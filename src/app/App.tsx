import { AppProvider } from './AppProvider';
import { AppRouter } from './router';
import { AppLoadingGate } from './AppLoadingGate';
import { ErrorBoundary } from '@/common/components/error-boundary/ErrorBoundary';

export const App = () => (
  <ErrorBoundary>
    <AppProvider>
      <AppLoadingGate>
        <AppRouter />
      </AppLoadingGate>
    </AppProvider>
  </ErrorBoundary>
);
