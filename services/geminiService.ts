import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Checkpoint, QuizQuestion, QuizResult, WebSource } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelFlash = 'gemini-2.5-flash';

/**
 * Generates a structured learning path based on a topic and optional notes.
 */
export const generateLearningPath = async (topic: string, userNotes: string): Promise<Checkpoint[]> => {
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        objective: { type: Type.STRING },
      },
      required: ["title", "objective"],
    },
  };

  const prompt = `
    ACT AS an expert curriculum designer for an Autonomous Learning Agent.
    
    GOAL: Create a structured learning path for the topic: "${topic}".
    CONTEXT: User provided notes: "${userNotes.slice(0, 500)}".
    
    INSTRUCTIONS:
    1. Break the topic down into 3 to 5 sequential learning checkpoints.
    2. Each checkpoint must be a self-contained module with a clear "objective".
    3. Order them logically from foundational concepts to advanced application.
    4. Ensure the titles are concise but descriptive.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are a rigid structuralist. You create linear, dependency-based learning graphs.",
      },
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, index: number) => ({
      id: index + 1,
      title: item.title,
      objective: item.objective,
      status: index === 0 ? 'current' : 'locked',
    }));
  } catch (error) {
    console.error("Error generating path:", error);
    throw new Error("Failed to generate learning path.");
  }
};

/**
 * Generates detailed learning content for a specific checkpoint using Web Search.
 */
export const generateContent = async (
  topic: string, 
  checkpoint: Checkpoint, 
  userNotes: string,
  isFeynmanMode: boolean
): Promise<{ text: string, sources: WebSource[] }> => {
  
  const modeInstruction = isFeynmanMode
    ? `
      *** ACTIVATING FEYNMAN PEDAGOGY MODULE ***
      CRITICAL: The user failed the previous assessment.
      1. EXPLAIN like I am 12 years old.
      2. Use concrete ANALOGIES for abstract concepts.
      3. Avoid jargon. If jargon is necessary, define it immediately with a simple comparison.
      4. Focus on "Intuition" first, "Definition" second.
      `
    : `
      *** STANDARD ACADEMIC MODULE ***
      1. Provide a comprehensive, structured explanation.
      2. Use bolding for key terms.
      3. Maintain a professional but encouraging tone.
      `;

  const prompt = `
    TOPIC: ${topic}
    CHECKPOINT: ${checkpoint.title}
    OBJECTIVE: ${checkpoint.objective}
    USER CONTEXT: ${userNotes.slice(0, 300)}

    ${modeInstruction}

    TASK:
    - Search the web for the most recent and relevant information to explain this concept.
    - Synthesize the search results and user notes into a clear Markdown explanation.
    - Structure with clear Headers.
    - OUTPUT FORMAT: Clean Markdown only. Do not use decorative " *** " separators or horizontal rules. Use standard Headers (#, ##) and bold (**text**) only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable Web Search
      }
    });

    // Extract grounding metadata (sources)
    const sources: WebSource[] = [];
    
    // Check for grounding chunks (Web)
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    return {
      text: response.text || "No content generated.",
      sources: sources
    };
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate content.");
  }
};

/**
 * Generates a quiz to verify understanding.
 */
export const generateQuiz = async (content: string): Promise<QuizQuestion[]> => {
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { 
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        correctOptionIndex: { type: Type.INTEGER },
      },
      required: ["question", "options", "correctOptionIndex"],
    },
  };

  const prompt = `
    ACT AS an Assessment Verification Module.
    
    CONTENT TO ASSESS:
    "${content.slice(0, 3000)}"
    
    TASK:
    Create 3 multiple-choice questions to strictly verify the learner's understanding of the key concepts in the content above.
    - Difficulty: Moderate.
    - Goal: Distinguish between superficial knowledge and deep understanding.
    - Format: 4 options per question.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((q: any, i: number) => ({
      id: i,
      question: q.question,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex
    }));
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz.");
  }
};

/**
 * Evaluates the quiz results.
 */
export const evaluateQuiz = async (
  questions: QuizQuestion[], 
  userAnswers: number[]
): Promise<QuizResult> => {
  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (q.correctOptionIndex === userAnswers[idx]) {
      correctCount++;
    }
  });

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= 70;

  // Generate a quick feedback message
  const feedbackPrompt = `
    SITUATION: The learner scored ${score}% on a checkpoint quiz.
    THRESHOLD: 70%.
    RESULT: ${passed ? "PASSED" : "FAILED"}.
    
    TASK:
    Provide a concise 1-sentence feedback message.
    If PASSED: Congratulate and mention readiness for the next step.
    If FAILED: Gently suggest using the Feynman Technique to simplify the concept.
  `;

  try {
     const response = await ai.models.generateContent({
      model: modelFlash,
      contents: feedbackPrompt,
    });
    
    return {
        score,
        passed,
        feedback: response.text || (passed ? "Ready to advance." : "Understanding not verified.")
    };
  } catch (e) {
    return {
        score,
        passed,
        feedback: passed ? "Excellent work." : "Let's try a simpler explanation."
    }
  }
};