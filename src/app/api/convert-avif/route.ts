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

    // Optimized AVIF settings for faster conversion
    const avifBuffer = await sharp(imageBuffer)
      .avif({
        quality: quality,
        effort: 2, // Reduced from 9 to 2 for much faster conversion
        chromaSubsampling: '4:2:0', // Keep for compression
        lossless: false
      })
      .toBuffer();

    // Return the AVIF file
    return new NextResponse(new Uint8Array(avifBuffer), {
      headers: {
        'Content-Type': 'image/avif',
        'Content-Disposition': `attachment; filename="${imageFile.name.replace(/\.[^/.]+$/, '')}.avif"`,
      },
    });

  } catch (error) {
    console.error('AVIF conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert image to AVIF' },
      { status: 500 }
    );
  }
}
