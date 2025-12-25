import { motion } from 'framer-motion';
import { useState } from 'react';
import { Users, UserX, Ban, ShieldOff, Search, Circle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Player } from '@/lib/pterodactyl';

interface PlayerManagementProps {
  players: Player[];
  onKick: (playerId: string) => void;
  onBan: (playerId: string) => void;
  onIpBan: (playerId: string) => void;
  onUnban: (playerId: string) => void;
}

const PlayerManagement = ({ players, onKick, onBan, onIpBan, onUnban }: PlayerManagementProps) => {
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [actionType, setActionType] = useState<'kick' | 'ban' | 'ipban' | 'unban' | null>(null);

  const onlinePlayers = players.filter(p => p.online && !p.banned);
  const offlinePlayers = players.filter(p => !p.online && !p.banned);
  const bannedPlayers = players.filter(p => p.banned);

  const filteredPlayers = (playerList: Player[]) => 
    playerList.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleAction = () => {
    if (!selectedPlayer || !actionType) return;
    
    switch (actionType) {
      case 'kick': onKick(selectedPlayer.id); break;
      case 'ban': onBan(selectedPlayer.id); break;
      case 'ipban': onIpBan(selectedPlayer.id); break;
      case 'unban': onUnban(selectedPlayer.id); break;
    }
    
    setSelectedPlayer(null);
    setActionType(null);
  };

  const getActionText = () => {
    switch (actionType) {
      case 'kick': return { title: 'Kick Player', desc: 'This will disconnect the player from the server.' };
      case 'ban': return { title: 'Ban Player', desc: 'This will prevent the player from joining the server.' };
      case 'ipban': return { title: 'IP Ban Player', desc: 'This will prevent this IP address from connecting.' };
      case 'unban': return { title: 'Unban Player', desc: 'This will allow the player to join again.' };
      default: return { title: '', desc: '' };
    }
  };

  const PlayerRow = ({ player, showBanActions = true }: { player: Player; showBanActions?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-sm font-medium">{player.name.charAt(0)}</span>
          </div>
          {player.online && (
            <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-primary text-primary" />
          )}
        </div>
        <div>
          <p className="font-medium text-sm">{player.name}</p>
          <p className="text-xs text-muted-foreground">
            {player.online ? 'Online' : player.lastSeen ? `Last seen ${player.lastSeen}` : 'Offline'}
          </p>
        </div>
      </div>
      <div className="flex gap-1">
        {showBanActions ? (
          <>
            {player.online && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSelectedPlayer(player); setActionType('kick'); }}
                className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <UserX className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSelectedPlayer(player); setActionType('ban'); }}
              className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Ban className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSelectedPlayer(player); setActionType('ipban'); }}
              className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <ShieldOff className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSelectedPlayer(player); setActionType('unban'); }}
            className="h-8 px-3 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <ShieldCheck className="w-4 h-4 mr-1" />
            Unban
          </Button>
        )}
      </div>
    </motion.div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Player Management</h2>
              <p className="text-xs text-muted-foreground">
                {onlinePlayers.length} online • {players.length - bannedPlayers.length} total
              </p>
            </div>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass pl-9"
          />
        </div>

        <Tabs defaultValue="online" className="w-full">
          <TabsList className="w-full bg-secondary/50 p-1 mb-4">
            <TabsTrigger value="online" className="flex-1 data-[state=active]:bg-background">
              Online ({onlinePlayers.length})
            </TabsTrigger>
            <TabsTrigger value="offline" className="flex-1 data-[state=active]:bg-background">
              Offline ({offlinePlayers.length})
            </TabsTrigger>
            <TabsTrigger value="banned" className="flex-1 data-[state=active]:bg-background">
              Banned ({bannedPlayers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="online" className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
            {filteredPlayers(onlinePlayers).length > 0 ? (
              filteredPlayers(onlinePlayers).map(player => (
                <PlayerRow key={player.id} player={player} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm">No online players</p>
            )}
          </TabsContent>

          <TabsContent value="offline" className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
            {filteredPlayers(offlinePlayers).length > 0 ? (
              filteredPlayers(offlinePlayers).map(player => (
                <PlayerRow key={player.id} player={player} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm">No offline players</p>
            )}
          </TabsContent>

          <TabsContent value="banned" className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
            {filteredPlayers(bannedPlayers).length > 0 ? (
              filteredPlayers(bannedPlayers).map(player => (
                <PlayerRow key={player.id} player={player} showBanActions={false} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm">No banned players</p>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={!!actionType} onOpenChange={() => { setSelectedPlayer(null); setActionType(null); }}>
        <DialogContent className="glass-panel sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getActionText().title}</DialogTitle>
            <DialogDescription>
              {getActionText().desc}
              {selectedPlayer && (
                <span className="block mt-2 font-medium text-foreground">
                  Player: {selectedPlayer.name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setSelectedPlayer(null); setActionType(null); }}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'unban' ? 'default' : 'destructive'}
              onClick={handleAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlayerManagement;
