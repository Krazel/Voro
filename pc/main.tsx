import React from 'react';
import { createRoot } from 'react-dom/client';
import '../app/globals.css';
import Home from '../app/page';
import { initializeLanguage } from '../app/language.mjs';
import './desktop.css';
initializeLanguage();
createRoot(document.getElementById('root')!).render(<Home desktop />);
