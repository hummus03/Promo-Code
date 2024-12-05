import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { Survey } from './components/Survey';

const container = document.getElementById('app');
const root = createRoot(container);

root.render(
  <AppProvider i18n={enTranslations}>
    <Survey />
  </AppProvider>
); 