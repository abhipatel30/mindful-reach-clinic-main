// Email configuration service
// This file centralizes all email-related configuration

interface EmailConfig {
  ownerEmail: string;
  senderEmail: string;
  senderName: string;
}

// Get email configuration from environment variables
export const getEmailConfig = (): EmailConfig => {
  return {
    ownerEmail: process.env.OWNER_EMAIL || 'owner@unveiledecho.com',
    senderEmail: process.env.SMTP_USER || 'noreply@unveiledecho.com',
    senderName: 'Unveiled Echo - Clinic Form Submission',
  };
};
