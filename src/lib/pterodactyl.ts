import { supabase } from '@/integrations/supabase/client';

// Pterodactyl API Types
export interface ServerStatus {
  id: string;
  name: string;
  status: 'running' | 'offline' | 'starting' | 'stopping';
  memory: { current: number; limit: number };
  cpu: number;
  disk: { current: number; limit: number };
}

export interface Player {
  id: string;
  name: string;
  uuid: string;
  online: boolean;
  lastSeen?: string;
  banned?: boolean;
  ipBanned?: boolean;
}

export interface AddonPack {
  id: string;
  name: string;
  type: 'behavior' | 'resource';
  version: string;
  uuid: string;
  description?: string;
  enabled: boolean;
  priority: number;
}

export interface ServerProperty {
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean';
  description?: string;
}

export interface ConsoleMessage {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'warning' | 'error' | 'command';
}

export interface PlayersData {
  ops: Array<{ uuid: string; name: string; level: number }>;
  whitelist: Array<{ uuid: string; name: string }>;
  banned: Array<{ uuid: string; name: string; reason: string }>;
  bannedIps: Array<{ ip: string; reason: string }>;
}

class PterodactylAPI {
  private serverUUID: string | null = null;
  private consoleSocket: WebSocket | null = null;
  private consoleMessages: ConsoleMessage[] = [];
  private messageListeners: Set<(messages: ConsoleMessage[]) => void> = new Set();

  constructor() {
    this.serverUUID = sessionStorage.getItem('server_uuid');
  }

  setServerUUID(uuid: string) {
    this.serverUUID = uuid;
    sessionStorage.setItem('server_uuid', uuid);
  }

  getServerUUID(): string | null {
    return this.serverUUID;
  }

  clearSession() {
    this.serverUUID = null;
    sessionStorage.removeItem('server_uuid');
    this.disconnectConsole();
  }

  private async callProxy(action: string, body?: object, queryParams?: Record<string, string>): Promise<any> {
    if (!this.serverUUID) {
      throw new Error('Server UUID not set');
    }

    const params = new URLSearchParams({ action, ...queryParams });
    
    const { data, error } = await supabase.functions.invoke('pterodactyl-proxy', {
      body: body || {},
      headers: {
        'x-server-uuid': this.serverUUID,
      },
    });

    // Since we can't pass query params directly, we'll modify the approach
    // Actually, supabase.functions.invoke doesn't support query params well
    // Let's use fetch directly for more control
    
    const projectUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const response = await fetch(`${projectUrl}/functions/v1/pterodactyl-proxy?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'x-server-uuid': this.serverUUID,
      },
      body: JSON.stringify(body || {}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return response.json();
  }

  // Server Status
  async getServerStatus(): Promise<ServerStatus> {
    const data = await this.callProxy('status');
    return {
      id: data.id,
      name: data.name,
      status: data.status as 'running' | 'offline' | 'starting' | 'stopping',
      memory: data.memory,
      cpu: data.cpu,
      disk: data.disk,
    };
  }

  // Console WebSocket connection
  async connectConsole(onMessage: (message: ConsoleMessage) => void): Promise<void> {
    try {
      const credentials = await this.callProxy('console');
      
      if (!credentials.socket) {
        console.log('WebSocket not available, using polling mode');
        return;
      }

      this.consoleSocket = new WebSocket(credentials.socket);
      
      this.consoleSocket.onopen = () => {
        console.log('Console WebSocket connected');
        // Authenticate
        this.consoleSocket?.send(JSON.stringify({
          event: 'auth',
          args: [credentials.token],
        }));
      };

      this.consoleSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.event === 'console output') {
            const message: ConsoleMessage = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              timestamp: new Date(),
              message: data.args[0],
              type: this.detectMessageType(data.args[0]),
            };
            
            this.consoleMessages.push(message);
            if (this.consoleMessages.length > 500) {
              this.consoleMessages = this.consoleMessages.slice(-500);
            }
            
            onMessage(message);
          }
        } catch (e) {
          console.error('Error parsing console message:', e);
        }
      };

      this.consoleSocket.onerror = (error) => {
        console.error('Console WebSocket error:', error);
      };

      this.consoleSocket.onclose = () => {
        console.log('Console WebSocket disconnected');
      };
    } catch (error) {
      console.error('Failed to connect console:', error);
    }
  }

  private detectMessageType(message: string): 'info' | 'warning' | 'error' | 'command' {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('[error]') || lowerMessage.includes('error:') || lowerMessage.includes('exception')) {
      return 'error';
    }
    if (lowerMessage.includes('[warn]') || lowerMessage.includes('warning:')) {
      return 'warning';
    }
    if (lowerMessage.startsWith('/') || lowerMessage.includes('[cmd]')) {
      return 'command';
    }
    return 'info';
  }

  disconnectConsole() {
    if (this.consoleSocket) {
      this.consoleSocket.close();
      this.consoleSocket = null;
    }
  }

  async getConsoleMessages(): Promise<ConsoleMessage[]> {
    return this.consoleMessages;
  }

  // Commands
  async sendCommand(command: string): Promise<void> {
    await this.callProxy('command', { command });
    
    // Add command to local messages
    const message: ConsoleMessage = {
      id: Date.now().toString(),
      timestamp: new Date(),
      message: `> ${command}`,
      type: 'command',
    };
    this.consoleMessages.push(message);
  }

  // Power actions
  async powerAction(action: 'start' | 'stop' | 'restart' | 'kill'): Promise<void> {
    await this.callProxy('power', { signal: action });
  }

  // Players
  async getPlayers(): Promise<Player[]> {
    const data: PlayersData = await this.callProxy('players');
    
    const players: Player[] = [];
    
    // Combine whitelist and banned players into a single list
    const allPlayers = new Map<string, Player>();
    
    // Add whitelisted players
    for (const p of data.whitelist || []) {
      allPlayers.set(p.uuid, {
        id: p.uuid,
        name: p.name,
        uuid: p.uuid,
        online: false, // We can't know online status from files
        banned: false,
        ipBanned: false,
      });
    }
    
    // Mark banned players
    for (const p of data.banned || []) {
      if (allPlayers.has(p.uuid)) {
        const existing = allPlayers.get(p.uuid)!;
        existing.banned = true;
      } else {
        allPlayers.set(p.uuid, {
          id: p.uuid,
          name: p.name,
          uuid: p.uuid,
          online: false,
          banned: true,
          ipBanned: false,
        });
      }
    }

    return Array.from(allPlayers.values());
  }

  async kickPlayer(playerName: string): Promise<void> {
    await this.sendCommand(`kick ${playerName}`);
  }

  async banPlayer(playerName: string): Promise<void> {
    await this.sendCommand(`ban ${playerName}`);
  }

  async ipBanPlayer(playerName: string): Promise<void> {
    await this.sendCommand(`ban-ip ${playerName}`);
  }

  async unbanPlayer(playerName: string): Promise<void> {
    await this.sendCommand(`pardon ${playerName}`);
  }

  // Server Properties
  async getServerProperties(): Promise<ServerProperty[]> {
    return await this.callProxy('properties');
  }

  async updateServerProperty(key: string, value: string | number | boolean): Promise<void> {
    await this.callProxy('update-property', { key, value: String(value) });
  }

  // Addons
  async getAddons(): Promise<AddonPack[]> {
    const data = await this.callProxy('addons');
    return [...(data.behaviorPacks || []), ...(data.resourcePacks || [])];
  }

  async toggleAddon(addonId: string, enabled: boolean): Promise<void> {
    // This would require modifying world_behavior_packs.json or world_resource_packs.json
    console.log(`Toggling addon ${addonId}: ${enabled}`);
    // Implementation depends on specific pack structure
  }

  async updateAddonPriority(addonId: string, newPriority: number): Promise<void> {
    console.log(`Updating addon ${addonId} priority to: ${newPriority}`);
    // Implementation depends on specific pack structure
  }

  async removeAddon(addonId: string): Promise<void> {
    console.log(`Removing addon: ${addonId}`);
    // Implementation would delete the pack folder
  }

  // File operations
  async getFiles(directory: string = '/'): Promise<any[]> {
    return await this.callProxy('files', {}, { directory });
  }

  async getFileContent(filePath: string): Promise<string> {
    const data = await this.callProxy('file-content', {}, { file: filePath });
    return data.content;
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    await this.callProxy('file-write', { file: filePath, content });
  }
}

export const pterodactylAPI = new PterodactylAPI();
