import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '../../../../lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    // Fetch submission details
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        *,
        submission_files (*)
      `)
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Create confirmation email content
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🎴 Submission Received!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for submitting your Pokémon card collection</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
          <p style="color: #2d3748; font-size: 16px; margin-top: 0;">Hi ${submission.name},</p>
          
          <p style="color: #4a5568; line-height: 1.6;">
            We've successfully received your Pokémon card collection submission! Our team will review your collection and get back to you within 24-48 hours.
          </p>

          <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2d3748; margin-top: 0;">Your Submission Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4a5568; width: 120px;">Submission ID:</td>
                <td style="padding: 8px 0; color: #2d3748; font-family: monospace;">${submission.id.substring(0, 8)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Submitted:</td>
                <td style="padding: 8px 0; color: #2d3748;">${new Date(submission.created_at).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Files Uploaded:</td>
                <td style="padding: 8px 0; color: #2d3748;">${submission.submission_files?.length || 0} files</td>
              </tr>
            </table>
          </div>

          <div style="background: #e6fffa; padding: 20px; border-radius: 8px; border-left: 4px solid #38b2ac; margin: 20px 0;">
            <h3 style="color: #2d3748; margin-top: 0;">What happens next?</h3>
            <ol style="color: #4a5568; margin: 10px 0; padding-left: 20px;">
              <li style="margin: 8px 0;">Our experts will review your collection photos/videos</li>
              <li style="margin: 8px 0;">We'll assess the value and condition of your cards</li>
              <li style="margin: 8px 0;">We'll contact you with our offer within 24-48 hours</li>
              <li style="margin: 8px 0;">If you accept, we'll arrange secure shipping and payment</li>
            </ol>
          </div>

          <div style="background: #fff5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #f56565; margin: 20px 0;">
            <h3 style="color: #2d3748; margin-top: 0;">Important Notes</h3>
            <ul style="color: #4a5568; margin: 10px 0; padding-left: 20px;">
              <li style="margin: 8px 0;">Please keep your cards in a safe place until we contact you</li>
              <li style="margin: 8px 0;">Don't send your cards until we've agreed on terms</li>
              <li style="margin: 8px 0;">If you have any questions, reply to this email</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #4a5568; margin: 0;">
              Questions? Contact us at <a href="mailto:${process.env.ADMIN_EMAIL || 'admin@example.com'}" style="color: #3182ce;">${process.env.ADMIN_EMAIL || 'admin@example.com'}</a>
            </p>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #718096; font-size: 14px; margin: 0;">
              Thank you for choosing us for your Pokémon card collection!<br>
              Keep this email for your records.
            </p>
          </div>
        </div>
      </div>
    `;

    // Send confirmation email
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Pokemon Cards <onboarding@resend.dev>',
      to: [submission.email],
      subject: `✅ We received your Pokémon card collection submission`,
      html: confirmationHtml,
    });

    if (error) {
      console.error('Confirmation email send error:', error);
      return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (error) {
    console.error('Confirmation email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}