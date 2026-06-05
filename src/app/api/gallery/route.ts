import { NextResponse, NextRequest } from 'next/server';
import { google } from 'googleapis';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const revalidate = 0; // Ensure fresh data on each call

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sync = searchParams.get('sync') === 'true';

    // 1. If not syncing, try fetching from Supabase database first for maximum performance
    if (!sync) {
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
    }

    // 2. Fetch directly from Google Drive (always done if sync=true or database is empty)
    console.log('[Gallery API] Fetching from Google Drive. Sync mode:', sync);
    
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

    // Fetch photos
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

    // Fetch videos
    if (videoFolderId) {
      try {
        const videoRes = await drive.files.list({
          q: `'${videoFolderId}' in parents and trashed = false`,
          fields: 'files(id, name, mimeType, createdTime)',
          pageSize: 20,
        });

        if (videoRes.data.files) {
          videoRes.data.files.forEach((file) => {
            const fileType = 'video';
            const directUrl = `https://docs.google.com/uc?export=download&id=${file.id}`;

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

    // 3. If in sync mode, compare Drive items with DB and insert missing items
    if (sync) {
      console.log('[Gallery API] Starting synchronization logic...');
      try {
        // Get existing URLs from DB
        const { data: dbItems } = await supabaseAdmin
          .from('gallery_items')
          .select('file_url');
        
        const existingUrls = new Set((dbItems || []).map(item => item.file_url));

        for (const item of driveItems) {
          if (!existingUrls.has(item.file_url)) {
            console.log(`[Sync] Found new Drive file: "${item.original_name}" (ID: ${item.id}). Adding to DB...`);
            
            // Share the file publicly so anyone can view it
            try {
              await drive.permissions.create({
                fileId: item.id,
                requestBody: {
                  role: 'reader',
                  type: 'anyone',
                },
              });
              console.log(`[Sync] Set public read permissions for file ${item.id}`);
            } catch (permError: any) {
              console.warn(`[Sync] Failed to set public permissions for file ${item.id}:`, permError.message);
            }

            // Save to database
            const { error: insertError } = await supabaseAdmin
              .from('gallery_items')
              .insert({
                event_name: item.event_name,
                file_url: item.file_url,
                file_type: item.file_type,
                created_at: item.created_at
              });

            if (insertError) {
              console.error(`[Sync] Database insert failed for file ${item.id}:`, insertError.message);
            }
          }
        }
      } catch (syncError: any) {
        console.error('[Gallery API] Sync logic failed:', syncError.message);
      }

      // Re-fetch all items from database to return the freshly synced data
      try {
        const { data: dbItems, error: dbError } = await supabaseAdmin
          .from('gallery_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (!dbError && dbItems && dbItems.length > 0) {
          return NextResponse.json({
            source: 'database-synced',
            items: dbItems
          });
        }
      } catch (fetchDbError: any) {
        console.error('[Gallery API] Failed to re-fetch database after sync:', fetchDbError.message);
      }
    }

    // Fallback: Return Google Drive items directly if database is empty or queries failed
    driveItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return NextResponse.json({
      source: 'google-drive-fallback',
      items: driveItems
    });

  } catch (error: any) {
    console.error('[Gallery API] Fatal error listing gallery items:', error);
    return NextResponse.json({ error: 'Failed to list gallery items', details: error.message }, { status: 500 });
  }
}
