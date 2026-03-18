import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Plus, Sparkles, Award, TrendingUp, Clock } from 'lucide-react';
import { HobbyDialog } from '../components/HobbyDialog';
import { apiUtils } from '../utils/apiUtils';
import { calculateHobbyStats } from '../utils/analytics';
import { Hobby, Quest, HobbyFormData, CATEGORY_COLORS } from '../types';
import { toast } from 'sonner';

export function MasteryTracks() {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHobby, setEditingHobby] = useState<Hobby | undefined>();

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      const [nextHobbies, nextQuests] = await Promise.all([apiUtils.getHobbies(), apiUtils.getQuests()]);
      setHobbies(nextHobbies);
      setQuests(nextQuests);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load tracks from backend.');
    }
  };

  const handleSave = async (data: HobbyFormData) => {
    try {
      if (editingHobby) {
        await apiUtils.updateHobby(editingHobby.id, data);
        toast.success('Hobby updated successfully!');
      } else {
        await apiUtils.createHobby(data);
        toast.success('Hobby created successfully!');
      }
      await loadData();
      setEditingHobby(undefined);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save hobby.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure? This will also delete all associated quests.')) {
      try {
        await apiUtils.deleteHobby(id);
        toast.success('Hobby deleted');
        await loadData();
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete hobby.');
      }
    }
  };

  const handleToggleMastered = async (hobby: Hobby) => {
    try {
      await apiUtils.updateHobby(hobby.id, { isMastered: !hobby.isMastered });
      toast.success(hobby.isMastered ? 'Unmastered!' : 'Hobby mastered!');
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update hobby mastery state.');
    }
  };

  const handleEdit = (hobby: Hobby) => {
    setEditingHobby(hobby);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingHobby(undefined);
    setDialogOpen(true);
  };

  return (
    <div className="p-8 space-y-8 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Mastery Tracks
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Your personal journeys to excellence
          </p>
        </div>
        <Button onClick={handleCreate} size="lg" className="gap-2">
          <Plus className="size-5" />
          New Track
        </Button>
      </motion.div>

      {hobbies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative min-h-[60vh] flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5 rounded-3xl" />
          <div className="relative text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Sparkles className="size-12 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Begin Your Journey</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first mastery track and start tracking your progress
              </p>
            </div>
            <Button onClick={handleCreate} size="lg">
              <Plus className="size-4 mr-2" />
              Create Your First Track
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {hobbies.map((hobby, index) => {
            const stats = calculateHobbyStats(hobby, quests);
            const progressAngle = (stats.progressPercentage / 100) * 360;

            return (
              <motion.div
                key={hobby.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                {/* Background gradient effect */}
                <div
                  className={`absolute -inset-1 bg-gradient-to-r ${
                    hobby.isMastered
                      ? 'from-yellow-500/30 via-orange-500/30 to-pink-500/30'
                      : 'from-purple-500/20 via-pink-500/20 to-transparent'
                  } rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl`}
                />

                {/* Main container */}
                <div className="relative bg-background border border-border/50 rounded-3xl p-8 backdrop-blur-sm">
                  <div className="flex items-start gap-8">
                    {/* Circular Progress Visualization */}
                    <div className="relative flex-shrink-0">
                      <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
                        {/* Background circle */}
                        <circle
                          cx="70"
                          cy="70"
                          r="60"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="text-muted opacity-20"
                        />
                        {/* Progress arc */}
                        <motion.circle
                          cx="70"
                          cy="70"
                          r="60"
                          fill="none"
                          stroke="url(#gradient-${hobby.id})"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 60}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - stats.progressPercentage / 100) }}
                          transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                        />
                        <defs>
                          <linearGradient id={`gradient-${hobby.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="50%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Center content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-4xl mb-2">{hobby.emoji}</div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                          {Math.round(stats.progressPercentage)}%
                        </div>
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold truncate">{hobby.name}</h3>
                            {hobby.isMastered && (
                              <div className="flex-shrink-0 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                                <Award className="size-4 inline text-yellow-500 mr-1" />
                                <span className="text-xs font-medium text-yellow-500">Mastered</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[hobby.category]} bg-opacity-20`}
                            >
                              {hobby.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(hobby)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(hobby.id)}
                          >
                            Delete
                          </Button>
                          <Button
                            variant={hobby.isMastered ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleToggleMastered(hobby)}
                          >
                            {hobby.isMastered ? 'Unmaster' : 'Mark Mastered'}
                          </Button>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="size-3" />
                            Quests
                          </div>
                          <div className="text-xl font-bold">
                            {stats.completedQuests}<span className="text-muted-foreground text-sm">/{stats.totalQuests}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Sparkles className="size-3" />
                            XP Earned
                          </div>
                          <div className="text-xl font-bold text-purple-400">
                            {stats.xpEarned}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" />
                            Hours
                          </div>
                          <div className="text-xl font-bold text-cyan-400">
                            {stats.hoursInvested}
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.progressPercentage}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <HobbyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        hobby={editingHobby}
        onSave={handleSave}
      />
    </div>
  );
}