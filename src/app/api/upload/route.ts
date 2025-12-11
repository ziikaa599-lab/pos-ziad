import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { getToken } from 'next-auth/jwt';

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(req: Request) {
    // Admin-only: Only admins can upload images
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({
                error: 'Invalid file type. Please use JPG, PNG, or WebP images.'
            }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
            }, { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop() || 'jpg';
        const filename = `${timestamp}-${randomString}.${extension}`;

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save file to public/uploads
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Return URL path
        const url = `/uploads/${filename}`;
        return NextResponse.json({ url }, { status: 201 });
    } catch (error) {
        console.error('Upload error', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
