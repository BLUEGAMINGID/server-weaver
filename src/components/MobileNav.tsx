import { NavLink, useLocation } from 'react-router-dom';
import { Terminal, Users, Boxes, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Terminal, label: 'Console', path: '/' },
  { icon: Users, label: 'Players', path: '/players' },
  { icon: Boxes, label: 'Addons', path: '/addons' },
  { icon: Settings, label: 'Settings', path: '/properties' },
];

const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-panel border-t border-border/50 px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[64px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon 
                  className={`w-5 h-5 relative z-10 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`} 
                />
                <span 
                  className={`text-[10px] font-medium relative z-10 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileNav;
