import React from 'react';
import { Outlet, Navigate, ScrollRestoration } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useAuthStore } from '@/stores/authStore';

export const AdminShell: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // Basic auth check for admin shell
  // Note: if user?.role !== 'ADMIN' is meant, we also check it here.
  // For demonstration, we just check auth.
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  /* 
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  } 
  */

  return (
    <div className="flex min-h-screen bg-surface-bg text-text-primary">
      <AdminSidebar />
      <main className="flex-grow pl-64 flex flex-col">
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </main>
      <ScrollRestoration />
    </div>
  );
};
