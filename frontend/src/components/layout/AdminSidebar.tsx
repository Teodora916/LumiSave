import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  CreditCard, 
  Users, 
  Settings, 
  BarChart, 
  ChevronDown, 
  LogOut,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

export const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>('shop');

  const mainLinks = [
    { title: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
    { title: 'Transakcije', path: '/admin/transactions', icon: <CreditCard className="w-5 h-5" /> },
    { title: 'Narudžbine', path: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { title: 'Korisnici', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { title: 'Izveštaji', path: '/admin/reports', icon: <BarChart className="w-5 h-5" /> },
  ];

  const shopSubmenu = [
    { title: 'Proizvodi', path: '/admin/products', icon: <Package className="w-4 h-4" /> },
    { title: 'Kategorije', path: '/admin/categories', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 flex flex-col bg-surface-card border-r border-surface-border z-40 transition-colors duration-300">
      
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-surface-border shrink-0">
        <Link to="/admin" className="flex items-center gap-2 group">
          <span className="text-xl transition-transform group-hover:scale-110">⚡</span>
          <span className="font-display font-bold text-xl text-primary">LumiAdmin</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {mainLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.exact}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
            )}
          >
            {link.icon}
            {link.title}
          </NavLink>
        ))}

        {/* E-commerce Submenu */}
        <div className="mt-2">
          <button 
            onClick={() => setOpenSubmenu(openSubmenu === 'shop' ? null : 'shop')}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors font-medium text-sm text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
              openSubmenu === 'shop' && "text-text-primary"
            )}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5" />
              Katalog
            </div>
            <ChevronDown className={cn("w-4 h-4 transition-transform", openSubmenu === 'shop' && "rotate-180")} />
          </button>
          
          <AnimatePresence>
            {openSubmenu === 'shop' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-1 pt-1 pl-11 pr-2">
                  {shopSubmenu.map((sublink) => (
                    <NavLink
                      key={sublink.path}
                      to={sublink.path}
                      className={({ isActive }) => cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm",
                        isActive 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-text-muted hover:text-text-primary hover:bg-surface-subtle"
                      )}
                    >
                      {sublink.icon}
                      {sublink.title}
                    </NavLink>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* User Area */}
      <div className="shrink-0 p-4 border-t border-surface-border bg-surface-subtle/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
              {user?.firstName?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-text-primary truncate">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-xs text-text-muted truncate">Administrator</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Odjavi se"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

    </aside>
  );
};
