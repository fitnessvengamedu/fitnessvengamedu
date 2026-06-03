import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Set up Google Drive API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_DRIVE_CLIENT_ID,
      process.env.GOOGLE_DRIVE_CLIENT_SECRET,
      // The redirect URI isn't strictly necessary for just using the refresh token, 
      // but it's good practice to provide the one used during generation.
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Determine the target folder based on mime type
    let folderId = null;
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

    // Upload to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [folderId],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: 'id, webViewLink, webContentLink',
    });

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
    });

  } catch (error: any) {
    console.error('Error uploading to Google Drive:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
