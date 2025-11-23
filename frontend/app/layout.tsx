import React from 'react';
import './globals.css';
import '../src/design/styles.css';
import 'leaflet/dist/leaflet.css';
import { ThemeProvider } from '../src/design/ThemeProvider';
import { UiStateProvider } from '../src/state/ui/UiStateContext';
import { AreaDataProvider } from '../src/state/data/AreaDataContext';

export const metadata = {
  title: 'Science Tokyo Map',
  description: 'Interactive campus map for Tokyo Tech (prototype)'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <ThemeProvider>
          <AreaDataProvider>
            <UiStateProvider>
              {children}
            </UiStateProvider>
          </AreaDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
