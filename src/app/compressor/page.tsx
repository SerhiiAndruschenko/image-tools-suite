import type { Metadata } from 'next';
import ImageCompressor from '../../components/ImageCompressor';

export const metadata: Metadata = {
  title: "Image Compressor - Unlimited Image Compression | Image Tools Suite",
  description: "Compress unlimited images for free. No limits on file count - process hundreds or thousands of images at once. Professional image compression with unlimited batch processing and quality control.",
  keywords: "image compressor, unlimited images, batch compression, free image compressor, compress images, unlimited file count, image compression tool, batch image processing, file size reduction",
  openGraph: {
    title: "Image Compressor - Unlimited Image Compression",
    description: "Compress unlimited images for free. No limits on file count - process hundreds or thousands of images at once.",
    url: '/compressor',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Image Compressor - Unlimited Image Compression",
    description: "Compress unlimited images for free. No limits on file count.",
  },
  alternates: {
    canonical: '/compressor',
  },
};

export default function CompressorPage() {
  return <ImageCompressor />;
}
