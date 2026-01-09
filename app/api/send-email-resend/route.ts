import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// HTML escape helper
const escapeHtml = (text: string | null | undefined): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return String(text || '').replace(/[&<>'"']/g, (m) => map[m]);
};

// Email template generator for form submissions
const getFormSubmissionTemplate = (data: { name: string; email: string; phone?: string; message: string; submittedAt?: string | Date }) => `
  <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
        .email-wrapper { background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 30px 20px; }
        .field { margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #0ea5e9; border-radius: 4px; }
        .label { font-weight: 600; color: #0ea5e9; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { margin-top: 8px; color: #1f2937; font-size: 14px; line-height: 1.6; word-break: break-word; }
        .footer { padding: 20px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        .action-button { display: inline-block; padding: 10px 20px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header">
            <h1>🎯 New Form Submission</h1>
            <p style="margin: 0 0 0 0; font-size: 14px; opacity: 0.9;">Unveiled Echo Clinic</p>
          </div>
          
          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Client Information</h2>
            
            <div class="field">
              <div class="label">Name</div>
              <div class="value">${escapeHtml(data.name)}</div>
            </div>
            
            <div class="field">
              <div class="label">Email Address</div>
              <div class="value"><a href="mailto:${escapeHtml(data.email)}" style="color: #0ea5e9; text-decoration: none;">${escapeHtml(data.email)}</a></div>
            </div>
            
            ${data.phone ? `
            <div class="field">
              <div class="label">Phone Number</div>
              <div class="value">${escapeHtml(data.phone)}</div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="label">Message</div>
              <div class="value">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
            </div>
            
            <div class="field">
              <div class="label">Submitted At</div>
              <div class="value">${new Date(data.submittedAt || new Date()).toLocaleString()}</div>
            </div>

            <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">
              💡 <strong>Quick Action:</strong> Reply directly to this email to contact the client.
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">This is an automated email from Unveiled Echo clinic submission system.</p>
            <p style="margin: 8px 0 0 0;">© ${new Date().getFullYear()} Unveiled Echo. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
  </html>
`;

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message, submittedAt } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields: name, email, and message are required' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('✗ Resend API key not configured');
      return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 });
    }

    const ownerEmail = 'contact@unveiledecho.com';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: ownerEmail,
        subject: `New Form Submission from ${name} - Unveiled Echo Clinic`,
        html: getFormSubmissionTemplate({
            name,
            email,
            phone,
            message,
            submittedAt: submittedAt || new Date().toISOString()
        }),
    });

    if (error) {
      console.error('✗ Resend API error:', error);
      return NextResponse.json({
        error: 'Failed to send email',
        message: error.message
      }, { status: 500 });
    }

    console.log(`✓ Form submission email sent successfully from ${email} to ${ownerEmail}`);
    if(data) {
        console.log(`  Email ID: ${data.id}`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Form submission email sent successfully',
      emailId: data ? data.id : ''
    });
  } catch (error: any) {
    console.error('✗ Error sending email:', error?.message || error);
    return NextResponse.json({
      error: 'Failed to send email',
      message: error?.message || String(error)
    }, { status: 500 });
  }
}
