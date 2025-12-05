import React from 'react';

import { RouterProvider, createRouter } from '@tanstack/react-router';

import { inject } from '@vercel/analytics';

import ReactDOM from 'react-dom/client';

import './index.css';
import { routeTree } from './routeTree.gen';

// Initialize Vercel Web Analytics
inject();

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    </React.StrictMode>
);
