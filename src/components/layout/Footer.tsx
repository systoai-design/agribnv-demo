import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Agribnv Logo Icon (just the A with leaf)
function AgribnvIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn("h-8 w-8", className)}>
      <path 
        d="M24 4L44 44H35L24 24L13 44H4L24 4Z" 
        fill="currentColor"
        className="text-primary"
      />
      <path 
        d="M24 14C24 14 19 22 19 28C19 32 21 34 24 34C27 34 29 32 29 28C29 22 24 14 24 14Z" 
        fill="hsl(84, 48%, 66%)"
      />
      <path 
        d="M24 18V30" 
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-primary"
      />
    </svg>
  );
}

const INSPIRATION_TABS = [
  { id: 'popular', label: 'Popular' },
  { id: 'farm-stays', label: 'Farm stays' },
  { id: 'eco-retreats', label: 'Eco retreats' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'adventures', label: 'Adventures' },
  { id: 'family', label: 'Family-friendly' },
];

const INSPIRATION_DESTINATIONS: Record<string, { name: string; type: string }[]> = {
  popular: [
    { name: 'Tagaytay', type: 'Farm stays' },
    { name: 'Batangas', type: 'Beachside farms' },
    { name: 'La Union', type: 'Surf & farm' },
    { name: 'Baguio', type: 'Mountain retreats' },
    { name: 'Guimaras', type: 'Mango farms' },
    { name: 'Cebu', type: 'Island farms' },
    { name: 'Palawan', type: 'Eco lodges' },
    { name: 'Siargao', type: 'Sustainable stays' },
    { name: 'Davao', type: 'Fruit orchards' },
    { name: 'Iloilo', type: 'Heritage farms' },
    { name: 'Zambales', type: 'Coastal farms' },
    { name: 'Laguna', type: 'Hot spring farms' },
  ],
  'farm-stays': [
    { name: 'Tagaytay', type: 'Vegetable farms' },
    { name: 'Benguet', type: 'Strawberry farms' },
    { name: 'Bukidnon', type: 'Pineapple plantations' },
    { name: 'Quezon', type: 'Coconut farms' },
    { name: 'Batangas', type: 'Coffee farms' },
    { name: 'Cavite', type: 'Organic gardens' },
    { name: 'Negros', type: 'Sugar plantations' },
    { name: 'Mindoro', type: 'Rice terraces' },
  ],
  'eco-retreats': [
    { name: 'Palawan', type: 'Jungle lodges' },
    { name: 'Bohol', type: 'Forest retreats' },
    { name: 'Camiguin', type: 'Volcanic farms' },
    { name: 'Siquijor', type: 'Mystic gardens' },
    { name: 'Marinduque', type: 'Off-grid stays' },
    { name: 'Romblon', type: 'Island farms' },
  ],
  wellness: [
    { name: 'Laguna', type: 'Spa farms' },
    { name: 'Batangas', type: 'Yoga retreats' },
    { name: 'Tagaytay', type: 'Meditation centers' },
    { name: 'Baguio', type: 'Healing gardens' },
    { name: 'Antipolo', type: 'Art therapy farms' },
  ],
  adventures: [
    { name: 'La Union', type: 'Surf camps' },
    { name: 'Sagada', type: 'Trekking lodges' },
    { name: 'Coron', type: 'Diving bases' },
    { name: 'Siargao', type: 'Adventure stays' },
    { name: 'Mt. Pulag', type: 'Mountain camps' },
  ],
  family: [
    { name: 'Tagaytay', type: 'Kids-friendly farms' },
    { name: 'Subic', type: 'Animal sanctuaries' },
    { name: 'Rizal', type: 'Educational farms' },
    { name: 'Clark', type: 'Activity farms' },
    { name: 'Batangas', type: 'Beach farms' },
  ],
};

const FOOTER_LINKS = {
  support: {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Get help with a safety issue', href: '/safety' },
      { label: 'AgriCover', href: '/agricover' },
      { label: 'Anti-discrimination', href: '/anti-discrimination' },
      { label: 'Disability support', href: '/accessibility' },
      { label: 'Cancellation options', href: '/cancellations' },
      { label: 'Report neighborhood concern', href: '/report' },
    ],
  },
  hosting: {
    title: 'Hosting',
    links: [
      { label: 'Agribnv your home', href: '/host' },
      { label: 'Agribnv your experience', href: '/host/experiences' },
      { label: 'AgriCover for Hosts', href: '/host/agricover' },
      { label: 'Hosting resources', href: '/host/resources' },
      { label: 'Community forum', href: '/community' },
      { label: 'Hosting responsibly', href: '/host/responsibility' },
      { label: 'Join a free hosting class', href: '/host/learn' },
      { label: 'Find a co-host', href: '/host/co-host' },
    ],
  },
  agribnv: {
    title: 'Agribnv',
    links: [
      { label: '2025 Summer Release', href: '/release' },
      { label: 'Newsroom', href: '/news' },
      { label: 'New features', href: '/features' },
      { label: 'Careers', href: '/careers' },
      { label: 'Investors', href: '/investors' },
      { label: 'Gift cards', href: '/giftcards' },
      { label: 'Agribnv.org emergency stays', href: '/emergency' },
    ],
  },
};

export function Footer() {
  const [activeTab, setActiveTab] = useState('popular');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const destinations = INSPIRATION_DESTINATIONS[activeTab] || [];
  const visibleDestinations = isExpanded ? destinations : destinations.slice(0, 8);

  return (
    <footer className="bg-muted/30 border-t border-border/50">
      {/* Inspiration Section */}
      <div className="container py-10">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Inspiration for future getaways
        </h2>
        
        {/* Tabs */}
        <div className="flex gap-6 border-b border-border/50 mb-6 overflow-x-auto scrollbar-hide">
          {INSPIRATION_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsExpanded(false);
              }}
              className={cn(
                'pb-3 text-sm font-medium whitespace-nowrap transition-colors relative',
                activeTab === tab.id
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                />
              )}
            </button>
          ))}
        </div>
        
        {/* Destinations Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {visibleDestinations.map((dest, index) => (
              <Link
                key={`${dest.name}-${index}`}
                to={`/?location=${encodeURIComponent(dest.name)}`}
                className="group"
              >
                <p className="text-sm font-medium text-foreground group-hover:underline">
                  {dest.name}
                </p>
                <p className="text-sm text-muted-foreground">{dest.type}</p>
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>
        
        {/* Show More */}
        {destinations.length > 8 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 mt-6 text-sm font-medium text-foreground hover:underline"
          >
            {isExpanded ? 'Show less' : 'Show more'}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Main Footer Links */}
      <div className="border-t border-border/50">
        <div className="container py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {Object.entries(FOOTER_LINKS).map(([key, section]) => (
              <div key={key}>
                <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left - Copyright & Links */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>© 2025 Agribnv, Inc.</span>
              <span className="hidden md:inline">·</span>
              <Link to="/privacy" className="hover:underline">Privacy</Link>
              <span>·</span>
              <Link to="/terms" className="hover:underline">Terms</Link>
              <span>·</span>
              <Link to="/sitemap" className="hover:underline">Sitemap</Link>
              <span>·</span>
              <Link to="/company" className="hover:underline">Company details</Link>
            </div>

            {/* Right - Language & Social */}
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-sm font-medium text-foreground hover:underline">
                <Globe className="h-4 w-4" />
                <span>English (US)</span>
              </button>
              <span className="text-sm font-medium text-foreground">₱ PHP</span>
              
              {/* Social Icons */}
              <div className="flex items-center gap-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:opacity-70 transition-opacity"
                  aria-label="Facebook"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:opacity-70 transition-opacity"
                  aria-label="X (Twitter)"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:opacity-70 transition-opacity"
                  aria-label="Instagram"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}