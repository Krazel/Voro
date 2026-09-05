import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'VORO · Abisal', description: 'Una primera vida. Nada, absorbe nutrientes y despierta como un organismo Abisal.' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#030b12' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="es"><body>{children}</body></html>; }
