import { motion } from 'framer-motion';
import { Activity, HardDrive, Cpu, MemoryStick, Circle, Power, RotateCcw, Square, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServerStatus } from '@/lib/pterodactyl';

interface ServerStatusCardProps {
  status: ServerStatus;
  onPowerAction: (action: 'start' | 'stop' | 'restart' | 'kill') => void;
}

const ServerStatusCard = ({ status, onPowerAction }: ServerStatusCardProps) => {
  const getStatusColor = () => {
    switch (status.status) {
      case 'running': return 'text-primary bg-primary/20';
      case 'starting': return 'text-warning bg-warning/20';
      case 'stopping': return 'text-warning bg-warning/20';
      case 'offline': return 'text-destructive bg-destructive/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} MB`;
    return `${(bytes / 1024).toFixed(1)} GB`;
  };

  const ProgressBar = ({ value, max, color = 'primary' }: { value: number; max: number; color?: string }) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            color === 'primary' ? 'bg-primary' : 
            color === 'warning' ? 'bg-warning' : 'bg-primary'
          }`}
        />
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">{status.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${getStatusColor()}`}>
                <Circle className="w-2 h-2 fill-current" />
                {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* CPU */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Cpu className="w-3.5 h-3.5" />
            <span>CPU</span>
          </div>
          <p className="text-lg font-semibold">{status.cpu}%</p>
          <ProgressBar value={status.cpu} max={100} color={status.cpu > 80 ? 'warning' : 'primary'} />
        </div>

        {/* Memory */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MemoryStick className="w-3.5 h-3.5" />
            <span>Memory</span>
          </div>
          <p className="text-lg font-semibold">{formatBytes(status.memory.current)}</p>
          <ProgressBar 
            value={status.memory.current} 
            max={status.memory.limit} 
            color={status.memory.current / status.memory.limit > 0.8 ? 'warning' : 'primary'} 
          />
        </div>

        {/* Disk */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Disk</span>
          </div>
          <p className="text-lg font-semibold">{formatBytes(status.disk.current)}</p>
          <ProgressBar 
            value={status.disk.current} 
            max={status.disk.limit}
            color={status.disk.current / status.disk.limit > 0.8 ? 'warning' : 'primary'} 
          />
        </div>
      </div>

      {/* Power Controls */}
      <div className="flex gap-2 pt-4 border-t border-border/50">
        {status.status === 'offline' ? (
          <Button 
            onClick={() => onPowerAction('start')} 
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <Power className="w-4 h-4 mr-2" />
            Start
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              onClick={() => onPowerAction('restart')} 
              className="flex-1 btn-glass"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onPowerAction('stop')} 
              className="flex-1 btn-glass"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => onPowerAction('kill')} 
              className="px-4"
            >
              <Zap className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ServerStatusCard;
