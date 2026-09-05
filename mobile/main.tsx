import React, { lazy, Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Home from '../app/page';
import '../app/globals.css';
const AnimationStudio = lazy(() => import('../app/animaciones/page'));
const InterfaceStudio = lazy(() => import('../app/interfaz/page'));

function MobileApp() {
  const [path, setPath] = useState(location.hash.slice(1) || '/');
  useEffect(() => {
    const navigate = () => { setPath(location.hash.slice(1) || '/'); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  return <Suspense fallback={<output>Cargando…</output>}>
    {path === '/animaciones' ? <AnimationStudio /> : path === '/interfaz' ? <InterfaceStudio /> : <Home />}
  </Suspense>;
}

createRoot(document.getElementById('root')!).render(<MobileApp />);
