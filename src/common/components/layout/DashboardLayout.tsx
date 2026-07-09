import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/common/utils/cn';
import { Sidebar } from './dashboard/Sidebar';
import { DashboardTopbar } from './dashboard/DashboardTopbar';

const TABLET_BREAKPOINT = 1024;

export const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < TABLET_BREAKPOINT);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isTablet = window.innerWidth < TABLET_BREAKPOINT;
      setCollapsed(isTablet);
      if (window.innerWidth >= TABLET_BREAKPOINT) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidth = collapsed ? 'lg:pl-16' : 'lg:pl-64';

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed((v) => !v)}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main area shifts right on desktop to accommodate sidebar */}
      <div className={cn('flex flex-col min-h-screen transition-all duration-300', sidebarWidth)}>
        <DashboardTopbar onMobileMenuOpen={() => setMobileOpen(true)} />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
