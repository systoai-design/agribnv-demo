import { motion } from 'framer-motion';
import { Clock, Users, Leaf, Fish, ChefHat, Palette, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Experience } from '@/types/database';
import { cn } from '@/lib/utils';

interface FarmExperiencesProps {
  experiences: Experience[];
  selectedExperiences: string[];
  onToggleExperience: (experienceId: string) => void;
  className?: string;
}

// Map experience names to icons
const getExperienceIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('mango') || lowerName.includes('picking') || lowerName.includes('harvest')) return Leaf;
  if (lowerName.includes('fish') || lowerName.includes('aqua')) return Fish;
  if (lowerName.includes('cook') || lowerName.includes('table')) return ChefHat;
  if (lowerName.includes('craft') || lowerName.includes('weav')) return Palette;
  return Sparkles;
};

export function FarmExperiences({ 
  experiences, 
  selectedExperiences, 
  onToggleExperience,
  className 
}: FarmExperiencesProps) {
  if (!experiences || experiences.length === 0) return null;

  const activeExperiences = experiences.filter(exp => exp.is_active);
  if (activeExperiences.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('py-4 border-b border-border/50', className)}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Farm Experiences</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Add unique farm activities to your stay
      </p>

      <div className="space-y-3">
        {activeExperiences.map((experience) => {
          const isSelected = selectedExperiences.includes(experience.id);
          const Icon = getExperienceIcon(experience.name);
          
          return (
            <motion.button
              key={experience.id}
              onClick={() => onToggleExperience(experience.id)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left',
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-soft' 
                  : 'border-border/50 bg-card hover:border-primary/30'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
              )}>
                <Icon className="h-6 w-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground line-clamp-1">
                  {experience.name}
                </h4>
                {experience.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                    {experience.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {experience.duration_hours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Max {experience.max_participants}
                  </span>
                </div>
              </div>
              
              <div className="text-right shrink-0">
                <p className="font-semibold text-primary">
                  ₱{experience.price.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">/person</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {activeExperiences.length > 3 && (
        <Button variant="outline" className="w-full mt-4 rounded-lg border-foreground">
          View all {activeExperiences.length} experiences
        </Button>
      )}
    </motion.div>
  );
}
