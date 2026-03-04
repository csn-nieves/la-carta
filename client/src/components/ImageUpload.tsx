import type { RefObject } from 'react';

interface ImageUploadProps {
  imagePreview: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

export default function ImageUpload({ imagePreview, fileInputRef, onImageChange, onClear }: ImageUploadProps) {
  return (
    <div>
      <label className="form-label mb-2">Photo</label>
      <div
        onClick={() => !imagePreview && fileInputRef.current?.click()}
        className={`border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl text-center transition-colors ${imagePreview ? '' : 'p-6 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500'}`}
      >
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="Preview" className="w-full aspect-square object-cover rounded-lg" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white border-none cursor-pointer text-sm flex items-center justify-center hover:bg-black/80"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="text-neutral-400">
            <p className="text-3xl mb-2">📷</p>
            <p className="text-sm">Tap to add a photo</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
