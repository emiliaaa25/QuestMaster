import { useState, useEffect } from 'react';
import { apiUtils } from '../utils/apiUtils';
import { calculateGlobalStats, calculateHobbyStats } from '../utils/analytics';
import { Trophy, Target, Clock, Zap, Award, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'motion/react';
import { Hobby, Quest } from '../types';
import { toast } from 'sonner';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

export function Analytics() {
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
      toast.error('Failed to load analytics from backend.');
    }
  };

  const globalStats = calculateGlobalStats(hobbies, quests);
  
  const hobbyStats = hobbies.map((hobby) => calculateHobbyStats(hobby, quests));
  
  const xpDistribution = hobbyStats
    .filter((stat) => stat.xpEarned > 0)
    .map((stat) => ({
      name: stat.hobby.name,
      value: stat.xpEarned,
      emoji: stat.hobby.emoji,
    }));

  const timeDistribution = hobbyStats
    .filter((stat) => stat.hoursInvested > 0)
    .map((stat) => ({
      name: stat.hobby.name,
      hours: stat.hoursInvested,
      emoji: stat.hobby.emoji,
    }));

  return (
    <div className="p-8 space-y-12 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
          Hall of Fame
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Analytics and insights across all your mastery tracks
        </p>
      </motion.div>

      {/* Global Stats Grid */}
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
              <div className="text-4xl font-bold">{globalStats.totalQuests}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Quests</div>
              <div className="text-xs text-purple-400 mt-2">{globalStats.completedQuests} completed</div>
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
              <div className="text-4xl font-bold">{globalStats.totalXP}</div>
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
              <div className="text-4xl font-bold">{globalStats.totalHoursInvested}</div>
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
              <div className="text-4xl font-bold">{globalStats.masteredHobbies}</div>
              <div className="text-sm text-muted-foreground mt-1">Mastered</div>
              <div className="text-xs text-pink-400 mt-2">Out of {hobbies.length}</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      {(xpDistribution.length > 0 || timeDistribution.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid lg:grid-cols-2 gap-8"
        >
          {/* XP Distribution */}
          {xpDistribution.length > 0 && (
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent rounded-3xl blur-xl" />
              <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Zap className="size-5 text-purple-400" />
                  XP Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={xpDistribution}>
                    <defs>
                      <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#ec4899" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '8px 12px',
                      }}
                    />
                    <Bar dataKey="value" fill="url(#colorXP)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Time Distribution */}
          {timeDistribution.length > 0 && (
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent rounded-3xl blur-xl" />
              <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Clock className="size-5 text-cyan-400" />
                  Time Investment
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeDistribution}>
                    <defs>
                      <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '8px 12px',
                      }}
                    />
                    <Bar dataKey="hours" fill="url(#colorTime)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* XP Pie Chart (only if we have data) */}
      {xpDistribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-3xl blur-xl" />
          <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-6">XP Breakdown</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={xpDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ index, value }) => {
                      const slice = typeof index === 'number' ? xpDistribution[index] : undefined;
                      return slice ? `${slice.emoji} ${value}` : String(value);
                    }}
                  >
                    {xpDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '8px 12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hobby Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Trophy className="size-6 text-yellow-500" />
          Leaderboard
        </h2>
        {hobbyStats.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-3xl border-muted">
            <TrendingUp className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hobbies to display yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hobbyStats
              .sort((a, b) => b.xpEarned - a.xpEarned)
              .map((stat, index) => (
                <motion.div
                  key={stat.hobby.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="relative group"
                >
                  <div className={`absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30' :
                    index === 1 ? 'bg-gradient-to-r from-slate-400/30 to-slate-500/30' :
                    index === 2 ? 'bg-gradient-to-r from-orange-600/30 to-orange-700/30' :
                    'bg-gradient-to-r from-purple-500/20 to-pink-500/20'
                  }`} />
                  
                  <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                    <div className="flex items-center gap-6">
                      {/* Rank */}
                      <div className={`text-3xl font-bold w-12 text-center ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-slate-400' :
                        index === 2 ? 'text-orange-600' :
                        'text-muted-foreground'
                      }`}>
                        #{index + 1}
                      </div>

                      {/* Emoji */}
                      <div className="text-4xl">{stat.hobby.emoji}</div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold truncate">{stat.hobby.name}</h3>
                          {stat.hobby.isMastered && (
                            <Award className="size-5 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>{stat.completedQuests}/{stat.totalQuests} quests</span>
                          <span>•</span>
                          <span>{stat.hoursInvested}h invested</span>
                        </div>
                        {/* Progress bar */}
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full"
                            style={{ width: `${stat.progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* XP */}
                      <div className="text-right">
                        <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                          {stat.xpEarned}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">XP</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
