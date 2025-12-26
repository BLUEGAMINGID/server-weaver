import { motion } from 'framer-motion';
import { useState } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ServerProperty } from '@/lib/pterodactyl';

interface ServerPropertiesProps {
  properties: ServerProperty[];
  onUpdate: (key: string, value: string | number | boolean) => void;
}

const ServerProperties = ({ properties, onUpdate }: ServerPropertiesProps) => {
  const [localProps, setLocalProps] = useState(properties);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: string, value: string | number | boolean) => {
    setLocalProps(prev => prev.map(p => p.key === key ? { ...p, value } : p));
    setHasChanges(true);
  };

  const handleSave = () => {
    localProps.forEach(prop => {
      const original = properties.find(p => p.key === prop.key);
      if (original && original.value !== prop.value) {
        onUpdate(prop.key, prop.value);
      }
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalProps(properties);
    setHasChanges(false);
  };

  const renderInput = (prop: ServerProperty) => {
    switch (prop.type) {
      case 'boolean':
        return (
          <Switch
            checked={prop.value as boolean}
            onCheckedChange={(checked) => handleChange(prop.key, checked)}
            className="data-[state=checked]:bg-primary scale-90 md:scale-100"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={prop.value as number}
            onChange={(e) => handleChange(prop.key, parseInt(e.target.value) || 0)}
            className="input-glass w-20 md:w-24 h-8 md:h-9 text-right text-xs md:text-sm"
          />
        );
      default:
        return (
          <Input
            type="text"
            value={prop.value as string}
            onChange={(e) => handleChange(prop.key, e.target.value)}
            className="input-glass h-8 md:h-9 w-full max-w-[140px] md:max-w-xs text-xs md:text-sm"
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 md:p-6"
    >
      <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Settings className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm md:text-base">Server Properties</h2>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              Configure settings
            </p>
          </div>
        </div>
        {hasChanges && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-1.5 md:gap-2"
          >
            <Button variant="outline" size="sm" onClick={handleReset} className="btn-glass h-7 md:h-8 px-2 md:px-3 text-xs">
              <RotateCcw className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button size="sm" onClick={handleSave} className="h-7 md:h-8 px-2 md:px-3 text-xs bg-primary hover:bg-primary/90">
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
          </motion.div>
        )}
      </div>

      <div className="space-y-2 md:space-y-3 max-h-[400px] md:max-h-[500px] overflow-y-auto scrollbar-thin pr-1 md:pr-2">
        {localProps.map((prop, index) => (
          <motion.div
            key={prop.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-center justify-between py-2.5 md:py-3 px-3 md:px-4 rounded-lg bg-secondary/30 hover:bg-secondary/40 transition-colors gap-3"
          >
            <div className="space-y-0.5 min-w-0 flex-1">
              <Label className="font-mono text-[11px] md:text-sm block truncate">{prop.key}</Label>
              {prop.description && (
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">{prop.description}</p>
              )}
            </div>
            <div className="shrink-0">
              {renderInput({ ...prop, value: localProps.find(p => p.key === prop.key)?.value ?? prop.value })}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ServerProperties;
