import { Clock, Edit, Trash2 } from 'lucide-react';
import { DIFFICULTY_COLORS, Quest } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface QuestCardProps {
  quest: Quest;
  hobbyName?: string;
  hobbyEmoji?: string;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (newStatus: Quest['status']) => void;
}

export function QuestCard({ quest, hobbyName, hobbyEmoji, onEdit, onDelete, onStatusChange }: QuestCardProps) {
  return (
    <Card className="mb-3 border-border/60 bg-background/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-base">
              {hobbyEmoji && <span>{hobbyEmoji}</span>}
              {quest.title}
            </CardTitle>
            {hobbyName && <p className="mt-1 text-xs text-muted-foreground">{hobbyName}</p>}
          </div>
          <Badge className={DIFFICULTY_COLORS[quest.difficulty]}>{quest.difficulty}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {quest.description && <p className="text-sm text-muted-foreground">{quest.description}</p>}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="size-4 text-muted-foreground" />
            <span>{quest.hoursInvested}h</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">XP:</span>
            <span className="font-medium">{quest.xpReward}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={quest.status}
            onChange={(event) => onStatusChange(event.target.value as Quest['status'])}
            className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
          >
            <option value="To Do">To Do</option>
            <option value="Doing">Doing</option>
            <option value="Done">Done</option>
          </select>
          <Button onClick={onEdit} variant="outline" size="icon">
            <Edit className="size-4" />
          </Button>
          <Button onClick={onDelete} variant="destructive" size="icon">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}