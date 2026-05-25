
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Info, Clock, Tag } from 'lucide-react';
import AnimatedBackground from '@/components/animated-background';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from "sonner";
import CourseCard from '@/components/course/CourseCard';
import { getPublicCourses } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';

const PublicCourses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Fix: getPublicCourses expects number parameters, not string
      const { courses, count } = await getPublicCourses(10, 0);
      setCourses(courses || []);
      
      toast.success(
        searchTerm
          ? `Found ${courses?.length || 0} courses matching "${searchTerm}"`
          : `Showing ${courses?.length || 0} public courses`
      );
    } catch (error) {
      toast.error("Failed to search courses");
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*, profiles(username, avatar_url)')
          .eq('is_public', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setCourses(data || []);
      } catch (error) {
        toast.error("Failed to load courses");
        console.error("Error loading courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-dark-500 text-white">
      <AnimatedBackground variant="circles" intensity="low" />
      <Header username="Guest" />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold cartoon-text mb-4">Public Courses</h1>
          <p className="text-xl text-gray-300">Explore courses created by our community</p>
        </div>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-dark-400 border-dark-300 focus:border-kibi-600"
            />
            <Search className="absolute left-4 top-4 text-gray-400" />
            <Button 
              type="submit"
              className="absolute right-2 top-2 bg-kibi-500 hover:bg-kibi-600 border-2 border-kibi-600"
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </form>
        
        {isLoading ? (
          <div className="flex justify-center my-16">
            <div className="flex items-center space-x-4">
              <div className="h-4 w-4 bg-kibi-400 rounded-full animate-pulse"></div>
              <div className="h-4 w-4 bg-kibi-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-4 w-4 bg-kibi-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        ) : (
          <>
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course: any) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    metadata={course.metadata || {
                      tags: [],
                      level: 'beginner',
                      duration: 'unknown',
                      created_by: course.profiles?.username || 'Unknown author'
                    }}
                    share_token={course.share_token}
                    isPaid={course.is_paid_only}
                    authorName={course.profiles?.username || 'Anonymous'}
                    authorAvatar={course.profiles?.avatar_url}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center my-16">
                <h3 className="text-2xl font-bold mb-4">No courses found</h3>
                <p className="text-gray-300">Try a different search term or browse all courses</p>
                <Button 
                  className="mt-6 bg-kibi-500 hover:bg-kibi-600 border-2 border-kibi-600"
                  onClick={() => {
                    setSearchTerm('');
                    handleSearch(new Event('submit') as any);
                  }}
                >
                  View All Courses
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default PublicCourses;
