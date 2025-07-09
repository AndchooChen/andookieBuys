import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form fields
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const description = formData.get('description') as string
    
    // Validate required fields
    if (!name || !email || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert submission into database
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          description
        }
      ])
      .select()
      .single()

    if (submissionError) {
      console.error('Database error:', submissionError)
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      )
    }

    // Handle file uploads
    const files = formData.getAll('files') as File[]
    const fileResults = []

    for (const file of files) {
      if (file && file.size > 0) {
        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${submission.id}/${Date.now()}.${fileExt}`
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('submission-files')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('submission-files')
          .getPublicUrl(fileName)

        // Save file info to database
        const { error: fileError } = await supabase
          .from('submission_files')
          .insert([
            {
              submission_id: submission.id,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              file_url: urlData.publicUrl
            }
          ])

        if (!fileError) {
          fileResults.push({
            name: file.name,
            url: urlData.publicUrl
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        name: submission.name,
        email: submission.email,
        filesUploaded: fileResults.length
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}