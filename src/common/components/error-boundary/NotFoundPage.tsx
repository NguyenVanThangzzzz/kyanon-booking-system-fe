import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md">
        <p className="text-8xl font-bold text-primary-600">404</p>
        <h1 className="mt-4 text-2xl font-bold text-secondary-900">Page not found</h1>
        <p className="mt-2 text-secondary-500">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};
