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
      className="glass-card flex flex-col h-[500px]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-1.5">
          <Circle className="w-3 h-3 fill-destructive text-destructive" />
          <Circle className="w-3 h-3 fill-warning text-warning" />
          <Circle className="w-3 h-3 fill-primary text-primary" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Terminal className="w-4 h-4" />
          <span>Console</span>
        </div>
      </div>

      {/* Console Output */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin bg-background/30">
        <div className="space-y-1">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className="console-text flex gap-3"
            >
              <span className="text-muted-foreground/50 shrink-0">
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
      <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 bg-background/20">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-mono text-sm">
              &gt;
            </span>
            <Input
              type="text"
              placeholder="Enter command..."
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="input-glass h-10 pl-7 font-mono text-sm"
            />
          </div>
          <Button type="submit" size="icon" className="h-10 w-10 bg-primary hover:bg-primary/90">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default Console;
