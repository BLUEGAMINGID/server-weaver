import { motion } from 'framer-motion';
import { useState } from 'react';
import { Users, UserX, Ban, ShieldOff, Search, Circle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Player } from '@/lib/pterodactyl';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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
      className="flex items-center justify-between p-2.5 md:p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
    >
      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
        <div className="relative shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-xs md:text-sm font-medium">{player.name.charAt(0)}</span>
          </div>
          {player.online && (
            <Circle className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 fill-primary text-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-xs md:text-sm truncate">{player.name}</p>
          <p className="text-[10px] md:text-xs text-muted-foreground truncate">
            {player.online ? 'Online' : player.lastSeen ? `Last: ${player.lastSeen}` : 'Offline'}
          </p>
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        {showBanActions ? (
          <>
            {player.online && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSelectedPlayer(player); setActionType('kick'); }}
                className="h-7 w-7 md:h-8 md:w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <UserX className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSelectedPlayer(player); setActionType('ban'); }}
              className="h-7 w-7 md:h-8 md:w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Ban className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSelectedPlayer(player); setActionType('ipban'); }}
              className="h-7 w-7 md:h-8 md:w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hidden sm:flex"
            >
              <ShieldOff className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSelectedPlayer(player); setActionType('unban'); }}
            className="h-7 md:h-8 px-2 md:px-3 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
            <span className="hidden sm:inline">Unban</span>
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
        className="glass-card p-4 md:p-6"
      >
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm md:text-base">Player Management</h2>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                {onlinePlayers.length} online • {players.length - bannedPlayers.length} total
              </p>
            </div>
          </div>
        </div>

        <div className="relative mb-3 md:mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass pl-8 md:pl-9 h-9 md:h-10 text-sm"
          />
        </div>

        <Tabs defaultValue="online" className="w-full">
          <TabsList className="w-full bg-secondary/50 p-1 mb-3 md:mb-4 h-9 md:h-10">
            <TabsTrigger value="online" className="flex-1 text-xs md:text-sm data-[state=active]:bg-background">
              Online ({onlinePlayers.length})
            </TabsTrigger>
            <TabsTrigger value="offline" className="flex-1 text-xs md:text-sm data-[state=active]:bg-background">
              Offline ({offlinePlayers.length})
            </TabsTrigger>
            <TabsTrigger value="banned" className="flex-1 text-xs md:text-sm data-[state=active]:bg-background">
              Banned ({bannedPlayers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="online" className="space-y-2 max-h-[250px] md:max-h-[300px] overflow-y-auto scrollbar-thin">
            {filteredPlayers(onlinePlayers).length > 0 ? (
              filteredPlayers(onlinePlayers).map(player => (
                <PlayerRow key={player.id} player={player} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-6 md:py-8 text-xs md:text-sm">No online players</p>
            )}
          </TabsContent>

          <TabsContent value="offline" className="space-y-2 max-h-[250px] md:max-h-[300px] overflow-y-auto scrollbar-thin">
            {filteredPlayers(offlinePlayers).length > 0 ? (
              filteredPlayers(offlinePlayers).map(player => (
                <PlayerRow key={player.id} player={player} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-6 md:py-8 text-xs md:text-sm">No offline players</p>
            )}
          </TabsContent>

          <TabsContent value="banned" className="space-y-2 max-h-[250px] md:max-h-[300px] overflow-y-auto scrollbar-thin">
            {filteredPlayers(bannedPlayers).length > 0 ? (
              filteredPlayers(bannedPlayers).map(player => (
                <PlayerRow key={player.id} player={player} showBanActions={false} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-6 md:py-8 text-xs md:text-sm">No banned players</p>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Mobile Drawer for actions */}
      <Drawer open={!!actionType} onOpenChange={() => { setSelectedPlayer(null); setActionType(null); }}>
        <DrawerContent className="glass-panel">
          <DrawerHeader>
            <DrawerTitle>{getActionText().title}</DrawerTitle>
            <DrawerDescription>
              {getActionText().desc}
              {selectedPlayer && (
                <span className="block mt-2 font-medium text-foreground">
                  Player: {selectedPlayer.name}
                </span>
              )}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex-row gap-2">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </DrawerClose>
            <Button
              variant={actionType === 'unban' ? 'default' : 'destructive'}
              onClick={handleAction}
              className="flex-1"
            >
              Confirm
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default PlayerManagement;
