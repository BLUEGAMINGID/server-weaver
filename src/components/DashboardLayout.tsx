import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';
import MobileNav from '@/components/MobileNav';
import MobileHeader from '@/components/MobileHeader';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>
      
      {/* Mobile Header */}
      <MobileHeader />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 p-4 md:p-6 overflow-x-hidden pb-20 md:pb-6"
      >
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </motion.main>
      
      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;
