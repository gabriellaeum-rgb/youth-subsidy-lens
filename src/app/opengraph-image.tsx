import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
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
          background: 'linear-gradient(135deg, #2DC7F0 0%, #4C6EF5 50%, #8B5CF6 100%)',
          color: '#FFFFFF',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, display: 'flex' }}>청년지원금렌즈</div>
        <div style={{ fontSize: 32, marginTop: 24, opacity: 0.9, display: 'flex' }}>
          내게 맞는 정부 지원금, 이유까지 함께
        </div>
      </div>
    ),
    { ...size },
  );
}
