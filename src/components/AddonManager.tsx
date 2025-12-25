import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Boxes, Plus, Upload } from 'lucide-react';
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
            className="text-center py-8"
          >
            <Boxes className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No {type} packs installed</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Boxes className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Addon Manager</h2>
            <p className="text-xs text-muted-foreground">
              {localAddons.filter(a => a.enabled).length} active packs
            </p>
          </div>
        </div>
        <Button className="btn-glass h-9 gap-2">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Add Pack</span>
        </Button>
      </div>

      <Tabs defaultValue="behavior" className="w-full">
        <TabsList className="w-full bg-secondary/50 p-1 mb-4">
          <TabsTrigger value="behavior" className="flex-1 data-[state=active]:bg-background">
            Behavior ({behaviorPacks.length})
          </TabsTrigger>
          <TabsTrigger value="resource" className="flex-1 data-[state=active]:bg-background">
            Resource ({resourcePacks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="behavior" className="max-h-[400px] overflow-y-auto scrollbar-thin">
          <PackList packs={behaviorPacks} type="behavior" />
        </TabsContent>

        <TabsContent value="resource" className="max-h-[400px] overflow-y-auto scrollbar-thin">
          <PackList packs={resourcePacks} type="resource" />
        </TabsContent>
      </Tabs>

      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Use the arrows to change pack priority. Packs at the top are loaded first.
        </p>
      </div>
    </motion.div>
  );
};

export default AddonManager;
