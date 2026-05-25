/**
 * File Processor
 * Handles extraction of content from various file formats:
 * PDF, DOCX, PPTX, TXT, Markdown, CSV
 */

import type { CourseDifficulty } from "@/types";

export interface ProcessedContent {
  title: string;
  content: string;
  type: "pdf" | "docx" | "pptx" | "txt" | "markdown" | "csv";
  metadata: Record<string, unknown>;
  lessons: ProcessedLesson[];
  flashcards: ProcessedFlashcard[];
}

export interface ProcessedLesson {
  title: string;
  content: string;
  keyTakeaways: string[];
}

export interface ProcessedFlashcard {
  front: string;
  back: string;
  conceptName: string;
}

/**
 * Extract content from PDF file (basic implementation)
 * In production, use pdf-parse or similar library
 */
export async function extractFromPdf(buffer: Buffer): Promise<ProcessedContent> {
  // Basic PDF text extraction - in production use pdf-parse library
  const text = buffer.toString("utf-8");

  // Extract title from first line or metadata
  const lines = text.split("\n").filter((l) => l.trim());
  const title = lines[0]?.slice(0, 100) || "Untitled PDF";

  // Clean and segment content
  const content = text
    .replace(/[^\x20-\x7E\n]/g, " ") // Remove non-printable
    .replace(/\s+/g, " ")
    .trim();

  // Split into lessons by sections (approximately)
  const lessons = segmentContent(content, title);

  return {
    title,
    content,
    type: "pdf",
    metadata: {
      pageCount: text.split("\f").length,
      charCount: content.length,
    },
    lessons,
    flashcards: generateFlashcardsFromContent(content, title),
  };
}

/**
 * Extract content from DOCX file
 * In production, use mammoth.js or docx library
 */
export async function extractFromDocx(buffer: Buffer): Promise<ProcessedContent> {
  // Basic DOCX extraction - in production use mammoth
  const text = buffer.toString("utf-8");

  // Extract title
  const titleMatch = text.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/);
  const title = titleMatch?.[1] || "Untitled Document";

  // Extract text content between XML tags
  const content = text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const lessons = segmentContent(content, title);

  return {
    title,
    content,
    type: "docx",
    metadata: {
      charCount: content.length,
    },
    lessons,
    flashcards: generateFlashcardsFromContent(content, title),
  };
}

/**
 * Extract content from PPTX file
 * In production, use jszip to extract slide content
 */
export async function extractFromPptx(buffer: Buffer): Promise<ProcessedContent> {
  // Basic PPTX extraction - in production use proper parsing
  const text = buffer.toString("utf-8");

  // Extract title from first slide
  const titleMatch = text.match(/<a:t>([^<]+)<\/a:t>/);
  const title = titleMatch?.[1] || "Untitled Presentation";

  // Extract slide content
  const slideContents = text.match(/<a:t>([^<]+)<\/a:t>/g) || [];
  const content = slideContents
    .map((s) => s.replace(/<[^>]+>/g, ""))
    .join("\n")
    .trim();

  // Create one lesson per slide
  const slideTexts = slideContents.map((s) => s.replace(/<[^>]+>/g, ""));
  const lessons = slideTexts.map((slideText, i) => ({
    title: `Slide ${i + 1}`,
    content: slideText,
    keyTakeaways: extractKeyTakeaways(slideText),
  }));

  return {
    title,
    content,
    type: "pptx",
    metadata: {
      slideCount: slideTexts.length,
    },
    lessons: lessons.length > 0 ? lessons : [{ title: "Overview", content, keyTakeaways: [] }],
    flashcards: generateFlashcardsFromContent(content, title),
  };
}

/**
 * Process TXT file
 */
export async function extractFromTxt(buffer: Buffer): Promise<ProcessedContent> {
  const content = buffer.toString("utf-8");

  const lines = content.split("\n").filter((l) => l.trim());
  const title = lines[0]?.slice(0, 100) || "Untitled";

  const lessons = segmentContent(content, title);

  return {
    title,
    content,
    type: "txt",
    metadata: {
      charCount: content.length,
      lineCount: lines.length,
    },
    lessons,
    flashcards: generateFlashcardsFromContent(content, title),
  };
}

/**
 * Process Markdown file
 */
export async function extractFromMarkdown(buffer: Buffer): Promise<ProcessedContent> {
  const content = buffer.toString("utf-8");

  // Extract title from first # heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1] || "Untitled";

  // Remove markdown formatting for plain text
  const plainContent = content
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1");

  const lessons = segmentMarkdownContent(content, title);

  return {
    title,
    content: plainContent,
    type: "markdown",
    metadata: {
      charCount: plainContent.length,
    },
    lessons,
    flashcards: generateFlashcardsFromContent(plainContent, title),
  };
}

/**
 * Process CSV file - generates flashcards from structured data
 */
export async function extractFromCsv(buffer: Buffer): Promise<ProcessedContent> {
  const content = buffer.toString("utf-8");
  const lines = content.split("\n").filter((l) => l.trim());

  if (lines.length < 2) {
    return {
      title: "CSV Data",
      content,
      type: "csv",
      metadata: { rowCount: 0 },
      lessons: [],
      flashcards: [],
    };
  }

  // Parse CSV headers
  const headers = parseCSVLine(lines[0]);
  const title = headers[0] || "CSV Data";

  // Generate flashcards from CSV rows
  const flashcards: ProcessedFlashcard[] = [];
  const firstCol = headers[0];
  const secondCol = headers[1];

  for (let i = 1; i < Math.min(lines.length, 20); i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length >= 2 && values[0] && values[1]) {
      flashcards.push({
        front: `What is ${values[0]}?`,
        back: values[1],
        conceptName: firstCol || "Data",
      });
    }
  }

  return {
    title,
    content,
    type: "csv",
    metadata: {
      headers,
      rowCount: lines.length - 1,
    },
    lessons: [],
    flashcards,
  };
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

/**
 * Segment large content into lessons
 */
function segmentContent(content: string, title: string): ProcessedLesson[] {
  const maxChunkSize = 2000;
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];

  const lessons: ProcessedLesson[] = [];
  let currentChunk = "";
  let lessonIndex = 1;

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      lessons.push({
        title: `${title} - Part ${lessonIndex}`,
        content: currentChunk.trim(),
        keyTakeaways: extractKeyTakeaways(currentChunk),
      });
      currentChunk = sentence;
      lessonIndex++;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.length > 0) {
    lessons.push({
      title: `${title} - Part ${lessonIndex}`,
      content: currentChunk.trim(),
      keyTakeaways: extractKeyTakeaways(currentChunk),
    });
  }

  return lessons.length > 0 ? lessons : [{ title, content, keyTakeaways: [] }];
}

/**
 * Segment markdown content preserving structure
 */
function segmentMarkdownContent(content: string, title: string): ProcessedLesson[] {
  // Split by ## headings to create lessons
  const sections = content.split(/^##\s+/m).filter((s) => s.trim());

  if (sections.length <= 1) {
    return segmentContent(content, title);
  }

  return sections.map((section, i) => {
    const lines = section.split("\n");
    const sectionTitle = lines[0]?.trim() || `${title} - Section ${i + 1}`;
    const sectionContent = lines.slice(1).join("\n").trim();

    return {
      title: sectionTitle,
      content: sectionContent,
      keyTakeaways: extractKeyTakeaways(sectionContent),
    };
  });
}

/**
 * Extract key takeaways from content
 */
function extractKeyTakeaways(content: string): string[] {
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  // Return first 3 significant sentences
  return sentences.slice(0, 3).map((s) => s.trim());
}

/**
 * Generate basic flashcards from content
 */
function generateFlashcardsFromContent(content: string, title: string): ProcessedFlashcard[] {
  // Extract key terms and definitions (simple heuristic)
  const flashcards: ProcessedFlashcard[] = [];

  // Look for term: definition patterns
  const termPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*[:\-]\s*([^.!?]+[.!?])/g;
  let match;

  while ((match = termPattern.exec(content)) !== null && flashcards.length < 10) {
    flashcards.push({
      front: `What is ${match[1]}?`,
      back: match[2].trim(),
      conceptName: title,
    });
  }

  return flashcards;
}

/**
 * Process file based on type
 */
export async function processFile(
  buffer: Buffer,
  mimeType: string
): Promise<ProcessedContent> {
  switch (mimeType) {
    case "application/pdf":
      return extractFromPdf(buffer);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return extractFromDocx(buffer);
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return extractFromPptx(buffer);
    case "text/plain":
      return extractFromTxt(buffer);
    case "text/markdown":
      return extractFromMarkdown(buffer);
    case "text/csv":
      return extractFromCsv(buffer);
    default:
      // Try plain text as fallback
      return extractFromTxt(buffer);
  }
}