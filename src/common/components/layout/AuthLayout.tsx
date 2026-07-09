import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-700">Kyanon Booking</h1>
          <p className="mt-1 text-sm text-secondary-500">Room reservation management system</p>
        </div>
        <div className="card">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
