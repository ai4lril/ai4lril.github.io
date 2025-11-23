"use client";

import { useState, useEffect } from 'react';

export default function TeamPhoto() {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const img = document.querySelector('#team-img') as HTMLImageElement;
    if (img && img.complete && img.naturalWidth === 0) {
      setShowFallback(true);
    }
  }, []);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    setShowFallback(true);
  };

  return (
    <>
      <img
        id="team-img"
        src="/placeholder-team.jpg"
        alt="Our Language Data Collection Team"
        className={`w-48 h-48 rounded-full mx-auto mb-4 object-cover bg-slate-200 flex items-center justify-center text-slate-500 ${showFallback ? 'hidden' : ''}`}
        onError={handleError}
        loading="lazy"
      />
      {showFallback && (
        <div className="text-2xl mx-auto mb-4">👥</div>
      )}
    </>
  );
}
