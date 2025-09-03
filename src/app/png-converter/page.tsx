import type { Metadata } from 'next';
import PngConverter from '../../components/PngConverter';

export const metadata: Metadata = {
  title: "PNG Converter - Unlimited Image Conversion | Image Tools Suite",
  description: "Convert unlimited images to PNG format for free. No limits on file count - process hundreds or thousands of images at once. Professional PNG conversion with unlimited batch processing and lossless quality.",
  keywords: "PNG converter, unlimited images, batch conversion, free PNG converter, image format converter, unlimited file count, PNG conversion tool, lossless conversion, batch image processing",
  openGraph: {
    title: "PNG Converter - Unlimited Image Conversion",
    description: "Convert unlimited images to PNG format for free. No limits on file count - process hundreds or thousands of images at once.",
    url: '/png-converter',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "PNG Converter - Unlimited Image Conversion",
    description: "Convert unlimited images to PNG format for free. No limits on file count.",
  },
  alternates: {
    canonical: '/png-converter',
  },
};

export default function PngConverterPage() {
  return <PngConverter />;
}
