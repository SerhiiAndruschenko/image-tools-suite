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

    // Optimized PNG settings for faster conversion
    const pngBuffer = await sharp(imageBuffer)
      .png({ 
        compressionLevel: 6, // Reduced from 9 to 6 for faster processing
        quality: quality,
        progressive: false, // Disable progressive for faster processing
        palette: true // Enable palette for better compression
      })
      .toBuffer();

    // Return the PNG file
    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${imageFile.name.replace(/\.[^/.]+$/, '')}.png"`,
      },
    });

  } catch (error) {
    console.error('PNG conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert image to PNG' },
      { status: 500 }
    );
  }
}
