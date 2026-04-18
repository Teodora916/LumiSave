import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { AdminShell } from '../components/layout/AdminShell';
import { LandingPage } from '../pages/LandingPage';
import { LEDCalculatorPage } from '../pages/calculator/LEDCalculatorPage';
import { SmartHomeCalculatorPage } from '../pages/calculator/SmartHomeCalculatorPage';
import { ShopPage } from '../pages/shop/ShopPage';
import { CartPage } from '../pages/cart/CartPage';
import { CheckoutPage } from '../pages/cart/CheckoutPage';
import { OrderSuccessPage } from '../pages/cart/OrderSuccessPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';

// Lazy loading for performance using React.lazy / standard imports 
// For now we'll mock the missing pages to prevent build errors
const MockPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <h1 className="text-2xl font-bold">{title} Page</h1>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'shop/:id', element: <MockPage title="Product Detail" /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'checkout/success', element: <OrderSuccessPage /> },
      { path: 'calculator/led', element: <LEDCalculatorPage /> },
      { path: 'calculator/smarthome', element: <SmartHomeCalculatorPage /> },
      { path: 'about', element: <MockPage title="About Us" /> },
    ],
  },
  {
    path: '/auth',
    children: [
      { path: 'login', element: <MockPage title="Login" /> },
      { path: 'register', element: <MockPage title="Register" /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminShell />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'transactions', element: <MockPage title="Admin Transactions" /> },
      { path: 'orders', element: <MockPage title="Admin Orders" /> },
      { path: 'products', element: <MockPage title="Admin Products" /> },
      { path: 'users', element: <MockPage title="Admin Users" /> },
      { path: 'reports', element: <MockPage title="Admin Reports" /> },
    ],
  },
]);
