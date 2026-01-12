// This script is used to obtain a Google OAuth2 refresh token.
// A refresh token is a long-lived credential that allows your application to obtain new access tokens
// without requiring the user to re-authorize every time.
//
// HOW TO USE:
// 1. Ensure you have created OAuth 2.0 credentials for a "Web application" in your Google Cloud Platform project.
//    - Go to https://console.cloud.google.com/apis/credentials
//    - Click "+ CREATE CREDENTIALS" -> "OAuth client ID".
//    - Select "Web application".
//    - Under "Authorized redirect URIs", add "http://localhost:3000".
//    - Click "Create".
//    - A dialog will show your "Client ID" and "Client Secret". Copy these.
//
// 2. Create a `.env.local` file in your project root with these values:
//    GOOGLE_CLIENT_ID=your_client_id_here
//    GOOGLE_CLIENT_SECRET=your_client_secret_here
//
// 3. Run this script from your terminal:
//    node get-google-refresh-token.js
//
// 4. The script will print a URL. Copy and paste this URL into your browser.
//
// 5. You will be prompted to sign in with your Google account and grant permission.
//    - Choose the Google account you want to send emails FROM (e.g., contact@unveiledecho.com).
//    - Since your app is not verified by Google, you will see a warning screen.
//    - Click "Advanced", then "Go to [your app name] (unsafe)".
//    - Grant the "Send email on your behalf" permission.
//
// 6. After granting permission, you will be redirected to a blank page on localhost:3000.
//    Your browser will likely show a "This site can’t be reached" error. This is EXPECTED.
//    In your terminal, the script will have printed your REFRESH TOKEN.
//
// 7. Copy the refresh token and add it to your `.env.local` file:
//    GOOGLE_REFRESH_TOKEN=your_refresh_token_here
//
// You only need to run this script ONCE to get the refresh token.

const http = require('http');
const url = require('url');
const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

// Configuration from environment variables
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = 'http://localhost:3000';

if (!googleClientId || !googleClientSecret) {
  console.error(
    'ERROR: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in your .env.local file.'
  );
  process.exit(1);
}

// Create an OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  googleClientId,
  googleClientSecret,
  redirectUri
);

// Define the scope for the Gmail API
// This scope allows the application to send emails on the user's behalf.
const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

// Generate the authorization URL
const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // 'offline' is required to get a refresh token
  scope: GMAIL_SCOPES,
  prompt: 'consent', // 'consent' ensures you get a refresh token every time
});

// Function to get the refresh token from the authorization code
async function getRefreshToken(code, server) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    if (tokens.refresh_token) {
      console.log('\n✅ Authorization successful!');
      console.log('================================================================');
      console.log('Your Refresh Token is (copy this into your .env.local file):');
      console.log('\x1b[32m%s\x1b[0m', `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
      console.log('================================================================');
    } else {
      console.error('\n❌ Failed to get refresh token.');
      console.log('This can happen if you have already authorized this app. Try revoking access here:');
      console.log('https://myaccount.google.com/permissions');
      console.log('Then run the script again.');
    }
  } catch (error) {
    console.error('\nError getting tokens:', error.message);
  } finally {
    // Stop the server
    server.close(() => {
      console.log('\nServer shut down. You can close this terminal.');
      process.exit(0);
    });
  }
}

// Start a simple server to listen for the OAuth callback
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/') {
        const { code } = parsedUrl.query;
        if (code) {
            res.end('Authentication successful! Please check your terminal for the refresh token.');
            getRefreshToken(decodeURIComponent(code), server);
        } else {
            res.end('Waiting for authentication callback...');
        }
    }
}).listen(3000, () => {
    console.log('🚀 Starting authorization process...');
    console.log('================================================================');
    console.log('1. Copy the URL below and paste it into your browser:');
    console.log('\x1b[36m%s\x1b[0m', authorizationUrl);
    console.log('\n2. Authorize the application with your Google account.');
    console.log('3. You will be redirected to a blank/error page, which is normal.');
    console.log('4. Your Refresh Token will be printed in this terminal.');
    console.log('\nWaiting for authorization...');
    console.log('================================================================');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error('ERROR: Port 3000 is already in use. Please stop the other process and try again.');
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});
