<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Google Drive Media Integration Rules
- **Public Read Permission for Uploads:** Whenever uploading files to Google Drive using the Drive API, always call `drive.permissions.create` with `role: 'reader'` and `type: 'anyone'` immediately after the file is created. This ensures the file is accessible to the public.
- **Referrer Policy for Rendered Images:** When displaying images or video thumbnails fetched from Google User Content/Drive (`lh3.googleusercontent.com` or `docs.google.com`), always add `referrerPolicy="no-referrer"` to the HTML `<img>` tag elements. This prevents Google from blocking image load requests due to cross-origin referrer header checks.

