
import { GenerateOutlineResponse } from '@/types/course';

export const dsaDemoContent = [
  // Unit 1
  {
    unitTitle: "Unit 1: Introduction to Data Structures & Algorithms",
    subunits: [
      {
        title: "1.1 Overview of Data Structures",
        article: "What are Data Structures? A Complete Introduction",
        videoUrl: "https://www.youtube.com/watch?v=RBSGKlAvoiM",
        videoTimeRanges: [
          { start: 0, end: 1800, label: "Intro & motivation" },
          { start: 1800, end: 3000, label: "Data structure types" },
          { start: 3000, end: 4200, label: "Choosing the right structure" },
        ],
        summary: "Defines data structures, covers arrays, linked lists, trees, graphs; discusses trade-offs and real world use-cases.",
        quiz: {
          title: "Basic Concepts Quiz",
          questions: [
            "What is a data structure?",
            "List 3 common data structures and their use-cases.",
            "Why choose a linked list over an array?"
          ]
        }
      },
      {
        title: "1.2 Importance of Algorithms",
        article: "Why Algorithms Matter in Programming",
        videoUrl: "https://www.youtube.com/watch?v=F47DiTauNqY",
        summary: "Explains algorithmic thinking using sorting & search as examples; emphasizes maintainability and scaling.",
        quiz: {
          title: "Fundamentals of Algorithms Quiz",
          questions: [
            "Define 'algorithm' in your own words.",
            "Why are algorithms important for performance?",
            "Describe a real‑life process that's algorithmic."
          ]
        }
      },
      {
        title: "1.3 Time & Space Complexity (Big O)",
        article: "Understanding Big O Notation & Complexity Analysis",
        videoUrl: "https://www.youtube.com/watch?v=XMUe3zFhM5c",
        videoTimeRanges: [
          { start: 0, end: 180, label: "Big O basics" },
          { start: 180, end: 360, label: "Common time complexities" },
          { start: 360, end: 540, label: "Analyzing simple code examples" },
        ],
        summary: "Demystifies Big O with example-driven explanations: O(1), O(n), O(n²), and discusses best/average/worst-case.",
        quiz: {
          title: "Complexity Analysis Quiz",
          questions: [
            "What does O(n²) signify?",
            "Compare time vs space complexity.",
            "Classify the complexity of nested loops."
          ]
        }
      }
    ]
  },

  // Unit 2
  {
    unitTitle: "Unit 2: Basic Data Structures",
    subunits: [
      {
        title: "2.1 Arrays & Matrices",
        article: "Arrays and Matrices: Foundation of Data Storage",
        videoUrl: "https://www.youtube.com/watch?v=O9v10jQkm5c",
        summary: "Introduces array and matrix layouts; contrasts row-major vs column-major memory models; use-cases like image processing.",
        quiz: {
          title: "Array & Matrix Quiz",
          questions: [
            "How do you access matrix[2][3]?",
            "Explain row-major vs column-major layout.",
            "Give a case when you'd use matrices."
          ]
        }
      },
      {
        title: "2.2 Linked Lists",
        article: "Linked Lists: Dynamic Data Storage Explained",
        videoUrl: "https://www.youtube.com/watch?v=8hly31xKli0",
        summary: "Covers singly/doubly linked lists, insertion, deletion, and traversal; advantages vs arrays.",
        quiz: {
          title: "Linked List Quiz",
          questions: [
            "What is a singly vs doubly linked list?",
            "How to insert at the head?",
            "Why use a linked list instead of an array?"
          ]
        }
      },
      {
        title: "2.3 Stacks & Queues",
        article: "Stacks and Queues: LIFO and FIFO Data Structures",
        videoUrl: "https://www.youtube.com/watch?v=O9v10jQkm5c&t=540",
        summary: "Defines stack (LIFO) and queue (FIFO); covers push/pop, enqueue/dequeue operations; real-world examples like browser history and print queues.",
        quiz: {
          title: "Stack & Queue Quiz",
          questions: [
            "Define LIFO and FIFO.",
            "Describe pop vs enqueue operations.",
            "Give an application of stacks."
          ]
        }
      }
    ]
  },

  // Unit 3
  {
    unitTitle: "Unit 3: Advanced Data Structures",
    subunits: [
      {
        title: "3.1 Trees & Graphs",
        article: "Trees and Graphs: Hierarchical & Network Data Structures",
        videoUrl: "https://www.youtube.com/playlist?list=PLVlQHNRLflP_OxF1QJoGBwH_TnZszHR_j",
        summary: "Explains binary trees, BSTs, graph representations, DFS/BFS traversals, and typical applications.",
        quiz: {
          title: "Tree & Graph Quiz",
          questions: [
            "List tree traversal orders.",
            "What's the difference: directed vs undirected graph?",
            "How to detect a cycle?"
          ]
        }
      },
      {
        title: "3.2 Hash Tables",
        article: "Hash Tables: Fast Data Retrieval with Hashing",
        videoUrl: "https://www.youtube.com/watch?v=FsfRsGFHuv4",
        summary: "Introduces hash functions, buckets, collisions, chaining vs open addressing; includes linear probing and resizing strategies.",
        quiz: {
          title: "Hashing Quiz",
          questions: [
            "What is a hash function?",
            "Explain collision resolution methods.",
            "What's average-case lookup time?"
          ]
        }
      },
      {
        title: "3.3 Heaps & Priority Queues",
        article: "Heaps and Priority Queues: Efficient Priority Management",
        videoUrl: "https://www.youtube.com/watch?list=PLVlQHNRLflP_OxF1QJoGBwH_TnZszHR_j&index=20",
        summary: "Binary heap structure, inserting and removing min/max, plus heap sort overview and typical use in priority queues.",
        quiz: {
          title: "Heap Operations Quiz",
          questions: [
            "What defines a binary heap?",
            "How to insert into a min-heap?",
            "Describe heap‑sort at high-level."
          ]
        }
      }
    ]
  },

  // Unit 4
  {
    unitTitle: "Unit 4: Algorithm Design Techniques",
    subunits: [
      {
        title: "4.1 Divide & Conquer",
        article: "Divide & Conquer: Breaking Down Complex Problems",
        videoUrl: "https://www.youtube.com/watch?v=RBSGKlAvoiM&t=1800",
        summary: "Explains splitting problems (merge sort, quick sort); introduces recurrence relations and Master Theorem.",
        quiz: {
          title: "Divide & Conquer Quiz",
          questions: [
            "Define divide and conquer.",
            "Use merge sort as an example.",
            "What is a recurrence relation?"
          ]
        }
      },
      {
        title: "4.2 Dynamic Programming (DP)",
        article: "Dynamic Programming: Optimizing Recursive Solutions",
        videoUrl: "https://www.youtube.com/watch?v=Q_1M2JaijjQ",
        summary: "Discusses overlapping subproblems, memoization vs tabulation; classic examples like Fibonacci and knapsack.",
        quiz: {
          title: "DP Quiz",
          questions: [
            "What conditions make DP applicable?",
            "Define memoization.",
            "Contrast naive vs DP Fibonacci."
          ]
        }
      },
      {
        title: "4.3 Greedy Algorithms",
        article: "Greedy Algorithms: Locally Optimal Choices",
        videoUrl: "https://www.youtube.com/watch?v=x2CRZaN2xgM",
        summary: "Defines greedy strategies, example problems (coin change, interval scheduling); explains why greedy sometimes fails.",
        quiz: {
          title: "Greedy Algorithms Quiz",
          questions: [
            "What is a greedy algorithm?",
            "Give an example problem.",
            "Why might greedy be suboptimal?"
          ]
        }
      }
    ]
  }
];

export const getHardcodedDSACourse = (): GenerateOutlineResponse => {
  return {
    title: "Mastering Data Structures and Algorithms",
    units: dsaDemoContent.map((unit, unitIndex) => ({
      title: unit.unitTitle,
      subunits: unit.subunits.map(subunit => subunit.title)
    }))
  };
};

export const generateHardcodedDSAModuleContent = (unitIndex: number) => {
  const course = getHardcodedDSACourse();
  const unit = course.units[unitIndex];
  const demoUnit = dsaDemoContent[unitIndex];
  
  if (!unit || !demoUnit) {
    return {
      status: "complete",
      message: "All units processed successfully"
    };
  }

  const unitContent = {
    title: unit.title,
    introduction: `This unit covers key concepts in ${unit.title}.`,
    content: demoUnit.subunits.map((subunit, subunitIndex) => ({
      title: subunit.title,
      modules: [
        {
          id: `${unitIndex}-${subunitIndex}-0`,
          type: "article",
          title: subunit.article,
          description: `Learn about ${subunit.title} with comprehensive explanations and real-world examples.`,
          content: `
# ${subunit.title}

${subunit.summary}

## Key Learning Points

- Understanding the fundamental concepts
- Practical applications and use cases
- Best practices and implementation details
- Common pitfalls to avoid

## Deep Dive

${subunit.summary}

This comprehensive overview provides you with everything you need to understand ${subunit.title}. The concepts covered here form the foundation for more advanced topics in data structures and algorithms.

## Real-World Applications

These concepts are widely used in:
- Software engineering and system design
- Competitive programming and technical interviews
- Optimization problems in various domains
- Building efficient and scalable applications

## Summary

${subunit.summary}

This module provides a solid foundation for understanding ${subunit.title} and prepares you for more advanced topics.
          `,
          placeholder: false
        },
        {
          id: `${unitIndex}-${subunitIndex}-1`,
          type: "lecture",
          title: `${subunit.title} - Video Lecture`,
          description: `Watch a detailed video explanation of ${subunit.title} concepts with visual demonstrations.`,
          videoUrl: subunit.videoUrl,
          videoTimeRanges: subunit.videoTimeRanges,
          searchKeyword: subunit.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim(),
          placeholder: false
        },
        {
          id: `${unitIndex}-${subunitIndex}-2`,
          type: "quiz",
          title: subunit.quiz.title,
          description: `Test your understanding of ${subunit.title} with this comprehensive assessment.`,
          content_json: {
            questions: subunit.quiz.questions.map((question, qIndex) => ({
              id: `q${qIndex + 1}`,
              question: question,
              type: "multiple_choice",
              options: [
                "Option A - This is a sample answer",
                "Option B - This is another sample answer", 
                "Option C - This is the correct answer",
                "Option D - This is the final sample answer"
              ],
              correctAnswer: 2,
              explanation: `This question tests your understanding of ${subunit.title}. The correct answer demonstrates key concepts covered in this module.`
            }))
          },
          placeholder: false
        },
        {
          id: `${unitIndex}-${subunitIndex}-3`,
          type: "review",
          title: `${subunit.title} - Summary & Review`,
          description: `Review and consolidate your learning about ${subunit.title} with key takeaways and practical insights.`,
          content_json: {
            summary: subunit.summary,
            keyPoints: [
              "Core concepts and definitions",
              "Practical applications",
              "Implementation considerations",
              "Common use cases and examples"
            ],
            nextSteps: [
              "Practice with coding exercises",
              "Explore real-world applications",
              "Review related algorithms and data structures"
            ]
          },
          placeholder: false
        }
      ]
    }))
  };

  const calculatedProgress = Math.round(((unitIndex + 1) / course.units.length) * 100);

  return {
    status: "processing",
    unitIndex: unitIndex,
    totalUnits: course.units.length,
    currentUnit: unitContent,
    progress: calculatedProgress
  };
};
