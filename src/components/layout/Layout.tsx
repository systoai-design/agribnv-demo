import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';

interface LayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
  showSearch?: boolean;
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
      <main className={`flex-1 ${showMobileNav ? 'pb-20 md:pb-0' : ''}`}>
        {children}
      </main>
      {showMobileNav && <MobileNav />}
    </div>
  );
}
