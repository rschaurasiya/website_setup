import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import imageCompression from 'browser-image-compression';

const ImageCropper = ({ imageSrc, onCropComplete, onCancel, aspect = 1 }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
            image.src = url;
        });

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return null;
        }

        // set canvas size to match the bounding box
        canvas.width = image.width;
        canvas.height = image.height;

        // draw image
        ctx.drawImage(image, 0, 0);

        // croppedAreaPixels values are bounding box relative
        // extract the cropped image using these values
        const data = ctx.getImageData(
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height
        );

        // set canvas width to final desired crop size - this will clear existing context
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        // paste generated rotate image to the top left of new canvas context
        ctx.putImageData(data, 0, 0);

        // As File
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                const fileUrl = window.URL.createObjectURL(blob);
                blob.name = 'newFile.jpeg';
                // resolve({ fileUrl, blob });
                resolve(blob);
            }, 'image/jpeg');
        });
    };



    const handleSave = async () => {
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

            // Compression Options
            const options = {
                maxSizeMB: 0.5, // 500KB
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: 'image/jpeg'
            };

            // Compress the Blob/File
            // Note: browser-image-compression expects a File or Blob.
            // getCroppedImg returns a Blob.
            // We might need to convert it to a File object or ensuring it works with Blob.
            // The library works with Blob/File.

            const compressedFile = await imageCompression(croppedBlob, options);

            // Log for debugging (optional, remove in prod)
            console.log(`Original: ${(croppedBlob.size / 1024).toFixed(2)} KB`);
            console.log(`Compressed: ${(compressedFile.size / 1024).toFixed(2)} KB`);

            onCropComplete(compressedFile);
        } catch (e) {
            console.error("Compression failed:", e);
            // Fallback to original if compression fails
            onCropComplete(await getCroppedImg(imageSrc, croppedAreaPixels));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-white rounded-lg overflow-hidden w-full max-w-lg mx-4 flex flex-col h-[500px]">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg">Adjust Photo</h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="relative flex-1 bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                    />
                </div>

                <div className="p-4 bg-white border-t">
                    <div className="flex items-center gap-4 mb-4">
                        <ZoomOut size={20} className="text-gray-500" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(e.target.value)}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <ZoomIn size={20} className="text-gray-500" />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50">
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Check size={18} /> Save Photo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;
