
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { Sparkles, Book, Database, BrainCircuit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import HomeLayout from '@/components/home/HomeLayout';
import HeroSection from '@/components/home/HeroSection';
import ContentSection from '@/components/home/ContentSection';
import { simulateOpenAIValidation } from '@/utils/courseUtils';
import { getHardcodedDSACourse } from '@/utils/dsaDemoContent';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isDSADemoMode } = useDemoMode();

  const popularTopics = [
    {
      name: "Machine Learning",
      color: "bg-kibi-600"
    },
    {
      name: "Web Development",
      color: "bg-kibi-500"
    },
    {
      name: "Data Science",
      color: "bg-kibi-400"
    },
    {
      name: "UI/UX Design",
      color: "bg-kibi-700"
    },
    {
      name: "Python",
      color: "bg-kibi-500"
    }
  ];

  const features = [
    {
      title: "AI-Powered Learning",
      description: "Our platform uses advanced AI to create personalized learning paths tailored to your needs and learning style.",
      icon: <Sparkles className="h-10 w-10 text-kibi-400" />,
      bgColor: "bg-kibi-900",
      borderColor: "border-kibi-700"
    },
    {
      title: "Interactive Courses",
      description: "Engage with dynamic content including quizzes, practical exercises, and real-world projects.",
      icon: <Book className="h-10 w-10 text-kibi-400" />,
      bgColor: "bg-kibi-900",
      borderColor: "border-kibi-700"
    },
    {
      title: "Learning Analytics",
      description: "Track your progress with detailed analytics and insights to optimize your learning journey.",
      icon: <Database className="h-10 w-10 text-kibi-400" />,
      bgColor: "bg-kibi-900",
      borderColor: "border-kibi-700"
    },
  ];
  
  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Software Developer",
      content: "Kibi helped me fill knowledge gaps in my programming journey. The AI-generated courses were surprisingly well-tailored to my learning style.",
      avatar: "A",
      bgColor: "bg-kibi-600",
      borderColor: "border-kibi-700"
    },
    {
      name: "Sarah Chen",
      role: "Data Scientist",
      content: "I was amazed by how quickly I could go from a complete beginner to confidently working with Python and data science tools.",
      avatar: "S",
      bgColor: "bg-kibi-600",
      borderColor: "border-kibi-700"
    },
    {
      name: "Marcus Williams",
      role: "UX Designer",
      content: "The design courses on Kibi gave me practical skills I could immediately apply to my work. Highly recommended!",
      avatar: "M",
      bgColor: "bg-kibi-600",
      borderColor: "border-kibi-700"
    }
  ];

  const validateAndProcess = async (text: string) => {
    if (!text.trim()) {
      setError('Please enter a topic or upload a file');
      return;
    }

    setIsLoading(true);
    setError('');
    setSearchInput(text);

    try {
      toast({
        title: "Processing your request",
        description: "Creating your course outline...",
      });
      
      // Clear any previously stored outline before navigation
      sessionStorage.removeItem('course_outline');
      
      if (isDSADemoMode) {
        // Use hardcoded DSA course outline and navigate directly to module generator
        const dsaCourse = getHardcodedDSACourse();
        sessionStorage.setItem('course_outline', JSON.stringify(dsaCourse));
        navigate('/module-generator');
      } else {
        // Navigate to outline builder with the search query
        navigate('/outline-builder', { state: { searchQuery: text } });
      }
    } catch (err) {
      setError("There was an error processing your request. Please try again.");
      setIsLoading(false);
    }
  };

  const handleTopicClick = (topic: string) => {
    setSearchInput(topic);
    validateAndProcess(topic);
  };

  return (
    <HomeLayout>
      <HeroSection 
        isLoading={isLoading}
        error={error}
        onSearch={validateAndProcess}
        onTopicClick={handleTopicClick}
        popularTopics={popularTopics}
      />

      <ContentSection 
        features={features}
        testimonials={testimonials}
      />
    </HomeLayout>
  );
};

export default Index;
