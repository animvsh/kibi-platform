"use client";

import { useState, useEffect, useCallback } from "react";
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
  Eye,
  Lightbulb,
  FileText,
  Clock,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  EyeOff,
} from "lucide-react";

interface CaseStudyQuestion {
  id: string;
  question: string;
  hints: string[];
  maxPoints: number;
}

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  scenario: string;
  background: string;
  questions: CaseStudyQuestion[];
  modelAnswer?: {
    [questionId: string]: string;
  };
  reflectionPrompts: string[];
  estimatedMinutes: number;
}

interface Answer {
  questionId: string;
  answer: string;
}

export default function CaseStudyPage() {
  const params = useParams();
  const courseId = params.id as string;
  const caseStudyId = params.caseStudyId as string;

  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [hintsRevealed, setHintsRevealed] = useState<Set<string>>(new Set());

  const userId = "user-123"; // Mock user ID

  const fetchCaseStudy = useCallback(async () => {
    try {
      setIsLoading(true);
      // Mock data - in production, fetch from API
      const mockCaseStudy: CaseStudy = {
        id: caseStudyId,
        title: "The E-Commerce Dilemma",
        description: "Analyze a business scenario and provide strategic recommendations",
        scenario: `TechMart, a mid-sized electronics retailer, has been experiencing declining sales over the past two years. Their traditional brick-and-mortar stores are struggling as competitors move online, but their own e-commerce platform has seen minimal growth.

The company's leadership team is divided on the best path forward:
- The CTO believes they need a complete platform overhaul
- The CFO argues for cost-cutting and focusing on physical stores
- The CMO wants to invest heavily in digital marketing

As an external consultant, you've been brought in to analyze the situation and provide recommendations.`,
        background: `TechMart Stats:
- Founded: 1995
- Physical Stores: 150
- Online Revenue: 12% of total
- Customer Average Age: 45
- Annual Revenue: $500M
- Market Share: Declining (was 8%, now 5%)

Industry Trends:
- E-commerce growing 15% annually
- Customer expectations for digital experience increasing
- Competitors offering same-day delivery
- Mobile commerce now 60% of online traffic`,
        questions: [
          {
            id: "q1",
            question: "What are the root causes of TechMart's declining sales?",
            hints: [
              "Consider both internal and external factors",
              "Think about changing consumer behaviors",
              "Look at the competitive landscape",
            ],
            maxPoints: 25,
          },
          {
            id: "q2",
            question: "Evaluate each leadership proposal. Which approach do you recommend and why?",
            hints: [
              "Consider resource requirements",
              "Think about timeline to impact",
              "Evaluate risks of each option",
            ],
            maxPoints: 35,
          },
          {
            id: "q3",
            question: "Develop a 12-month action plan with specific milestones and KPIs",
            hints: [
              "Be realistic about resources",
              "Include both short-term wins and long-term strategy",
              "Define clear success metrics",
            ],
            maxPoints: 40,
          },
        ],
        modelAnswer: {
          q1: `Root causes of TechMart's decline:

1. Digital Transformation Gap
- Slow to adapt to e-commerce trends
- Outdated online platform with poor UX
- Limited mobile commerce capabilities

2. Customer Demographics Mismatch
- Customer base skewing older
- Younger demographics prefer online shopping
- Physical store experience not differentiated

3. Competitive Pressure
- Amazon and Best Buy dominating online
- Regional players taking market share
- Price competition from pure-play online retailers

4. Operational Challenges
- Inventory management not optimized for omnichannel
- Supply chain not designed for rapid fulfillment
- Staff training inadequate for digital products`,

          q2: `Analysis of leadership proposals:

CTO's Platform Overhaul:
- Pros: Long-term solution, improved customer experience
- Cons: High cost ($20M+), 18-24 month timeline
- Risk: High investment with uncertain ROI

CFO's Cost-Cutting Approach:
- Pros: Quick cost savings, preserves cash
- Cons: Doesn't address root cause, may accelerate decline
- Risk: Short-term thinking, morale impact

CMO's Digital Marketing Focus:
- Pros: Can drive immediate traffic, brand building
- Cons: Wasted if website experience is poor
- Risk: Marketing spend without conversion optimization

Recommended: Hybrid approach combining elements of all three:
- Phase 1: Quick wins from marketing + targeted platform fixes
- Phase 2: Gradual platform improvement
- Phase 3: Full transformation based on Phase 1-2 learnings`,

          q3: `12-Month Action Plan:

Q1 (Foundation):
- Launch customer feedback program
- Implement basic website UX improvements
- Begin mobile app development
- KPI: 10% improvement in website conversion

Q2 (Marketing & Acquisition):
- Launch targeted digital marketing campaign
- Implement loyalty program
- Partner with same-day delivery service
- KPI: 20% increase in online traffic

Q3 (Platform & Operations):
- Launch mobile app beta
- Implement inventory management system
- Begin omnichannel fulfillment pilot
- KPI: 15% of online orders via mobile

Q4 (Scale & Optimize):
- Full mobile app launch
- Expand omnichannel to all stores
- Analyze and optimize based on data
- KPI: Online revenue reaches 20% of total`,
        },
        reflectionPrompts: [
          "What assumptions did you make in your analysis?",
          "How would your recommendations change if TechMart had more/less capital?",
          "What would you do differently if you were the CEO?",
        ],
        estimatedMinutes: 60,
      };

      setCaseStudy(mockCaseStudy);
    } catch (error) {
      console.error("Error fetching case study:", error);
    } finally {
      setIsLoading(false);
    }
  }, [caseStudyId]);

  useEffect(() => {
    fetchCaseStudy();
  }, [fetchCaseStudy]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, answer);
    setAnswers(newAnswers);
  };

  const handleRevealHint = (questionId: string) => {
    const newHints = new Set(hintsRevealed);
    newHints.add(questionId);
    setHintsRevealed(newHints);
  };

  const handleSubmit = async () => {
    if (!caseStudy) return;

    // Check all questions answered
    const unanswered = caseStudy.questions.filter((q) => !answers.get(q.id));
    if (unanswered.length > 0) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // In production, save answers and show scoring
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Case study not found</p>
        <Link href={`/courses/${courseId}`}>
          <Button className="mt-4">Back to Course</Button>
        </Link>
      </div>
    );
  }

  const currentQuestion = caseStudy.questions[currentQuestionIndex];
  const answeredCount = answers.size;
  const totalQuestions = caseStudy.questions.length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

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
            <h1 className="text-3xl font-bold tracking-tight">{caseStudy.title}</h1>
            <p className="text-muted-foreground mt-1">{caseStudy.description}</p>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Clock className="h-4 w-4 mr-1" />
            {caseStudy.estimatedMinutes} min
          </Badge>
        </div>
      </div>

      {/* Scenario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Scenario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {caseStudy.scenario}
          </div>
        </CardContent>
      </Card>

      {/* Background */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Background Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {caseStudy.background}
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Questions
          </CardTitle>
          <CardDescription>
            Progress: {answeredCount} of {totalQuestions} answered
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={progressPercent} />

          {/* Question Navigation */}
          <div className="flex gap-2 flex-wrap">
            {caseStudy.questions.map((q, index) => (
              <Button
                key={q.id}
                variant={index === currentQuestionIndex ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentQuestionIndex(index)}
                className="relative"
              >
                Question {index + 1}
                {answers.get(q.id) && (
                  <CheckCircle2 className="h-4 w-4 ml-1 text-green-500" />
                )}
              </Button>
            ))}
          </div>

          {/* Current Question */}
          {currentQuestion && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">
                  {currentQuestionIndex + 1}. {currentQuestion.question}
                </h4>
                <Badge variant="secondary">
                  {currentQuestion.maxPoints} points
                </Badge>
              </div>

              {/* Hints */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Hints
                  </span>
                  {hintsRevealed.has(currentQuestion.id) ? (
                    <Badge variant="outline" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      Revealed
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRevealHint(currentQuestion.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Reveal Hints
                    </Button>
                  )}
                </div>

                {hintsRevealed.has(currentQuestion.id) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
                    {currentQuestion.hints.map((hint, i) => (
                      <p key={i} className="text-sm text-amber-800 flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {hint}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Answer */}
              <Textarea
                placeholder="Enter your answer..."
                value={answers.get(currentQuestion.id) || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                rows={6}
              />

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentQuestionIndex(Math.min(totalQuestions - 1, currentQuestionIndex + 1))
                  }
                  disabled={currentQuestionIndex === totalQuestions - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit or Model Answer */}
      {showModelAnswer ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EyeOff className="h-5 w-5" />
              Model Answer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {caseStudy.questions.map((q, index) => (
              <div key={q.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                <h4 className="font-semibold mb-2">
                  {index + 1}. {q.question}
                </h4>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {caseStudy.modelAnswer?.[q.id]}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Once you submit, you can compare your answers with the model answer
              and reflect on your analysis approach.
            </p>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={answeredCount < totalQuestions || isSubmitting}
                size="lg"
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowModelAnswer(true)}
                size="lg"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Model Answer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reflection */}
      {showModelAnswer && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Reflection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium mb-3">
              Consider the following questions:
            </p>
            <ul className="space-y-2">
              {caseStudy.reflectionPrompts.map((prompt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-green-600 font-medium">{i + 1}.</span>
                  <span className="text-green-800">{prompt}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}