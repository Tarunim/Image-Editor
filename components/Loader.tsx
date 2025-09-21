import React from 'react';

interface LoaderProps {
    message?: string;
}

export default function Loader({ message = 'Generating your image...' }: LoaderProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center z-50">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[var(--color-accent)]"></div>
      <p className="text-white mt-4 text-lg">{message}</p>
      {message === 'Generating your image...' && (
         <p className="text-gray-400 mt-2">This may take a moment. Please wait.</p>
      )}
    </div>
  );
}