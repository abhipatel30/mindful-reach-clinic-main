// This script verifies that your Google Service Account environment variables
// are correctly loaded from your .env.local file.

const dotenv = require('dotenv');
// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });

console.log('--- Verifying Google Service Account Environment Variables ---');

const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

if (clientEmail) {
  console.log('GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL: Loaded (value starts with:', clientEmail.substring(0, 10) + '...)');
} else {
  console.error('GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL: NOT FOUND');
}

if (privateKey) {
  console.log('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: Loaded (value starts with:', privateKey.substring(0, 30) + '...)');
} else {
  console.error('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: NOT FOUND');
}

if (clientEmail && privateKey) {
  console.log('\n✅ Environment variables appear to be loaded correctly.');
} else {
  console.error('\n❌ Some environment variables are missing or incorrectly configured.');
  console.error('Please ensure GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY are set in your .env.local file.');
}

console.log('--- End Verification ---');
