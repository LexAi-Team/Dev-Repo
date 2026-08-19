import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-700"></div>
      <div className="mt-4 text-amber-900 font-semibold">Loading LexAI...</div>
    </div>
  );
};

export default LoadingSpinner;
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-off-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gold border-t-transparent"></div>
        <p className="mt-4 text-brown-tan font-serif text-lg">Loading LexAI...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
