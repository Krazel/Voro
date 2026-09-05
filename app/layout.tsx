import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'VORO · Abisal',
  description:
    'La vida en una gota: explora un mundo microscópico infinito, absorbe organismos y adapta tu membrana.',
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#030b12',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
