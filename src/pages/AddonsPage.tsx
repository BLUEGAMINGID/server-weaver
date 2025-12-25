import { motion } from 'framer-motion';
import AddonManager from '@/components/AddonManager';
import { pterodactylAPI, AddonPack } from '@/lib/pterodactyl';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

const AddonsPage = () => {
  const { data: addons = [] } = useQuery<AddonPack[]>({
    queryKey: ['addons'],
    queryFn: () => pterodactylAPI.getAddons(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      pterodactylAPI.toggleAddon(id, enabled),
    onSuccess: (_, { enabled }) => {
      toast({
        title: enabled ? 'Addon Enabled' : 'Addon Disabled',
        description: `The addon has been ${enabled ? 'enabled' : 'disabled'}.`,
      });
    },
  });

  const priorityMutation = useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: number }) =>
      pterodactylAPI.updateAddonPriority(id, priority),
    onSuccess: () => {
      toast({
        title: 'Priority Updated',
        description: 'Pack priority has been updated.',
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => pterodactylAPI.removeAddon(id),
    onSuccess: () => {
      toast({
        title: 'Addon Removed',
        description: 'The addon has been removed from the server.',
      });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-semibold mb-1">Addon Manager</h1>
        <p className="text-muted-foreground text-sm">
          Manage behavior and resource packs
        </p>
      </div>

      <AddonManager
        addons={addons}
        onToggle={(id, enabled) => toggleMutation.mutate({ id, enabled })}
        onUpdatePriority={(id, priority) => priorityMutation.mutate({ id, priority })}
        onRemove={(id) => removeMutation.mutate(id)}
      />
    </motion.div>
  );
};

export default AddonsPage;
