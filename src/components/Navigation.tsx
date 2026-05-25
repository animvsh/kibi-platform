
import React from 'react';
import { Link } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { BookOpen } from 'lucide-react';

const Navigation = () => {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/courses" className="bg-transparent text-white hover:bg-dark-300 hover:text-kibi-400 px-4 py-2 rounded-md font-medium transition-colors">
            Courses
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/pricing" className="bg-transparent text-white hover:bg-dark-300 hover:text-kibi-400 px-4 py-2 rounded-md font-medium transition-colors">
            Pricing
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/blog" className="bg-transparent text-white hover:bg-dark-300 hover:text-kibi-400 px-4 py-2 rounded-md font-medium transition-colors">
            Blog
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navigation;
