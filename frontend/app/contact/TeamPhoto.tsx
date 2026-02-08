"use client";

import React from 'react';
import Image from 'next/image';

export default function TeamPhoto() {
  const [showFallback, setShowFallback] = React.useState(false);

  React.useEffect(() => {
    const img = document.querySelector('#team-img') as HTMLImageElement;
    if (img && img.complete && img.naturalWidth === 0) {
      setShowFallback(true);
    }
  }, []);

  // const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  //   const target = e.target as HTMLImageElement;
  //   target.style.display = 'none';
  //   setShowFallback(true);
  // };

  return (
    <>
      <Image
        src="/team-photo.jpg"
        alt="Our multilingual team working on voice data collection"
        width={800}
        height={600}
        className="w-full h-auto rounded-lg shadow-lg"
      />
      {showFallback && (
        <div className="text-2xl mx-auto mb-4">👥</div>
      )}
    </>
  );
}
