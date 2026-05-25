
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle } from "lucide-react";

interface Module {
  title: string;
  description: string;
  topics: string[];
}

// Background animation component
const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated gradient circles */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-kibi-600/20 blur-3xl animate-pulse" 
        style={{ animation: 'pulse 8s infinite alternate' }}></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-dark-100/10 blur-3xl"
        style={{ animation: 'pulse 12s infinite alternate-reverse' }}></div>
      <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full bg-kibi-500/10 blur-3xl"
        style={{ animation: 'float 15s infinite ease-in-out' }}></div>
      
      {/* Animated particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, index) => (
          <div 
            key={index}
            className="absolute bg-kibi-400 rounded-full opacity-20"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s infinite alternate ease-in-out`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

const CourseOutline = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { inputText } = location.state || { inputText: null };
  
  const [loading, setLoading] = useState(true);
  const [outlineModules, setOutlineModules] = useState<Module[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inputText) return;
    
    const generateOutline = async () => {
      try {
        setLoading(true);
        
        // Simulate calling OpenAI API
        // In a real implementation, replace this with an actual API call
        const modules = await simulateOpenAICall(inputText);
        setOutlineModules(modules);
        toast.success("Course outline generated successfully!");
      } catch (err) {
        console.error("Error generating course outline:", err);
        setError("Failed to generate course outline. Please try again.");
        toast.error("Failed to generate course outline");
      } finally {
        setLoading(false);
      }
    };

    generateOutline();
  }, [inputText]);

  // This function simulates an API call to OpenAI
  // In a real application, replace this with an actual OpenAI API call
  const simulateOpenAICall = (text: string): Promise<Module[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate a sample outline based on the input text
        const topicWords = text.split(' ').filter(word => word.length > 3).slice(0, 5);
        
        const modules: Module[] = [
          {
            title: `Introduction to ${topicWords[0] || 'Course'}`,
            description: `Learn the fundamentals of ${text.substring(0, 30)}...`,
            topics: ['Overview', 'Key concepts', 'History and background']
          },
          {
            title: `Core Principles of ${topicWords[1] || 'Learning'}`,
            description: 'Understanding the essential components and methodologies',
            topics: ['Fundamental techniques', 'Practical applications', 'Case studies']
          },
          {
            title: `Advanced ${topicWords[2] || 'Topics'}`,
            description: 'Diving deeper into complex aspects of the subject',
            topics: ['Advanced strategies', 'Problem-solving approaches', 'Expert-level concepts']
          },
          {
            title: `Practical Applications of ${topicWords[0] || 'Knowledge'}`,
            description: "Applying what you've learned in real-world scenarios",
            topics: ['Real-world examples', 'Hands-on projects', 'Implementation strategies']
          },
          {
            title: 'Mastery and Next Steps',
            description: 'Solidifying your understanding and exploring further areas of study',
            topics: ['Summary of key learnings', 'Further resources', 'Community engagement']
          }
        ];
        
        resolve(modules);
      }, 2000); // Simulate API delay
    });
  };

  const handleContinue = () => {
    navigate('/build', { state: { outlineModules, inputText } });
    toast.success("Outline saved! Building your course...");
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col p-6 overflow-hidden relative">
      <BackgroundAnimation />
      
      <div className="max-w-4xl mx-auto w-full relative z-10">
        <div className="glass-card p-8 mb-6 animate-fade-in">
          <div className="flex items-center mb-6">
            <img 
              src="/lovable-uploads/d05aeef2-b1b6-41ba-bece-8440a8931c04.png" 
              alt="Logo" 
              className="w-12 h-12 mr-3 animate-pulse" 
              style={{ animationDuration: '3s' }}
            />
            <h1 className="text-3xl font-bold text-white cartoon-text">Course Outline</h1>
          </div>
          
          {inputText ? (
            <div>
              <p className="text-gray-300 mb-4">Creating a personalized learning path from:</p>
              <div className="bg-dark-300 p-4 rounded-lg mb-6 border border-dark-200">
                <p className="text-white">{inputText}</p>
              </div>
              
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map((_, index) => (
                    <div 
                      key={index} 
                      className="glass-card p-4 border border-dark-200" 
                      style={{
                        animation: `pulse ${2 + index * 0.2}s infinite alternate`,
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <Skeleton className="h-6 w-3/4 mb-2 bg-dark-300" />
                      <Skeleton className="h-4 w-5/6 mb-2 bg-dark-300" />
                      <div className="space-y-2 mt-4">
                        <Skeleton className="h-3 w-2/3 bg-dark-300" />
                        <Skeleton className="h-3 w-3/4 bg-dark-300" />
                        <Skeleton className="h-3 w-1/2 bg-dark-300" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center">
                  <p className="text-red-400 mb-4">{error}</p>
                  <Button asChild variant="outline">
                    <Link to="/">Back to Home</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {outlineModules.map((module, index) => (
                    <div 
                      key={index} 
                      className="glass-card p-6 border-4 border-kibi-600 rounded-xl blocky hover:transform hover:-translate-y-1 transition-all duration-300"
                      style={{ 
                        animation: 'fadeInUp 0.5s forwards',
                        animationDelay: `${index * 0.15}s`,
                        opacity: 0,
                        transform: 'translateY(20px)'
                      }}
                    >
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-kibi-500 icon-3d border-kibi-600 flex items-center justify-center rounded-xl text-white font-bold mr-4">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 cartoon-text">
                            {module.title}
                          </h3>
                          <p className="text-gray-300 mb-3">{module.description}</p>
                          <div className="space-y-2">
                            {module.topics.map((topic, tIndex) => (
                              <div 
                                key={tIndex} 
                                className="flex items-center"
                                style={{ 
                                  animation: 'fadeInLeft 0.5s forwards',
                                  animationDelay: `${(index * 0.15) + (tIndex * 0.1) + 0.3}s`,
                                  opacity: 0
                                }}
                              >
                                <CheckCircle className="h-4 w-4 text-kibi-500 mr-2" />
                                <p className="text-sm text-gray-400">{topic}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div 
                    className="mt-8 text-center" 
                    style={{ 
                      animation: 'fadeInUp 0.5s forwards',
                      animationDelay: '1s',
                      opacity: 0
                    }}
                  >
                    <Button 
                      onClick={handleContinue} 
                      className="px-8 py-6 h-auto hover:scale-105 transition-transform"
                    >
                      Continue to Course Builder
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-300 mb-4">No content was provided. Please return to the home page and start again.</p>
              <Button asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseOutline;
