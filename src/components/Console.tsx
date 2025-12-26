import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Circle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ConsoleMessage } from '@/lib/pterodactyl';

interface ConsoleProps {
  messages: ConsoleMessage[];
  onSendCommand: (command: string) => void;
}

const Console = ({ messages, onSendCommand }: ConsoleProps) => {
  const [command, setCommand] = useState('');
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      onSendCommand(command);
      setCommand('');
    }
  };

  const getMessageColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return 'text-destructive';
      case 'warning':
        return 'text-warning';
      case 'command':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex flex-col h-[350px] md:h-[500px]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 border-b border-border/50">
        <div className="flex items-center gap-1.5">
          <Circle className="w-2.5 h-2.5 md:w-3 md:h-3 fill-destructive text-destructive" />
          <Circle className="w-2.5 h-2.5 md:w-3 md:h-3 fill-warning text-warning" />
          <Circle className="w-2.5 h-2.5 md:w-3 md:h-3 fill-primary text-primary" />
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
          <Terminal className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span>Console</span>
        </div>
      </div>

      {/* Console Output */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 scrollbar-thin bg-background/30">
        <div className="space-y-1">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className="console-text flex gap-2 md:gap-3 text-[11px] md:text-sm"
            >
              <span className="text-muted-foreground/50 shrink-0 hidden sm:inline">
                {formatTime(msg.timestamp)}
              </span>
              <span className={getMessageColor(msg.type)}>
                {msg.message}
              </span>
            </motion.div>
          ))}
          <div ref={consoleEndRef} />
        </div>
      </div>

      {/* Command Input */}
      <form onSubmit={handleSubmit} className="p-3 md:p-4 border-t border-border/50 bg-background/20">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-mono text-xs md:text-sm">
              &gt;
            </span>
            <Input
              type="text"
              placeholder="Enter command..."
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="input-glass h-9 md:h-10 pl-6 md:pl-7 font-mono text-xs md:text-sm"
            />
          </div>
          <Button type="submit" size="icon" className="h-9 w-9 md:h-10 md:w-10 bg-primary hover:bg-primary/90">
            <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default Console;
