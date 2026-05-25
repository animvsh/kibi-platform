import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainHeader from '@/components/MainHeader';
import Footer from '@/components/Footer';
import CourseModule from '@/components/CourseModule';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, PlusCircle, BookOpen, Code, Video, PenTool, FileText, MessageSquare, HelpCircle, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { PopoverClose } from '@radix-ui/react-popover';
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { useCourseSave } from '@/hooks/useCourseSave';
import { generateModuleContent } from '@/services/api';
import AnimatedBackground from '@/components/animated-background';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Build = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [modules, setModules] = useState([
    {
      title: "Introduction to Programming",
      description: "Learn the basics of programming concepts.",
      content: {
        conceptContent: "This module covers the fundamental concepts of programming, including variables, data types, and control structures.",
        codeContent: {
          explanation: "Write a simple program to print 'Hello, World!'",
          snippet: "console.log('Hello, World!');",
          language: "javascript"
        },
        videoIds: ["dQw4w9WgXcQ", "jNQXAC9IVRw"]
      }
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [showSupport, setShowSupport] = useState(false);
  const { isSaving, saveComplete, saveCourse } = useCourseSave();
  const [isLoading, setIsLoading] = useState(false);
  const [conceptContent, setConceptContent] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [videoIds, setVideoIds] = useState('');
  const [quizQuestions, setQuizQuestions] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (saveComplete) {
      navigate('/my-courses');
    }
  }, [saveComplete, navigate]);

  const addModule = () => {
    setModules([...modules, { title: '', description: '', content: { conceptContent: '', codeContent: { explanation: '', snippet: '', language: '' }, videoIds: [] } }]);
  };

  const updateModule = (index: number, field: string, value: string) => {
    const newModules = [...modules];
    newModules[index][field] = value;
    setModules(newModules);
  };

  const updateModuleContent = (index: number, contentType: string, value: string) => {
    const newModules = [...modules];
    newModules[index].content[contentType] = value;
    setModules(newModules);
  };

  const updateCodeContent = (index: number, field: string, value: string) => {
    const newModules = [...modules];
    newModules[index].content.codeContent[field] = value;
    setModules(newModules);
  };

  const handleSaveCourse = () => {
    saveCourse(modules, inputText);
  };

  const handleOpenSupport = () => {
    setShowSupport(true);
  };

  const handleCloseSupport = () => {
    setShowSupport(false);
  };

  const handleGenerateContent = async () => {
    setIsLoading(true);
    try {
      const generatedContent = await generateModuleContent({
        title: "Sample Module Title",
        units: [{
          title: "Sample Module Title", 
          subunits: ["topic1", "topic2"]
        }]
      });

      setConceptContent(generatedContent.conceptContent);
      setCodeContent(JSON.stringify(generatedContent.codeContent));
      setVideoIds(generatedContent.videoIds.join(', '));
      setQuizQuestions(JSON.stringify(generatedContent.quizQuestions));

      toast({
        title: "Content Generated!",
        description: "AI has generated content for this module.",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem generating content. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-500 text-white">
      <AnimatedBackground variant="shapes" intensity="medium" />

      <MainHeader />

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Course Builder</h1>
            <p className="text-gray-400">Create and customize your course content</p>
          </div>

          <Button onClick={handleOpenSupport} variant="secondary">
            <HelpCircle className="w-4 h-4 mr-2" />
            Support
          </Button>
        </div>

        <Card className="bg-dark-400 border-2 border-dark-300 mb-6">
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>Enter the basic details for your course</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Course Title</Label>
              <Input
                id="name"
                placeholder="Title of your course"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {modules.map((module, index) => (
          <CourseModule
            key={index}
            index={index}
            title={module.title}
            description={module.description}
            conceptContent={module.content?.conceptContent}
            codeContent={module.content?.codeContent}
            videoIds={module.content?.videoIds}
            isLoading={isLoading}
          />
        ))}

        <Button onClick={addModule} className="mb-6 bg-kibi-500 hover:bg-kibi-600">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Module
        </Button>

        <Button onClick={handleSaveCourse} disabled={isSaving} className="bg-kibi-500 hover:bg-kibi-600">
          {isSaving ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 4V2m0 16v2M4 12H2m16 0h2M6.343 6.343l-1.414-1.414M19.071 4.929l1.414-1.414M4.929 19.071l-1.414 1.414M19.071 19.071l1.414 1.414" opacity=".5" /><path fill="currentColor" d="M21.485 12A9.485 9.485 0 0 0 12 2.515M12 21.485A9.485 9.485 0 0 0 2.515 12" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Course
            </>
          )}
        </Button>
      </main>

      <Footer />
      <SupportModal isOpen={showSupport} onClose={handleCloseSupport} />
    </div>
  );
};

const SupportModal = ({ isOpen, onClose }: SupportModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-dark-400 border-2 border-dark-300">
        <DialogHeader>
          <DialogTitle>Support</DialogTitle>
          <DialogDescription>
            How can we help?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="John Doe" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Email
            </Label>
            <Input id="username" value="john.doe@example.com" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="textarea" className="text-right">
              Message
            </Label>
            <Textarea id="textarea" className="col-span-3" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Build;
