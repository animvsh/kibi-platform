
import { Search } from 'lucide-react';
import { Button } from './ui/button';
import Logo from './Logo';
import { Link as ScrollLink } from 'react-scroll';

export default function HeroSection() {
  const popularTopics = [
    "web development", "machine learning", "data science", "javascript", "python", "design"
  ];
  
  return (
    <div className="text-center px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative mb-6">
          <Logo size="xl" className="mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-kibi-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-xs">AI</span>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2 cartoon-text">
          <span className="text-kibi-400">k</span>
          <span className="text-kibi-300">i</span>
          <span className="text-kibi-400">b</span>
          <span className="text-kibi-300">i</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          learn anything with kibi
        </p>
      </div>
      
      <div className="relative max-w-lg mx-auto mb-8 group">
        <input
          type="text"
          placeholder="enter a topic or upload a pdf to generate a course"
          className="w-full py-4 px-6 bg-dark-300 border-4 border-dark-200 rounded-xl text-white focus:outline-none focus:border-kibi-500 shadow-[0_8px_0_rgba(0,0,0,0.3)] group-hover:border-kibi-600/50 transition-all"
        />
        <Button 
          className="absolute right-2 top-2 bg-kibi-500 hover:bg-kibi-600 active:bg-kibi-700 border-4 border-kibi-600 text-white shadow-[0_4px_0_rgba(0,0,0,0.3)] active:shadow-[0_2px_0_rgba(0,0,0,0.3)] active:translate-y-1 transition-all"
          size="icon"
        >
          <Search />
        </Button>
      </div>
      
      <div className="mb-8">
        <p className="text-gray-400 mb-4">popular topics:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {popularTopics.map((topic, index) => (
            <Button 
              key={index} 
              variant="outline" 
              className="bg-dark-400 border-4 border-dark-300 text-gray-300 hover:bg-dark-300 hover:text-white shadow-[0_4px_0_rgba(0,0,0,0.3)] active:shadow-[0_2px_0_rgba(0,0,0,0.3)] active:translate-y-1 transition-all"
            >
              {topic}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-12 mb-8">
        <Button 
          className="text-lg bg-kibi-500 hover:bg-kibi-600 text-white px-8 py-6 h-auto"
        >
          Start Learning Now
        </Button>
        <ScrollLink to="pricing" smooth={true} duration={500}>
          <Button 
            variant="outline"
            className="text-lg bg-dark-400 hover:bg-dark-300 text-white px-8 py-6 h-auto"
          >
            See Pricing
          </Button>
        </ScrollLink>
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-6 cartoon-text">
        popular learning paths
      </h2>
      <p className="text-gray-400">
        discover what others are learning and start your journey today
      </p>
    </div>
  );
}
