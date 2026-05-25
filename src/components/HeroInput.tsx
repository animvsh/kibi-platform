
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, Zap } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import FileUploadZone from '@/components/FileUploadZone';
import TypewriterInput from '@/components/TypewriterInput';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface HeroInputProps {
  onSearch: (text: string) => void;
  isLoading: boolean;
  error: string;
}

const HeroInput: React.FC<HeroInputProps> = ({ onSearch, isLoading, error }) => {
  const [inputText, setInputText] = useState('');
  const fileUploadRef = useRef<any>(null);
  const isMobile = useIsMobile();

  const placeholderPhrases = [
    "machine learning",
    "web development",
    "python programming",
    "data science",
    "UI/UX design",
    "artificial intelligence"
  ];

  const handleInputChange = (value: string) => {
    setInputText(value);
  };

  const handleFileContent = (content: string) => {
    // First, validate content before processing
    if (isLimitedExtraction(content)) {
      toast.error("Could not extract meaningful text from the PDF. Please try another file format.");
      return;
    }
    
    const plainText = content.replace(/(<([^>]+)>)/gi, '');
    
    // Verify that we have meaningful content (at least 100 characters)
    if (!plainText || plainText.trim().length < 100) {
      toast.error("The extracted text is too short for meaningful analysis. Please upload a document with more content.");
      return;
    }
    
    setInputText(plainText);
    
    // If content seems valid, start the search
    onSearch(plainText);
    toast.success("Document processed successfully");
  };
  
  const isLimitedExtraction = (text: string): boolean => {
    const limitedExtractionPhrases = [
      "Limited text extraction available",
      "Could not extract meaningful text",
      "We couldn't extract readable text",
      "Failed to extract text"
    ];
    
    for (const phrase of limitedExtractionPhrases) {
      if (text.includes(phrase)) {
        return true;
      }
    }
    
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't allow empty submissions
    if (!inputText.trim()) {
      toast.error("Please enter a topic or upload a document");
      return;
    }
    
    onSearch(inputText);
  };

  // Add drag and drop handlers to the entire document
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Check if dragged items are files
      if (e.dataTransfer?.types.includes('Files')) {
        // Trigger the file upload dialog automatically
        fileUploadRef.current?.openFileDialog();
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <div className="animate-fadeInUp" style={{animationDelay: '0.4s'}}>
      <FileUploadZone 
        ref={fileUploadRef}
        onFileContent={handleFileContent} 
        isLoading={isLoading}
      >
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative">
            <TypewriterInput
              placeholderPhrases={placeholderPhrases}
              onValueChange={handleInputChange}
              baseClass={`w-full ${isMobile ? 'h-14 text-base' : 'h-16 text-lg'} px-4 sm:px-6 py-4 bg-dark-300 text-white rounded-xl border-2 sm:border-4 border-dark-200 focus:border-kibi-600 focus:outline-none shadow-[0_6px_0_rgba(0,0,0,0.3)] sm:shadow-[0_8px_0_rgba(0,0,0,0.3)] transition-all duration-300`}
            />
            <Button
              type="submit"
              className={`absolute right-2 top-2 ${isMobile ? 'h-10' : 'h-12'} shadow-[0_4px_0_rgba(0,0,0,0.1)] active:shadow-[0_2px_0_rgba(0,0,0,0.1)] active:translate-y-1 transition-all bg-kibi-500 hover:bg-kibi-600 text-white border-2 sm:border-4 border-kibi-600 flex items-center gap-2 rounded-xl`}
              disabled={isLoading || !inputText.trim()}
            >
              {isLoading ? (
                <>Creating...</>
              ) : (
                <>
                  {isMobile ? 'Go' : 'Create'} <Zap size={isMobile ? 14 : 16} className="text-white" />
                </>
              )}
            </Button>
          </div>
        </form>
      </FileUploadZone>

      {error && (
        <Alert variant="destructive" className="mt-4 bg-red-900 border-2 sm:border-4 border-red-600 shadow-[0_4px_0_rgba(0,0,0,0.1)] rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default HeroInput;
