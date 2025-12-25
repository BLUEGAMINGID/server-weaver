import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Console from '@/components/Console';
import ServerStatusCard from '@/components/ServerStatusCard';
import { pterodactylAPI, ServerStatus, ConsoleMessage } from '@/lib/pterodactyl';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

const ConsolePage = () => {
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);

  const { data: serverStatus } = useQuery<ServerStatus>({
    queryKey: ['serverStatus'],
    queryFn: () => pterodactylAPI.getServerStatus(),
    refetchInterval: 5000,
  });

  const { data: initialMessages } = useQuery<ConsoleMessage[]>({
    queryKey: ['consoleMessages'],
    queryFn: () => pterodactylAPI.getConsoleMessages(),
  });

  useEffect(() => {
    if (initialMessages) {
      setConsoleMessages(initialMessages);
    }
  }, [initialMessages]);

  const handleSendCommand = async (command: string) => {
    const newMessage: ConsoleMessage = {
      id: Date.now().toString(),
      timestamp: new Date(),
      message: `> ${command}`,
      type: 'command',
    };
    setConsoleMessages(prev => [...prev, newMessage]);

    await pterodactylAPI.sendCommand(command);

    // Simulate response
    setTimeout(() => {
      const responseMessage: ConsoleMessage = {
        id: (Date.now() + 1).toString(),
        timestamp: new Date(),
        message: `[Server] Command executed: ${command}`,
        type: 'info',
      };
      setConsoleMessages(prev => [...prev, responseMessage]);
    }, 500);
  };

  const handlePowerAction = async (action: 'start' | 'stop' | 'restart' | 'kill') => {
    await pterodactylAPI.powerAction(action);
    toast({
      title: 'Power Action',
      description: `Server ${action} command sent successfully.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-semibold mb-1">Console</h1>
        <p className="text-muted-foreground text-sm">
          Monitor server output and send commands
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Console 
            messages={consoleMessages} 
            onSendCommand={handleSendCommand} 
          />
        </div>
        <div>
          {serverStatus && (
            <ServerStatusCard 
              status={serverStatus} 
              onPowerAction={handlePowerAction} 
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ConsolePage;
