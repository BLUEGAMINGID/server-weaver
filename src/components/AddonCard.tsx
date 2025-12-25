import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Trash2, Package, Puzzle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AddonPack } from '@/lib/pterodactyl';

interface AddonCardProps {
  addon: AddonPack;
  isFirst: boolean;
  isLast: boolean;
  onToggle: (enabled: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

const AddonCard = ({ addon, isFirst, isLast, onToggle, onMoveUp, onMoveDown, onRemove }: AddonCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all ${
        !addon.enabled ? 'opacity-50' : ''
      }`}
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
        addon.type === 'behavior' 
          ? 'bg-primary/10 text-primary' 
          : 'bg-purple-500/10 text-purple-400'
      }`}>
        {addon.type === 'behavior' ? (
          <Puzzle className="w-6 h-6" />
        ) : (
          <Package className="w-6 h-6" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm truncate">{addon.name}</h3>
          <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-medium ${
            addon.type === 'behavior' 
              ? 'bg-primary/20 text-primary' 
              : 'bg-purple-500/20 text-purple-400'
          }`}>
            {addon.type}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {addon.description || 'No description'} • v{addon.version}
        </p>
      </div>

      {/* Priority Controls */}
      <div className="flex flex-col gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          disabled={isFirst}
          onClick={onMoveUp}
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          disabled={isLast}
          onClick={onMoveDown}
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Toggle & Remove */}
      <div className="flex items-center gap-3">
        <Switch
          checked={addon.enabled}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-primary"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default AddonCard;
