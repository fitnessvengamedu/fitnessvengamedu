import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const revalidate = 0; // Ensure fresh data on each call

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 1. Try fetching from Supabase database first
    try {
      const { data: dbItems, error: dbError } = await supabaseAdmin
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!dbError && dbItems && dbItems.length > 0) {
        console.log(`[Gallery API] Successfully loaded ${dbItems.length} items from Supabase.`);
        return NextResponse.json({
          source: 'database',
          items: dbItems
        });
      }
      
      if (dbError) {
        console.warn('[Gallery API] Supabase query failed, falling back to Google Drive:', dbError.message);
      }
    } catch (e: any) {
      console.warn('[Gallery API] Supabase query exception, falling back to Google Drive:', e.message);
    }

    // 2. Fallback: Fetch directly from Google Drive
    console.log('[Gallery API] Listing files directly from Google Drive folders...');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_DRIVE_CLIENT_ID,
      process.env.GOOGLE_DRIVE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const driveItems: any[] = [];

    const photoFolderId = process.env.GOOGLE_DRIVE_PHOTO_FOLDER_ID;
    const videoFolderId = process.env.GOOGLE_DRIVE_VIDEO_FOLDER_ID;

    // Fetch from Photo Folder
    if (photoFolderId) {
      try {
        const photoRes = await drive.files.list({
          q: `'${photoFolderId}' in parents and trashed = false`,
          fields: 'files(id, name, mimeType, createdTime)',
          pageSize: 50,
        });

        if (photoRes.data.files) {
          photoRes.data.files.forEach((file) => {
            const isVideo = file.mimeType?.startsWith('video/') || false;
            const fileType = isVideo ? 'video' : 'image';
            const directUrl = isVideo
              ? `https://docs.google.com/uc?export=download&id=${file.id}`
              : `https://lh3.googleusercontent.com/d/${file.id}`;

            // Extract event name from naming convention: "Event Name__File Name"
            let eventName = 'General Gallery';
            let originalName = file.name || 'Untitled';
            if (file.name && file.name.includes('__')) {
              const parts = file.name.split('__');
              eventName = parts[0];
              originalName = parts.slice(1).join('__');
            }

            driveItems.push({
              id: file.id,
              event_name: eventName,
              file_url: directUrl,
              file_type: fileType,
              created_at: file.createdTime || new Date().toISOString(),
              original_name: originalName
            });
          });
        }
      } catch (err: any) {
        console.error('[Gallery API] Error reading photo folder:', err.message);
      }
    }

    // Fetch from Video Folder
    if (videoFolderId) {
      try {
        const videoRes = await drive.files.list({
          q: `'${videoFolderId}' in parents and trashed = false`,
          fields: 'files(id, name, mimeType, createdTime)',
          pageSize: 20,
        });

        if (videoRes.data.files) {
          videoRes.data.files.forEach((file) => {
            const isVideo = true;
            const fileType = 'video';
            const directUrl = `https://docs.google.com/uc?export=download&id=${file.id}`;

            // Extract event name
            let eventName = 'General Gallery';
            let originalName = file.name || 'Untitled';
            if (file.name && file.name.includes('__')) {
              const parts = file.name.split('__');
              eventName = parts[0];
              originalName = parts.slice(1).join('__');
            }

            driveItems.push({
              id: file.id,
              event_name: eventName,
              file_url: directUrl,
              file_type: fileType,
              created_at: file.createdTime || new Date().toISOString(),
              original_name: originalName
            });
          });
        }
      } catch (err: any) {
        console.error('[Gallery API] Error reading video folder:', err.message);
      }
    }

    // Sort combined files by creation time descending
    driveItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      source: 'google-drive',
      items: driveItems
    });

  } catch (error: any) {
    console.error('[Gallery API] Fatal error listing gallery items:', error);
    return NextResponse.json({ error: 'Failed to list gallery items', details: error.message }, { status: 500 });
  }
}
