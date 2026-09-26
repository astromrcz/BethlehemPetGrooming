import { RouterProvider } from 'react-router';
import { AppProviders } from './contexts';
import { router } from './app/routes';

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
