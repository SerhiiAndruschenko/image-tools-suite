import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const cropX = parseInt(formData.get('cropX') as string);
    const cropY = parseInt(formData.get('cropY') as string);
    const cropWidth = parseInt(formData.get('cropWidth') as string);
    const cropHeight = parseInt(formData.get('cropHeight') as string);

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (!cropX || !cropY || !cropWidth || !cropHeight) {
      return NextResponse.json({ error: 'Invalid crop parameters' }, { status: 400 });
    }

    // Convert File to Buffer
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    // Optimized cropping with Sharp
    const croppedBuffer = await sharp(imageBuffer)
      .extract({
        left: cropX,
        top: cropY,
        width: cropWidth,
        height: cropHeight
      })
      .png({ 
        compressionLevel: 6, // Reduced from 9 to 6 for faster processing
        palette: true // Enable palette for better compression
      })
      .toBuffer();

    // Return the cropped file
    return new NextResponse(new Uint8Array(croppedBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${imageFile.name.replace(/\.[^/.]+$/, '')}_cropped.png"`,
      },
    });

  } catch (error) {
    console.error('Image cropping error:', error);
    return NextResponse.json(
      { error: 'Failed to crop image' },
      { status: 500 }
    );
  }
}
