import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Boxes, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddonCard from '@/components/AddonCard';
import { AddonPack } from '@/lib/pterodactyl';

interface AddonManagerProps {
  addons: AddonPack[];
  onToggle: (addonId: string, enabled: boolean) => void;
  onUpdatePriority: (addonId: string, newPriority: number) => void;
  onRemove: (addonId: string) => void;
}

const AddonManager = ({ addons, onToggle, onUpdatePriority, onRemove }: AddonManagerProps) => {
  const [localAddons, setLocalAddons] = useState(addons);

  const behaviorPacks = localAddons.filter(a => a.type === 'behavior').sort((a, b) => a.priority - b.priority);
  const resourcePacks = localAddons.filter(a => a.type === 'resource').sort((a, b) => a.priority - b.priority);

  const handleMoveUp = (addonId: string, type: 'behavior' | 'resource') => {
    const list = type === 'behavior' ? behaviorPacks : resourcePacks;
    const index = list.findIndex(a => a.id === addonId);
    if (index <= 0) return;

    const newAddons = [...localAddons];
    const currentAddon = newAddons.find(a => a.id === addonId);
    const prevAddon = newAddons.find(a => a.id === list[index - 1].id);
    
    if (currentAddon && prevAddon) {
      const tempPriority = currentAddon.priority;
      currentAddon.priority = prevAddon.priority;
      prevAddon.priority = tempPriority;
      setLocalAddons(newAddons);
      onUpdatePriority(addonId, currentAddon.priority);
    }
  };

  const handleMoveDown = (addonId: string, type: 'behavior' | 'resource') => {
    const list = type === 'behavior' ? behaviorPacks : resourcePacks;
    const index = list.findIndex(a => a.id === addonId);
    if (index >= list.length - 1) return;

    const newAddons = [...localAddons];
    const currentAddon = newAddons.find(a => a.id === addonId);
    const nextAddon = newAddons.find(a => a.id === list[index + 1].id);
    
    if (currentAddon && nextAddon) {
      const tempPriority = currentAddon.priority;
      currentAddon.priority = nextAddon.priority;
      nextAddon.priority = tempPriority;
      setLocalAddons(newAddons);
      onUpdatePriority(addonId, currentAddon.priority);
    }
  };

  const handleToggle = (addonId: string, enabled: boolean) => {
    setLocalAddons(prev => prev.map(a => a.id === addonId ? { ...a, enabled } : a));
    onToggle(addonId, enabled);
  };

  const handleRemove = (addonId: string) => {
    setLocalAddons(prev => prev.filter(a => a.id !== addonId));
    onRemove(addonId);
  };

  const PackList = ({ packs, type }: { packs: AddonPack[]; type: 'behavior' | 'resource' }) => (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {packs.length > 0 ? (
          packs.map((addon, index) => (
            <AddonCard
              key={addon.id}
              addon={addon}
              isFirst={index === 0}
              isLast={index === packs.length - 1}
              onToggle={(enabled) => handleToggle(addon.id, enabled)}
              onMoveUp={() => handleMoveUp(addon.id, type)}
              onMoveDown={() => handleMoveDown(addon.id, type)}
              onRemove={() => handleRemove(addon.id)}
            />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6 md:py-8"
          >
            <Boxes className="w-10 h-10 md:w-12 md:h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-xs md:text-sm">No {type} packs installed</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 md:p-6"
    >
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Boxes className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm md:text-base">Addon Manager</h2>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              {localAddons.filter(a => a.enabled).length} active packs
            </p>
          </div>
        </div>
        <Button className="btn-glass h-8 md:h-9 gap-1.5 md:gap-2 text-xs md:text-sm px-2.5 md:px-3">
          <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="hidden xs:inline">Add</span>
        </Button>
      </div>

      <Tabs defaultValue="behavior" className="w-full">
        <TabsList className="w-full bg-secondary/50 p-1 mb-3 md:mb-4 h-9 md:h-10">
          <TabsTrigger value="behavior" className="flex-1 text-xs md:text-sm data-[state=active]:bg-background">
            Behavior ({behaviorPacks.length})
          </TabsTrigger>
          <TabsTrigger value="resource" className="flex-1 text-xs md:text-sm data-[state=active]:bg-background">
            Resource ({resourcePacks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="behavior" className="max-h-[300px] md:max-h-[400px] overflow-y-auto scrollbar-thin">
          <PackList packs={behaviorPacks} type="behavior" />
        </TabsContent>

        <TabsContent value="resource" className="max-h-[300px] md:max-h-[400px] overflow-y-auto scrollbar-thin">
          <PackList packs={resourcePacks} type="resource" />
        </TabsContent>
      </Tabs>

      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border/50">
        <p className="text-[10px] md:text-xs text-muted-foreground">
          Use arrows to change priority. Top packs load first.
        </p>
      </div>
    </motion.div>
  );
};

export default AddonManager;
