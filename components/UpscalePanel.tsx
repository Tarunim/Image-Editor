
import React from 'react';

interface UpscalePanelProps {
  multiplier: number;
  setMultiplier: (multiplier: number) => void;
  onUpscaleImage: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export default function UpscalePanel({
  multiplier,
  setMultiplier,
  onUpscaleImage,
  isLoading,
  disabled
}: UpscalePanelProps) {
  return (
    <div className="p-4 bg-[var(--color-background-secondary)] h-full flex flex-col space-y-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Upscale Controls</h2>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          Upscale Factor
        </label>
        <div className="flex space-x-2">
          {[2, 4].map((factor) => (
            <button
              key={factor}
              onClick={() => setMultiplier(factor)}
              className={`px-4 py-2 rounded-md text-sm font-medium w-full transition-colors ${
                multiplier === factor
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-background-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)]'
              }`}
              disabled={isLoading || disabled}
            >
              {factor}x
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-grow flex items-center">
        <p className="text-sm text-[var(--color-text-secondary)] text-center">
            This will upscale the selected input image. Use the "Use as Input" button on a generated image to upscale it.
        </p>
      </div>

      <button
        onClick={onUpscaleImage}
        className="w-full bg-[var(--color-accent)] hover:opacity-90 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading || disabled}
      >
        {isLoading ? 'Upscaling...' : 'Upscale Image'}
      </button>
    </div>
  );
}
