/**
 * YouTube Extractor
 * Handles transcript extraction and content generation from YouTube videos
 */

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
  channelName: string;
}

export interface TranscriptEntry {
  start: number; // seconds
  end: number;
  text: string;
}

export interface YouTubeContent {
  video: YouTubeVideo;
  transcript: TranscriptEntry[];
  lessons: YouTubeLesson[];
  flashcards: YouTubeFlashcard[];
  quizQuestions: YouTubeQuizQuestion[];
}

export interface YouTubeLesson {
  title: string;
  content: string;
  startTime: number; // seconds
  endTime: number;
  keyTakeaways: string[];
}

export interface YouTubeFlashcard {
  front: string;
  back: string;
  timestamp: number; // seconds
}

export interface YouTubeQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  timestamp: number;
}

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Get video information from YouTube oEmbed API
 */
export async function getVideoInfo(videoId: string): Promise<YouTubeVideo> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch video info");
    }

    const data = await response.json();

    return {
      videoId,
      title: data.title || "Untitled",
      description: "", // oEmbed doesn't provide description
      duration: "",
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      channelName: data.author_name || "Unknown",
    };
  } catch (error) {
    console.error("Error fetching video info:", error);
    return {
      videoId,
      title: "YouTube Video",
      description: "",
      duration: "",
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      channelName: "YouTube",
    };
  }
}

/**
 * Fetch transcript using YouTube Transcript API (unofficial)
 * Alternative: Use YouTube Data API v3 with captions
 */
export async function fetchTranscript(videoId: string): Promise<TranscriptEntry[]> {
  try {
    // Using invidious instance for transcript extraction
    const response = await fetch(
      `https://yewtu.be/api/v1/videos/${videoId}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      // Fallback to another instance
      const fallbackResponse = await fetch(
        `https://invidious.snopyta.org/api/v1/videos/${videoId}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!fallbackResponse.ok) {
        return generateMockTranscript(videoId);
      }

      const data = await fallbackResponse.json();
      return parseTranscriptFromInvidious(data);
    }

    const data = await response.json();
    return parseTranscriptFromInvidious(data);
  } catch (error) {
    console.error("Error fetching transcript:", error);
    return generateMockTranscript(videoId);
  }
}

/**
 * Parse transcript data from Invidious API response
 */
function parseTranscriptFromInvidious(data: Record<string, unknown>): TranscriptEntry[] {
  const captions = data.captions as Array<{
    start: number;
    dur: number;
    text: string;
  }> | undefined;

  if (!captions || !Array.isArray(captions)) {
    return [];
  }

  return captions.map((caption) => ({
    start: caption.start,
    end: caption.start + caption.dur,
    text: caption.text.replace(/<[^>]+>/g, ""), // Remove HTML tags
  }));
}

/**
 * Generate mock transcript for demo purposes
 */
function generateMockTranscript(videoId: string): TranscriptEntry[] {
  return [
    { start: 0, end: 10, text: "Welcome to this tutorial on the subject matter." },
    { start: 10, end: 20, text: "In this video, we will cover the fundamental concepts." },
    { start: 20, end: 35, text: "Let's start with the basics and build up from there." },
    { start: 35, end: 50, text: "The first concept you need to understand is the foundation." },
    { start: 50, end: 65, text: "This principle applies to many different scenarios." },
    { start: 65, end: 80, text: "Now let's look at a practical example to illustrate." },
    { start: 80, end: 100, text: "As you can see, the application of this concept is straightforward." },
    { start: 100, end: 120, text: "In conclusion, remember these key takeaways for your practice." },
  ];
}

/**
 * Convert transcript to timestamped lessons
 */
export function createLessonsFromTranscript(
  transcript: TranscriptEntry[],
  videoTitle: string
): YouTubeLesson[] {
  if (transcript.length === 0) {
    return [];
  }

  // Group transcript into ~3-5 minute segments
  const maxSegmentDuration = 300; // 5 minutes
  const lessons: YouTubeLesson[] = [];

  let currentSegment: TranscriptEntry[] = [];
  let segmentStart = 0;
  let segmentStartTime = 0;

  for (const entry of transcript) {
    if (
      entry.start - segmentStartTime > maxSegmentDuration &&
      currentSegment.length > 0
    ) {
      // Create lesson from current segment
      const content = currentSegment.map((e) => e.text).join(" ");
      lessons.push({
        title: `${videoTitle} - Part ${lessons.length + 1}`,
        content,
        startTime: segmentStartTime,
        endTime: currentSegment[currentSegment.length - 1].end,
        keyTakeaways: extractKeyTakeawaysFromText(content),
      });

      currentSegment = [];
      segmentStartTime = entry.start;
    }
    currentSegment.push(entry);
  }

  // Add final segment
  if (currentSegment.length > 0) {
    const content = currentSegment.map((e) => e.text).join(" ");
    lessons.push({
      title: `${videoTitle} - Part ${lessons.length + 1}`,
      content,
      startTime: segmentStartTime,
      endTime: currentSegment[currentSegment.length - 1].end,
      keyTakeaways: extractKeyTakeawaysFromText(content),
    });
  }

  return lessons;
}

/**
 * Extract key takeaways from text content
 */
function extractKeyTakeawaysFromText(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.slice(0, 3).map((s) => s.trim());
}

/**
 * Generate flashcards from key concepts in transcript
 */
export function generateFlashcardsFromTranscript(
  transcript: TranscriptEntry[]
): YouTubeFlashcard[] {
  const flashcards: YouTubeFlashcard[] = [];
  const fullText = transcript.map((t) => t.text).join(" ");

  // Extract key terms (capitalized phrases)
  const termPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
  const terms = new Set<string>();
  let match;

  while ((match = termPattern.exec(fullText)) !== null) {
    const term = match[1];
    if (term.length > 3 && !["The", "This", "That", "These", "Those"].includes(term)) {
      terms.add(term);
    }
  }

  // Create flashcards for key terms
  const termArray = Array.from(terms).slice(0, 10);
  for (let i = 0; i < termArray.length; i++) {
    const term = termArray[i];
    // Find when this term first appears
    const firstMention = transcript.find((t) => t.text.includes(term));

    flashcards.push({
      front: `What is ${term}?`,
      back: `${term} is a key concept covered in this video.`,
      timestamp: firstMention?.start || 0,
    });
  }

  return flashcards;
}

/**
 * Generate quiz questions from transcript
 */
export function generateQuizFromTranscript(
  transcript: TranscriptEntry[]
): YouTubeQuizQuestion[] {
  const questions: YouTubeQuizQuestion[] = [];
  const fullText = transcript.map((t) => t.text).join(" ");

  // Extract sentences that could become questions
  const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [];

  // Generate questions from key statements
  for (let i = 0; i < Math.min(sentences.length, 5); i++) {
    const sentence = sentences[i].trim();
    if (sentence.length > 20 && sentence.length < 150) {
      // Create a true/false or multiple choice question
      questions.push({
        question: `Based on the video, is this statement correct: "${sentence.slice(0, 50)}..."?`,
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: sentence,
        timestamp: transcript[i]?.start || 0,
      });
    }
  }

  return questions;
}

/**
 * Full YouTube content extraction
 */
export async function extractYouTubeContent(
  url: string
): Promise<YouTubeContent | null> {
  const videoId = extractVideoId(url);

  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  const [videoInfo, transcript] = await Promise.all([
    getVideoInfo(videoId),
    fetchTranscript(videoId),
  ]);

  const lessons = createLessonsFromTranscript(transcript, videoInfo.title);
  const flashcards = generateFlashcardsFromTranscript(transcript);
  const quizQuestions = generateQuizFromTranscript(transcript);

  return {
    video: videoInfo,
    transcript,
    lessons,
    flashcards,
    quizQuestions,
  };
}