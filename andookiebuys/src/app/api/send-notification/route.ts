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

    // Fetch submission details with files
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

    // Format file list for email
    const filesList = submission.submission_files?.map((file: any) => 
      `• ${file.file_name} (${formatFileSize(file.file_size)})`
    ).join('\n') || 'No files uploaded';

    // Create email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🎴 New Pokémon Card Submission!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Someone wants to sell their collection</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
          <h2 style="color: #2d3748; margin-top: 0;">Submission Details</h2>
          
          <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4a5568; width: 100px;">Name:</td>
                <td style="padding: 8px 0; color: #2d3748;">${submission.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${submission.email}" style="color: #3182ce; text-decoration: none;">${submission.email}</a></td>
              </tr>
              ${submission.phone ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Phone:</td>
                <td style="padding: 8px 0;"><a href="tel:${submission.phone}" style="color: #3182ce; text-decoration: none;">${submission.phone}</a></td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Submitted:</td>
                <td style="padding: 8px 0; color: #2d3748;">${new Date(submission.created_at).toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <h3 style="color: #2d3748; margin: 25px 0 15px 0;">Collection Description</h3>
          <div style="background: #edf2f7; padding: 15px; border-radius: 8px; border-left: 4px solid #3182ce;">
            <p style="margin: 0; color: #2d3748; white-space: pre-wrap;">${submission.description}</p>
          </div>

          <h3 style="color: #2d3748; margin: 25px 0 15px 0;">Uploaded Files (${submission.submission_files?.length || 0})</h3>
          <div style="background: #f0fff4; padding: 15px; border-radius: 8px; border-left: 4px solid #38a169;">
            <pre style="margin: 0; font-family: Arial, sans-serif; color: #2d3748; white-space: pre-wrap;">${filesList}</pre>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin" 
               style="background: #3182ce; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View in Admin Dashboard
            </a>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #718096; font-size: 14px; margin: 0;">
              Submission ID: ${submission.id}<br>
              This email was sent automatically from your Pokémon Card Collection system.
            </p>
          </div>
        </div>
      </div>
    `;

    // Send email
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Pokemon Cards <onboarding@resend.dev>',
      to: [process.env.ADMIN_EMAIL || 'admin@example.com'],
      subject: `🎴 New Pokémon Card Submission from ${submission.name}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Email send error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}