
import React, { useState, useEffect } from 'react';
import { useLocation, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import HomeLayout from '@/components/home/HomeLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { CreditCard, User, Bell, Shield, Settings as SettingsIcon } from 'lucide-react';

import SubscriptionTab from '@/components/settings/SubscriptionTab';
import AccountTab from '@/components/settings/AccountTab';
import NotificationsTab from '@/components/settings/NotificationsTab';
import PrivacyTab from '@/components/settings/PrivacyTab';
import PreferencesTab from '@/components/settings/PreferencesTab';

const Settings = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("subscription");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  useEffect(() => {
    // Check URL params for tab selection
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['subscription', 'account', 'notifications', 'privacy', 'preferences'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
    
    // Check if a plan was selected from the pricing page
    if (location.state?.selectedPlan) {
      setSelectedPlan(location.state.selectedPlan);
      setActiveTab("subscription");
    }
  }, [location.state, searchParams]);

  // Redirect to auth page if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSubscribe = (plan: string) => {
    // This would normally connect to Stripe or another payment processor
    toast({
      title: "Subscription flow initiated",
      description: `You selected the ${plan} plan. (Payments not implemented in this demo)`,
    });
    
    setSelectedPlan(null);
  };
  
  const handleReferralCopy = () => {
    navigator.clipboard.writeText(`https://kibi.learn/ref/${user?.id?.substring(0, 8)}`);
    toast({
      title: "Referral link copied!",
      description: "Share with friends to earn free sessions",
    });
  };

  const currentPlan = "Free Tier"; // Would normally come from user data
  const sessionsUsed = 3; // Would normally come from user data
  const sessionsTotal = 5; // Would normally come from user data

  return (
    <HomeLayout>
      <div className="max-w-5xl w-full mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 cartoon-text">settings</h1>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="subscription" className="text-lg">
              <CreditCard className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Subscription</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="text-lg">
              <User className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-lg">
              <Bell className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-lg">
              <Shield className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-lg">
              <SettingsIcon className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscription">
            <SubscriptionTab 
              currentPlan={currentPlan}
              sessionsUsed={sessionsUsed}
              sessionsTotal={sessionsTotal}
              selectedPlan={selectedPlan}
              handleSubscribe={handleSubscribe}
              handleReferralCopy={handleReferralCopy}
            />
          </TabsContent>
          
          <TabsContent value="account">
            <AccountTab />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
          
          <TabsContent value="privacy">
            <PrivacyTab />
          </TabsContent>
          
          <TabsContent value="preferences">
            <PreferencesTab />
          </TabsContent>
        </Tabs>
      </div>
    </HomeLayout>
  );
};

export default Settings;
