import type { Metadata } from 'next';
import ImageCropper from '../../components/ImageCropper';

export const metadata: Metadata = {
  title: "Image Cropper - Unlimited Image Cropping | Image Tools Suite",
  description: "Crop unlimited images for free. No limits on file count - process hundreds or thousands of images at once. Professional image cropping with unlimited batch processing and interactive selection.",
  keywords: "image cropper, unlimited images, batch cropping, free image cropper, crop images, unlimited file count, image crop tool, batch image processing, interactive cropping",
  openGraph: {
    title: "Image Cropper - Unlimited Image Cropping",
    description: "Crop unlimited images for free. No limits on file count - process hundreds or thousands of images at once.",
    url: '/cropper',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Image Cropper - Unlimited Image Cropping",
    description: "Crop unlimited images for free. No limits on file count.",
  },
  alternates: {
    canonical: '/cropper',
  },
};

export default function CropperPage() {
  return <ImageCropper />;
}
