import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2DC7F0 0%, #4C6EF5 50%, #8B5CF6 100%)',
          borderRadius: 6,
          color: '#FFFFFF',
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        Y
      </div>
    ),
    { ...size },
  );
}
