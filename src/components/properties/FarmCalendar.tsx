import { motion } from 'framer-motion';
import { CalendarDays, Leaf, Sun, CloudRain, Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FarmCalendarProps {
  className?: string;
}

// Sample seasonal activities - in production this would come from the database
const SEASONAL_ACTIVITIES = [
  {
    season: 'Harvest Season',
    period: 'Mar - May',
    icon: Sun,
    activities: [
      { name: 'Mango Harvest', status: 'peak', emoji: '🥭' },
      { name: 'Rice Harvest', status: 'available', emoji: '🌾' },
    ],
  },
  {
    season: 'Planting Season', 
    period: 'Jun - Aug',
    icon: Sprout,
    activities: [
      { name: 'Rice Planting', status: 'available', emoji: '🌱' },
      { name: 'Vegetable Planting', status: 'available', emoji: '🥬' },
    ],
  },
  {
    season: 'Growing Season',
    period: 'Sep - Nov',
    icon: CloudRain,
    activities: [
      { name: 'Farm Tour', status: 'available', emoji: '🚜' },
      { name: 'Mango Blooming', status: 'peak', emoji: '🌸' },
    ],
  },
  {
    season: 'Dry Season',
    period: 'Dec - Feb',
    icon: Leaf,
    activities: [
      { name: 'Fishing', status: 'peak', emoji: '🐟' },
      { name: 'Outdoor Camping', status: 'peak', emoji: '⛺' },
    ],
  },
];

// Determine current season based on month
const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 0; // Mar-May
  if (month >= 6 && month <= 8) return 1; // Jun-Aug
  if (month >= 9 && month <= 11) return 2; // Sep-Nov
  return 3; // Dec-Feb
};

export function FarmCalendar({ className }: FarmCalendarProps) {
  const currentSeasonIndex = getCurrentSeason();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('py-4 border-b border-border/50', className)}
    >
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Farm Activity Calendar</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Plan your visit around seasonal farm activities
      </p>

      <div className="space-y-3">
        {SEASONAL_ACTIVITIES.map((season, idx) => {
          const isCurrent = idx === currentSeasonIndex;
          const Icon = season.icon;
          
          return (
            <div
              key={season.season}
              className={cn(
                'p-4 rounded-xl border transition-all',
                isCurrent 
                  ? 'border-primary bg-primary/5 shadow-soft' 
                  : 'border-border/50 bg-card'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{season.season}</h4>
                    <p className="text-xs text-muted-foreground">{season.period}</p>
                  </div>
                </div>
                {isCurrent && (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    Now
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {season.activities.map((activity) => (
                  <div
                    key={activity.name}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs',
                      activity.status === 'peak' 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <span>{activity.emoji}</span>
                    <span>{activity.name}</span>
                    {activity.status === 'peak' && (
                      <span className="text-[10px] bg-primary text-primary-foreground px-1 rounded">
                        Peak
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
