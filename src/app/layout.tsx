import type { Metadata, Viewport } from 'next';
import '@fontsource/jetbrains-mono/400.css';
import '../styles/globals.css';
import { SkipLink } from '@/components/layout/SkipLink';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: '청년지원금렌즈 — 내게 맞는 정부 지원금, 이유까지',
  description: '만 19–34세 청년이 9가지 프로필을 입력하면 자격되는 정부 지원금과 이유를 함께 보여줍니다. 로그인 없음, 3분, 익명.',
  openGraph: {
    title: '청년지원금렌즈 — 내게 맞는 정부 지원금, 이유까지',
    description: '만 19–34세 청년이 9가지 프로필을 입력하면 자격되는 정부 지원금과 이유를 함께 보여줍니다. 로그인 없음, 3분, 익명.',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light', // N35: dark mode out of scope for v5
  themeColor: '#FFFFFF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ToastProvider>
          <SkipLink />
          <div className="app-container">
            <main id="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
