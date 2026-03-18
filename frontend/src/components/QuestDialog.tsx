import { useEffect, useState } from 'react';
import { DIFFICULTY_XP, DifficultyLevel, Hobby, Quest, QuestFormData, QuestStatus } from '../types';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

interface QuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quest?: Quest;
  hobbies: Hobby[];
  defaultHobbyId?: number;
  onSave: (data: QuestFormData) => void;
}

const difficulties: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];
const statuses: QuestStatus[] = ['To Do', 'Doing', 'Done'];

export function QuestDialog({ open, onOpenChange, quest, hobbies, defaultHobbyId, onSave }: QuestDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hobbyId, setHobbyId] = useState<number | undefined>(defaultHobbyId);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [status, setStatus] = useState<QuestStatus>('To Do');
  const [hoursInvested, setHoursInvested] = useState(0);

  useEffect(() => {
    if (quest) {
      setTitle(quest.title);
      setDescription(quest.description);
      setHobbyId(quest.hobbyId);
      setDifficulty(quest.difficulty);
      setStatus(quest.status);
      setHoursInvested(quest.hoursInvested);
      return;
    }

    setTitle('');
    setDescription('');
    setHobbyId(defaultHobbyId);
    setDifficulty('Medium');
    setStatus('To Do');
    setHoursInvested(0);
  }, [defaultHobbyId, open, quest]);

  const handleSave = () => {
    if (!title.trim() || !hobbyId) {
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      hobbyId,
      difficulty,
      status,
      hoursInvested,
      xpReward: DIFFICULTY_XP[difficulty],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{quest ? 'Edit Quest' : 'Create New Quest'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="title">Quest Title</Label>
            <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g., Learn power chords" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional details about this quest..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="hobby">Track</Label>
              <Select value={hobbyId ? String(hobbyId) : undefined} onValueChange={(value) => setHobbyId(Number(value))}>
                <SelectTrigger id="hobby">
                  <SelectValue placeholder="Select a mastery track" />
                </SelectTrigger>
                <SelectContent>
                  {hobbies.map((hobbyItem) => (
                    <SelectItem key={hobbyItem.id} value={String(hobbyItem.id)}>
                      {hobbyItem.emoji} {hobbyItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={(value) => setDifficulty(value as DifficultyLevel)}>
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as QuestStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hours">Hours Invested</Label>
              <Input
                id="hours"
                type="number"
                min="0"
                step="0.5"
                value={hoursInvested}
                onChange={(event) => setHoursInvested(Number(event.target.value) || 0)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{quest ? 'Save Changes' : 'Create Quest'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}