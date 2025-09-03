import type { Metadata } from 'next';
import ImageResizer from '../../components/ImageResizer';

export const metadata: Metadata = {
  title: "Image Resizer - Unlimited Image Resizing | PixUnlim",
  description: "Resize unlimited images for free. No limits on file count - process hundreds or thousands of images at once. Professional image resizing with unlimited batch processing and custom dimensions.",
  keywords: "image resizer, unlimited images, batch resizing, free image resizer, resize images, unlimited file count, image dimension tool, batch image processing",
  openGraph: {
    title: "Image Resizer - Unlimited Image Resizing",
    description: "Resize unlimited images for free. No limits on file count - process hundreds or thousands of images at once.",
    url: '/resizer',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Image Resizer - Unlimited Image Resizing",
    description: "Resize unlimited images for free. No limits on file count.",
  },
  alternates: {
    canonical: '/resizer',
  },
};

export default function ResizerPage() {
  return <ImageResizer />;
}
