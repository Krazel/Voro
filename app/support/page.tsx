import type { Metadata } from 'next';
import Link from 'next/link';
import '../legal.css';

export const metadata: Metadata = {
  title: 'Soporte · VORO: Abisal',
  description: 'Ayuda y soporte de VORO: Abisal.',
};

export default function SupportPage() {
  return (
    <main className="legal-page">
      <article className="legal-content">
        <p className="legal-kicker">VORO · Abisal</p>
        <h1>Soporte</h1>
        <h2>Controles</h2>
        <p>Arrastra sobre la escena para mover el organismo. En teclado puedes usar WASD o las flechas; la tecla Espacio activa el impulso.</p>
        <h2>Informar de un problema</h2>
        <p>Incluye el modelo del dispositivo, la versión de VORO y el entorno en el que ocurre. Usa el canal de soporte indicado en la ficha de la aplicación.</p>
        <nav className="legal-nav" aria-label="Enlaces legales">
          <Link href="/privacy">Privacidad</Link>
          <Link href="/">Volver a VORO</Link>
        </nav>
      </article>
    </main>
  );
}
