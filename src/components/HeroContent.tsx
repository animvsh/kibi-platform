
import { Button } from "@/components/ui/button";
import { BookOpen, Code, Database, Trophy, Star, Brain, FileText, BarChart3, Upload, Sparkles, CheckCircle, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const HeroContent = () => {
  return (
    <div className="max-w-4xl mx-auto text-center px-4">
      {/* Main Hero Section */}
      <div className="glass-card p-6 mb-10 transform hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-dark-300/70 to-dark-400/70 backdrop-blur-md border-kibi-600/30">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles size={20} className="text-yellow-400" />
          <h2 className="text-2xl md:text-3xl font-bold text-white cartoon-text">
            Learn anything with <span className="text-kibi-400">Kibi</span>
          </h2>
          <Sparkles size={20} className="text-yellow-400" />
        </div>
        <p className="text-lg text-gray-300 mb-6">
          Personalized AI-powered learning that adapts to your goals, pace, and style.
        </p>
        
        <div className="bg-dark-300/80 rounded-xl p-6 mb-6 border-2 border-dark-200 transform transition-all hover:border-kibi-500/50 hover:scale-[1.01]">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Upload size={18} className="text-kibi-400" />
            <h3 className="text-xl font-bold text-white cartoon-text">Get Started Instantly</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Enter a topic or upload a PDF to generate a personalized course.<br/>
            Our AI will create a structured course with <span className="text-kibi-400">modules, quizzes, and hands-on projects</span>—just for you.
          </p>
        </div>
      </div>
      
      {/* What is Kibi Section */}
      <div className="glass-card p-6 mb-10 transform hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-dark-300/70 to-dark-400/70 backdrop-blur-md border-kibi-600/30">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Brain size={20} className="text-kibi-400" />
          <h2 className="text-2xl font-bold text-white mb-4 cartoon-text">What is Kibi?</h2>
        </div>
        
        <p className="text-lg text-gray-300 mb-6">
          <span className="text-kibi-400 font-bold">Kibi</span> is your AI-powered learning platform that builds <span className="text-white">personalized courses</span> based on your <span className="text-white">goals</span>, <span className="text-white">learning style</span>, and <span className="text-white">pace</span>.
        </p>
        
        <div className="bg-dark-300/80 rounded-xl p-4 mb-6 border-2 border-dark-200">
          <p className="text-gray-300 italic">
            <span className="text-kibi-300">🎓</span> With Kibi, you can learn anything—from coding to cooking, mathematics to music theory—guided by AI-generated curriculums tailored for you.
          </p>
        </div>
      </div>
      
      {/* Meet Kibi Section */}
      <div className="glass-card p-6 mb-10 transform hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-dark-300/70 to-dark-400/70 backdrop-blur-md border-kibi-600/30">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles size={20} className="text-yellow-400" />
          <h2 className="text-2xl font-bold text-white cartoon-text">Meet Kibi – Your Friendly AI Learning Companion</h2>
          <Sparkles size={20} className="text-yellow-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-gradient-to-br from-dark-300/80 to-dark-200/50 rounded-xl p-5 border-2 border-dark-200 hover:border-kibi-500 transition-all duration-300 transform hover:scale-105 hover:rotate-1">
            <div className="w-12 h-12 bg-gradient-to-br from-kibi-500 to-kibi-600 icon-3d border-kibi-700 flex items-center justify-center mb-4 mx-auto">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Personalized Learning</h3>
            <p className="text-gray-300">AI analyzes your learning style to create custom paths</p>
          </div>
          
          <div className="bg-gradient-to-br from-dark-300/80 to-dark-200/50 rounded-xl p-5 border-2 border-dark-200 hover:border-kibi-500 transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-kibi-500 to-kibi-600 icon-3d border-kibi-700 flex items-center justify-center mb-4 mx-auto">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Interactive Content</h3>
            <p className="text-gray-300">Includes exercises, quizzes, and hands-on projects</p>
          </div>
          
          <div className="bg-gradient-to-br from-dark-300/80 to-dark-200/50 rounded-xl p-5 border-2 border-dark-200 hover:border-kibi-500 transition-all duration-300 transform hover:scale-105 hover:rotate-[-1deg]">
            <div className="w-12 h-12 bg-gradient-to-br from-kibi-500 to-kibi-600 icon-3d border-kibi-700 flex items-center justify-center mb-4 mx-auto">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Progress Tracking</h3>
            <p className="text-gray-300">See your learning progress and milestones</p>
          </div>
        </div>
      </div>
      
      {/* User Testimonials Section */}
      <div className="glass-card p-6 mb-10 transform hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-dark-300/70 to-dark-400/70 backdrop-blur-md border-kibi-600/30">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent w-16"></div>
          <h2 className="text-2xl font-bold text-white cartoon-text flex items-center gap-2">
            What Our Users Say
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent w-16"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-dark-300/80 via-kibi-900/10 to-dark-200/50 rounded-xl p-5 border-2 border-dark-200 hover:border-kibi-500 transition-all duration-300 transform hover:scale-105 hover:rotate-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-kibi-500 to-kibi-700 flex items-center justify-center mb-4 mx-auto shadow-lg">
              <span className="text-white font-bold">SK</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Sarah K.</h3>
            <p className="text-gray-400 text-sm mb-2">Software Developer</p>
            <div className="flex justify-center mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={14} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-gray-300 italic">"Kibi totally transformed how I learn. The personalized paths helped me master React in half the time I expected."</p>
          </div>
          
          <div className="bg-gradient-to-br from-dark-300/80 via-kibi-900/10 to-dark-200/50 rounded-xl p-5 border-2 border-dark-200 hover:border-kibi-500 transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-kibi-500 to-kibi-700 flex items-center justify-center mb-4 mx-auto shadow-lg">
              <span className="text-white font-bold">MT</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Michael T.</h3>
            <p className="text-gray-400 text-sm mb-2">Marketing Student</p>
            <div className="flex justify-center mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={14} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-gray-300 italic">"I was struggling with digital marketing concepts until I found Kibi. The interactive elements make learning so much more engaging!"</p>
          </div>
          
          <div className="bg-gradient-to-br from-dark-300/80 via-kibi-900/10 to-dark-200/50 rounded-xl p-5 border-2 border-dark-200 hover:border-kibi-500 transition-all duration-300 transform hover:scale-105 hover:rotate-[-1deg]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-kibi-500 to-kibi-700 flex items-center justify-center mb-4 mx-auto shadow-lg">
              <span className="text-white font-bold">AJ</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Aisha J.</h3>
            <p className="text-gray-400 text-sm mb-2">Data Scientist</p>
            <div className="flex justify-center mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={14} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-gray-300 italic">"As someone who needs to constantly learn new technologies, Kibi has been a game-changer. The AI adapts perfectly to my learning style."</p>
          </div>
        </div>
      </div>
      
      {/* Key Features Section */}
      <div className="glass-card p-6 mb-10 transform hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-dark-300/70 to-dark-400/70 backdrop-blur-md border-kibi-600/30">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Zap size={20} className="text-yellow-400" />
          <h2 className="text-2xl font-bold text-white cartoon-text">Key Features</h2>
          <Zap size={20} className="text-yellow-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-dark-300/80 to-dark-200/50 rounded-xl p-5 border-2 border-dark-200 hover:border-kibi-500 transition-all duration-300 transform hover:scale-105 hover:rotate-1">
            <div className="w-12 h-12 bg-gradient-to-br from-kibi-500 to-kibi-600 icon-3d border-kibi-700 flex items-center justify-center mb-4 mx-auto">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Personalized</h3>
            <p className="text-gray-300">Courses tailored to your style and goals</p>
            <div className="mt-4 flex justify-center">
              <CheckCircle size={16} className="text-kibi-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-dark-300/80 to-dark-200/50 rounded-xl p-5 border-2 border-dark-200 hover:border-kibi-500 transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-kibi-500 to-kibi-600 icon-3d border-kibi-700 flex items-center justify-center mb-4 mx-auto">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Rich Content</h3>
            <p className="text-gray-300">Articles, videos, quizzes, and exercises</p>
            <div className="mt-4 flex justify-center">
              <CheckCircle size={16} className="text-kibi-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-dark-300/80 to-dark-200/50 rounded-xl p-5 border-2 border-dark-200 hover:border-kibi-500 transition-all duration-300 transform hover:scale-105 hover:rotate-[-1deg]">
            <div className="w-12 h-12 bg-gradient-to-br from-kibi-500 to-kibi-600 icon-3d border-kibi-700 flex items-center justify-center mb-4 mx-auto">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Track Progress</h3>
            <p className="text-gray-300">Monitor your journey and celebrate wins</p>
            <div className="mt-4 flex justify-center">
              <CheckCircle size={16} className="text-kibi-400" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 mb-12">
        <Button 
          className="btn-3d text-lg py-6 px-8 bg-gradient-to-r from-kibi-500 to-kibi-600 hover:from-kibi-600 hover:to-kibi-700 border-2 border-kibi-600 flex items-center gap-2"
        >
          Start Learning Now <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
};

export default HeroContent;
