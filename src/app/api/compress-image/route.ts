import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const quality = parseInt(formData.get('quality') as string);

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    // Process image with Sharp based on file type
    let compressedBuffer: Buffer;
    const fileType = imageFile.type;

    if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
      // Compress JPEG with quality setting
      compressedBuffer = await sharp(imageBuffer)
        .jpeg({ quality: quality })
        .toBuffer();
    } else if (fileType === 'image/png') {
      // Compress PNG with optimization
      compressedBuffer = await sharp(imageBuffer)
        .png({ compressionLevel: 9, quality: quality })
        .toBuffer();
    } else if (fileType === 'image/webp') {
      // Compress WebP with quality setting
      compressedBuffer = await sharp(imageBuffer)
        .webp({ quality: quality })
        .toBuffer();
    } else {
      // For other formats, just optimize without quality change
      compressedBuffer = await sharp(imageBuffer)
        .png({ compressionLevel: 9 })
        .toBuffer();
    }

    // Return the compressed file
    return new NextResponse(new Blob([compressedBuffer], { type: fileType }), {
      headers: {
        'Content-Type': fileType,
        'Content-Disposition': `attachment; filename="${imageFile.name}"`,
      },
    });

  } catch (error) {
    console.error('Image compression error:', error);
    return NextResponse.json(
      { error: 'Failed to compress image' },
      { status: 500 }
    );
  }
}
