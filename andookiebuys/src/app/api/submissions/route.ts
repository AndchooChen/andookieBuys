// app/api/submissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const description = formData.get('description') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const zipCode = formData.get('zipCode') as string;
    const country = formData.get('country') as string;
    const priceRange = formData.get('priceRange') as string; // NEW FIELD
    const files = formData.getAll('files') as File[];

    // Validate required fields
    if (!name || !email || !description || !address || !city || !state || !zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert submission into database
    const { data: submission, error: dbError } = await supabase
      .from('submissions')
      .insert({
        name,
        email,
        phone,
        description,
        address,
        city,
        state,
        zip_code: zipCode,
        country: country || 'United States',
        price_range: priceRange, // NEW FIELD
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    // Upload files to Supabase Storage - FIXED BUCKET NAME
    const uploadedFiles = [];
    for (const file of files) {
      if (file.size > 0) {
        const fileName = `${submission.id}/${Date.now()}-${file.name}`;
        const fileBuffer = await file.arrayBuffer();
        
        const { error: uploadError } = await supabase.storage
          .from('submission-files') // CHANGED FROM 'submissions' TO 'submission-files'
          .upload(fileName, fileBuffer, {
            contentType: file.type,
          });

        if (uploadError) {
          console.error('File upload error:', uploadError);
          continue;
        }

        // Get public URL - FIXED BUCKET NAME
        const { data: { publicUrl } } = supabase.storage
          .from('submission-files') // CHANGED FROM 'submissions' TO 'submission-files'
          .getPublicUrl(fileName);

        // Save file info to database
        const { error: fileDbError } = await supabase
          .from('submission_files')
          .insert({
            submission_id: submission.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_url: publicUrl
          });

        if (!fileDbError) {
          uploadedFiles.push({
            name: file.name,
            url: publicUrl
          });
        }
      }
    }

    // Get price range label for email
    const PRICE_RANGES = [
      { value: 'under-50', label: 'Under $50' },
      { value: '50-100', label: '$50 - $100' },
      { value: '100-200', label: '$100 - $200' },
      { value: '200-300', label: '$200 - $300' },
      { value: '300-400', label: '$300 - $400' },
      { value: '400-500', label: '$400 - $500' },
      { value: '500-700', label: '$500 - $700' },
      { value: '700-1000', label: '$700 - $1,000' },
      { value: '1000-2000', label: '$1,000 - $2,000' },
      { value: 'over-20000', label: 'Over $2,000' },
      { value: 'not-sure', label: 'Not sure / Need help estimating' }
    ];

    const priceRangeLabel = PRICE_RANGES.find(range => range.value === priceRange)?.label || 'Not specified';

    // Send email notification
    try {
      await resend.emails.send({
        from: 'noreply@yourdomain.com',
        to: process.env.ADMIN_EMAIL!,
        subject: 'New Pokémon Collection Submission',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Collection Submission</h2>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #555; margin-top: 0;">Contact Information</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            </div>

            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #555; margin-top: 0;">Shipping Address</h3>
              <p><strong>Address:</strong> ${address}</p>
              <p><strong>City:</strong> ${city}</p>
              <p><strong>State:</strong> ${state}</p>
              <p><strong>ZIP Code:</strong> ${zipCode}</p>
              <p><strong>Country:</strong> ${country || 'United States'}</p>
            </div>

            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #555; margin-top: 0;">Collection Details</h3>
              <p><strong>Expected Price Range:</strong> ${priceRangeLabel}</p>
              <p><strong>Description:</strong></p>
              <p style="background: white; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${description}</p>
            </div>

            ${uploadedFiles.length > 0 ? `
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #555; margin-top: 0;">Uploaded Files</h3>
                <ul>
                  ${uploadedFiles.map(file => `
                    <li><a href="${file.url}" target="_blank">${file.name}</a></li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}

            <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 8px;">
              <p style="margin: 0;"><strong>Submission ID:</strong> ${submission.id}</p>
              <p style="margin: 10px 0 0 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Don't fail the submission if email fails
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: 'Submission received successfully!'
    });

  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}