import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { AdminShell } from '../components/layout/AdminShell';
import { LandingPage } from '../pages/LandingPage';
import { LEDCalculatorPage } from '../pages/calculator/LEDCalculatorPage';
import { SmartHomeCalculatorPage } from '../pages/calculator/SmartHomeCalculatorPage';
import { ShopPage } from '../pages/shop/ShopPage';
import { ProductDetailPage } from '../pages/shop/ProductDetailPage';
import { CartPage } from '../pages/cart/CartPage';
import { CheckoutPage } from '../pages/cart/CheckoutPage';
import { OrderSuccessPage } from '../pages/cart/OrderSuccessPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { AboutPage } from '../pages/AboutPage';
import { ProtectedRoute } from './ProtectedRoute';

import { UsersAdminPage } from '../pages/admin/UsersAdminPage';
import { ProductsAdminPage } from '../pages/admin/ProductsAdminPage';
import { OrdersAdminPage } from '../pages/admin/OrdersAdminPage';
import { SettingsAdminPage } from '../pages/admin/SettingsAdminPage';

// Minimal placeholder for remaining admin stubs
const AdminMockPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <h1 className="text-2xl font-bold">{title} — Coming Soon</h1>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'shop/:slug', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      { path: 'checkout/success', element: <OrderSuccessPage /> },
      { path: 'calculator/led', element: <LEDCalculatorPage /> },
      { path: 'calculator/smarthome', element: <SmartHomeCalculatorPage /> },
      { path: 'about', element: <AboutPage /> },
    ],
  },
  {
    // Auth pages use full-screen layout (no AppShell)
    path: '/auth',
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'transactions', element: <AdminMockPage title="Transakcije" /> },
      { path: 'orders', element: <OrdersAdminPage /> },
      { path: 'products', element: <ProductsAdminPage /> },
      { path: 'users', element: <UsersAdminPage /> },
      { path: 'settings', element: <SettingsAdminPage /> },
      { path: 'reports', element: <AdminMockPage title="Izveštaji" /> },
    ],
  },
]);
