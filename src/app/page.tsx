import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PixUnlim - Unlimited Image Processing Tools | Free & No Limits",
  description:
    "Professional image processing suite with unlimited image count support. Convert, compress, resize, and crop unlimited images for free. No limits on file quantity - process hundreds or thousands of images at once.",
  keywords:
    "pixunlim, image tools, unlimited images, free image processing, WebP converter, AVIF converter, image resizer, image cropper, image compressor, PNG converter, batch processing, unlimited file count, no limits",
  openGraph: {
    title: "PixUnlim - Unlimited Image Processing Tools",
    description:
      "Professional image processing suite with unlimited image count support. Convert, compress, resize, and crop unlimited images for free.",
    url: "https://pixunlim.com",
    type: "website",
    siteName: "PixUnlim",
  },
  twitter: {
    card: "summary_large_image",
    title: "PixUnlim - Unlimited Image Processing Tools",
    description:
      "Professional image processing suite with unlimited image count support. No limits on file quantity.",
  },
  alternates: {
    canonical: "https://pixunlim.com",
  },
};

export default function Home() {
  const services = [
    {
      title: "WebP Converter",
      description:
        "Convert images to optimized WebP format locally in your browser",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      href: "/converter",
      gradient: "from-blue-600 to-purple-600",
      hoverGradient: "from-blue-700 to-purple-700",
    },
    {
      title: "AVIF Converter",
      description:
        "Convert images to modern AVIF format for superior compression and quality",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      href: "/avif-converter",
      gradient: "from-orange-600 to-amber-600",
      hoverGradient: "from-orange-700 to-amber-700",
    },
    {
      title: "Image Resizer",
      description:
        "Resize images to any dimensions with high quality processing",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      ),
      href: "/resizer",
      gradient: "from-green-600 to-teal-600",
      hoverGradient: "from-green-700 to-teal-700",
    },
    {
      title: "Image Cropper",
      description:
        "Crop images to perfect dimensions with interactive selection",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      href: "/cropper",
      gradient: "from-violet-600 to-purple-600",
      hoverGradient: "from-violet-700 to-purple-700",
    },
    {
      title: "Image Compressor",
      description:
        "Compress images to reduce file size while maintaining quality",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16M4 12h16M4 12l4-4m-4 4l4 4m12-4l-4-4m4 4l-4 4"
          />
        </svg>
      ),
      href: "/compressor",
      gradient: "from-red-600 to-pink-600",
      hoverGradient: "from-red-700 to-pink-700",
    },
    {
      title: "PNG Converter",
      description:
        "Convert images to high-quality PNG format with lossless compression",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      href: "/png-converter",
      gradient: "from-cyan-600 to-blue-600",
      hoverGradient: "from-cyan-700 to-blue-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <div className="max-w-6xl mx-auto p-6 pb-12 space-y-12">
        {/* PixUnlim Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl mb-8 glow">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            PixUnlim
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Professional image processing tools that work locally in your
            browser - no server limits, no file size restrictions, complete
            privacy. Process unlimited images with PixUnlim.
          </p>
        </div>

        {/* PixUnlim Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Link key={index} href={service.href} className="group">
              <div
                className={`relative h-full p-8 rounded-3xl border-2 border-gray-700/50 bg-gray-800/80 backdrop-blur-sm transition-all  duration-500 transform hover:scale-105 hover:shadow-2xl group-hover:border-gray-500/50`}
              >
                {/* Background glow effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${service.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}
                ></div>

                <div className="relative z-10 space-y-6">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="text-white">{service.icon}</div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                      {service.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                    <span className="text-sm font-medium">Get Started</span>
                    <svg
                      className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* PixUnlim Features Section */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8  shadow-2xl border border-gray-700/20">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Why Choose PixUnlim?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">100% Private</h3>
              <p className="text-gray-300">
                All processing happens locally in your browser. Your images
                never leave your device.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">No Limits</h3>
              <p className="text-gray-300">
                Process unlimited files with no size restrictions. PixUnlim
                handles hundreds or thousands of images at once.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">High Quality</h3>
              <p className="text-gray-300">
                Professional-grade algorithms ensure the best possible results
                for your images with PixUnlim's advanced processing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
