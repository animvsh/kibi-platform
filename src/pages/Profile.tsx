import React, { useState } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedBackground from '@/components/animated-background';
import MainHeader from '@/components/MainHeader';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User, CreditCard, Heart, Clock, Crown, Check, BookOpen, Edit, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const Profile = () => {
  const { user, profile, subscription, loading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState(true);
  const [updatingPreferences, setUpdatingPreferences] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(profile?.bio || "Hello! I'm excited to learn new things and grow my knowledge with KibiAI.");

  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab') || 'profile';

  const favoriteTopics = ['Machine Learning', 'Web Development', 'Data Science'];
  const recentCourses = [
    { id: 1, title: 'Introduction to Python', progress: 75, lastAccessed: '2 days ago' },
    { id: 2, title: 'Advanced JavaScript', progress: 40, lastAccessed: '1 week ago' },
    { id: 3, title: 'Data Science Fundamentals', progress: 20, lastAccessed: 'Yesterday' },
  ];
  const achievements = [
    { id: 1, title: 'Fast Learner', description: 'Completed 3 courses in a week', icon: '🚀' },
    { id: 2, title: 'Perfect Score', description: 'Scored 100% on a quiz', icon: '🏆' },
    { id: 3, title: 'Early Adopter', description: 'Joined during beta phase', icon: '🔍' },
  ];

  const updatePreferences = async (notifications: boolean) => {
    if (!user) return;
    
    setUpdatingPreferences(true);
    
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ notifications })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Preferences updated",
        description: "Your notification settings have been saved."
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdatingPreferences(false);
    }
  };

  const updateBio = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Bio updated",
        description: "Your bio has been saved successfully."
      });
      setEditingBio(false);
    } catch (error) {
      console.error('Error updating bio:', error);
      toast({
        title: "Error",
        description: "Failed to update your bio. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleNotifications = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    updatePreferences(newValue);
  };

  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-dark-500 text-white">
      <AnimatedBackground variant="circles" intensity="medium" />
      
      <MainHeader />

      <main className="flex-1 flex flex-col items-center px-4 py-10 relative z-20">
        <div className="w-full max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-gray-400">Your personal space to track progress and manage your account</p>
          </div>

          <Tabs defaultValue={tab} className="w-full">
            <TabsList className="bg-dark-400 border-2 border-dark-300 mb-8">
              <TabsTrigger value="profile" className="data-[state=active]:bg-kibi-600 data-[state=active]:text-white">
                <User className="h-4 w-4 mr-2" />
                About Me
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-kibi-600 data-[state=active]:text-white">
                <Clock className="h-4 w-4 mr-2" />
                Learning History
              </TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-kibi-600 data-[state=active]:text-white">
                <Heart className="h-4 w-4 mr-2" />
                My Favorites
              </TabsTrigger>
              <TabsTrigger value="subscription" className="data-[state=active]:bg-kibi-600 data-[state=active]:text-white">
                <CreditCard className="h-4 w-4 mr-2" />
                Membership
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0">
              <Card className="bg-dark-400 border-2 border-dark-300">
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                  <CardDescription className="text-gray-400">
                    Your personal information and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center">
                    <Avatar className="w-32 h-32 border-4 border-kibi-600">
                      {profile?.avatar_url ? (
                        <AvatarImage src={profile.avatar_url} alt={profile.username || "User Avatar"} />
                      ) : (
                        <AvatarFallback className="bg-kibi-600 text-white text-5xl">
                          {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <Button variant="outline" className="mt-4 w-full bg-dark-300">
                      Change Picture
                    </Button>
                    <div className="mt-6 text-center">
                      <h3 className="text-xl font-bold">{profile?.username || 'User'}</h3>
                      <p className="text-gray-400">{user?.email}</p>
                      <div className="mt-2 flex gap-2 justify-center">
                        <div className="px-3 py-1 bg-dark-300 rounded-full text-sm">
                          {subscription?.plan_name || 'Free'} Plan
                        </div>
                        <div className="px-3 py-1 bg-dark-300 rounded-full text-sm">
                          Joined 2023
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-lg font-medium">Bio</Label>
                        {!editingBio ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setEditingBio(true)}
                            className="text-kibi-400"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={updateBio}
                            className="text-kibi-400"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        )}
                      </div>
                      {editingBio ? (
                        <Textarea 
                          value={bio} 
                          onChange={(e) => setBio(e.target.value)}
                          className="bg-dark-300 text-white border-dark-200 min-h-[120px]"
                          placeholder="Tell us a bit about yourself..."
                        />
                      ) : (
                        <p className="text-gray-300 bg-dark-300 p-4 rounded-md">{bio}</p>
                      )}
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3">My Achievements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {achievements.map(achievement => (
                          <div key={achievement.id} className="bg-dark-300 p-4 rounded-lg flex items-center">
                            <div className="text-3xl mr-3">{achievement.icon}</div>
                            <div>
                              <h4 className="font-medium">{achievement.title}</h4>
                              <p className="text-sm text-gray-400">{achievement.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">My Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {favoriteTopics.map((topic, index) => (
                          <div key={index} className="bg-kibi-600 bg-opacity-30 text-kibi-300 px-3 py-1 rounded-full text-sm">
                            {topic}
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="rounded-full bg-dark-300 h-7">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <Card className="bg-dark-400 border-2 border-dark-300">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Learning History</span>
                    <Button asChild variant="outline" size="sm" className="bg-dark-300 border-dark-200">
                      <Link to="/my-courses">
                        <BookOpen className="h-4 w-4 mr-2" />
                        View All My Courses
                      </Link>
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Track your progress and continue where you left off
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <h3 className="font-medium text-lg">Recently Viewed</h3>
                    {recentCourses.map(course => (
                      <div key={course.id} className="bg-dark-300 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-kibi-300">{course.title}</h4>
                          <span className="text-xs text-gray-400">{course.lastAccessed}</span>
                        </div>
                        <div className="mt-2 mb-3">
                          <div className="w-full bg-dark-200 rounded-full h-2">
                            <div 
                              className="bg-kibi-500 h-2 rounded-full" 
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs">{course.progress}% complete</span>
                            <span className="text-xs">
                              {Math.round(course.progress / 10)} / 10 modules
                            </span>
                          </div>
                        </div>
                        <Button size="sm" className="bg-dark-400 hover:bg-dark-300">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Continue Learning
                        </Button>
                      </div>
                    ))}
                    
                    <div className="pt-4">
                      <h3 className="font-medium text-lg mb-3">Learning Statistics</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-dark-300 p-4 rounded-lg text-center">
                          <p className="text-3xl font-bold text-kibi-400">8</p>
                          <p className="text-gray-400">Courses Started</p>
                        </div>
                        <div className="bg-dark-300 p-4 rounded-lg text-center">
                          <p className="text-3xl font-bold text-kibi-400">3</p>
                          <p className="text-gray-400">Courses Completed</p>
                        </div>
                        <div className="bg-dark-300 p-4 rounded-lg text-center">
                          <p className="text-3xl font-bold text-kibi-400">24h</p>
                          <p className="text-gray-400">Learning Time</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favorites" className="mt-0">
              <Card className="bg-dark-400 border-2 border-dark-300">
                <CardHeader>
                  <CardTitle>My Favorites</CardTitle>
                  <CardDescription className="text-gray-400">
                    Courses and topics you've saved for later
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <h3 className="font-medium text-lg">Favorite Topics</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {favoriteTopics.map((topic, index) => (
                        <div key={index} className="bg-kibi-600 bg-opacity-30 text-kibi-300 px-4 py-2 rounded-md flex items-center">
                          <Heart className="h-4 w-4 mr-2 fill-kibi-400" />
                          {topic}
                        </div>
                      ))}
                    </div>
                    
                    <h3 className="font-medium text-lg pt-4">Saved Courses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...recentCourses, {id: 4, title: 'Machine Learning with Python', progress: 0, lastAccessed: 'Not started'}].map(course => (
                        <div key={course.id} className="bg-dark-300 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium">{course.title}</h4>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Heart className="h-4 w-4 fill-kibi-400" />
                            </Button>
                          </div>
                          <Button size="sm" className="bg-kibi-500 hover:bg-kibi-600 text-white">
                            {course.progress > 0 ? 'Continue' : 'Start Course'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription" className="mt-0">
              <Card className="bg-dark-400 border-2 border-dark-300">
                <CardHeader>
                  <CardTitle>Your Membership</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your subscription and account settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-dark-300 rounded-lg p-6 mb-8 border-2 border-dark-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-kibi-400">{subscription?.plan_name || "Free Tier"}</h3>
                        <p className="text-gray-400">
                          {subscription?.plan_id === 1 
                            ? "Limited features with 5 sessions per day" 
                            : "Full access to all features and courses"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {subscription?.plan_id === 1 ? "$0" : "$9.99"}
                          <span className="text-sm text-gray-400">/month</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          {subscription?.plan_id === 1 
                            ? "Free forever" 
                            : "Next billing date: May 15, 2025"}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      {subscription?.plan_id === 1 ? (
                        <Button className="bg-kibi-500 hover:bg-kibi-600 text-white">
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade to Pro
                        </Button>
                      ) : (
                        <Button variant="outline" className="bg-dark-400 border-dark-200">
                          Manage Subscription
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {subscription?.plan_id !== 1 && (
                    <div>
                      <h4 className="font-medium mb-4">Payment Method</h4>
                      <div className="bg-dark-300 rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-600 rounded p-2">
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-xs text-gray-400">Expires 12/2025</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">Change</Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <h4 className="font-medium mb-4">Account Settings</h4>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notifications">Email Notifications</Label>
                          <p className="text-sm text-gray-400">
                            Receive emails about new courses and updates
                          </p>
                        </div>
                        <Switch
                          id="notifications"
                          checked={notifications}
                          onCheckedChange={toggleNotifications}
                          disabled={updatingPreferences}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="theme">Dark Mode</Label>
                          <p className="text-sm text-gray-400">
                            Toggle between light and dark theme
                          </p>
                        </div>
                        <Switch id="theme" checked={true} />
                      </div>
                      
                      <div className="pt-4">
                        <Button variant="outline" className="bg-dark-300 w-full">
                          Change Password
                        </Button>
                      </div>
                      
                      <div className="pt-2">
                        <Button variant="outline" className="bg-dark-300 text-red-400 w-full border-red-900">
                          Log Out
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start pt-0">
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Share KibiAI with Friends</h4>
                    <div className="bg-dark-300 p-4 rounded-lg">
                      <p className="text-sm mb-2">Your referral link:</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value="https://kibiai.com/ref/YOUR123"
                          readOnly
                          className="bg-dark-200 p-2 rounded text-sm flex-grow"
                        />
                        <Button size="sm" className="bg-kibi-500">Copy</Button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Get 1 month free when a friend signs up with your link!
                      </p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
