import { create } from 'zustand';

interface ServerStore {
  serverUUID: string | null;
  isConnected: boolean;
  setServerUUID: (uuid: string) => void;
  disconnect: () => void;
}

export const useServerStore = create<ServerStore>((set) => ({
  serverUUID: sessionStorage.getItem('server_uuid'),
  isConnected: !!sessionStorage.getItem('server_uuid'),
  setServerUUID: (uuid: string) => {
    sessionStorage.setItem('server_uuid', uuid);
    set({ serverUUID: uuid, isConnected: true });
  },
  disconnect: () => {
    sessionStorage.removeItem('server_uuid');
    set({ serverUUID: null, isConnected: false });
  },
}));
