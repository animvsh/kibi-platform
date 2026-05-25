import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MainHeader from '@/components/MainHeader';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/animated-background';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, Edit, PlusCircle } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';
import { GenerateOutlineResponse } from '@/types/course';

interface CourseItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  content: {
    title: string;
    units: {
      title: string;
      subunits: string[];
    }[];
  };
  progress?: number;
}

const parseContentFromSupabase = (content: Json): CourseItem['content'] => {
  try {
    if (typeof content === 'object' && content !== null && 'title' in content && 'units' in content) {
      return content as CourseItem['content'];
    }
    
    if (typeof content === 'string') {
      return JSON.parse(content) as CourseItem['content'];
    }
    
    return {
      title: "Untitled Course",
      units: []
    };
  } catch (error) {
    console.error("Error parsing course content:", error);
    return {
      title: "Untitled Course",
      units: []
    };
  }
};

const MyCourses = () => {
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('created');

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          const transformedData: CourseItem[] = data.map(item => ({
            id: item.id,
            title: item.title,
            created_at: item.created_at,
            updated_at: item.updated_at,
            content: parseContentFromSupabase(item.content)
          }));
          
          setCourses(transformedData);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-500 text-white">
      <AnimatedBackground variant="circles" intensity="medium" />
      
      <MainHeader />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Courses</h1>
            <p className="text-gray-400">Manage and track your learning journey</p>
          </div>
          
          <Button asChild className="bg-kibi-500 hover:bg-kibi-600">
            <Link to="/outline-builder">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Course
            </Link>
          </Button>
        </div>
        
        <Tabs defaultValue="created" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-dark-400 border-2 border-dark-300 mb-6">
            <TabsTrigger value="created" className="data-[state=active]:bg-kibi-600">
              <BookOpen className="h-4 w-4 mr-2" />
              Created Courses
            </TabsTrigger>
            <TabsTrigger value="studying" className="data-[state=active]:bg-kibi-600">
              <Clock className="h-4 w-4 mr-2" />
              Currently Studying
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="created">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kibi-400"></div>
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <Card key={course.id} className="bg-dark-400 border-2 border-dark-300 overflow-hidden hover:border-kibi-600 transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <Badge className="bg-kibi-600 text-white mb-2">Course</Badge>
                        <span className="text-sm text-gray-400">
                          {formatDate(course.updated_at)}
                        </span>
                      </div>
                      <CardTitle className="text-xl text-kibi-300">{course.content.title}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {course.content.units?.length || 0} units &middot; {course.content.units?.reduce((total, unit) => total + (unit.subunits?.length || 0), 0) || 0} topics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-gray-300">
                        {course.content.units?.slice(0, 3).map((unit, index) => (
                          <li key={index} className="truncate mb-1">• {unit.title}</li>
                        ))}
                        {course.content.units?.length > 3 && (
                          <li className="text-gray-400">• +{course.content.units.length - 3} more units</li>
                        )}
                      </ul>
                    </CardContent>
                    <CardFooter className="border-t border-dark-300 pt-4 flex justify-between">
                      <Button 
                        variant="outline" 
                        className="bg-dark-300 hover:bg-dark-200" 
                        asChild
                      >
                        <Link to={`/course/${course.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Course
                        </Link>
                      </Button>
                      <Button 
                        className="bg-kibi-500 hover:bg-kibi-600" 
                        asChild
                      >
                        <Link to={`/course/${course.id}`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Open
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-dark-400 border-2 border-dark-300 rounded-lg">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-medium mb-2">No courses created yet</h3>
                <p className="text-gray-400 mb-6">Create your first course and start your teaching journey</p>
                <Button asChild className="bg-kibi-500 hover:bg-kibi-600">
                  <Link to="/outline-builder">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create First Course
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="studying">
            <div className="text-center py-12 bg-dark-400 border-2 border-dark-300 rounded-lg">
              <Clock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium mb-2">No courses in progress</h3>
              <p className="text-gray-400 mb-6">You're not currently studying any courses</p>
              <Button asChild className="bg-kibi-500 hover:bg-kibi-600">
                <Link to="/courses">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Courses
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyCourses;
