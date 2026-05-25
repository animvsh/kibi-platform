"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Target,
  FileText,
  Upload,
  Clock,
  Brain,
  Check,
  ChevronRight,
  X,
} from "lucide-react";

interface ProjectStep {
  id: string;
  title: string;
  description: string;
  instructions: string;
  resources?: string[];
  isCompleted: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string;
  brief: string;
  goals: string[];
  deliverables: string[];
  rubric: {
    criteria: string;
    points: number;
  }[];
  steps: ProjectStep[];
  estimatedMinutes: number;
  retryCount: number;
  maxRetries: number;
}

interface Submission {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  submittedAt: string;
  feedback?: {
    score: number;
    strengths: string[];
    improvements: string[];
    overall: string;
  };
  isRetry: boolean;
}

export default function ProjectPage() {
  const params = useParams();
  const courseId = params.id as string;
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [retryMode, setRetryMode] = useState(false);

  const [answer, setAnswer] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userId = "user-123"; // Mock user ID

  const fetchProject = useCallback(async () => {
    try {
      setIsLoading(true);
      // Mock data - in production, fetch from API
      const mockProject: Project = {
        id: projectId,
        title: "Build a REST API",
        description: "Create a functional REST API with authentication",
        brief: `You need to build a REST API that allows users to:
- Register and authenticate
- Create, read, update, and delete resources
- Implement proper error handling and validation

This project tests your understanding of API design, authentication, and data management.`,
        goals: [
          "Implement user authentication with JWT tokens",
          "Create CRUD endpoints for resources",
          "Add request validation and error handling",
          "Write unit tests for core functionality",
        ],
        deliverables: [
          "Source code in a GitHub repository",
          "API documentation (README.md)",
          "Postman collection for testing",
          "Unit test coverage report",
        ],
        rubric: [
          { criteria: "Authentication", points: 25 },
          { criteria: "CRUD Operations", points: 25 },
          { criteria: "Error Handling", points: 20 },
          { criteria: "Code Quality", points: 15 },
          { criteria: "Testing", points: 15 },
        ],
        steps: [
          {
            id: "1",
            title: "Project Setup",
            description: "Initialize your project and install dependencies",
            instructions: "Create a new Node.js project and set up Express. Install necessary packages like cors, helmet, and dotenv.",
            isCompleted: false,
          },
          {
            id: "2",
            title: "Authentication",
            description: "Implement user registration and login",
            instructions: "Create endpoints for /register and /login. Use bcrypt for password hashing and JWT for tokens.",
            isCompleted: false,
          },
          {
            id: "3",
            title: "Resource CRUD",
            description: "Create the main resource endpoints",
            instructions: "Implement GET, POST, PUT, DELETE endpoints for your main resource. Add authentication middleware.",
            isCompleted: false,
          },
          {
            id: "4",
            title: "Error Handling",
            description: "Add validation and error handling",
            instructions: "Add input validation, proper HTTP status codes, and meaningful error messages.",
            isCompleted: false,
          },
        ],
        estimatedMinutes: 120,
        retryCount: 0,
        maxRetries: 3,
      };

      setProject(mockProject);
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const fetchSubmission = useCallback(async () => {
    try {
      // Mock submission
      const mockSubmission: Submission = {
        id: "sub-1",
        projectId,
        userId,
        content: "My project submission content...",
        submittedAt: new Date().toISOString(),
        feedback: {
          score: 78,
          strengths: [
            "Good authentication implementation",
            "Clean code structure",
            "Proper error responses",
          ],
          improvements: [
            "Add more validation on input fields",
            "Improve test coverage",
            "Add rate limiting",
          ],
          overall: "Good work! Your API is functional and well-structured. Focus on improving validation and test coverage.",
        },
        isRetry: false,
      };

      setSubmission(mockSubmission);
      if (mockSubmission.feedback) {
        setShowFeedback(true);
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
    }
  }, [projectId, userId]);

  useEffect(() => {
    fetchProject();
    fetchSubmission();
  }, [fetchProject, fetchSubmission]);

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newSubmission: Submission = {
        id: crypto.randomUUID(),
        projectId,
        userId,
        content: answer,
        submittedAt: new Date().toISOString(),
        feedback: {
          score: Math.floor(Math.random() * 30) + 70, // 70-100
          strengths: [
            "Demonstrates understanding of core concepts",
            "Good problem-solving approach",
            "Clear communication",
          ],
          improvements: [
            "Consider edge cases more carefully",
            "Add more detailed explanations",
          ],
          overall: "Great submission! You've demonstrated a solid understanding of the material.",
        },
        isRetry: retryMode,
      };

      setSubmission(newSubmission);
      setShowFeedback(true);
      setAnswer("");
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setRetryMode(true);
    setShowFeedback(false);
    setAnswer("");
  };

  const handleStepComplete = (stepIndex: number) => {
    if (!project) return;

    const updatedSteps = [...project.steps];
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], isCompleted: true };
    setProject({ ...project, steps: updatedSteps });

    if (stepIndex < updatedSteps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert("File size exceeds 50MB limit");
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert("File size exceeds 50MB limit");
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found</p>
        <Link href={`/courses/${courseId}`}>
          <Button className="mt-4">Back to Course</Button>
        </Link>
      </div>
    );
  }

  const completedSteps = project.steps.filter((s) => s.isCompleted).length;
  const progressPercent = (completedSteps / project.steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/courses/${courseId}`}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Course
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
            <p className="text-muted-foreground mt-1">{project.description}</p>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Clock className="h-4 w-4 mr-1" />
            {project.estimatedMinutes} min
          </Badge>
        </div>
      </div>

      {/* Project Brief */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Brief
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap">{project.brief}</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Goals
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {project.goals.map((goal, i) => (
                  <li key={i}>{goal}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Deliverables</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {project.deliverables.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Rubric</h4>
            <div className="space-y-2">
              {project.rubric.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{item.criteria}</span>
                  <Badge variant="secondary">{item.points} pts</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
          <CardDescription>
            Complete these steps to build your project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressPercent} className="mb-4" />

          {project.steps.map((step, index) => (
            <div
              key={step.id}
              className={`border rounded-lg p-4 transition-colors ${
                index === currentStep ? "border-primary bg-primary/5" : ""
              } ${step.isCompleted ? "bg-green-50 border-green-200" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.isCompleted
                      ? "bg-green-500 text-white"
                      : index === currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{step.title}</h4>
                    {index === currentStep && !step.isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStepComplete(index)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  {index === currentStep && !step.isCompleted && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm">{step.instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submission */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Submit Your Work
          </CardTitle>
          <CardDescription>
            {project.retryCount > 0 && (
              <span className="text-orange-600">
                Retry {project.retryCount} of {project.maxRetries}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showFeedback && submission?.feedback ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-primary">
                    {submission.feedback.score}
                    <span className="text-lg text-muted-foreground">/100</span>
                  </div>
                  <Badge
                    variant={
                      submission.feedback.score >= 80
                        ? "default"
                        : submission.feedback.score >= 60
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-lg px-3 py-1"
                  >
                    {submission.feedback.score >= 80
                      ? "Excellent"
                      : submission.feedback.score >= 60
                      ? "Good"
                      : "Needs Work"}
                  </Badge>
                </div>

                {project.retryCount < project.maxRetries && (
                  <Button onClick={handleRetry}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Strengths
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                    {submission.feedback.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Areas to Improve
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
                    {submission.feedback.improvements.map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Feedback
                </h4>
                <p className="text-sm text-blue-700">{submission.feedback.overall}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.docx,.txt,.zip"
                className="hidden"
              />

              {/* File Upload Area */}
              {selectedFile ? (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`w-full p-6 border-2 border-dashed rounded-lg transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-muted-foreground/25 hover:border-blue-400 hover:bg-blue-50/50"
                  }`}
                  disabled={isSubmitting}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className={`h-6 w-6 ${isDragging ? "text-blue-500" : "text-muted-foreground"}`} />
                    <p className={`text-sm ${isDragging ? "text-blue-600" : "text-muted-foreground"}`}>
                      {isDragging ? "Drop file here" : "Upload file (PDF, DOCX, TXT, ZIP)"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Optional - max 50MB
                    </p>
                  </div>
                </button>
              )}

              <Textarea
                placeholder="Describe your project approach, what you built, and any challenges you faced..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={8}
                disabled={isSubmitting}
              />

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                size="lg"
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Review
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}