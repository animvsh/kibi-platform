
import { Book, MoonStar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SessionCards() {
  return (
    <div className="p-8 pb-0">
      <div className="glass-card border-4 p-6 mb-6 blocky border-kibi-600">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 rounded-xl bg-dark-300 text-kibi-500 flex items-center justify-center mr-3 border-2 border-dark-200">
            <span className="text-2xl font-bold">+</span>
          </div>
          <h3 className="text-xl text-white font-bold cartoon-text">quick log</h3>
        </div>
        <div className="px-4 py-2 bg-dark-300 rounded border-2 border-dark-200 mb-2">
          <p className="text-red-400 font-bold">
            speech recognition is not supported in this browser.
          </p>
        </div>
      </div>
      
      <div className="glass-card border-4 p-6 mb-6 blocky border-kibi-600">
        <div className="flex items-center mb-4">
          <Book className="h-6 w-6 text-kibi-500 mr-3" />
          <h3 className="text-xl text-white font-bold cartoon-text">study session</h3>
        </div>
        <p className="text-gray-400 mb-4 pl-8 font-medium">
          track your reading progress and take notes
        </p>
      </div>
      
      <div className="glass-card border-4 p-6 mb-6 blocky border-kibi-600">
        <div className="flex items-center mb-4">
          <MoonStar className="h-6 w-6 text-kibi-500 mr-3" />
          <h3 className="text-xl text-white font-bold cartoon-text">deep work</h3>
        </div>
        <p className="text-gray-400 mb-4 pl-8 font-medium">
          focus without distractions on a single task
        </p>
      </div>
      
      <Button className="w-full bg-kibi-600 hover:bg-kibi-700 text-white py-6 h-16 border-4 border-kibi-700 rounded-xl btn-3d font-bold">
        <Play className="mr-2 h-5 w-5" />
        Start Focused Session
      </Button>
    </div>
  );
}

function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  );
}
