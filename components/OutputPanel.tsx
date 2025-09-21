
import React from 'react';
import FullscreenButton from './FullscreenButton';

interface OutputPanelProps {
  outputImage: string | null;
  outputVideo: string | null; // Blob URL for video
  onUseAsInput: () => void;
  isLoading: boolean;
}

export default function OutputPanel({ outputImage, outputVideo, onUseAsInput, isLoading }: OutputPanelProps) {
  
  const outputUrl = outputImage || outputVideo;
  const isVideo = !!outputVideo;

  const handleSave = () => {
    if (!outputUrl) return;
    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = `gemini-output-${Date.now()}.${isVideo ? 'mp4' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="bg-[var(--color-background-primary)] p-4 flex flex-col items-center justify-center h-full">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 self-start">Output</h2>
      <div 
        id="output-panel-content"
        className="flex-grow w-full flex items-center justify-center relative rounded-lg bg-[var(--color-background-tertiary)] overflow-hidden"
      >
        <FullscreenButton targetId="output-panel-content" />
        {outputUrl ? (
          isVideo ? (
             <video src={outputUrl} controls autoPlay loop className="max-w-full max-h-full object-contain" />
          ) : (
            <img src={outputUrl} alt="Generated output" className="max-w-full max-h-full object-contain" />
          )
        ) : (
          <div className="text-center text-[var(--color-text-secondary)]">
            <p>Your generated output will appear here.</p>
          </div>
        )}
      </div>
      {outputUrl && (
        <div className="mt-4 w-full flex space-x-2">
            <button
              onClick={handleSave}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isVideo ? 'Save Video' : 'Save Image'}
            </button>
            <button
              onClick={onUseAsInput}
              className="w-full bg-[var(--color-accent)] hover:opacity-90 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || isVideo}
              title={isVideo ? "Cannot use video as input" : "Use as Input"}
            >
              Use as Input
            </button>
        </div>
      )}
    </div>
  );
}
