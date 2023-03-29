import React from 'react';
import ReactDOM from 'react-dom/client';
import './dashboard.scss';
import {
  RouterProvider,
  createMemoryRouter,
} from "react-router-dom";
import App from './DashboardApp';

const dashboardRoot = ReactDOM.createRoot(
  document.getElementById('dashboard') as HTMLElement
);

const router = createMemoryRouter([
  {
    path: "/",
    element: <App />,
  },
]);

dashboardRoot.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
