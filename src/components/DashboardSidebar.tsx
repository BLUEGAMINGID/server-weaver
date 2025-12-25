import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Terminal, 
  Users, 
  Boxes, 
  Settings, 
  LogOut,
  Gamepad2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useServerStore } from '@/stores/serverStore';

const navItems = [
  { icon: Terminal, label: 'Console', path: '/' },
  { icon: Users, label: 'Players', path: '/players' },
  { icon: Boxes, label: 'Addons', path: '/addons' },
  { icon: Settings, label: 'Properties', path: '/properties' },
];

const DashboardSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { disconnect } = useServerStore();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`glass-panel h-screen sticky top-0 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 glow-primary">
            <Gamepad2 className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden"
            >
              <h1 className="font-semibold text-sm">Server Panel</h1>
              <p className="text-[10px] text-muted-foreground">Minecraft Bedrock</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : ''}`} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <motion.div
                  layoutId="activeTab"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={disconnect}
          className={`w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 ${
            collapsed ? 'justify-center' : 'justify-start gap-3'
          }`}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Disconnect</span>}
        </Button>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;
