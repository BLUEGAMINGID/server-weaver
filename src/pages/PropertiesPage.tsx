import { motion } from 'framer-motion';
import ServerProperties from '@/components/ServerProperties';
import { pterodactylAPI, ServerProperty } from '@/lib/pterodactyl';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

const PropertiesPage = () => {
  const { data: properties = [] } = useQuery<ServerProperty[]>({
    queryKey: ['properties'],
    queryFn: () => pterodactylAPI.getServerProperties(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string | number | boolean }) =>
      pterodactylAPI.updateServerProperty(key, value),
    onSuccess: () => {
      toast({
        title: 'Settings Saved',
        description: 'Server properties have been updated.',
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
        <h1 className="text-2xl font-semibold mb-1">Server Properties</h1>
        <p className="text-muted-foreground text-sm">
          Configure server.properties settings
        </p>
      </div>

      <ServerProperties
        properties={properties}
        onUpdate={(key, value) => updateMutation.mutate({ key, value })}
      />
    </motion.div>
  );
};

export default PropertiesPage;
