import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Plus, Check, TrendingUp, Clock, Zap, ListChecks } from 'lucide-react';
import { apiUtils } from '../utils/apiUtils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { PresetHobby } from '../types';

export function BrowseHobbies() {
  const [presetHobbies, setPresetHobbies] = useState<PresetHobby[]>([]);
  const [joiningSlug, setJoiningSlug] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    void loadPresetHobbies();
  }, []);

  const loadPresetHobbies = async () => {
    try {
      const presets = await apiUtils.getPresetHobbies();
      setPresetHobbies(presets);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load preset hobbies.');
    }
  };

  const handleJoinHobby = async (preset: PresetHobby) => {
    setJoiningSlug(preset.slug);

    try {
      const result = await apiUtils.joinPresetHobby(preset.slug);
      setPresetHobbies((current) =>
        current.map((item) =>
          item.slug === preset.slug
            ? { ...item, joined: true, joinedHobbyId: result.hobby.id }
            : item,
        ),
      );

      if (result.alreadyJoined) {
        toast.info(`${preset.name} is already in your tracks.`);
      } else {
        toast.success(`Joined ${preset.name}. ${preset.quests.length} quests added.`);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to join ${preset.name}.`);
    } finally {
      setJoiningSlug(null);
    }
  };

  const isJoined = (preset: PresetHobby) => {
    return preset.joined;
  };

  return (
    <div className="p-8 space-y-8 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
          Browse Hobbies
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Join pre-made hobby tracks with ready-to-go quests
        </p>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-6 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <span>{presetHobbies.length} Available Hobbies</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>{presetHobbies.filter((preset) => preset.joined).length} Joined</span>
        </div>
      </motion.div>

      {/* Hobbies Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {presetHobbies.map((preset, index) => {
            const joined = isJoined(preset);
            
            return (
              <motion.div
                key={preset.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-lg ${
                  joined 
                    ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30' 
                    : 'bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-orange-500/30'
                }`} />
                
                {/* Main Card */}
                <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-3xl p-6 space-y-4 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-4xl">
                        {preset.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{preset.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {preset.category}
                        </p>
                      </div>
                    </div>
                    
                    {joined && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="size-4 text-green-500" />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {preset.description}
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 py-3">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <ListChecks className="size-3" />
                        Quests
                      </div>
                      <div className="font-bold">{preset.totalQuests}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Zap className="size-3" />
                        XP
                      </div>
                      <div className="font-bold text-purple-400">{preset.totalXP}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        Hours
                      </div>
                      <div className="font-bold text-cyan-400">{preset.estimatedHours}h</div>
                    </div>
                  </div>

                  {/* Quest Preview */}
                  <div className="flex-1 border-t border-border/30 pt-3">
                    <div className="text-xs text-muted-foreground mb-2">Sample Quests:</div>
                    <div className="space-y-1.5">
                      {preset.quests.slice(0, 3).map((quest, i) => (
                        <div key={i} className="text-xs flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                          <span className="line-clamp-1 text-muted-foreground">{quest.title}</span>
                        </div>
                      ))}
                      {preset.quests.length > 3 && (
                        <div className="text-xs text-muted-foreground/60 pl-3">
                          +{preset.quests.length - 3} more quests
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full gap-2"
                    variant={joined ? 'outline' : 'default'}
                    disabled={joiningSlug === preset.slug}
                    onClick={() => {
                      if (joined) {
                        navigate('/tracks');
                      } else {
                        void handleJoinHobby(preset);
                      }
                    }}
                  >
                    {joined ? (
                      <>
                        <Check className="size-4" />
                        View in My Tracks
                      </>
                    ) : (
                      <>
                        <Plus className="size-4" />
                        Join This Track
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-8"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted/50 text-sm text-muted-foreground">
          <TrendingUp className="size-4" />
          <span>Join a hobby to add it with all its quests to your personal tracks</span>
        </div>
      </motion.div>
    </div>
  );
}
