import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import {
  RouterProvider,
  createMemoryRouter,
} from "react-router-dom";
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const router = createMemoryRouter([
  {
    path: "/",
    element: <App />,
  },
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
