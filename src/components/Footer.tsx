import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-800/50 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">PixUnlim</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Professional image processing tools with unlimited image count support. 
              Convert, compress, resize, and crop unlimited images for free.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Tools</h4>
            <div className="space-y-2">
              <Link href="/converter" className="block text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                WebP Converter
              </Link>
              <Link href="/avif-converter" className="block text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm">
                AVIF Converter
              </Link>
              <Link href="/resizer" className="block text-gray-400 hover:text-green-400 transition-colors duration-200 text-sm">
                Image Resizer
              </Link>
              <Link href="/cropper" className="block text-gray-400 hover:text-violet-400 transition-colors duration-200 text-sm">
                Image Cropper
              </Link>
              <Link href="/compressor" className="block text-gray-400 hover:text-red-400 transition-colors duration-200 text-sm">
                Image Compressor
              </Link>
              <Link href="/png-converter" className="block text-gray-400 hover:text-cyan-400 transition-colors duration-200 text-sm">
                PNG Converter
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Key Features</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Unlimited image count</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>100% free to use</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Local processing</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Batch processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-gray-800/50">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0">
            <div className="text-center space-y-2">
              <div className="text-gray-400 text-sm">
                © {new Date().getFullYear()} PixUnlim.com. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
