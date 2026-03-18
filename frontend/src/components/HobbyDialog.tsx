import { useEffect, useState } from 'react';
import { Hobby, HobbyCategory, HobbyFormData } from '../types';
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

interface HobbyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hobby?: Hobby;
  onSave: (data: HobbyFormData) => void;
}

const categories: HobbyCategory[] = ['Creative', 'Physical', 'Intellectual'];
const emojiSuggestions = ['🎨', '💻', '⚽', '🏋️', '📚', '🎸', '🎮', '✍️', '📷', '🧠'];

export function HobbyDialog({ open, onOpenChange, hobby, onSave }: HobbyDialogProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [category, setCategory] = useState<HobbyCategory>('Creative');

  useEffect(() => {
    setName(hobby?.name ?? '');
    setEmoji(hobby?.emoji ?? '🎯');
    setCategory(hobby?.category ?? 'Creative');
  }, [hobby, open]);

  const handleSave = () => {
    if (!name.trim()) {
      return;
    }

    onSave({
      name: name.trim(),
      emoji,
      category,
      description: hobby?.description ?? '',
      imageUrl: hobby?.imageUrl ?? null,
      isMastered: hobby?.isMastered ?? false,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{hobby ? 'Edit Hobby' : 'Create New Hobby'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Hobby Name</Label>
            <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g., Guitar Playing" />
          </div>
          <div>
            <Label>Emoji Icon</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {emojiSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setEmoji(suggestion)}
                  className={suggestion === emoji ? 'rounded border-2 border-primary p-2 text-2xl' : 'rounded border-2 border-transparent p-2 text-2xl'}
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <Input value={emoji} onChange={(event) => setEmoji(event.target.value)} className="mt-2" placeholder="Or type a custom emoji" maxLength={2} />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as HobbyCategory)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{hobby ? 'Save Changes' : 'Create Hobby'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}