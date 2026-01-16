import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
  showSearch?: boolean;
  showFooter?: boolean;
  hideNavbarOnMobile?: boolean;
  searchLocation?: string;
  onSearchLocationChange?: (location: string) => void;
  searchDateRange?: { from: Date | undefined; to: Date | undefined };
  onSearchDateRangeChange?: (range: { from: Date | undefined; to: Date | undefined }) => void;
  searchGuestCount?: number;
  onSearchGuestCountChange?: (count: number) => void;
  onSearch?: () => void;
}

export function Layout({ 
  children, 
  showMobileNav = true,
  showSearch = true,
  showFooter = true,
  hideNavbarOnMobile = false,
  searchLocation,
  onSearchLocationChange,
  searchDateRange,
  onSearchDateRangeChange,
  searchGuestCount,
  onSearchGuestCountChange,
  onSearch,
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className={hideNavbarOnMobile ? 'hidden md:block' : ''}>
        <Navbar 
          showSearch={showSearch}
          searchLocation={searchLocation}
          onSearchLocationChange={onSearchLocationChange}
          searchDateRange={searchDateRange}
          onSearchDateRangeChange={onSearchDateRangeChange}
          searchGuestCount={searchGuestCount}
          onSearchGuestCountChange={onSearchGuestCountChange}
          onSearch={onSearch}
        />
      </div>
      <main className={`flex-1 ${showMobileNav ? 'pb-20 md:pb-0' : ''}`}>
        {children}
      </main>
      {showFooter && <Footer />}
      {showMobileNav && <MobileNav />}
    </div>
  );
}
