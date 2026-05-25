
import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Upload, FileUp, X, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileUploadZoneProps {
  children: React.ReactNode;
  onFileContent: (content: string) => void;
  isLoading?: boolean;
}

const FileUploadZone = forwardRef<{ openFileDialog: () => void }, FileUploadZoneProps>(({ 
  children, 
  onFileContent,
  isLoading = false
}, ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingFile, setProcessingFile] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    openFileDialog: () => {
      if (!isLoading) {
        setIsModalOpen(true);
      }
    }
  }));

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
    
    if (isLoading) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading || !e.target.files || e.target.files.length === 0) return;
    setSelectedFile(e.target.files[0]);
    processFile(e.target.files[0]);
  };

  const processFile = async (file: File) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    setProcessingFile(true);
    setProcessingError(null);
    setUsedFallback(false);
    setProcessingProgress(0);
    setProgressMessage('Preparing file for processing');
    
    try {
      if (file.type === 'application/pdf') {
        const fileDataUrl = await readFileAsDataURL(file);
        
        if (fileDataUrl) {
          try {
            toast.info("Processing PDF, this may take a moment...");
            setProgressMessage('Uploading PDF file');
            
            // Simple progress simulation
            const progressInterval = setInterval(() => {
              setProcessingProgress(prev => {
                const increase = Math.random() * 15;
                if (prev < 85) return prev + increase;
                return prev;
              });
            }, 1000);
            
            // Update progress message
            setTimeout(() => setProgressMessage('Extracting text from PDF'), 2000);
            setTimeout(() => setProgressMessage('Analyzing document structure'), 5000);
            
            // Call the edge function with retry mechanism
            let retryCount = 0;
            const maxRetries = 3;
            let success = false;
            let data;
            let error;
            
            while (retryCount < maxRetries && !success) {
              try {
                console.log(`Attempt ${retryCount + 1} to call extract-pdf-text function`);
                const response = await supabase.functions.invoke("extract-pdf-text", {
                  body: { fileUrl: fileDataUrl }
                });
                
                error = response.error;
                data = response.data;
                
                if (!error) {
                  success = true;
                } else {
                  retryCount++;
                  await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                }
              } catch (err) {
                console.error(`Attempt ${retryCount + 1} failed:`, err);
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              }
            }
            
            // Stop progress animation
            clearInterval(progressInterval);
            
            if (!success) {
              console.error("All edge function retry attempts failed:", error);
              throw new Error(`Failed to extract content: ${error?.message || 'Unknown error'}`);
            }
            
            if (!data) {
              throw new Error('No data returned from PDF extraction');
            }
            
            setProcessingProgress(100);
            setProgressMessage('Text extraction completed');
            
            // If we have actual error message in the data
            if (data.error) {
              setProcessingError(data.error);
              return;
            }
            
            // Check if fallback extraction was used
            if (data.usingFallback) {
              setUsedFallback(true);
              toast.warning("Using simplified PDF extraction. Results may be limited.");
            }
            
            // Format the extracted content
            const formattedContent = formatExtractedContent(data);
            
            // Check if we got any meaningful content
            if (isMeaningfulContent(formattedContent)) {
              onFileContent(formattedContent);
              setIsModalOpen(false);
            } else {
              setProcessingError("Could not extract meaningful text from the PDF. Please try a different file format.");
            }
            
          } catch (error) {
            console.error("Error extracting PDF content:", error);
            setProcessingError(`Failed to process PDF: ${error.message || 'Unknown error'}. Try a different file or format.`);
            toast.error("Failed to process PDF. Please try a different file format.");
          }
        } else {
          throw new Error('Failed to read file');
        }
      } else if (file.type === 'text/plain') {
        setProgressMessage('Reading text file');
        setProcessingProgress(50);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setProcessingProgress(100);
          onFileContent(content);
          setIsModalOpen(false);
        };
        reader.readAsText(file);
      } else {
        setProgressMessage('Processing document');
        setProcessingProgress(50);
        
        toast.warning('DOCX processing is limited in this version');
        const content = `Content extracted from: ${file.name} (DOCX parsing is simplified in this version)`;
        setProcessingProgress(100);
        onFileContent(content);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      setProcessingError(`Error processing file: ${error.message || 'Unknown error'}`);
      toast.error("Failed to process file. Please try again.");
    } finally {
      setProcessingFile(false);
    }
  };
  
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsDataURL(file);
    });
  };

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
  
  const isMeaningfulContent = (text: string): boolean => {
    // Check if the string only contains the "Limited text extraction" message
    if (text.includes("Limited text extraction available") && 
        text.length < 200) {
      return false;
    }
    
    // Count paragraphs that are not just short phrases
    const paragraphs = text.split("\n\n");
    const meaningfulParagraphs = paragraphs.filter(p => p.length > 50);
    
    return meaningfulParagraphs.length >= 1;
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setProcessingFile(false);
    setProcessingError(null);
    setUsedFallback(false);
    setProcessingProgress(0);
  };

  const retryProcessFile = () => {
    if (selectedFile) {
      processFile(selectedFile);
    }
  };
  
  const tryAnotherFile = () => {
    setSelectedFile(null);
    setProcessingError(null);
    setUsedFallback(false);
    setProcessingProgress(0);
    triggerFileInput();
  };

  return (
    <div className="relative w-full transition-all duration-300">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.txt"
        onChange={handleFileSelect}
      />
      
      {children}
      
      <div className="text-center mt-3">
        <button 
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading}
          className="text-gray-300 hover:text-white flex items-center justify-center gap-2 mx-auto group transition-all duration-300"
        >
          <div className="relative">
            <Upload className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <div className="absolute -inset-1 bg-kibi-500/0 group-hover:bg-kibi-500/50 rounded-full transition-all duration-300 -z-10"></div>
          </div>
          <span>Upload a document</span>
        </button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="w-[80vw] max-w-[1200px] h-[80vh] max-h-[800px] p-0 bg-dark-400 border-4 border-dark-300">
          <DialogTitle className="sr-only">Upload Document</DialogTitle>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-dark-300 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Upload Document</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div 
              className={`flex-1 flex items-center justify-center p-8 ${isDragging ? 'bg-dark-300' : 'bg-dark-400'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={`border-4 border-dashed ${isDragging ? 'border-kibi-500' : 'border-dark-200'} rounded-2xl w-full h-full flex flex-col items-center justify-center transition-all duration-300`}>
                {selectedFile && processingFile ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-kibi-600/70 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                    <p className="text-white text-lg font-bold">{selectedFile.name}</p>
                    <p className="text-gray-300 mb-4">{progressMessage}</p>
                    
                    {/* Progress bar */}
                    <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto mt-4">
                      <div 
                        className="h-full bg-kibi-500 transition-all duration-500 ease-out"
                        style={{width: `${processingProgress}%`}}
                      ></div>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      {processingProgress < 100 ? 'Processing...' : 'Finalizing...'}
                    </p>
                  </div>
                ) : selectedFile && processingError ? (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-red-600/30 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto">
                      <X className="h-8 w-8 text-red-400" />
                    </div>
                    <p className="text-white text-lg font-bold">{selectedFile.name}</p>
                    <p className="text-red-400 my-4">{processingError}</p>
                    <div className="flex justify-center gap-4 mt-6">
                      <button 
                        className="px-4 py-2 bg-dark-300 hover:bg-dark-200 text-white rounded-lg transition-colors"
                        onClick={tryAnotherFile}
                      >
                        Try Different File
                      </button>
                      <button 
                        className="px-4 py-2 bg-kibi-500 hover:bg-kibi-600 text-white rounded-lg transition-colors"
                        onClick={retryProcessFile}
                      >
                        Retry
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm mt-6">
                      Try using a simpler PDF or try a different format like TXT
                    </p>
                  </div>
                ) : selectedFile && usedFallback ? (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-amber-600/30 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto">
                      <AlertTriangle className="h-8 w-8 text-amber-400" />
                    </div>
                    <p className="text-white text-lg font-bold">{selectedFile.name}</p>
                    <p className="text-amber-400 my-3">Using simplified text extraction</p>
                    <p className="text-gray-300 mb-4">Full PDF features unavailable. Text extraction might be limited.</p>
                    <div className="flex justify-center gap-4 mt-6">
                      <button 
                        className="px-4 py-2 bg-dark-300 hover:bg-dark-200 text-white rounded-lg transition-colors"
                        onClick={tryAnotherFile}
                      >
                        Try Different File
                      </button>
                      <button 
                        className="px-4 py-2 bg-kibi-500 hover:bg-kibi-600 text-white rounded-lg transition-colors"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Continue Anyway
                      </button>
                    </div>
                  </div>
                ) : selectedFile ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-kibi-600/70 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-white text-lg font-bold">{selectedFile.name}</p>
                    <p className="text-gray-300 mb-4">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    <button 
                      className="px-6 py-2 bg-kibi-500 hover:bg-kibi-600 text-white rounded-xl transition-colors"
                      onClick={() => processFile(selectedFile)}
                    >
                      Process Document
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="relative">
                      <div className="w-24 h-24 bg-kibi-600/30 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 mx-auto">
                        <FileUp className="h-12 w-12 text-white" />
                        {isDragging && <div className="absolute inset-0 bg-kibi-500/20 rounded-full animate-ping"></div>}
                      </div>
                    </div>
                    <h3 className="text-white text-2xl font-bold mb-2">Drop your file here</h3>
                    <p className="text-gray-300 mb-8">Supported formats: PDF, DOCX, or TXT</p>
                    <button 
                      onClick={triggerFileInput} 
                      className="px-6 py-3 bg-kibi-500 hover:bg-kibi-600 text-white text-lg rounded-xl shadow-lg transition-colors"
                    >
                      Browse Files
                    </button>
                    <p className="text-xs text-gray-500 mt-4">Recommend text-based PDFs for best extraction results</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

FileUploadZone.displayName = 'FileUploadZone';

export default FileUploadZone;
