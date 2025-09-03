# PixUnlim - Unlimited Image Processing Tools

Professional image processing suite with unlimited image count support. Convert, compress, resize, and crop unlimited images for free at pixunlim.com.

## Features

- 🖼️ **Multiple Format Support**: PNG, JPG, JPEG, WebP, GIF, AVIF
- ⚡ **Unlimited Processing**: Process hundreds or thousands of images at once
- 📦 **ZIP Archives**: Download all processed files as a single ZIP archive
- 🎛️ **Quality Settings**: Adjust compression quality from 1% to 100%
- 📊 **Detailed Statistics**: File size comparisons and compression ratios
- 🖱️ **Drag & Drop**: Convenient file upload interface
- 📥 **Auto Download**: Converted files are automatically downloaded
- 🎨 **Modern UI**: Beautiful and responsive interface with Tailwind CSS
- 🔄 **Multiple Tools**: Convert, Compress, Resize, Crop images
- 🚀 **Fast Processing**: Optimized Sharp.js backend for speed
- 🔒 **100% Private**: All processing happens on the server, no data stored

## Technologies

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Image Processing**: Sharp
- **Backend**: Next.js API Routes
- **Archiving**: JSZip

## Installation

1. Clone the repository:
```bash
git clone https://github.com/SerhiiAndruschenko/image-tools-suite.git
cd image-tools-suite
```

2. Install dependencies:
```bash
npm install
```

3. Run the application in development mode:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Bulk File Upload

1. **File Upload**:
   - Drag and drop images into the upload zone
   - Or click "Select Files" to choose from the file system
   - Supports up to 500 files simultaneously

2. **Download Mode Settings**:
   - **Individual Files**: Each WebP file is downloaded separately
   - **ZIP Archive**: All files are packaged into a single ZIP archive

3. **Quality Settings**:
   - Use the slider to set the desired WebP quality
   - Lower quality = smaller file size
   - Higher quality = better visual result

4. **Conversion**:
   - Click "Convert Files to WebP"
   - Wait for processing to complete
   - Files are automatically downloaded to your computer

### File Management

- **Remove Individual Files**: Click ✕ next to the file name
- **Clear All Files**: Click "Clear All"
- **Add More Files**: Click "Add More" to add to existing files

## API Endpoints

### POST /api/convert

Converts images to WebP format with individual download.

**Parameters:**
- `files` (File[]): Array of images to convert (PNG, JPG, JPEG)
- `quality` (number): WebP quality (1-100, default 80)

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "originalName": "image.jpg",
      "fileName": "image.webp",
      "originalSize": 1024000,
      "convertedSize": 256000,
      "compressionRatio": 75.0,
      "webpBuffer": "base64_encoded_webp_data"
    }
  ],
  "totalFiles": 1,
  "successfulConversions": 1,
  "failedConversions": 0
}
```

### POST /api/convert-zip

Converts images to WebP format and returns a ZIP archive.

**Parameters:**
- `files` (File[]): Array of images to convert (PNG, JPG, JPEG)
- `quality` (number): WebP quality (1-100, default 80)

**Response:**
- Success: ZIP file for download
- Error: JSON with error message

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── convert/
│   │   │   └── route.ts          # API endpoint for individual conversion
│   │   └── convert-zip/
│   │       └── route.ts          # API endpoint for ZIP archive
│   ├── page.tsx                  # Main page
│   └── layout.tsx                # Application layout
├── components/
│   └── ImageConverter.tsx        # Main converter component
└── ...
```

## WebP Advantages

- **Smaller Size**: WebP files are typically 25-35% smaller than JPEG at the same quality
- **Transparency Support**: Unlike JPEG, WebP supports alpha channel
- **Modern Format**: Developed by Google for web use
- **Fast Loading**: Smaller files = faster page loading

## Limitations

- **Maximum File Count**: 500 files at once
- **Supported Formats**: JPG, JPEG, PNG only
- **File Size**: Depends on browser and server settings

## License

MIT License

## Author

Created by PixUnlim.com for professional image optimization and unlimited processing capabilities.
