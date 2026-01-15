import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';

interface LayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
}

export function Layout({ children, showMobileNav = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-1 ${showMobileNav ? 'pb-20 md:pb-0' : ''}`}>
        {children}
      </main>
      {showMobileNav && <MobileNav />}
    </div>
  );
}
