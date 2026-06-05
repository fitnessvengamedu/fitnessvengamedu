import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Create a service role admin client for database insertions
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const eventName = formData.get('event_name') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Set up Google Drive API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_DRIVE_CLIENT_ID,
      process.env.GOOGLE_DRIVE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Determine the target folder based on mime type
    let folderId = null;
    const fileType = file.type.startsWith('video/') ? 'video' : 'image';
    
    if (file.type.startsWith('image/')) {
      folderId = process.env.GOOGLE_DRIVE_PHOTO_FOLDER_ID;
    } else if (file.type.startsWith('video/')) {
      folderId = process.env.GOOGLE_DRIVE_VIDEO_FOLDER_ID;
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload an image or video.' }, { status: 400 });
    }

    if (!folderId) {
       return NextResponse.json({ error: 'Server configuration error: Missing folder ID in environment variables.' }, { status: 500 });
    }

    // Convert file to a readable stream for Google Drive upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // Format the filename in Google Drive with the event name prefix if provided
    const finalFileName = eventName ? `${eventName.trim()}__${file.name}` : file.name;

    // Upload to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: finalFileName,
        parents: [folderId],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: 'id, webViewLink, webContentLink',
    });

    const fileId = response.data.id;

    // Make the file publicly viewable so the preview renders on the website
    if (fileId) {
      try {
        await drive.permissions.create({
          fileId: fileId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });
        console.log(`[Upload] Set public read permissions for file ${fileId}`);
      } catch (permError: any) {
        console.warn(`[Upload] Failed to set public permissions for file ${fileId}:`, permError.message);
      }
    }

    // Construct the direct image source link format
    const directFileUrl = fileType === 'image' 
      ? `https://lh3.googleusercontent.com/d/${fileId}`
      : `https://docs.google.com/uc?export=download&id=${fileId}`;

    let savedToDb = false;
    let dbError = null;

    // Save metadata to gallery_items database table if eventName is specified
    if (eventName && fileId) {
      try {
        const { error } = await supabaseAdmin
          .from('gallery_items')
          .insert({
            event_name: eventName.trim(),
            file_url: directFileUrl,
            file_type: fileType,
          });
        
        if (error) {
          console.warn('[Upload] Failed to save metadata to gallery_items:', error.message);
          dbError = error.message;
        } else {
          savedToDb = true;
          console.log('[Upload] Metadata successfully saved to gallery_items');
        }
      } catch (err: any) {
        console.error('[Upload] Exception saving to database:', err);
        dbError = err.message;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      fileId: fileId,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
      directUrl: directFileUrl,
      savedToDb: savedToDb,
      dbError: dbError
    });

  } catch (error: any) {
    console.error('Error uploading to Google Drive:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
