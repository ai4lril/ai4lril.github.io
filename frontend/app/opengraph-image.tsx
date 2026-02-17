import { ImageResponse } from 'next/og';

export const alt = 'ILHRF - International Linguistic Heritage Research Foundation';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #6366f1 100%)',
          padding: 48,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-0.02em',
            }}
          >
            ILHRF
          </div>
          <div
            style={{
              fontSize: 28,
              color: 'rgba(255,255,255,0.95)',
              textAlign: 'center',
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            International Linguistic Heritage Research Foundation
          </div>
          <div
            style={{
              fontSize: 24,
              color: 'rgba(255,255,255,0.85)',
              marginTop: 8,
            }}
          >
            Crowdsourced Linguistic Data for 7100+ Languages
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
