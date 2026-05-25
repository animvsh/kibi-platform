import { Button } from './ui/button';
import { Rocket, Code, Database, BookOpen, BrainCircuit, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CourseCardProps {
  title: string;
  icon: React.ReactNode;
  level: string;
  duration: string;
  description: string;
  color: string;
  borderColor: string;
  enrolled?: number;
  rating?: number;
}

function CourseCard({ 
  title, 
  icon, 
  level, 
  duration, 
  description, 
  color, 
  borderColor,
  enrolled = 0,
  rating = 0
}: CourseCardProps) {
  return (
    <div className={`bg-dark-400 border-4 ${borderColor} rounded-xl p-5 blocky hover:scale-[1.02] transition-transform duration-300`}>
      <div className={`w-14 h-14 ${color} icon-3d ${borderColor} flex items-center justify-center transform rotate-6 mb-4 rounded-xl`}>
        {icon}
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-sm text-gray-400">{level}</span>
          <span className="text-sm text-gray-400 mx-2">•</span>
          <span className="text-sm text-gray-400">{duration}</span>
        </div>
        {enrolled > 0 && (
          <span className="text-xs bg-kibi-500/20 text-kibi-300 px-2 py-1 rounded-full">
            {enrolled.toLocaleString()} enrolled
          </span>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2 cartoon-text">{title}</h3>
      <p className="text-gray-300 mb-4 text-sm">{description}</p>
      
      <div className="flex justify-between items-center">
        {rating > 0 ? (
          <div className="flex items-center text-kibi-400">
            <span className="mr-1">{rating.toFixed(1)}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star} 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill={star <= rating ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              ))}
            </div>
          </div>
        ) : (
          <span className="text-kibi-400 font-medium">Starting soon</span>
        )}
        <Button 
          variant="outline"
          className="bg-dark-300 border-4 border-dark-200 text-gray-300 hover:bg-dark-200 hover:text-white shadow-[0_4px_0_rgba(0,0,0,0.3)] active:shadow-[0_2px_0_rgba(0,0,0,0.3)] active:translate-y-1 transition-all"
        >
          Explore
        </Button>
      </div>
    </div>
  );
}

export default function PopularCourses() {
  const courses = [
    {
      title: "Machine Learning Fundamentals",
      icon: <BrainCircuit className="w-6 h-6 text-white" />,
      level: "Intermediate",
      duration: "8 weeks",
      description: "Learn the core principles and algorithms of machine learning and how to implement them.",
      color: "bg-purple-500",
      borderColor: "border-purple-600",
      enrolled: 2341,
      rating: 4.7
    },
    {
      title: "Web Development with React",
      icon: <Code className="w-6 h-6 text-white" />,
      level: "Beginner",
      duration: "6 weeks",
      description: "Build interactive web applications using React, the popular JavaScript library.",
      color: "bg-blue-500",
      borderColor: "border-blue-600",
      enrolled: 3105,
      rating: 4.9
    },
    {
      title: "Data Science with Python",
      icon: <Database className="w-6 h-6 text-white" />,
      level: "Intermediate",
      duration: "10 weeks",
      description: "Explore data analysis, visualization, and machine learning using Python.",
      color: "bg-kibi-500",
      borderColor: "border-kibi-600",
      enrolled: 1862,
      rating: 4.6
    },
    {
      title: "UX/UI Design Principles",
      icon: <Palette className="w-6 h-6 text-white" />,
      level: "Beginner",
      duration: "5 weeks",
      description: "Learn essential design principles and tools for creating effective user interfaces.",
      color: "bg-pink-500",
      borderColor: "border-pink-600",
      enrolled: 1298,
      rating: 4.5
    },
    {
      title: "Mobile App Development",
      icon: <Rocket className="w-6 h-6 text-white" />,
      level: "Intermediate",
      duration: "9 weeks",
      description: "Create cross-platform mobile applications using React Native and modern tools.",
      color: "bg-amber-500",
      borderColor: "border-amber-600",
      enrolled: 2011,
      rating: 4.8
    },
    {
      title: "Intro to Artificial Intelligence",
      icon: <BookOpen className="w-6 h-6 text-white" />,
      level: "Advanced",
      duration: "12 weeks",
      description: "Dive deep into AI concepts, neural networks, and practical applications.",
      color: "bg-indigo-500",
      borderColor: "border-indigo-600",
      enrolled: 1547,
      rating: 4.7
    }
  ];

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white cartoon-text">Popular Courses</h2>
        <Link to="/courses">
          <Button 
            variant="outline"
            className="bg-dark-400 border-4 border-dark-300 text-gray-300 hover:bg-dark-300 hover:text-white shadow-[0_4px_0_rgba(0,0,0,0.3)] active:shadow-[0_2px_0_rgba(0,0,0,0.3)] active:translate-y-1 transition-all"
          >
            View All Courses
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <CourseCard key={index} {...course} />
        ))}
      </div>
    </div>
  );
}
