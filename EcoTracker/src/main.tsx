import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import LanguageDetector from 'i18next-browser-languagedetector';
import i18next from "i18next";
import { initReactI18next } from 'react-i18next'
import HttpApi from 'i18next-http-backend'

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

i18next
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'es'],
    fallbackLng: 'es',
    debug: false,
    detection: {
      order: ['path', 'cookie', 'htmlTag'],
      caches: ['cookie'],
    },
    backend: {
      loadPath: '/assets/locales/{{lng}}/translation.json',
    },
  })