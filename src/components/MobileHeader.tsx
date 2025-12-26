import { motion } from 'framer-motion';
import { Gamepad2, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useServerStore } from '@/stores/serverStore';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';

const MobileHeader = () => {
  const { disconnect } = useServerStore();

  return (
    <header className="sticky top-0 z-40 md:hidden glass-panel border-b border-border/50">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-primary">
            <Gamepad2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">Server Panel</h1>
            <p className="text-[10px] text-muted-foreground">Minecraft Bedrock</p>
          </div>
        </div>
        
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="w-5 h-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="glass-panel">
            <DrawerHeader>
              <DrawerTitle>Server Options</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-2">
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  onClick={disconnect}
                  className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect from Server
                </Button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  );
};

export default MobileHeader;
