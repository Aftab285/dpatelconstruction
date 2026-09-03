import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const cfEnv = (locals as any)?.runtime?.env;
    const apiKey =
      cfEnv?.RESEND_API_KEY ||
      import.meta.env.RESEND_API_KEY ||
      process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error('RESEND_API_KEY is not configured in environment or Cloudflare Pages settings.');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: RESEND_API_KEY is not configured.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await request.json();
    const { fullName, email, phone, projectType, message } = data;

    if (!fullName || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Please complete all required fields.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(apiKey);

    const safeMessage = String(message)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const { data: resendData, error } = await resend.emails.send({
      from: 'D Patel Construction <website@dpatelconstruction.com>',
      to: ['info@dpatelconstruction.com'],
      replyTo: email,
      subject: `New Project Inquiry: ${fullName} - ${projectType || 'General Inquiry'}`,
      text: `New Website Inquiry\n\nName: ${fullName}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nProject Type: ${projectType || 'Not specified'}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <div style="border-bottom: 2px solid #D4A017; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #1B3A5C; margin: 0; font-size: 22px;">D Patel Construction</h2>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.05em;">Website Inquiry Notification</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 15px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1B3A5C; width: 140px;">Full Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1B3A5C;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${email}" style="color: #D4A017; text-decoration: none; font-weight: 500;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1B3A5C;">Phone:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${phone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1B3A5C;">Project Type:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500;">${projectType || 'Not specified'}</td>
            </tr>
          </table>

          <div style="background-color: #f8fafc; border-left: 4px solid #D4A017; padding: 16px; border-radius: 4px; margin-top: 20px;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #1B3A5C; font-size: 14px;">Message:</p>
            <p style="margin: 0; color: #334155; white-space: pre-wrap; line-height: 1.6; font-size: 14px;">${safeMessage}</p>
          </div>

          <div style="margin-top: 28px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            Sent from website@dpatelconstruction.com to info@dpatelconstruction.com. Reply directly to this email to respond to ${fullName}.
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend delivery error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Failed to send message via Resend.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: resendData?.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('API execution error:', err);
    return new Response(
      JSON.stringify({ error: err?.message || 'Internal server error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
