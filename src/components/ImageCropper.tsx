'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import Link from 'next/link';
import ReactCrop, { type Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CroppedResult {
  originalName: string;
  fileName: string;
  originalSize: number;
  croppedSize: number;
  originalDimensions: { width: number; height: number };
  cropArea: Crop;
}

interface BatchCropResult {
  success: boolean;
  results: (CroppedResult | { originalName: string; error: string })[];
  totalFiles: number;
  successfulConversions: number;
  failedConversions: number;
}

export default function ImageCropper() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isCropping, setIsCropping] = useState(false);
  const [cropProgress, setCropProgress] = useState(0);
  const [result, setResult] = useState<BatchCropResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadMode, setDownloadMode] = useState<'individual' | 'zip'>('individual');
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [crop, setCrop] = useState<Crop>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(16/9);
  const [isAspectRatioEnabled, setIsAspectRatioEnabled] = useState(true);

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
      
      // Take only the first file
      const file = files[0];
      setSelectedFiles([file]);
      setError(null);
      setResult(null);
      setCropProgress(0);
      setCurrentFileIndex(0);
      
      // Load the image preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Reset crop
      setCrop(undefined);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    setImageDimensions({ width, height });
    
    // Don't create initial crop - let user draw their own
    setCrop(undefined);
  };

  const createInitialCrop = () => {
    if (!imageDimensions.width || !imageDimensions.height) return;
    
    if (isAspectRatioEnabled && aspectRatio) {
      // Create crop with aspect ratio
      const crop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 80,
          },
          aspectRatio,
          imageDimensions.width,
          imageDimensions.height
        ),
        imageDimensions.width,
        imageDimensions.height
      );
      setCrop(crop);
    }
  };

  const handleCustomAspectRatio = () => {
    setIsAspectRatioEnabled(false);
    setCrop(undefined);
  };

  // Auto-create crop when aspect ratio settings change
  useEffect(() => {
    if (isAspectRatioEnabled && aspectRatio && imageDimensions.width && imageDimensions.height) {
      createInitialCrop();
    }
  }, [isAspectRatioEnabled, aspectRatio, imageDimensions.width, imageDimensions.height]);

  const cropImage = async (file: File): Promise<{
    blob: Blob;
    originalSize: number;
    croppedSize: number;
    originalDimensions: { width: number; height: number };
    cropArea: Crop;
  }> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!crop) {
          throw new Error('No crop area selected');
        }

        // Create FormData to send to our API endpoint
        const formData = new FormData();
        formData.append('image', file);
        
        // Convert crop coordinates to pixels if they're percentages
        let cropX, cropY, cropWidth, cropHeight;
        
        if (crop.unit === '%') {
          cropX = Math.round((crop.x / 100) * imageDimensions.width);
          cropY = Math.round((crop.y / 100) * imageDimensions.height);
          cropWidth = Math.round((crop.width / 100) * imageDimensions.width);
          cropHeight = Math.round((crop.height / 100) * imageDimensions.height);
        } else {
          cropX = Math.round(crop.x || 0);
          cropY = Math.round(crop.y || 0);
          cropWidth = Math.round(crop.width || 0);
          cropHeight = Math.round(crop.height || 0);
        }
        
        formData.append('cropX', cropX.toString());
        formData.append('cropY', cropY.toString());
        formData.append('cropWidth', cropWidth.toString());
        formData.append('cropHeight', cropHeight.toString());

        // Send to our API endpoint that uses sharp
        const response = await fetch('/api/crop-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Cropping failed: ${response.statusText}`);
        }

        const croppedBlob = await response.blob();
        
        resolve({
          blob: croppedBlob,
          originalSize: file.size,
          croppedSize: croppedBlob.size,
          originalDimensions: imageDimensions,
          cropArea: crop
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleCrop = async () => {
    if (selectedFiles.length === 0 || !crop) return;

    setIsCropping(true);
    setError(null);
    setCropProgress(0);

    try {
      const results: (CroppedResult | { originalName: string; error: string })[] = [];
      let successfulConversions = 0;
      let failedConversions = 0;

      if (downloadMode === 'zip') {
        const zip = new JSZip();
        
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          
          try {
            const { blob, originalSize, croppedSize, originalDimensions, cropArea } = await cropImage(file);
            
            const originalName = file.name.replace(/\.[^/.]+$/, '');
            const extension = file.name.split('.').pop();
            const fileName = `${originalName}_cropped.${extension}`;

            zip.file(fileName, blob);

            results.push({
              originalName: file.name,
              fileName,
              originalSize,
              croppedSize,
              originalDimensions,
              cropArea
            });
            
            successfulConversions++;
          } catch (error) {
            results.push({
              originalName: file.name,
              error: error instanceof Error ? error.message : 'Cropping error'
            });
            failedConversions++;
          }

          setCropProgress(((i + 1) / selectedFiles.length) * 100);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const zipFileName = `cropped-images-${timestamp}.zip`;
        
        const url = window.URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = zipFileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

      } else {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          
          try {
            const { blob, originalSize, croppedSize, originalDimensions, cropArea } = await cropImage(file);
            
            const originalName = file.name.replace(/\.[^/.]+$/, '');
            const extension = file.name.split('.').pop();
            const fileName = `${originalName}_cropped.${extension}`;

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
              croppedSize,
              originalDimensions,
              cropArea
            });
            
            successfulConversions++;
          } catch (error) {
            results.push({
              originalName: file.name,
              error: error instanceof Error ? error.message : 'Cropping error'
            });
            failedConversions++;
          }

          setCropProgress(((i + 1) / selectedFiles.length) * 100);
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
      setError(err instanceof Error ? err.message : 'Cropping error');
    } finally {
      setIsCropping(false);
      setCropProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      
      // Take only the first file
      const file = files[0];
      setSelectedFiles([file]);
      setError(null);
      setResult(null);
      setCropProgress(0);
      setCurrentFileIndex(0);
      
      // Load the image preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Reset crop
      setCrop(undefined);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setResult(null);
    setError(null);
    setCropProgress(0);
    setImagePreview(null);
    setImageDimensions({ width: 0, height: 0 });
    setCrop(undefined);
    setAspectRatio(16/9);
    setIsAspectRatioEnabled(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-900 to-purple-900">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="relative">
            <Link href="/" className="absolute left-0 top-0 p-3 bg-gray-800/80 hover:bg-gray-700/80 rounded-xl transition-colors duration-200 backdrop-blur-sm border border-gray-700/50">
              <svg className="w-5 h-5 text-gray-300 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl shadow-2xl mb-6 glow">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
            Image Cropper
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Crop images to perfect dimensions with interactive selection using React Image Crop library!
          </p>
        </div>

        {/* Upload Zone */}
        {selectedFiles.length === 0 && (
          <div
            className="relative group transition-all duration-300 hover:scale-102"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-purple-600/30 rounded-3xl blur-xl transition-opacity duration-300 opacity-0 group-hover:opacity-50"></div>
            
            <div className="relative backdrop-blur-sm border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 border-gray-600 bg-gray-800/80 hover:border-violet-400 hover:bg-gray-800/90 shadow-xl hover:shadow-2xl">
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl glow">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Upload your image
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Drag a single image here or click to select
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200 glow"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Select Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        {selectedFiles.length > 0 && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-gray-700/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Selected Files ({selectedFiles.length})
              </h3>
              <button
                onClick={clearAllFiles}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className='overflow-hidden max-w-[125px] md:max-w-none'>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {index === currentFileIndex && (
                    <span className="px-2 py-1 bg-violet-600 text-white text-xs rounded-full">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aspect Ratio Settings */}
        {selectedFiles.length > 0 && imagePreview && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-700/20">
                         <div className="text-center mb-6">
               <h3 className="text-xl font-bold text-white mb-2">
                 Aspect Ratio Selection
               </h3>
               <p className="text-gray-300">
                 Choose aspect ratio for consistent proportions or enable free-form cropping
               </p>
             </div>
            
                         <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
               {/* Aspect Ratio Selection */}
               <div className="bg-gray-700/50 rounded-2xl p-6">
                 <label className="block text-lg font-semibold text-white mb-4">Aspect Ratio</label>
                 <div className="grid grid-cols-2 gap-3">
                   <button
                     onClick={() => {
                       setIsAspectRatioEnabled(true);
                       setAspectRatio(16/9);
                       setCrop(undefined);
                     }}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                       isAspectRatioEnabled && aspectRatio === 16/9
                         ? 'bg-violet-600 text-white' 
                         : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                     }`}
                   >
                     16:9 (Landscape)
                   </button>
                   <button
                     onClick={() => {
                       setIsAspectRatioEnabled(true);
                       setAspectRatio(4/3);
                       setCrop(undefined);
                     }}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                       isAspectRatioEnabled && aspectRatio === 4/3
                         ? 'bg-violet-600 text-white' 
                         : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                     }`}
                   >
                     4:3 (Standard)
                   </button>
                   <button
                     onClick={() => {
                       setIsAspectRatioEnabled(true);
                       setAspectRatio(1/1);
                       setCrop(undefined);
                     }}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                       isAspectRatioEnabled && aspectRatio === 1/1
                         ? 'bg-violet-600 text-white' 
                         : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                     }`}
                   >
                     1:1 (Square)
                   </button>
                   <button
                     onClick={() => {
                       setIsAspectRatioEnabled(true);
                       setAspectRatio(3/4);
                       setCrop(undefined);
                     }}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                       isAspectRatioEnabled && aspectRatio === 3/4
                         ? 'bg-violet-600 text-white' 
                         : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                     }`}
                   >
                     3:4 (Portrait)
                   </button>
                   <button
                     onClick={() => {
                       setIsAspectRatioEnabled(true);
                       setAspectRatio(9/16);
                       setCrop(undefined);
                     }}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                       isAspectRatioEnabled && aspectRatio === 9/16
                         ? 'bg-violet-600 text-white' 
                         : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                     }`}
                   >
                     9:16 (Mobile)
                   </button>
                   <button
                     onClick={() => {
                       setIsAspectRatioEnabled(true);
                       setAspectRatio(2/3);
                       setCrop(undefined);
                     }}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                       isAspectRatioEnabled && aspectRatio === 2/3
                         ? 'bg-violet-600 text-white' 
                         : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                     }`}
                   >
                     2:3 (Classic)
                   </button>
                 </div>
                 
                 {/* Custom Aspect Ratio */}
                 <div className="mt-4">
                   <button
                     onClick={handleCustomAspectRatio}
                     className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                       !isAspectRatioEnabled
                         ? 'bg-violet-600 text-white' 
                         : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                     }`}
                   >
                     {!isAspectRatioEnabled ? 'Currently Active - Free-form Cropping' : 'Custom - Free-form Cropping'}
                   </button>
                   <p className="text-xs text-gray-400 text-center mt-2">
                     Allows you to draw crop area in any shape and size without aspect ratio restrictions
                   </p>
                 </div>
               </div>
              
              {/* Create Initial Crop Button */}
              {isAspectRatioEnabled && aspectRatio && !crop && (
                <div className="text-center mt-4">
                  <button
                    onClick={createInitialCrop}
                    className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors duration-200 shadow-lg"
                  >
                    Create Initial Crop Area
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Image Preview and Crop Area */}
        {selectedFiles.length > 0 && imagePreview && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-700/20">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">
                Crop Area Selection
              </h3>
              <p className="text-gray-300">
                {isAspectRatioEnabled && aspectRatio 
                  ? `Crop area locked to ${aspectRatio === 16/9 ? '16:9' : aspectRatio === 4/3 ? '4:3' : aspectRatio === 1/1 ? '1:1' : aspectRatio === 3/4 ? '3:4' : aspectRatio === 9/16 ? '9:16' : '2:3'} ratio`
                  : 'Free-form cropping enabled! Click and drag to create crop area in any shape and size, or use resize handles to adjust.'
                }
              </p>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="max-w-[60%]">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => console.log('Crop complete:', c)}
                  minWidth={50}
                  minHeight={50}
                  keepSelection
                  ruleOfThirds
                  aspect={isAspectRatioEnabled ? aspectRatio : undefined}
                  locked={isAspectRatioEnabled}
                >
                  <img
                    src={imagePreview}
                    alt="Crop preview"
                    className="max-w-full max-h-96 rounded-lg"
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>
            </div>
            
            {crop && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-gray-300">
                <div className="bg-gray-700/50 rounded-2xl p-4">
                  <h4 className="font-semibold text-violet-400 mb-2">Crop Area</h4>
                  <p className="text-lg">
                    {crop.unit === '%' 
                      ? `${crop.width?.toFixed(1)}% × ${crop.height?.toFixed(1)}%`
                      : `${crop.width} × ${crop.height} pixels`
                    }
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded-2xl p-4">
                  <h4 className="font-semibold text-violet-400 mb-2">Position</h4>
                  <p className="text-lg">
                    {crop.unit === '%' 
                      ? `(${crop.x?.toFixed(1)}%, ${crop.y?.toFixed(1)}%)`
                      : `(${crop.x}, ${crop.y})`
                    }
                  </p>
                </div>
                {isAspectRatioEnabled && aspectRatio && (
                  <div className="bg-gray-700/50 rounded-2xl p-4">
                    <h4 className="font-semibold text-violet-400 mb-2">Aspect Ratio</h4>
                    <p className="text-lg">
                      {aspectRatio === 16/9 ? '16:9' : 
                       aspectRatio === 4/3 ? '4:3' : 
                       aspectRatio === 1/1 ? '1:1' : 
                       aspectRatio === 3/4 ? '3:4' : 
                       aspectRatio === 9/16 ? '9:16' : '2:3'}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6 text-center text-sm text-gray-400">
              <p>💡 <strong>Tip:</strong> Click and drag to create crop area, then drag to move or use handles to resize. Any shape is possible!</p>
            </div>
          </div>
        )}

        {/* Download Mode and Crop Button */}
        {selectedFiles.length > 0 && crop && (
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
                        ? 'border-violet-500 bg-violet-900/30'
                        : 'border-gray-600 bg-gray-700/50 hover:border-violet-400 hover:bg-gray-700/70'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          downloadMode === 'individual'
                            ? 'bg-violet-500 text-white'
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
                        ? 'border-violet-500 bg-violet-900/30'
                        : 'border-gray-600 bg-gray-700/50 hover:border-violet-400 hover:bg-gray-700/70'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          downloadMode === 'zip'
                            ? 'bg-violet-500 text-white'
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

              {/* Crop Button */}
              <button
                onClick={handleCrop}
                disabled={isCropping}
                className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                  isCropping
                    ? 'bg-gray-600 cursor-not-allowed scale-95'
                    : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl hover:scale-105 glow'
                }`}
              >
                {isCropping ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Cropping {selectedFiles.length} files...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      {downloadMode === 'zip' 
                        ? `Crop ${selectedFiles.length} files (ZIP)`
                        : `Crop ${selectedFiles.length} files`
                      }
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Progress */}
        {isCropping && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-700/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-white">Cropping in progress...</span>
                <span className="text-violet-400 font-bold">{cropProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${cropProgress}%` }}
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
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl glow">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">
                Cropping completed! 🎉
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-6 rounded-2xl border border-blue-700/30">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{result.totalFiles}</div>
                  <div className="text-gray-300">Total files</div>
                </div>
                <div className="bg-gradient-to-br from-violet-900/50 to-violet-800/30 p-6 rounded-2xl border border-violet-700/30">
                  <div className="text-3xl font-bold text-violet-400 mb-2">{result.successfulConversions}</div>
                  <div className="text-gray-300">Successfully cropped</div>
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
              
              <p className="text-violet-400 font-medium">
                {downloadMode === 'zip' 
                  ? 'ZIP archive with all cropped files has been downloaded to your computer.'
                  : 'All successfully cropped files have been automatically downloaded to your computer.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
