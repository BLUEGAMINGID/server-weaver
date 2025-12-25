import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex w-full">
      <DashboardSidebar />
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 p-6 overflow-x-hidden"
      >
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
