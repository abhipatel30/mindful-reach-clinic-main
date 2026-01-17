"use server";

import { google } from 'googleapis';

// --- Configuration ---
const GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
const GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
const USER_TO_IMPERSONATE = 'intakes@unveiledecho.com';

// 
// const USER_TO_IMPERSONATE = 'contact@unveiledecho.com';
const EMAIL_TO = 'intakes@unveiledecho.com';
const EMAIL_FROM = USER_TO_IMPERSONATE;

// --- Helper Functions ---

function createJwtClient() {
  const scopes = ['https://www.googleapis.com/auth/gmail.send'];
  const jwtClient = new google.auth.JWT({
    email: GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    key: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: scopes,
    subject: USER_TO_IMPERSONATE,
  });
  return jwtClient;
}

const escapeHtml = (text: string | null | undefined): string => {
    const map: { [key: string]: string } = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
    };
    return String(text || '').replace(/[&<>()"']/g, (m) => map[m]);
};

const getFormSubmissionTemplate = (data: { name: string; email: string; phone?: string; message: string; submittedAt?: string | Date }) => `
    <html>
      <body>
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        ${data.phone ? `<p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(data.message).replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Submitted at: ${new Date(data.submittedAt || new Date()).toLocaleString()}</em></p>
      </body>
    </html>
`;

// --- Server Action ---

interface FormSubmissionData {
    name: string;
    email: string;
    phone?: string;
    message: string;
}

export async function sendEmailAction(formData: FormSubmissionData) {
  if (!GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL || !GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    console.error('✗ Google Service Account credentials not configured');
    throw new Error('Email server is not configured.');
  }

  try {
    const auth = createJwtClient();
    const gmail = google.gmail({ version: 'v1', auth });

    const emailHtml = getFormSubmissionTemplate({ ...formData, submittedAt: new Date() });
    const subject = `New Form Submission from ${formData.name} - Unveiled Echo Clinic`;
    
    const emailParts = [
      `From: "Unveiled Echo Clinic" <${EMAIL_FROM}>`,
      `To: ${EMAIL_TO}`,
      `Reply-To: ${formData.email}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`, // Note: Subject encoding is correct here
      '',
      emailHtml,
    ];
    const emailMessage = emailParts.join('\n');

    const encodedMessage = Buffer.from(emailMessage).toString('base64url');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`✓ Form submission email sent successfully via Server Action`);
    return { success: true, message: 'Form submission email sent successfully' };

  } catch (error: any) {
    // Log the entire error object for detailed debugging
    console.error('--- DETAILED GMAIL API ERROR ---');
    console.error(JSON.stringify(error, null, 2));
    console.error('--- END OF DETAILED ERROR ---');
    
    // Construct a more informative error message for the client
    const errorMessage = error?.response?.data?.error?.message || error?.message || 'An unknown error occurred while sending the email.';
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
}
