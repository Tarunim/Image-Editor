import React, { useState, useEffect, useCallback } from 'react';

interface FullscreenButtonProps {
  targetId: string;
}

export default function FullscreenButton({ targetId }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenChange = useCallback(() => {
    const targetElement = document.getElementById(targetId);
    setIsFullscreen(document.fullscreenElement === targetElement);
  }, [targetId]);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  const toggleFullscreen = async () => {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) {
      console.error('Fullscreen target element not found:', targetId);
      return;
    }

    if (!document.fullscreenElement) {
      try {
        await targetElement.requestFullscreen();
      } catch (err) {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
      }
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      className="absolute top-2 right-2 z-10 p-2 bg-black bg-opacity-40 text-white rounded-full hover:bg-opacity-60 transition-all"
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFullscreen ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M15 5a1 1 0 00-1-1h-4a1 1 0 100 2h3v3a1 1 0 102 0V5zM5 5a1 1 0 011-1h3a1 1 0 110 2H6v3a1 1 0 11-2 0V5zM15 15a1 1 0 01-1 1h-3a1 1 0 110-2h3v-3a1 1 0 112 0v4zM5 15a1 1 0 001 1h4a1 1 0 100-2H6v-3a1 1 0 10-2 0v4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a1 1 0 00-1 1v4a1 1 0 102 0V5h3a1 1 0 100-2H4zm12 0a1 1 0 00-1 1v3a1 1 0 102 0V4h-3a1 1 0 100-2h3zM4 17a1 1 0 001-1v-3a1 1 0 10-2 0v4a1 1 0 001 1zm12 0a1 1 0 001-1v-4a1 1 0 10-2 0v3h-3a1 1 0 100 2h4z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}
