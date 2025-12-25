import { motion } from 'framer-motion';
import PlayerManagement from '@/components/PlayerManagement';
import { pterodactylAPI, Player } from '@/lib/pterodactyl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

const PlayersPage = () => {
  const queryClient = useQueryClient();

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ['players'],
    queryFn: () => pterodactylAPI.getPlayers(),
    refetchInterval: 10000,
  });

  const kickMutation = useMutation({
    mutationFn: (playerId: string) => pterodactylAPI.kickPlayer(playerId),
    onSuccess: () => {
      toast({ title: 'Player Kicked', description: 'The player has been disconnected.' });
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });

  const banMutation = useMutation({
    mutationFn: (playerId: string) => pterodactylAPI.banPlayer(playerId),
    onSuccess: () => {
      toast({ title: 'Player Banned', description: 'The player has been banned.' });
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });

  const ipBanMutation = useMutation({
    mutationFn: (playerId: string) => pterodactylAPI.ipBanPlayer(playerId),
    onSuccess: () => {
      toast({ title: 'IP Banned', description: 'The IP address has been banned.' });
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });

  const unbanMutation = useMutation({
    mutationFn: (playerId: string) => pterodactylAPI.unbanPlayer(playerId),
    onSuccess: () => {
      toast({ title: 'Player Unbanned', description: 'The player can now join again.' });
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-semibold mb-1">Players</h1>
        <p className="text-muted-foreground text-sm">
          Manage online players and restrictions
        </p>
      </div>

      <PlayerManagement
        players={players}
        onKick={(id) => kickMutation.mutate(id)}
        onBan={(id) => banMutation.mutate(id)}
        onIpBan={(id) => ipBanMutation.mutate(id)}
        onUnban={(id) => unbanMutation.mutate(id)}
      />
    </motion.div>
  );
};

export default PlayersPage;
