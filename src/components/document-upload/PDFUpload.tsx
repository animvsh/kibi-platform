
import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PDFUploadProps {
  onExtractedText: (text: string, filename: string) => void;
  isUploading?: boolean;
}

const PDFUpload: React.FC<PDFUploadProps> = ({ onExtractedText, isUploading = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractionWarning, setExtractionWarning] = useState<string | null>(null);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (isUploading || extracting) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading || extracting || !e.target.files || e.target.files.length === 0) return;
    handleFile(e.target.files[0]);
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    setSelectedFile(file);
    setExtractionWarning(null);
    setExtractionProgress(0);
    setProgressMessage('');
    await extractText(file);
  };
  
  const extractText = async (file: File) => {
    setExtracting(true);
    toast.info('Analyzing PDF content...');
    setProgressMessage('Preparing PDF for analysis');
    setExtractionProgress(10);
    
    try {
      // Read file as data URL
      const fileContent = await readFileAsDataURL(file);
      
      if (!fileContent) {
        throw new Error('Could not read file content');
      }
      
      setProgressMessage('Sending PDF to extraction service');
      setExtractionProgress(30);
      
      // Send the PDF to our Adobe PDF Services edge function for extraction
      const { data, error } = await supabase.functions.invoke("extract-pdf-text", {
        body: { fileUrl: fileContent }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        toast.error('Failed to process PDF: ' + error.message);
        setExtracting(false);
        return;
      }
      
      if (!data) {
        throw new Error('No data returned from PDF extraction');
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      setProgressMessage('Processing extracted content');
      setExtractionProgress(70);

      // Check for extraction warnings
      if (data.usingFallback) {
        setExtractionWarning("Using simplified PDF extraction. Results may be limited.");
        toast.warning("Using simplified PDF extraction. Results may be limited.");
      } else if (data.usingAdobeExtraction) {
        toast.success("Document processed with Adobe PDF Services");
      }

      console.log("PDF extraction results:", data);
      
      // Check if we have enough content
      if (hasLimitedContent(data)) {
        setExtractionWarning("Limited text could be extracted from this PDF. Results may not include all content.");
        toast.warning("Limited text extraction. Try a different file format for better results.");
      }

      setProgressMessage('Generating course content');
      setExtractionProgress(85);

      // Pass the extracted data to the PDF-to-course function
      const { data: courseData, error: courseError } = await supabase.functions.invoke("pdf-to-course", {
        body: { 
          pdfText: formatExtractedContent(data),
          fileName: file.name
        }
      });
      
      if (courseError) {
        console.error("Course generation error:", courseError);
        throw new Error(`Failed to generate course: ${courseError.message}`);
      }

      setProgressMessage('Content generation complete');
      setExtractionProgress(100);

      // Pass the processed course data to the parent component
      if (courseData) {
        onExtractedText(JSON.stringify(courseData), file.name);
        if (!extractionWarning) {
          toast.success('PDF processed successfully!');
        }
      } else {
        throw new Error('No course data returned');
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast.error('Failed to extract text from PDF. Try a simpler PDF format.');
      setExtractionWarning("Error processing PDF: " + error.message);
    } finally {
      setExtracting(false);
    }
  };

  // Check if the extraction results are limited
  const hasLimitedContent = (data: any): boolean => {
    if (!data) return true;
    
    // Check for paragraphs
    if (!Array.isArray(data.paragraphs) || data.paragraphs.length === 0) {
      return true;
    }
    
    // If we have only one paragraph and it contains a warning
    if (data.paragraphs.length === 1 && 
        data.paragraphs[0].text.includes('Limited text')) {
      return true;
    }
    
    // Check if we have very few paragraphs in a larger document
    if (data.metadata?.pageCount > 5 && data.paragraphs.length < 3) {
      return true;
    }
    
    return false;
  };

  // Format extracted content for the course generator
  const formatExtractedContent = (data: any): string => {
    let formattedContent = `Title: ${data.title || 'Untitled Document'}\n\n`;
    
    if (Array.isArray(data.headings) && data.headings.length > 0) {
      formattedContent += "# Headings:\n";
      data.headings.forEach((heading: any) => {
        formattedContent += `${'#'.repeat(heading.level || 1)} ${heading.text}\n`;
      });
      formattedContent += "\n";
    }
    
    if (Array.isArray(data.paragraphs) && data.paragraphs.length > 0) {
      formattedContent += "# Content:\n";
      data.paragraphs.forEach((paragraph: any) => {
        formattedContent += `${paragraph.text}\n\n`;
      });
    }
    
    return formattedContent;
  };
  
  const readFileAsDataURL = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string || '');
      };
      reader.onerror = (e) => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const retryWithAnotherFormat = () => {
    setSelectedFile(null);
    setExtractionWarning(null);
    toast.info("Please try uploading the PDF in a different format or a TXT file instead");
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 transition-all
        ${isDragging ? 'border-kibi-400 bg-kibi-900/20' : 'border-gray-600 hover:border-gray-400'}
        ${isUploading || extracting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isUploading && !extracting && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf"
        onChange={handleFileSelect}
        disabled={isUploading || extracting}
      />
      
      <div className="flex flex-col items-center justify-center text-center">
        {selectedFile && extracting ? (
          <>
            <div className="h-12 w-12 rounded-full bg-kibi-600/30 flex items-center justify-center mb-4">
              <Loader2 className="h-6 w-6 text-kibi-400 animate-spin" />
            </div>
            <p className="text-white font-medium">{selectedFile.name}</p>
            <p className="text-gray-400 text-sm mt-1">{progressMessage}</p>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-700 rounded-full mt-3 max-w-xs">
              <div 
                className="h-full bg-kibi-500 rounded-full transition-all duration-300" 
                style={{ width: `${extractionProgress}%` }}
              ></div>
            </div>
          </>
        ) : selectedFile && extractionWarning ? (
          <>
            <div className="h-12 w-12 rounded-full bg-amber-600/30 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
            </div>
            <p className="text-white font-medium">{selectedFile.name}</p>
            <p className="text-amber-400 mt-2">{extractionWarning}</p>
            <div className="flex gap-3 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  retryWithAnotherFormat();
                }}
              >
                Try Another File
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setExtractionWarning(null);
                }}
              >
                Continue Anyway
              </Button>
            </div>
          </>
        ) : selectedFile ? (
          <>
            <div className="h-12 w-12 rounded-full bg-green-600/30 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-green-400" />
            </div>
            <p className="text-white font-medium">{selectedFile.name}</p>
            <p className="text-gray-400 text-sm mt-1">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </>
        ) : (
          <>
            <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-white font-medium">Upload a PDF document</p>
            <p className="text-gray-400 text-sm mt-1">Drag & drop or click to browse</p>
            <Button 
              variant="outline" 
              className="mt-4"
              disabled={isUploading || extracting}
            >
              Select PDF
            </Button>
            <p className="text-xs text-gray-500 mt-2">Recommended: Use text-based PDFs for best results</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PDFUpload;
