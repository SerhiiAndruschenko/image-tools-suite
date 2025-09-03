import type { Metadata } from 'next';
import AvifConverter from '../../components/AvifConverter';

export const metadata: Metadata = {
  title: "AVIF Converter - Unlimited Image Conversion | Image Tools Suite",
  description: "Convert unlimited images to AVIF format for free. No limits on file count - process hundreds or thousands of images at once. Professional AVIF conversion with unlimited batch processing and maximum compression.",
  keywords: "AVIF converter, unlimited images, batch conversion, free AVIF converter, image format converter, unlimited file count, AVIF conversion tool, maximum compression",
  openGraph: {
    title: "AVIF Converter - Unlimited Image Conversion",
    description: "Convert unlimited images to AVIF format for free. No limits on file count - process hundreds or thousands of images at once.",
    url: '/avif-converter',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "AVIF Converter - Unlimited Image Conversion",
    description: "Convert unlimited images to AVIF format for free. No limits on file count.",
  },
  alternates: {
    canonical: '/avif-converter',
  },
};

export default function AvifConverterPage() {
  return <AvifConverter />;
}
