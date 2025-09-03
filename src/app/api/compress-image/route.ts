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
      // Optimized JPEG compression
      compressedBuffer = await sharp(imageBuffer)
        .jpeg({ 
          quality: quality,
          progressive: false, // Disable progressive for faster processing
          mozjpeg: true // Use mozjpeg for better compression
        })
        .toBuffer();
    } else if (fileType === 'image/png') {
      // Optimized PNG compression
      compressedBuffer = await sharp(imageBuffer)
        .png({ 
          compressionLevel: 6, // Reduced from 9 to 6
          quality: quality,
          progressive: false,
          palette: true
        })
        .toBuffer();
    } else if (fileType === 'image/webp') {
      // Optimized WebP compression
      compressedBuffer = await sharp(imageBuffer)
        .webp({ 
          quality: quality,
          effort: 2, // Reduced effort for faster processing
          nearLossless: false
        })
        .toBuffer();
    } else {
      // For other formats, convert to optimized PNG
      compressedBuffer = await sharp(imageBuffer)
        .png({ 
          compressionLevel: 6,
          palette: true
        })
        .toBuffer();
    }

    // Return the compressed file
    return new NextResponse(new Uint8Array(compressedBuffer), {
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
