import { Trophy, Trash2, Edit } from 'lucide-react';
import { Hobby, CATEGORY_COLORS } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';

interface HobbyCardProps {
  hobby: Hobby;
  progressPercentage: number;
  totalQuests: number;
  completedQuests: number;
  xpEarned: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleMastered: () => void;
}

export function HobbyCard({
  hobby,
  progressPercentage,
  totalQuests,
  completedQuests,
  xpEarned,
  onEdit,
  onDelete,
  onToggleMastered,
}: HobbyCardProps) {
  return (
    <Card className="relative overflow-hidden border-border/60 bg-background/80 backdrop-blur-sm">
      {hobby.isMastered && (
        <div className="absolute right-3 top-3">
          <Trophy className="size-6 fill-yellow-500 text-yellow-500" />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="text-4xl">{hobby.emoji}</div>
          <div className="flex-1">
            <CardTitle>{hobby.name}</CardTitle>
            <Badge className={`mt-2 ${CATEGORY_COLORS[hobby.category]}`}>{hobby.category}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">
              {completedQuests}/{totalQuests} quests
            </span>
          </div>
          <Progress value={progressPercentage} />
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">XP Earned</div>
            <div className="text-lg font-bold">{xpEarned}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Completion</div>
            <div className="text-lg font-bold">{Math.round(progressPercentage)}%</div>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          {progressPercentage === 100 && !hobby.isMastered && (
            <Button onClick={onToggleMastered} size="sm" className="flex-1">
              <Trophy className="mr-1 size-4" />
              Mark as Mastered
            </Button>
          )}
          {hobby.isMastered && (
            <Button onClick={onToggleMastered} variant="outline" size="sm" className="flex-1">
              Unmaster
            </Button>
          )}
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