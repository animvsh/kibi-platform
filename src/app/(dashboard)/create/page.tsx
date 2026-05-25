"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, FileText, Link as LinkIcon, Video, Upload, X } from "lucide-react";
import Link from "next/link";
import { GenerationProgressDisplay, type GenerationProgress } from "@/components/course/generation-progress";

const sourceTypes = [
  { id: "prompt", label: "Text Prompt", icon: Sparkles, description: "Describe what you want to learn" },
  { id: "file", label: "Upload File", icon: FileText, description: "PDF, DOCX, PPTX, TXT, Markdown" },
  { id: "url", label: "Website URL", icon: LinkIcon, description: "Documentation, articles, pages" },
  { id: "youtube", label: "YouTube Video", icon: Video, description: "Video URL with transcript" },
];

interface CreatedUnit {
  id: string;
  title: string;
}

interface CreatedLesson {
  id: string;
  title: string;
  unitId: string;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [sourceType, setSourceType] = useState("prompt");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [createdUnits, setCreatedUnits] = useState<CreatedUnit[]>([]);
  const [createdLessons, setCreatedLessons] = useState<CreatedLesson[]>([]);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setError("File size exceeds 50MB limit");
        return;
      }
      setSelectedFile(file);
      setError(null);
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
        setError("File size exceeds 50MB limit");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationProgress(null);

    try {
      // Handle YouTube URL
      if (sourceType === "youtube") {
        if (!youtubeUrl.trim()) {
          throw new Error("YouTube URL is required");
        }

        const response = await fetch("/api/courses/generate/youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ youtubeUrl }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to generate course");
        }

        const data = await response.json();
        setTimeout(() => {
          router.push(`/courses/${data.course.id}`);
        }, 1500);
        return;
      }

      // Handle file upload
      if (sourceType === "file") {
        if (!selectedFile) {
          throw new Error("Please select a file to upload");
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch("/api/courses/generate/file", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to generate course");
        }

        const data = await response.json();
        setTimeout(() => {
          router.push(`/courses/${data.course.id}`);
        }, 1500);
        return;
      }

      // Handle text prompt (original flow)
      if (!prompt.trim()) {
        throw new Error("Prompt is required");
      }

      const response = await fetch("/api/courses/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, sourceType }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to start generation");
      }

      // Set up SSE reader for streaming progress
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const readStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                setIsGenerating(false);
                break;
              }

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  try {
                    const data = JSON.parse(line.slice(6));

                    // Handle entity creation events for live updates
                    if (data.type === "course_created") {
                      setCourseId(data.data.courseId);
                    }

                    if (data.type === "unit_created") {
                      setCreatedUnits(prev => [...prev, data.data.unit]);
                    }

                    if (data.type === "lesson_created") {
                      setCreatedLessons(prev => [...prev, {
                        id: data.data.lesson.id,
                        title: data.data.lesson.title,
                        unitId: data.data.unitId,
                      }]);
                    }

                    if (data.type === "completed") {
                      // Generation complete, redirect to course
                      setTimeout(() => {
                        router.push(`/courses/${data.data.courseId}`);
                      }, 1500);
                      return;
                    }

                    if (data.type === "error") {
                      setError(data.data.message);
                      setIsGenerating(false);
                      return;
                    }

                    // Progress update
                    if (data.status) {
                      setGenerationProgress(data);
                    }
                  } catch {
                    // Ignore parse errors for incomplete JSON
                  }
                }
              }
            }
          } catch (streamError) {
            console.error("Stream read error:", streamError);
            setIsGenerating(false);
          }
        };

        readStream();
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate course");
      setIsGenerating(false);
    }
  }, [prompt, sourceType, youtubeUrl, selectedFile, router]);

  const handleCancel = useCallback(() => {
    eventSourceRef.current?.close();
    setIsGenerating(false);
    setGenerationProgress(null);
    setCreatedUnits([]);
    setCreatedLessons([]);
    setCourseId(null);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create New Course</h1>
        <p className="text-muted-foreground mt-1">
          Describe what you want to learn and our AI will create a personalized course for you
        </p>
      </div>

      {/* Source Type Selection */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {sourceTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all ${
              sourceType === type.id
                ? "border-blue-500 ring-2 ring-blue-500"
                : "hover:border-blue-300"
            }`}
            onClick={() => !isGenerating && setSourceType(type.id)}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  sourceType === type.id ? "bg-blue-100" : "bg-slate-100"
                }`}>
                  <type.icon className={`h-5 w-5 ${
                    sourceType === type.id ? "text-blue-600" : "text-slate-500"
                  }`} />
                </div>
                <p className="font-medium">{type.label}</p>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Source-specific Input */}
      <Card>
        <CardHeader>
          <CardTitle>
            {sourceType === "prompt" && "What do you want to learn?"}
            {sourceType === "youtube" && "YouTube Video URL"}
            {sourceType === "file" && "Upload Your File"}
            {sourceType === "url" && "Website URL"}
          </CardTitle>
          <CardDescription>
            {sourceType === "prompt" && "Be specific for better results. Include your skill level and timeframe if relevant."}
            {sourceType === "youtube" && "Paste a YouTube video URL to generate a course from its transcript"}
            {sourceType === "file" && "Upload a PDF, DOCX, PPTX, TXT, Markdown, or CSV file (max 50MB)"}
            {sourceType === "url" && "Enter a website URL to extract content for your course"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prompt Input */}
          {sourceType === "prompt" && (
            <div className="space-y-2">
              <Input
                placeholder="Teach me React in 14 days..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-12 text-lg"
                disabled={isGenerating}
              />
            </div>
          )}

          {/* YouTube URL Input */}
          {sourceType === "youtube" && (
            <div className="space-y-2">
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="h-12 text-lg"
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground">
                Supported: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
              </p>
            </div>
          )}

          {/* File Upload */}
          {sourceType === "file" && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.docx,.pptx,.txt,.md,.markdown,.csv"
                className="hidden"
              />

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
                    disabled={isGenerating}
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
                  className={`w-full p-8 border-2 border-dashed rounded-lg transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-muted-foreground/25 hover:border-blue-400 hover:bg-blue-50/50"
                  }`}
                  disabled={isGenerating}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className={`h-8 w-8 ${isDragging ? "text-blue-500" : "text-muted-foreground"}`} />
                    <p className={`text-sm ${isDragging ? "text-blue-600" : "text-muted-foreground"}`}>
                      {isDragging ? "Drop file here" : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOCX, PPTX, TXT, MD, CSV (max 50MB)
                    </p>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* URL Input (for url source type) */}
          {sourceType === "url" && (
            <div className="space-y-2">
              <Input
                placeholder="https://example.com/article"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-12 text-lg"
                disabled={isGenerating}
              />
            </div>
          )}

          {/* Example prompts - only show for prompt source type */}
          {sourceType === "prompt" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Example prompts:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Explain quantum computing basics",
                  "Learn Spanish for beginners",
                  "Master machine learning fundamentals",
                  "Understand blockchain technology",
                ].map((example) => (
                  <Badge
                    key={example}
                    variant="secondary"
                    className="cursor-pointer hover:bg-slate-200"
                    onClick={() => !isGenerating && setPrompt(example)}
                  >
                    {example}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Generation Progress */}
          {isGenerating && (
            <GenerationProgressDisplay
              progress={generationProgress}
              isActive={isGenerating}
              entities={{
                courseId: courseId || undefined,
                units: createdUnits,
                lessons: createdLessons,
              }}
            />
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleGenerate}
              disabled={
                (sourceType === "prompt" && !prompt.trim()) ||
                (sourceType === "youtube" && !youtubeUrl.trim()) ||
                (sourceType === "file" && !selectedFile) ||
                (sourceType === "url" && !prompt.trim()) ||
                isGenerating
              }
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Course
                </>
              )}
            </Button>

            {isGenerating && (
              <Button
                size="lg"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-slate-50 border-dashed">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Tips for better courses:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>Be specific about your current skill level (beginner, intermediate, advanced)</li>
            <li>Mention your learning goal or timeframe (e.g., &quot;in 2 weeks&quot;, &quot;for a job interview&quot;)</li>
            <li>Include preferred learning style if you have one (visual, hands-on, theoretical)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
