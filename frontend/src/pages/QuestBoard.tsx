import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Plus, Circle, PlayCircle, CheckCircle2, Edit, Trash2, ChevronRight } from 'lucide-react';
import { QuestDialog } from '../components/QuestDialog';
import { apiUtils } from '../utils/apiUtils';
import { Hobby, Quest, QuestFormData, QuestStatus, DIFFICULTY_COLORS } from '../types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export function QuestBoard() {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | undefined>();

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
      toast.error('Failed to load quests from backend.');
    }
  };

  const handleSave = async (data: QuestFormData) => {
    try {
      if (editingQuest) {
        await apiUtils.updateQuest(editingQuest.id, data);
        toast.success('Quest updated successfully!');
      } else {
        await apiUtils.createQuest(data);
        toast.success('Quest created successfully!');
      }
      await loadData();
      setEditingQuest(undefined);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save quest.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this quest?')) {
      try {
        await apiUtils.deleteQuest(id);
        toast.success('Quest deleted');
        await loadData();
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete quest.');
      }
    }
  };

  const handleStatusChange = async (quest: Quest, newStatus: QuestStatus) => {
    try {
      await apiUtils.updateQuest(quest.id, { status: newStatus });
      if (newStatus === 'Done') {
        toast.success(`Quest completed! +${quest.xpReward} XP`);
      }
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update quest status.');
    }
  };

  const handleEdit = (quest: Quest) => {
    setEditingQuest(quest);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingQuest(undefined);
    setDialogOpen(true);
  };

  const getQuestsByStatus = (status: QuestStatus) => {
    return quests.filter((q) => q.status === status);
  };

  const getStatusIcon = (status: QuestStatus) => {
    switch (status) {
      case 'To Do':
        return <Circle className="size-5" />;
      case 'Doing':
        return <PlayCircle className="size-5" />;
      case 'Done':
        return <CheckCircle2 className="size-5" />;
    }
  };

  const getStatusColor = (status: QuestStatus) => {
    switch (status) {
      case 'To Do':
        return 'from-slate-500 to-slate-600';
      case 'Doing':
        return 'from-blue-500 to-cyan-500';
      case 'Done':
        return 'from-green-500 to-emerald-500';
    }
  };

  const renderQuestItem = (quest: Quest, index: number) => {
    const hobby = hobbies.find((h) => h.id === quest.hobbyId);
    const nextStatus: QuestStatus =
      quest.status === 'To Do' ? 'Doing' : quest.status === 'Doing' ? 'Done' : 'Done';

    return (
      <motion.div
        key={quest.id}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ delay: index * 0.05 }}
        className="relative group"
      >
        {/* Glow effect */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${getStatusColor(quest.status)} rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity`} />
        
        {/* Main container */}
        <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-xl">
                {hobby?.emoji || '🎯'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{quest.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{hobby?.name}</p>
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleEdit(quest)}
              >
                <Edit className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(quest.id)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>

          {/* Description */}
          {quest.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{quest.description}</p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs">
            <div className={`px-2 py-1 rounded-full ${DIFFICULTY_COLORS[quest.difficulty]} bg-opacity-20 font-medium`}>
              {quest.difficulty}
            </div>
            <div className="text-muted-foreground">{quest.hoursInvested}h</div>
            <div className="text-purple-400 font-medium">{quest.xpReward} XP</div>
          </div>

          {/* Status action */}
          {quest.status !== 'Done' && (
            <Button
              size="sm"
              className="w-full gap-2"
              onClick={() => handleStatusChange(quest, nextStatus)}
            >
              {quest.status === 'To Do' ? 'Start Quest' : 'Complete Quest'}
              <ChevronRight className="size-4" />
            </Button>
          )}
          
          {quest.status === 'Done' && (
            <div className="flex items-center justify-center gap-2 text-green-500 text-sm font-medium">
              <CheckCircle2 className="size-4" />
              Completed
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderColumn = (status: QuestStatus) => {
    const filteredQuests = getQuestsByStatus(status);
    
    return (
      <div className="space-y-3">
        {filteredQuests.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-2xl border-muted/50">
            <p className="text-sm text-muted-foreground">No quests here</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredQuests.map((quest, index) => renderQuestItem(quest, index))}
          </AnimatePresence>
        )}
      </div>
    );
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
            Quest Board
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Your journey through tasks and challenges
          </p>
        </div>
        <Button onClick={handleCreate} size="lg" disabled={hobbies.length === 0} className="gap-2">
          <Plus className="size-5" />
          New Quest
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
              <Circle className="size-12 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">No Tracks Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Create a mastery track first before adding quests
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Mobile View - Tabs */}
          <div className="lg:hidden">
            <Tabs defaultValue="To Do">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="To Do" className="gap-2">
                  <Circle className="size-3" />
                  {getQuestsByStatus('To Do').length}
                </TabsTrigger>
                <TabsTrigger value="Doing" className="gap-2">
                  <PlayCircle className="size-3" />
                  {getQuestsByStatus('Doing').length}
                </TabsTrigger>
                <TabsTrigger value="Done" className="gap-2">
                  <CheckCircle2 className="size-3" />
                  {getQuestsByStatus('Done').length}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="To Do" className="mt-6">
                {renderColumn('To Do')}
              </TabsContent>
              <TabsContent value="Doing" className="mt-6">
                {renderColumn('Doing')}
              </TabsContent>
              <TabsContent value="Done" className="mt-6">
                {renderColumn('Done')}
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop View - Flow Layout */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-3 gap-8">
              {/* To Do Column */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="mb-6 relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-slate-500/10 to-slate-600/10 rounded-2xl blur-lg" />
                  <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500/20 to-slate-600/20 flex items-center justify-center">
                        {getStatusIcon('To Do')}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">To Do</h3>
                        <p className="text-sm text-muted-foreground">
                          {getQuestsByStatus('To Do').length} quests
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {renderColumn('To Do')}
              </motion.div>

              {/* Doing Column */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mb-6 relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-lg" />
                  <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-blue-400">
                        {getStatusIcon('Doing')}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Doing</h3>
                        <p className="text-sm text-muted-foreground">
                          {getQuestsByStatus('Doing').length} quests
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {renderColumn('Doing')}
              </motion.div>

              {/* Done Column */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="mb-6 relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-lg" />
                  <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center text-green-400">
                        {getStatusIcon('Done')}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Done</h3>
                        <p className="text-sm text-muted-foreground">
                          {getQuestsByStatus('Done').length} quests
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {renderColumn('Done')}
              </motion.div>
            </div>
          </div>
        </>
      )}

      <QuestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        quest={editingQuest}
        hobbies={hobbies}
        onSave={handleSave}
      />
    </div>
  );
}
