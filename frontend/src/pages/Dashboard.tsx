import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Plus, Target, Trophy, Clock, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculateGlobalStats } from '../utils/analytics';
import { Hobby, Quest } from '../types';
import { motion } from 'motion/react';
import { apiUtils } from '../utils/apiUtils';
import { toast } from 'sonner';

export function Dashboard() {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);

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
      toast.error('Failed to load dashboard data from backend.');
    }
  };

  const stats = calculateGlobalStats(hobbies, quests);
  const recentQuests = [...quests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-8 space-y-12 min-h-screen">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute -top-10 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            QuestMaster
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
            Your personal universe of growth and mastery
          </p>
        </div>
      </motion.div>

      {/* Abstract Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/5 rounded-3xl transform group-hover:scale-105 transition-transform" />
          <div className="relative p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Target className="size-8 text-purple-400" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 opacity-20" />
            </div>
            <div>
              <div className="text-4xl font-bold">{stats.totalQuests}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Quests</div>
              <div className="text-xs text-purple-400 mt-2">{stats.completedQuests} completed</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-600/5 rounded-3xl transform group-hover:scale-105 transition-transform" />
          <div className="relative p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Zap className="size-8 text-yellow-400" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 opacity-20" />
            </div>
            <div>
              <div className="text-4xl font-bold">{stats.totalXP}</div>
              <div className="text-sm text-muted-foreground mt-1">Total XP</div>
              <div className="text-xs text-yellow-400 mt-2">Experience earned</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/5 rounded-3xl transform group-hover:scale-105 transition-transform" />
          <div className="relative p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Clock className="size-8 text-cyan-400" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 opacity-20" />
            </div>
            <div>
              <div className="text-4xl font-bold">{stats.totalHoursInvested}</div>
              <div className="text-sm text-muted-foreground mt-1">Hours Invested</div>
              <div className="text-xs text-cyan-400 mt-2">Time dedicated</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-rose-600/5 rounded-3xl transform group-hover:scale-105 transition-transform" />
          <div className="relative p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Trophy className="size-8 text-pink-400" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 opacity-20" />
            </div>
            <div>
              <div className="text-4xl font-bold">{stats.masteredHobbies}</div>
              <div className="text-sm text-muted-foreground mt-1">Mastered</div>
              <div className="text-xs text-pink-400 mt-2">Out of {hobbies.length}</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Global Progress - Abstract Circle */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Global Progress</h2>
          <div className="text-sm text-muted-foreground">
            {stats.completedQuests} / {stats.totalQuests} quests
          </div>
        </div>
        
        <div className="relative h-64 flex items-center justify-center">
          {/* Background circles */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
            <circle
              cx="200"
              cy="200"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted opacity-10"
            />
            <circle
              cx="200"
              cy="200"
              r="90"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted opacity-10"
            />
            <circle
              cx="200"
              cy="200"
              r="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted opacity-10"
            />
            
            {/* Progress circle */}
            <motion.circle
              cx="200"
              cy="200"
              r="90"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - stats.progressPercentage / 100)}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - stats.progressPercentage / 100) }}
              transition={{ duration: 1, ease: "easeOut" }}
              transform="rotate(-90 200 200)"
            />
            
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center text */}
          <div className="relative z-10 text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              {Math.round(stats.progressPercentage)}%
            </div>
            <div className="text-sm text-muted-foreground mt-2">Complete</div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Activity</h2>
          <Link to="/quests">
            <Button variant="ghost" size="sm">
              View all <TrendingUp className="size-4 ml-2" />
            </Button>
          </Link>
        </div>

        {recentQuests.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-3xl border-muted">
            <Target className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">No quests yet. Create your first one!</p>
            <Link to="/quests">
              <Button>
                <Plus className="size-4 mr-2" />
                Create Quest
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentQuests.map((quest, index) => {
              const hobby = hobbies.find((h) => h.id === quest.hobbyId);
              return (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-4 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
                      {hobby?.emoji || '🎯'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{quest.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{hobby?.name}</div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        quest.status === 'Done' 
                          ? 'bg-green-500/20 text-green-400' 
                          : quest.status === 'Doing'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {quest.status}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}