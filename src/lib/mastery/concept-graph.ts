/**
 * Concept Graph System
 * Tracks concepts with prerequisites and relationships
 */

import type { Concept, LessonConcept } from "@/types";

export type ConceptRelationship = "prerequisite" | "related" | "core";

export interface ConceptNode {
  id: string;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  prerequisites: string[];
  dependents: string[]; // Concepts that depend on this one
  relatedConcepts: string[];
  isCore: boolean;
  createdAt: string;
}

export interface ConceptEdge {
  source: string;
  target: string;
  relationship: ConceptRelationship;
  weight: number; // 0-1, importance of the relationship
}

export interface KnowledgeMap {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  courseId: string;
  generatedAt: string;
}

// In-memory concept storage
const conceptNodesStore = new Map<string, ConceptNode>();
const lessonConceptsStore = new Map<string, LessonConcept[]>();

export const conceptGraph = {
  /**
   * Initialize a concept in the graph
   */
  async initializeConcept(concept: Concept): Promise<ConceptNode> {
    const node: ConceptNode = {
      id: concept.id,
      name: concept.name,
      description: concept.description,
      difficulty: concept.difficulty,
      prerequisites: concept.prerequisiteConcepts || [],
      dependents: [],
      relatedConcepts: [],
      isCore: false,
      createdAt: concept.createdAt,
    };

    // Update dependents of prerequisites
    for (const prereqId of concept.prerequisiteConcepts) {
      const prereq = conceptNodesStore.get(prereqId);
      if (prereq && !prereq.dependents.includes(concept.id)) {
        prereq.dependents.push(concept.id);
        conceptNodesStore.set(prereqId, prereq);
      }
    }

    conceptNodesStore.set(concept.id, node);
    return node;
  },

  /**
   * Add a lesson-concept relationship
   */
  async addLessonConcept(lessonId: string, conceptId: string, importance: "core" | "supporting" | "optional"): Promise<void> {
    const existing = lessonConceptsStore.get(lessonId) || [];
    const alreadyExists = existing.some(lc => lc.conceptId === conceptId);

    if (!alreadyExists) {
      existing.push({ lessonId, conceptId, importance });
      lessonConceptsStore.set(lessonId, existing);
    }

    // Mark concept as core if needed
    if (importance === "core") {
      const concept = conceptNodesStore.get(conceptId);
      if (concept) {
        concept.isCore = true;
        conceptNodesStore.set(conceptId, concept);
      }
    }
  },

  /**
   * Get all concepts for a course
   */
  async getCourseConcepts(_courseId: string): Promise<ConceptNode[]> {
    const concepts: ConceptNode[] = [];
    for (const node of conceptNodesStore.values()) {
      // We'd need courseId tracking - for now return all or filter by stored courseId
      concepts.push(node);
    }
    return concepts;
  },

  /**
   * Get concept by ID
   */
  async getConcept(conceptId: string): Promise<ConceptNode | null> {
    return conceptNodesStore.get(conceptId) || null;
  },

  /**
   * Get concepts for a lesson
   */
  async getLessonConcepts(lessonId: string): Promise<LessonConcept[]> {
    return lessonConceptsStore.get(lessonId) || [];
  },

  /**
   * Get prerequisite chain (all ancestors)
   */
  async getPrerequisiteChain(conceptId: string): Promise<ConceptNode[]> {
    const chain: ConceptNode[] = [];
    const visited = new Set<string>();

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const concept = conceptNodesStore.get(id);
      if (concept) {
        for (const prereqId of concept.prerequisites) {
          traverse(prereqId);
          const prereq = conceptNodesStore.get(prereqId);
          if (prereq && !chain.some(c => c.id === prereqId)) {
            chain.push(prereq);
          }
        }
      }
    };

    traverse(conceptId);
    return chain;
  },

  /**
   * Get dependent chain (all descendants)
   */
  async getDependentChain(conceptId: string): Promise<ConceptNode[]> {
    const chain: ConceptNode[] = [];
    const visited = new Set<string>();

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const concept = conceptNodesStore.get(id);
      if (concept) {
        for (const depId of concept.dependents) {
          const dep = conceptNodesStore.get(depId);
          if (dep && !chain.some(c => c.id === depId)) {
            chain.push(dep);
          }
          traverse(depId);
        }
      }
    };

    traverse(conceptId);
    return chain;
  },

  /**
   * Build knowledge map for a course
   */
  async buildKnowledgeMap(courseId: string): Promise<KnowledgeMap> {
    const concepts = await this.getCourseConcepts(courseId);
    const nodes: ConceptNode[] = [];
    const edges: ConceptEdge[] = [];

    for (const concept of concepts) {
      nodes.push(concept);

      // Add prerequisite edges
      for (const prereqId of concept.prerequisites) {
        edges.push({
          source: prereqId,
          target: concept.id,
          relationship: "prerequisite",
          weight: 0.8,
        });
      }

      // Add related concept edges
      for (const relatedId of concept.relatedConcepts) {
        edges.push({
          source: concept.id,
          target: relatedId,
          relationship: "related",
          weight: 0.4,
        });
      }

      // Add core concept edges
      if (concept.isCore) {
        for (const depId of concept.dependents) {
          edges.push({
            source: concept.id,
            target: depId,
            relationship: "core",
            weight: 1.0,
          });
        }
      }
    }

    return {
      nodes,
      edges,
      courseId,
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Check if concept A is a prerequisite of concept B
   */
  async isPrerequisite(potentialPrereqId: string, conceptId: string): Promise<boolean> {
    const chain = await this.getPrerequisiteChain(conceptId);
    return chain.some(c => c.id === potentialPrereqId);
  },

  /**
   * Get learning order (topologically sorted)
   */
  async getLearningOrder(courseId: string): Promise<ConceptNode[]> {
    const concepts = await this.getCourseConcepts(courseId);
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    // Initialize
    for (const concept of concepts) {
      inDegree.set(concept.id, concept.prerequisites.length);
      adjList.set(concept.id, []);
    }

    // Build adjacency list (prerequisite -> dependent)
    for (const concept of concepts) {
      for (const prereqId of concept.prerequisites) {
        const deps = adjList.get(prereqId) || [];
        deps.push(concept.id);
        adjList.set(prereqId, deps);
      }
    }

    // Kahn's algorithm
    const queue: string[] = [];
    for (const [id, degree] of inDegree) {
      if (degree === 0) queue.push(id);
    }

    const result: ConceptNode[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const node = conceptNodesStore.get(current);
      if (node) result.push(node);

      for (const depId of adjList.get(current) || []) {
        const newDegree = inDegree.get(depId)! - 1;
        inDegree.set(depId, newDegree);
        if (newDegree === 0) queue.push(depId);
      }
    }

    return result;
  },
};
