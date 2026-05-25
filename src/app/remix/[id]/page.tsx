"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
  Clock,
  Target,
  BarChart3,
  Zap,
} from "lucide-react";

interface RemixCourse {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  estimatedDurationMinutes: number;
  thumbnailUrl?: string;
}

interface RemixPersonalization {
  level: string;
  goal: string;
  timeAvailable: string;
  difficulty: string;
  quizFrequency: string;
}

const personalizationSteps = [
  {
    id: "level",
    title: "What's your experience level?",
    description: "This helps us adjust the complexity of the content",
    icon: Target,
    options: [
      { value: "beginner", label: "Beginner", description: "New to the topic" },
      {
        value: "intermediate",
        label: "Intermediate",
        description: "Some familiarity with basics",
      },
      {
        value: "advanced",
        label: "Advanced",
        description: "Strong foundation, want to deepen knowledge",
      },
      {
        value: "expert",
        label: "Expert",
        description: "Comprehensive mastery of the topic",
      },
    ],
  },
  {
    id: "goal",
    title: "What's your learning goal?",
    description: "We can tailor the content to your specific goals",
    icon: Zap,
    options: [
      { value: "career", label: "Career Growth", description: "Get promoted or switch jobs" },
      { value: "hobby", label: "Personal Interest", description: "Just for fun and curiosity" },
      { value: "academic", label: "Academic Study", description: "For school or research" },
      { value: "certification", label: "Certification", description: "Prepare for an exam" },
    ],
  },
  {
    id: "timeAvailable",
    title: "How much time can you dedicate?",
    description: "We'll optimize the course length based on your availability",
    icon: Clock,
    options: [
      { value: "15min", label: "15 minutes", description: "Quick daily sessions" },
      { value: "30min", label: "30 minutes", description: "Standard daily practice" },
      { value: "1hr", label: "1 hour", description: "Extended learning sessions" },
      { value: "2hr+", label: "2+ hours", description: "Intensive learning days" },
    ],
  },
  {
    id: "difficulty",
    title: "Would you prefer easier or harder content?",
    description: "Adjust the challenge level to match your preference",
    icon: BarChart3,
    options: [
      { value: "easier", label: "Easier", description: "More explanations and examples" },
      { value: "same", label: "Same Level", description: "Match the original course" },
      { value: "harder", label: "Harder", description: "More advanced material" },
    ],
  },
  {
    id: "quizFrequency",
    title: "How often would you like quizzes?",
    description: "Balance theory and practice to your preference",
    icon: Sparkles,
    options: [
      { value: "more", label: "More Quizzes", description: "Frequent knowledge checks" },
      { value: "same", label: "Balanced", description: "Mix of lessons and quizzes" },
      { value: "less", label: "Fewer Quizzes", description: "Focus on concepts" },
    ],
  },
];

export default function RemixCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<RemixCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<RemixPersonalization>({
    level: "",
    goal: "",
    timeAvailable: "",
    difficulty: "",
    quizFrequency: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch course info
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // In production, fetch from API
        // For now, use mock data
        setCourse({
          id: courseId,
          title: "React Fundamentals",
          description: "Master the fundamentals of React including components, state, props, and hooks.",
          difficulty: "beginner",
          estimatedDurationMinutes: 180,
          thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
        });
      } catch (err) {
        setError("Failed to load course");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const currentStepData = personalizationSteps[currentStep];
  const isCurrentStepAnswered = answers[currentStepData.id as keyof RemixPersonalization] !== "";
  const canGoNext = isCurrentStepAnswered;
  const canSubmit = Object.values(answers).every((v) => v !== "");

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentStepData.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < personalizationSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/courses/${courseId}/remix`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(answers),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to remix course");
      }

      const data = await response.json();

      // Redirect to the new course
      router.push(data.data.remixUrl || `/courses/${data.data.courseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remix course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / personalizationSteps.length) * 100;
  const Icon = currentStepData.icon;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Course not found</p>
            <Link href="/explore">
              <Button variant="outline">Browse Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center">
          <Link href={`/course/${courseId}`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Course</span>
          </Link>
        </div>
      </header>

      <div className="container px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Course Info */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {course.thumbnailUrl && (
                  <div className="h-16 w-24 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Remixing course
                  </p>
                  <h2 className="text-xl font-semibold">{course.title}</h2>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {personalizationSteps.length}
              </p>
              <p className="text-sm font-medium">
                {Math.round(progress)}% complete
              </p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{currentStepData.title}</CardTitle>
              </div>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[currentStepData.id as keyof RemixPersonalization]}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {currentStepData.options.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                      answers[currentStepData.id as keyof RemixPersonalization] ===
                      option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleAnswer(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex-1">
                      <Label
                        htmlFor={option.value}
                        className="font-medium cursor-pointer"
                      >
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    {answers[currentStepData.id as keyof RemixPersonalization] ===
                      option.value && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < personalizationSteps.length - 1 ? (
              <Button onClick={handleNext} disabled={!canGoNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Remix...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Remix
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Error */}
          {error && (
            <Card className="mt-6 border-destructive">
              <CardContent className="pt-6">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
