
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  CreditCard, 
  LogOut, 
  ChevronDown, 
  BookOpen,
  Crown,
  GitBranch,
  Copy,
  Check,
  Database
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { useToast } from './ui/use-toast';

const UserProfileDropdown = () => {
  const { user, signOut, profile, subscription, referralCode } = useAuth();
  const { isDSADemoMode, toggleDSADemoMode, canUseDSADemo } = useDemoMode();
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  if (!user) return null;

  // Helper to get initials from username or email
  const getInitials = (): string => {
    if (profile?.username) {
      return profile.username.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Copy referral code to clipboard
  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast({
        title: "Referral code copied!",
        description: "You can now share it with friends."
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle DSA demo mode toggle
  const handleDSAToggle = async (checked: boolean) => {
    await toggleDSADemoMode(checked);
  };

  // Determine subscription label and progress
  const subscriptionLabel = subscription?.plan_name || 'Free Tier';
  const sessionsUsed = 3; // This would be dynamic in a real app
  const totalSessions = subscription?.plan_id === 1 ? 5 : '∞'; // 5 for free tier, unlimited for paid plans
  const sessionsText = totalSessions === '∞' 
    ? 'Unlimited sessions' 
    : `${sessionsUsed}/${totalSessions} sessions used`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
        <Avatar className="w-10 h-10 border-4 border-kibi-600 shadow-[0_4px_0_rgba(0,0,0,0.1)]">
          {profile?.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile.username || "User Avatar"} />
          ) : (
            <AvatarFallback className="bg-kibi-600 text-white">
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-dark-400 border-2 border-dark-300 text-white p-2">
        <DropdownMenuLabel className="text-gray-300">
          <p className="text-sm font-medium text-kibi-400">
            {profile?.username || user.email}
          </p>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400">{subscriptionLabel} · {sessionsText}</p>
            {subscription?.plan_id === 1 && (
              <div className="w-16 h-1 bg-dark-300 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-kibi-500" 
                  style={{ width: `${(sessionsUsed / 5) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-dark-300" />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer focus:bg-dark-300">
            <Link to="/profile" className="flex items-center gap-2 px-2 py-2">
              <User className="h-4 w-4 text-gray-400" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer focus:bg-dark-300">
            <Link to="/profile?tab=subscription" className="flex items-center gap-2 px-2 py-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <span>Subscription</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer focus:bg-dark-300">
            <Link to="/my-courses" className="flex items-center gap-2 px-2 py-2">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span>My Courses</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        {canUseDSADemo && (
          <>
            <DropdownMenuSeparator className="bg-dark-300" />
            <DropdownMenuItem className="cursor-pointer focus:bg-dark-300">
              <div className="flex items-center justify-between w-full px-2 py-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-kibi-400" />
                  <span className="text-kibi-400 font-medium">DSA Demo Mode</span>
                </div>
                <Switch
                  checked={isDSADemoMode}
                  onCheckedChange={handleDSAToggle}
                />
              </div>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator className="bg-dark-300" />
        {subscription?.plan_id === 1 ? (
          <DropdownMenuItem asChild className="cursor-pointer focus:bg-dark-300">
            <Link to="/profile?tab=upgrade" className="flex items-center gap-2 px-2 py-2 text-kibi-400">
              <Crown className="h-4 w-4 text-kibi-400" />
              <span className="font-medium">Upgrade to Pro</span>
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem className="cursor-pointer focus:bg-dark-300">
          <div className="w-full">
            <div className="flex items-center gap-2 px-2 py-2 text-gray-400 mb-1">
              <GitBranch className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="truncate">Refer a friend</span>
            </div>
            {referralCode && (
              <div className="flex items-center gap-2 mx-2 mb-1">
                <code className="text-xs bg-dark-300 px-2 py-1 rounded flex-grow text-white">
                  {referralCode}
                </code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-gray-400 hover:text-white"
                  onClick={copyReferralCode}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </div>
            )}
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-dark-300" />
        <DropdownMenuItem 
          onClick={() => signOut()} 
          className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-dark-300"
        >
          <div className="flex items-center gap-2 px-2 py-2">
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
