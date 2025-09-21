
import React from 'react';
import { ImageFile } from '../types';

interface ImageGalleryProps {
  images: ImageFile[];
  selectedImage: ImageFile | null;
  referenceImages: ImageFile[];
  onImageSelect: (image: ImageFile) => void;
  onReferenceToggle: (image: ImageFile) => void;
  onImagesUpload: (files: FileList) => void;
  onImageDelete: (imageId: string) => void;
  onNewImage: () => void;
}

export default function ImageGallery({
  images,
  selectedImage,
  referenceImages,
  onImageSelect,
  onReferenceToggle,
  onImagesUpload,
  onImageDelete,
  onNewImage,
}: ImageGalleryProps) {
  return (
    <div className="p-4 bg-[var(--color-background-secondary)] h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]">Image Library</h2>
      <div className="mb-4 flex space-x-2">
         <button
          onClick={onNewImage}
          className="w-full text-center bg-[var(--color-background-tertiary)] hover:bg-opacity-90 text-[var(--color-text-primary)] font-bold py-2 px-4 rounded cursor-pointer transition-opacity"
        >
          New Image
        </button>
        <label
          htmlFor="image-upload"
          className="w-full text-center bg-[var(--color-accent)] hover:opacity-90 text-white font-bold py-2 px-4 rounded cursor-pointer block transition-opacity"
        >
          Upload
        </label>
        <input
          id="image-upload"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              onImagesUpload(e.target.files);
            }
            // Reset the input value to allow re-uploading the same file
            e.target.value = '';
          }}
        />
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] mb-2">Click to select primary image. Checkbox to use as reference for consistency.</p>
      <div className="flex-grow overflow-y-auto space-y-2 pr-2">
        {images.map((image) => (
          <div
            key={image.id}
            className={`relative rounded-lg overflow-hidden border-2 transition-all
              ${selectedImage?.id === image.id ? 'border-[var(--color-accent)] scale-105' : 'border-[var(--color-border)] hover:border-[var(--color-accent-hover)]'}`}
          >
            <img
              src={image.url}
              alt={image.name}
              className="w-full h-auto object-cover cursor-pointer"
              onClick={() => onImageSelect(image)}
            />
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onImageDelete(image.id);
                }}
                className="absolute top-2 left-2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-red-600 transition-colors z-10"
                aria-label={`Delete ${image.name}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                </svg>
            </button>
            <div className="absolute bottom-2 right-2 flex items-center bg-black bg-opacity-50 py-1 px-2 rounded">
              <label htmlFor={`ref-${image.id}`} className="text-white text-xs mr-2 font-semibold cursor-pointer select-none">
                REF
              </label>
              <input
                type="checkbox"
                id={`ref-${image.id}`}
                checked={referenceImages.some(ref => ref.id === image.id)}
                onChange={() => onReferenceToggle(image)}
                disabled={selectedImage?.id === image.id}
                className="h-4 w-4 rounded text-[var(--color-accent)] bg-[var(--color-background-tertiary)] border-[var(--color-border)] focus:ring-[var(--color-accent)] disabled:opacity-50 cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
