import React from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const AppShell: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[88px] flex flex-col">
        {/* pt-[88px] compensates for the fixed navbar height */}
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
};
