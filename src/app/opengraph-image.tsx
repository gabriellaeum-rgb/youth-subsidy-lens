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
          background: '#2554F0',
          color: '#FFFFFF',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, display: 'flex' }}>YouthFundLens</div>
        <div style={{ fontSize: 32, marginTop: 24, opacity: 0.9, display: 'flex' }}>
          Government subsidies you qualify for, with reasons.
        </div>
      </div>
    ),
    { ...size },
  );
}
