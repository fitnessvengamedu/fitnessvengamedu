const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
try {
  const envPath = path.resolve(__dirname, '../.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = val;
    }
  });
} catch (err) {
  console.error("Error reading .env:", err.message);
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });
const fileId = '1Hit_tQJ3bAQ43payI3FKB9lJM7Gao4fA';

async function shareFile() {
  try {
    console.log(`Setting public read permission for file ID: ${fileId}...`);
    const res = await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    console.log("Permission set successfully!", res.data);
    
    // Now let's try fetching the direct link using standard fetch to see if it responds with 200 OK
    const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
    console.log(`Checking direct link: ${directUrl}`);
    const checkRes = await fetch(directUrl);
    console.log("Direct URL HTTP Status:", checkRes.status);
  } catch (error) {
    console.error("Failed to share file:", error);
  }
}

shareFile();
