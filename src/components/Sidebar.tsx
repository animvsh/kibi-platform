
import { useState } from 'react';
import { Home, Layout, BookOpen, User, Moon, Settings, LogOut, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const path = location.pathname;
  
  // Set the active menu item based on the current path
  let defaultActive = 'home';
  if (path.includes('/course')) {
    defaultActive = 'courses';
  } else if (path.includes('/dashboard')) {
    defaultActive = 'dashboard';
  }
  
  const [activeItem, setActiveItem] = useState(defaultActive);
  
  const menuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'dashboard', icon: Layout, label: 'Dashboard' },
    { id: 'courses', icon: BookOpen, label: 'Courses' }
  ];
  
  const bottomMenuItems = [
    { id: 'dark-mode', icon: Moon, label: 'Dark Mode' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'logout', icon: LogOut, label: 'Log Out' }
  ];

  return (
    <div className="h-screen w-28 flex flex-col items-center py-8 bg-gradient-to-b from-dark-500 to-dark-600 border-r-4 border-dark-300 shadow-xl">
      <div className="mb-8">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-kibi-400 to-kibi-600 flex items-center justify-center border-4 border-kibi-600 icon-3d shadow-lg">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-6 flex-grow">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center transform transition-all hover:scale-110",
              activeItem === item.id 
                ? "bg-gradient-to-br from-kibi-400 to-kibi-600 text-white border-4 border-kibi-600 icon-3d shadow-lg" 
                : "text-gray-500 hover:text-kibi-400"
            )}
          >
            <item.icon className="w-7 h-7" />
          </button>
        ))}
        
        {/* User button */}
        <button className="w-16 h-16 rounded-xl flex items-center justify-center text-white bg-dark-400 border-4 border-dark-300 hover:bg-dark-300 hover:text-kibi-400 transition-all hover:scale-110 shadow-md">
          <User className="w-7 h-7" />
        </button>
      </div>
      
      <div className="flex flex-col items-center gap-6 mt-auto">
        {bottomMenuItems.map((item) => (
          <button
            key={item.id}
            className="w-14 h-14 rounded-xl flex items-center justify-center text-gray-500 hover:text-kibi-400 transition-transform hover:scale-110"
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </div>
    </div>
  );
}
