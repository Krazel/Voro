import type { Metadata } from 'next';
import Link from 'next/link';
import '../legal.css';

export const metadata: Metadata = {
  title: 'Privacidad · VORO: Abisal',
  description: 'Información de privacidad de VORO: Abisal.',
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <article className="legal-content">
        <p className="legal-kicker">VORO · Abisal</p>
        <h1>Privacidad</h1>
        <p>VORO: Abisal está diseñado para jugar sin cuenta y sin enviar automáticamente datos personales a nuestros servidores.</p>
        <h2>Datos que guarda la app</h2>
        <p>El progreso, las preferencias y los informes de rendimiento se guardan localmente en el dispositivo. Puedes borrarlos desde la configuración del juego.</p>
        <h2>Datos que no recopilamos</h2>
        <p>La app no usa publicidad ni seguimiento y no crea perfiles de usuario. No vendemos ni compartimos datos personales con terceros.</p>
        <h2>Contacto</h2>
        <p>Para solicitar ayuda sobre privacidad, utiliza el canal de soporte indicado en la ficha de la aplicación.</p>
        <nav className="legal-nav" aria-label="Enlaces legales">
          <Link href="/support">Soporte</Link>
          <Link href="/">Volver a VORO</Link>
        </nav>
      </article>
    </main>
  );
}
