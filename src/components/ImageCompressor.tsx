'use client';

import { useState, useRef } from 'react';
import JSZip from 'jszip';
import Link from 'next/link';

interface CompressionResult {
  originalName: string;
  fileName: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  originalDimensions: { width: number; height: number };
}

interface BatchCompressionResult {
  success: boolean;
  results: (CompressionResult | { originalName: string; error: string })[];
  totalFiles: number;
  successfulConversions: number;
  failedConversions: number;
}

export default function ImageCompressor() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [result, setResult] = useState<BatchCompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadMode, setDownloadMode] = useState<'individual' | 'zip'>('individual');

  // Compression settings
  const [quality, setQuality] = useState(80);
  
  const [fileDimensions, setFileDimensions] = useState<{
    [key: string]: { width: number; height: number };
  }>({});
  const [isLoadingDimensions, setIsLoadingDimensions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        setError(`Unsupported file formats: ${invalidFiles.map(f => f.name).join(', ')}. Only JPEG, JPG, PNG, WebP and GIF are supported`);
        return;
      }
      
      setSelectedFiles(prev => [...prev, ...files]);
      setError(null);
      setResult(null);
      setCompressionProgress(0);

      // Get dimensions for all files
      setIsLoadingDimensions(true);
      const dimensions: { [key: string]: { width: number; height: number } } = {};
      for (const file of files) {
        try {
          const dims = await getImageDimensions(file);
          dimensions[file.name] = dims;
        } catch (error) {
          console.error(`Failed to get dimensions for ${file.name}:`, error);
        }
      }
      setFileDimensions(prev => ({ ...prev, ...dimensions }));
      setIsLoadingDimensions(false);
    }
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const compressImage = async (file: File): Promise<{
    blob: Blob;
    originalSize: number;
    compressedSize: number;
    originalDimensions: { width: number; height: number };
  }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const originalDimensions = await getImageDimensions(file);

        // Create FormData to send to our API endpoint
        const formData = new FormData();
        formData.append('image', file);
        formData.append('quality', quality.toString());

        // Send to our API endpoint that uses sharp
        const response = await fetch('/api/compress-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Compression failed: ${response.statusText}`);
        }

        const compressedBlob = await response.blob();
        
        resolve({
          blob: compressedBlob,
          originalSize: file.size,
          compressedSize: compressedBlob.size,
          originalDimensions
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleCompress = async () => {
    if (selectedFiles.length === 0) return;

    setIsCompressing(true);
    setError(null);
    setCompressionProgress(0);

    try {
      const results: (CompressionResult | { originalName: string; error: string })[] = [];
      let successfulConversions = 0;
      let failedConversions = 0;

      if (downloadMode === 'zip') {
        // Create ZIP archive
        const zip = new JSZip();
        
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          
          try {
            const { blob, originalSize, compressedSize, originalDimensions } = await compressImage(file);
            
            const originalName = file.name.replace(/\.[^/.]+$/, '');
            const extension = file.name.split('.').pop();
            const fileName = `${originalName}.${extension}`;

            // Add file to ZIP
            zip.file(fileName, blob);

            results.push({
              originalName: file.name,
              fileName,
              originalSize,
              compressedSize,
              compressionRatio: ((originalSize - compressedSize) / originalSize) * 100,
              originalDimensions
            });
            
            successfulConversions++;
          } catch (error) {
            results.push({
              originalName: file.name,
              error: error instanceof Error ? error.message : 'Compression error'
            });
            failedConversions++;
          }

          // Update progress
          setCompressionProgress(((i + 1) / selectedFiles.length) * 100);
        }

        // Generate and download ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const zipFileName = `compressed-images-${timestamp}.zip`;
        
        const url = window.URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = zipFileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

      } else {
        // Individual downloads
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          
          try {
            const { blob, originalSize, compressedSize, originalDimensions } = await compressImage(file);
            
            const originalName = file.name.replace(/\.[^/.]+$/, '');
            const extension = file.name.split('.').pop();
            const fileName = `${originalName}.${extension}`;

            // Download the file
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            results.push({
              originalName: file.name,
              fileName,
              originalSize,
              compressedSize,
              compressionRatio: ((originalSize - compressedSize) / originalSize) * 100,
              originalDimensions
            });
            
            successfulConversions++;
          } catch (error) {
            results.push({
              originalName: file.name,
              error: error instanceof Error ? error.message : 'Compression error'
            });
            failedConversions++;
          }

          // Update progress
          setCompressionProgress(((i + 1) / selectedFiles.length) * 100);
        }
      }

      setResult({
        success: true,
        results,
        totalFiles: selectedFiles.length,
        successfulConversions,
        failedConversions
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compression error');
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalSize = (): number => {
    return selectedFiles.reduce((total, file) => total + file.size, 0);
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        setError(`Unsupported file formats: ${invalidFiles.map(f => f.name).join(', ')}. Only JPEG, JPG, PNG, WebP and GIF are supported`);
        return;
      }
      
      setSelectedFiles(prev => [...prev, ...files]);
      setError(null);
      setResult(null);
      setCompressionProgress(0);

      // Get dimensions for all files
      setIsLoadingDimensions(true);
      const dimensions: { [key: string]: { width: number; height: number } } = {};
      for (const file of files) {
        try {
          const dims = await getImageDimensions(file);
          dimensions[file.name] = dims;
        } catch (error) {
          console.error(`Failed to get dimensions for ${file.name}:`, error);
        }
      }
      setFileDimensions(prev => ({ ...prev, ...dimensions }));
      setIsLoadingDimensions(false);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const removeFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFileDimensions(prev => {
      const newDimensions = { ...prev };
      delete newDimensions[fileToRemove.name];
      return newDimensions;
    });
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setResult(null);
    setError(null);
    setCompressionProgress(0);
    setFileDimensions({});
    setIsLoadingDimensions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-pink-900">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="relative">
            <Link href="/" className="absolute left-0 top-0 p-3 bg-gray-800/80 hover:bg-gray-700/80 rounded-xl transition-colors duration-200 backdrop-blur-sm border border-gray-700/50">
              <svg className="w-5 h-5 text-gray-300 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl shadow-2xl mb-6 glow">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-red-200 to-pink-200 bg-clip-text text-transparent">
            Image Compressor
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Compress images to reduce file size while maintaining quality - process locally in your browser!
          </p>
        </div>

        {/* Upload Zone */}
        <div
          className={`relative group transition-all duration-300 ${
            selectedFiles.length > 0
              ? 'scale-105'
              : 'hover:scale-102'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-red-600/30 to-pink-600/30 rounded-3xl blur-xl transition-opacity duration-300 ${
            selectedFiles.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
          }`}></div>
          
          <div className={`relative backdrop-blur-sm border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
            selectedFiles.length > 0
              ? 'border-red-400 bg-red-900/20 shadow-2xl shadow-red-500/20'
              : 'border-gray-600 bg-gray-800/80 hover:border-red-400 hover:bg-gray-800/90 shadow-xl hover:shadow-2xl'
          }`}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFiles.length === 0 ? (
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl glow">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Upload your images
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Drag files here or click to select
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-400 mb-8">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      JPG
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      PNG
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      WebP
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      GIF
                    </span>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200 glow"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Select Files
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl glow">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedFiles.length} files ready
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Total size: <span className="font-semibold text-red-400">{formatFileSize(getTotalSize())}</span>
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={clearAllFiles}
                      className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors duration-200 shadow-lg"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-gray-700 text-white font-medium rounded-xl hover:bg-gray-600 transition-colors duration-200 shadow-lg"
                    >
                      Add More
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compression Settings */}
        {selectedFiles.length > 0 && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-700/20">
            <h3 className="text-xl font-bold text-white mb-6">
              Compression Settings
            </h3>
            <div className="space-y-6">
              {/* Quality Slider */}
              <div>
                <label className="block text-lg font-semibold text-gray-200 mb-4">
                  Quality: <span className="text-red-400">{quality}%</span>
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>High compression</span>
                    <span>High quality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        {selectedFiles.length > 0 && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-700/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                Selected Files
              </h3>
              <span className="px-4 py-2 bg-red-900/50 text-red-300 font-semibold rounded-full text-sm border border-red-700/50">
                {selectedFiles.length} files
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-3 custom-scrollbar">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-700/50 to-red-900/30 rounded-2xl border border-gray-600/50 hover:shadow-lg hover:border-gray-500/50 transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-white truncate max-w-xs">{file.name}</p>
                      <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                      {isLoadingDimensions ? (
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="text-yellow-400">Loading dimensions...</span>
                        </div>
                      ) : fileDimensions[file.name] ? (
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="text-red-400">
                            {fileDimensions[file.name].width} × {fileDimensions[file.name].height}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="text-red-400">Failed to load dimensions</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 text-red-400 hover:bg-red-900/30 rounded-xl transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Download Mode and Compress Button */}
        {selectedFiles.length > 0 && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-700/20">
            <div className="space-y-8">
              {/* Download Mode */}
              <div>
                <label className="block text-lg font-semibold text-gray-200 mb-4">
                  Download Mode
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`relative cursor-pointer group`}>
                    <input
                      type="radio"
                      value="individual"
                      checked={downloadMode === 'individual'}
                      onChange={(e) => setDownloadMode(e.target.value as 'individual' | 'zip')}
                      className="sr-only"
                    />
                    <div className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                      downloadMode === 'individual'
                        ? 'border-red-500 bg-red-900/30'
                        : 'border-gray-600 bg-gray-700/50 hover:border-red-400 hover:bg-gray-700/70'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          downloadMode === 'individual'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Individual Files</h4>
                          <p className="text-sm text-gray-400">{selectedFiles.length} downloads</p>
                        </div>
                      </div>
                    </div>
                  </label>
                  
                  <label className={`relative cursor-pointer group`}>
                    <input
                      type="radio"
                      value="zip"
                      checked={downloadMode === 'zip'}
                      onChange={(e) => setDownloadMode(e.target.value as 'individual' | 'zip')}
                      className="sr-only"
                    />
                    <div className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                      downloadMode === 'zip'
                        ? 'border-red-500 bg-red-900/30'
                        : 'border-gray-600 bg-gray-700/50 hover:border-red-400 hover:bg-gray-700/70'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          downloadMode === 'zip'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">ZIP Archive</h4>
                          <p className="text-sm text-gray-400">1 download</p>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Compress Button */}
              <button
                onClick={handleCompress}
                disabled={isCompressing}
                className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                  isCompressing
                    ? 'bg-gray-600 cursor-not-allowed scale-95'
                    : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-3xl hover:scale-105 glow'
                }`}
              >
                {isCompressing ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Compressing {selectedFiles.length} files...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>
                      {downloadMode === 'zip' 
                        ? `Compress ${selectedFiles.length} files (ZIP)`
                        : `Compress ${selectedFiles.length} files`
                      }
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Progress */}
        {isCompressing && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-700/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-white">Compression in progress...</span>
                <span className="text-red-400 font-bold">{compressionProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-pink-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${compressionProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 backdrop-blur-sm border border-red-700/50 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-300 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-700/20">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl glow">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">
                Compression completed! 🎉
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-6 rounded-2xl border border-blue-700/30">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{result.totalFiles}</div>
                  <div className="text-gray-300">Total files</div>
                </div>
                <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 p-6 rounded-2xl border border-red-700/30">
                  <div className="text-3xl font-bold text-red-400 mb-2">{result.successfulConversions}</div>
                  <div className="text-gray-300">Successfully compressed</div>
                </div>
                <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 p-6 rounded-2xl border border-red-700/30">
                  <div className="text-3xl font-bold text-red-400 mb-2">{result.failedConversions}</div>
                  <div className="text-gray-300">Errors</div>
                </div>
              </div>
              
              {result.failedConversions > 0 && (
                <div className="bg-red-900/30 rounded-2xl p-6 border border-red-700/30">
                  <h4 className="font-semibold text-red-300 mb-3">Files with errors:</h4>
                  <div className="space-y-2">
                    {result.results
                      .filter(r => 'error' in r)
                      .map((r, index) => (
                        <div key={index} className="text-sm text-red-300 bg-red-900/50 p-3 rounded-xl border border-red-700/30">
                          • {r.originalName}: {r.error}
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              <p className="text-red-400 font-medium">
                {downloadMode === 'zip' 
                  ? 'ZIP archive with all compressed files has been downloaded to your computer.'
                  : 'All successfully compressed files have been automatically downloaded to your computer.'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f97316, #dc2626);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ea580c, #b91c1c);
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, #f97316, #dc2626);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, #f97316, #dc2626);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </div>
  );
}
