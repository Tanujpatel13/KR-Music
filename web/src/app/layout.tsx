import './globals.css';
import Providers from '../components/Providers';
import ClientLayout from '../components/ClientLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KR Music - Premium Sound Streaming Platform',
  description: 'Stream your favorite tracks, compile playlists, and listen to trending electronic and synthwave artists in high-fidelity audio.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-brandBg text-brandWhite select-none h-screen flex flex-col overflow-hidden">
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
