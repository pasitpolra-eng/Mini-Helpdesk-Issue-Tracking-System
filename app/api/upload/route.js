// ============================================================
// route.js — API Endpoint for File Uploads
// Route: /api/upload
// ============================================================

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Convert file stream to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const bucketName = 'ticket-attachments';

        // 1. Verify/create storage bucket (using service role bypasses user RLS)
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        if (bucketsError) {
            console.error('Error listing buckets:', bucketsError);
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        const bucketExists = buckets?.some(b => b.name === bucketName);
        if (!bucketExists) {
            const { error: createError } = await supabase.storage.createBucket(bucketName, {
                public: true,
                fileSizeLimit: 10 * 1024 * 1024, // 10MB limit
            });
            if (createError) {
                console.error('Error creating bucket:', createError);
                return NextResponse.json({ error: 'Failed to initialize storage bucket' }, { status: 500 });
            }
        }

        // 2. Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `uploads/${uniqueFileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, buffer, {
                contentType: file.type,
                duplex: 'half'
            });

        if (uploadError) {
            console.error('Error uploading file to Supabase:', uploadError);
            return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 });
        }

        // 3. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return NextResponse.json({
            url: publicUrl,
            name: file.name,
            size: file.size,
            type: file.type
        });

    } catch (e) {
        console.error('API Error in POST /api/upload:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
