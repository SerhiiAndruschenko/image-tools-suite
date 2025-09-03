import type { Metadata } from 'next';
import ImageConverter from '../../components/ImageConverter';

export const metadata: Metadata = {
  title: "WebP Converter - Unlimited Image Conversion | Image Tools Suite",
  description: "Convert unlimited images to WebP format for free. No limits on file count - process hundreds or thousands of images at once. Professional WebP conversion with unlimited batch processing.",
  keywords: "WebP converter, unlimited images, batch conversion, free WebP converter, image format converter, unlimited file count, WebP conversion tool",
  openGraph: {
    title: "WebP Converter - Unlimited Image Conversion",
    description: "Convert unlimited images to WebP format for free. No limits on file count - process hundreds or thousands of images at once.",
    url: '/converter',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "WebP Converter - Unlimited Image Conversion",
    description: "Convert unlimited images to WebP format for free. No limits on file count.",
  },
  alternates: {
    canonical: '/converter',
  },
};

export default function ConverterPage() {
  return <ImageConverter />;
}
