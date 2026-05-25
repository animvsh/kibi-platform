"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Brain,
  Target,
  TrendingUp,
  BookOpen,
  Clock,
  Zap,
  ChevronRight,
  Info,
} from "lucide-react";

export interface KnowledgeMapConcept {
  id: string;
  name: string;
  description: string;
  masteryScore: number;
  masteryStatus: "not_learned" | "familiar" | "developing" | "proficient" | "strong" | "mastered";
  prerequisites: string[];
  dependents: string[];
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  isCore: boolean;
  lastPracticedAt?: string;
  learningSpeed?: number;
}

export interface KnowledgeMapData {
  courseId: string;
  concepts: KnowledgeMapConcept[];
  generatedAt: string;
}

// Mastery colors based on status
const MASTERY_COLORS = {
  not_learned: { bg: "bg-gray-200", text: "text-gray-600", border: "border-gray-300", fill: "#e5e7eb" },
  familiar: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", fill: "#dbeafe" },
  developing: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300", fill: "#fef9c3" },
  proficient: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", fill: "#dcfce7" },
  strong: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", fill: "#d1fae5" },
  mastered: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300", fill: "#f3e8ff" },
};

// Get mastery color
function getMasteryColor(status: KnowledgeMapConcept["masteryStatus"]) {
  return MASTERY_COLORS[status] || MASTERY_COLORS.not_learned;
}

// Get mastery label
function getMasteryLabel(status: KnowledgeMapConcept["masteryStatus"]): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface KnowledgeMapProps {
  data: KnowledgeMapData;
  onConceptClick?: (concept: KnowledgeMapConcept) => void;
}

export function KnowledgeMap({ data, onConceptClick }: KnowledgeMapProps) {
  const [selectedConcept, setSelectedConcept] = useState<KnowledgeMapConcept | null>(null);
  const [hoveredConcept, setHoveredConcept] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");

  // Calculate layout positions for nodes
  const layout = useMemo(() => {
    const concepts = data.concepts;
    const nodeCount = concepts.length;

    if (nodeCount === 0) return { nodes: [], edges: [] };

    // Simple grid-based layout with some randomness for visual interest
    const cols = Math.ceil(Math.sqrt(nodeCount));
    const nodePositions: Record<string, { x: number; y: number }> = {};

    concepts.forEach((concept, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      // Add some variation
      const offsetX = (Math.random() - 0.5) * 40;
      const offsetY = (Math.random() - 0.5) * 40;

      nodePositions[concept.id] = {
        x: 100 + col * 180 + offsetX,
        y: 100 + row * 140 + offsetY,
      };
    });

    // Create edges from prerequisites
    const edges: { source: string; target: string }[] = [];
    concepts.forEach((concept) => {
      concept.prerequisites.forEach((prereqId) => {
        edges.push({ source: prereqId, target: concept.id });
      });
    });

    return {
      nodes: concepts.map((c) => ({
        ...c,
        x: nodePositions[c.id]?.x || 100,
        y: nodePositions[c.id]?.y || 100,
      })),
      edges,
    };
  }, [data.concepts]);

  const handleConceptClick = useCallback((concept: KnowledgeMapConcept) => {
    setSelectedConcept(concept);
    onConceptClick?.(concept);
  }, [onConceptClick]);

  // Stats for the map
  const stats = useMemo(() => {
    const concepts = data.concepts;
    const statusCounts = {
      not_learned: 0,
      familiar: 0,
      developing: 0,
      proficient: 0,
      strong: 0,
      mastered: 0,
    };

    let totalMastery = 0;
    let practicedCount = 0;

    concepts.forEach((c) => {
      statusCounts[c.masteryStatus]++;
      totalMastery += c.masteryScore;
      if (c.lastPracticedAt) practicedCount++;
    });

    return {
      totalConcepts: concepts.length,
      avgMastery: concepts.length > 0 ? Math.round(totalMastery / concepts.length) : 0,
      practicedToday: practicedCount,
      statusCounts,
    };
  }, [data.concepts]);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Concepts</p>
                <p className="text-2xl font-bold">{stats.totalConcepts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Mastery</p>
                <p className="text-2xl font-bold">{stats.avgMastery}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mastered</p>
                <p className="text-2xl font-bold">{stats.statusCounts.mastered}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Not Started</p>
                <p className="text-2xl font-bold">{stats.statusCounts.not_learned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mastery Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm text-muted-foreground">Mastery Legend:</span>
            {Object.entries(MASTERY_COLORS).map(([status, colors]) => (
              <div key={status} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full border ${colors.border} ${colors.bg}`}
                />
                <span className="text-xs">{getMasteryLabel(status as KnowledgeMapConcept["masteryStatus"])}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex justify-end">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "graph" | "list")}>
          <TabsList>
            <TabsTrigger value="graph">Graph View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Knowledge Map Graph */}
      {viewMode === "graph" ? (
        <Card>
          <CardContent className="pt-6">
            <TooltipProvider>
              <div className="relative w-full overflow-x-auto" style={{ minHeight: "400px" }}>
                <svg
                  className="w-full h-full min-h-[400px]"
                  viewBox="0 0 800 600"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Edges */}
                  {layout.edges.map((edge, i) => {
                    const sourceNode = layout.nodes.find((n) => n.id === edge.source);
                    const targetNode = layout.nodes.find((n) => n.id === edge.target);
                    if (!sourceNode || !targetNode) return null;

                    return (
                      <line
                        key={`edge-${i}`}
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={targetNode.x}
                        y2={targetNode.y}
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        opacity="0.6"
                      />
                    );
                  })}

                  {/* Nodes */}
                  {layout.nodes.map((node) => {
                    const color = getMasteryColor(node.masteryStatus);
                    const isHovered = hoveredConcept === node.id;
                    const radius = node.isCore ? 40 : 32;

                    return (
                      <g key={node.id}>
                        {/* Outer glow for core concepts */}
                        {node.isCore && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={radius + 8}
                            fill={color.fill}
                            opacity="0.3"
                          />
                        )}

                        {/* Main node */}
                        <Tooltip>
                          <TooltipTrigger>
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={radius}
                              fill={color.fill}
                              stroke={color.border}
                              strokeWidth="2"
                              className="cursor-pointer transition-all hover:scale-110"
                              onMouseEnter={() => setHoveredConcept(node.id)}
                              onMouseLeave={() => setHoveredConcept(null)}
                              onClick={() => handleConceptClick(node)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{node.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Mastery: {node.masteryScore}% ({getMasteryLabel(node.masteryStatus)})
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Node label */}
                        <text
                          x={node.x}
                          y={node.y + radius + 16}
                          textAnchor="middle"
                          className="text-xs fill-foreground"
                        >
                          {node.name.length > 15 ? node.name.slice(0, 15) + "..." : node.name}
                        </text>

                        {/* Core badge */}
                        {node.isCore && (
                          <circle
                            cx={node.x + radius - 8}
                            cy={node.y - radius + 8}
                            r="8"
                            fill="#f59e0b"
                          />
                        )}

                        {/* Mastery score indicator */}
                        <text
                          x={node.x}
                          y={node.y + 4}
                          textAnchor="middle"
                          className="text-sm font-bold fill-foreground"
                        >
                          {node.masteryScore}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>
      ) : (
        /* List View */
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {layout.nodes
                .sort((a, b) => b.masteryScore - a.masteryScore)
                .map((concept) => {
                  const color = getMasteryColor(concept.masteryStatus);
                  return (
                    <div
                      key={concept.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${color.border} ${color.bg} cursor-pointer hover:opacity-80 transition-opacity`}
                      onClick={() => handleConceptClick(concept)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{concept.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {concept.difficulty} {concept.isCore && "- Core"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={color.text}>
                          {getMasteryLabel(concept.masteryStatus)}
                        </Badge>
                        <div className="w-20">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>{concept.masteryScore}%</span>
                          </div>
                          <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${color.bg}`}
                              style={{ width: `${concept.masteryScore}%` }}
                            />
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Concept Detail Dialog */}
      <ConceptDetailDialog
        concept={selectedConcept}
        open={!!selectedConcept}
        onClose={() => setSelectedConcept(null)}
      />
    </div>
  );
}

// Concept Detail Dialog Component
interface ConceptDetailDialogProps {
  concept: KnowledgeMapConcept | null;
  open: boolean;
  onClose: () => void;
}

function ConceptDetailDialog({ concept, open, onClose }: ConceptDetailDialogProps) {
  if (!concept) return null;

  const color = getMasteryColor(concept.masteryStatus);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {concept.name}
            {concept.isCore && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                Core
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>{concept.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mastery Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Mastery Score</span>
              <span className="text-2xl font-bold">{concept.masteryScore}%</span>
            </div>
            <div className={`h-3 rounded-full ${color.bg} border ${color.border}`}>
              <div
                className="h-full bg-current rounded-full transition-all"
                style={{ width: `${concept.masteryScore}%` }}
              />
            </div>
            <Badge className={color.text}>{getMasteryLabel(concept.masteryStatus)}</Badge>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Difficulty</p>
              <p className="text-sm font-medium capitalize">{concept.difficulty}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Learning Speed</p>
              <p className="text-sm font-medium capitalize">
                {concept.learningSpeed ? `${concept.learningSpeed}/min` : "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Prerequisites</p>
              <p className="text-sm font-medium">{concept.prerequisites.length || "None"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Dependent Concepts</p>
              <p className="text-sm font-medium">{concept.dependents.length || "None"}</p>
            </div>
          </div>

          {/* Last Practiced */}
          {concept.lastPracticedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Last practiced: {new Date(concept.lastPracticedAt).toLocaleDateString()}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1 gap-2">
              <Zap className="w-4 h-4" />
              Practice Now
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <Info className="w-4 h-4" />
              Learn More
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Mock data generator for testing
export function generateMockKnowledgeMap(courseId: string): KnowledgeMapData {
  const concepts: KnowledgeMapConcept[] = [
    {
      id: "c1",
      name: "React Components",
      description: "Understanding how to build and compose React components",
      masteryScore: 85,
      masteryStatus: "strong",
      prerequisites: [],
      dependents: ["c2", "c3"],
      difficulty: "beginner",
      isCore: true,
      lastPracticedAt: new Date().toISOString(),
      learningSpeed: 1.2,
    },
    {
      id: "c2",
      name: "State Management",
      description: "Managing application state with useState and useReducer",
      masteryScore: 60,
      masteryStatus: "developing",
      prerequisites: ["c1"],
      dependents: ["c4"],
      difficulty: "intermediate",
      isCore: true,
      lastPracticedAt: new Date(Date.now() - 86400000).toISOString(),
      learningSpeed: 0.9,
    },
    {
      id: "c3",
      name: "Props and Data Flow",
      description: "Passing data between components via props",
      masteryScore: 90,
      masteryStatus: "mastered",
      prerequisites: ["c1"],
      dependents: ["c4"],
      difficulty: "beginner",
      isCore: true,
      learningSpeed: 1.5,
    },
    {
      id: "c4",
      name: "useEffect Hook",
      description: "Side effects and lifecycle in functional components",
      masteryScore: 35,
      masteryStatus: "familiar",
      prerequisites: ["c2", "c3"],
      dependents: [],
      difficulty: "intermediate",
      isCore: false,
      lastPracticedAt: new Date(Date.now() - 172800000).toISOString(),
      learningSpeed: 0.7,
    },
    {
      id: "c5",
      name: "Custom Hooks",
      description: "Creating reusable stateful logic with custom hooks",
      masteryScore: 15,
      masteryStatus: "not_learned",
      prerequisites: ["c4"],
      dependents: [],
      difficulty: "advanced",
      isCore: false,
    },
    {
      id: "c6",
      name: "Context API",
      description: "Global state management with React Context",
      masteryScore: 0,
      masteryStatus: "not_learned",
      prerequisites: ["c2"],
      dependents: [],
      difficulty: "intermediate",
      isCore: false,
    },
  ];

  return {
    courseId,
    concepts,
    generatedAt: new Date().toISOString(),
  };
}
