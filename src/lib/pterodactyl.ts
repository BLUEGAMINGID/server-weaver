import axios, { AxiosInstance } from 'axios';

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

// Mock data generators for demo purposes
const generateMockPlayers = (): Player[] => [
  { id: '1', name: 'Steve_Builder', uuid: 'a1b2c3d4', online: true },
  { id: '2', name: 'Alex_Miner', uuid: 'e5f6g7h8', online: true },
  { id: '3', name: 'CreeperKing99', uuid: 'i9j0k1l2', online: false, lastSeen: '2 hours ago' },
  { id: '4', name: 'DiamondHunter', uuid: 'm3n4o5p6', online: false, lastSeen: '1 day ago', banned: true },
  { id: '5', name: 'EnderDragon_X', uuid: 'q7r8s9t0', online: true },
  { id: '6', name: 'RedstoneWizard', uuid: 'u1v2w3x4', online: false, lastSeen: '5 minutes ago' },
];

const generateMockAddons = (): AddonPack[] => [
  { id: '1', name: 'Better Swords', type: 'behavior', version: '1.2.0', uuid: 'addon-1', description: 'Adds new sword types', enabled: true, priority: 1 },
  { id: '2', name: 'HD Textures', type: 'resource', version: '2.0.1', uuid: 'addon-2', description: 'High definition textures', enabled: true, priority: 2 },
  { id: '3', name: 'Custom Mobs', type: 'behavior', version: '1.0.5', uuid: 'addon-3', description: 'New mob variants', enabled: true, priority: 3 },
  { id: '4', name: 'Shader Pack', type: 'resource', version: '3.1.0', uuid: 'addon-4', description: 'Realistic lighting', enabled: false, priority: 4 },
  { id: '5', name: 'Advanced Crafting', type: 'behavior', version: '1.1.2', uuid: 'addon-5', description: 'New crafting recipes', enabled: true, priority: 5 },
];

const generateMockProperties = (): ServerProperty[] => [
  { key: 'server-name', value: 'My Awesome Server', type: 'string', description: 'Name of the server' },
  { key: 'gamemode', value: 'survival', type: 'string', description: 'Default game mode' },
  { key: 'difficulty', value: 'normal', type: 'string', description: 'Game difficulty' },
  { key: 'max-players', value: 20, type: 'number', description: 'Maximum players allowed' },
  { key: 'pvp', value: true, type: 'boolean', description: 'Enable player vs player' },
  { key: 'white-list', value: false, type: 'boolean', description: 'Enable whitelist' },
  { key: 'spawn-protection', value: 16, type: 'number', description: 'Spawn protection radius' },
  { key: 'view-distance', value: 10, type: 'number', description: 'Render distance' },
  { key: 'allow-cheats', value: false, type: 'boolean', description: 'Allow cheat commands' },
  { key: 'motd', value: 'Welcome to the server!', type: 'string', description: 'Message of the day' },
  { key: 'online-mode', value: true, type: 'boolean', description: 'Verify player accounts' },
  { key: 'allow-flight', value: false, type: 'boolean', description: 'Allow flying' },
];

const mockConsoleMessages: ConsoleMessage[] = [
  { id: '1', timestamp: new Date(Date.now() - 300000), message: '[Server] Starting Minecraft Bedrock Server...', type: 'info' },
  { id: '2', timestamp: new Date(Date.now() - 280000), message: '[Server] Loading world "Survival World"...', type: 'info' },
  { id: '3', timestamp: new Date(Date.now() - 260000), message: '[Server] World loaded successfully', type: 'info' },
  { id: '4', timestamp: new Date(Date.now() - 200000), message: '[INFO] Steve_Builder joined the game', type: 'info' },
  { id: '5', timestamp: new Date(Date.now() - 150000), message: '[INFO] Alex_Miner joined the game', type: 'info' },
  { id: '6', timestamp: new Date(Date.now() - 100000), message: '[WARN] Entity count approaching limit', type: 'warning' },
  { id: '7', timestamp: new Date(Date.now() - 50000), message: '[INFO] EnderDragon_X joined the game', type: 'info' },
  { id: '8', timestamp: new Date(Date.now() - 30000), message: '[CMD] /time set day', type: 'command' },
];

class PterodactylAPI {
  private client: AxiosInstance | null = null;
  private serverUUID: string | null = null;

  constructor() {
    this.serverUUID = sessionStorage.getItem('server_uuid');
  }

  setServerUUID(uuid: string) {
    this.serverUUID = uuid;
    sessionStorage.setItem('server_uuid', uuid);
    this.initClient();
  }

  getServerUUID(): string | null {
    return this.serverUUID;
  }

  clearSession() {
    this.serverUUID = null;
    sessionStorage.removeItem('server_uuid');
    this.client = null;
  }

  private initClient() {
    // In production, this would connect to actual Pterodactyl API
    this.client = axios.create({
      baseURL: '/api/pterodactyl',
      headers: {
        'Authorization': `Bearer ${this.serverUUID}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Server Status
  async getServerStatus(): Promise<ServerStatus> {
    // Mock implementation
    return {
      id: this.serverUUID || 'mock-server',
      name: 'Survival World',
      status: 'running',
      memory: { current: 2048, limit: 4096 },
      cpu: 45,
      disk: { current: 5120, limit: 20480 },
    };
  }

  // Players
  async getPlayers(): Promise<Player[]> {
    return generateMockPlayers();
  }

  async kickPlayer(playerId: string): Promise<void> {
    console.log(`Kicking player: ${playerId}`);
  }

  async banPlayer(playerId: string): Promise<void> {
    console.log(`Banning player: ${playerId}`);
  }

  async ipBanPlayer(playerId: string): Promise<void> {
    console.log(`IP Banning player: ${playerId}`);
  }

  async unbanPlayer(playerId: string): Promise<void> {
    console.log(`Unbanning player: ${playerId}`);
  }

  // Addons
  async getAddons(): Promise<AddonPack[]> {
    return generateMockAddons();
  }

  async toggleAddon(addonId: string, enabled: boolean): Promise<void> {
    console.log(`Toggling addon ${addonId}: ${enabled}`);
  }

  async updateAddonPriority(addonId: string, newPriority: number): Promise<void> {
    console.log(`Updating addon ${addonId} priority to: ${newPriority}`);
  }

  async removeAddon(addonId: string): Promise<void> {
    console.log(`Removing addon: ${addonId}`);
  }

  // Server Properties
  async getServerProperties(): Promise<ServerProperty[]> {
    return generateMockProperties();
  }

  async updateServerProperty(key: string, value: string | number | boolean): Promise<void> {
    console.log(`Updating property ${key}: ${value}`);
  }

  // Console
  async getConsoleMessages(): Promise<ConsoleMessage[]> {
    return mockConsoleMessages;
  }

  async sendCommand(command: string): Promise<void> {
    console.log(`Sending command: ${command}`);
  }

  // Power actions
  async powerAction(action: 'start' | 'stop' | 'restart' | 'kill'): Promise<void> {
    console.log(`Power action: ${action}`);
  }
}

export const pterodactylAPI = new PterodactylAPI();
