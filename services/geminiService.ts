import { GoogleGenAI, Type } from "@google/genai";
import type { Course } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const courseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The main title of the course." },
    description: { type: Type.STRING, description: "A brief, one-paragraph description of the course." },
    modules: {
      type: Type.ARRAY,
      description: "An array of modules for the course.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The title of the module." },
          lessons: {
            type: Type.ARRAY,
            description: "An array of lessons within the module.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "The title of the lesson." },
                content: { type: Type.STRING, description: "Concise and easy-to-understand content for the lesson, explaining key concepts simply for a beginner. Avoid jargon." },
                activity: { type: Type.STRING, description: "A practical activity or exercise for the user to complete." },
                codeExample: { type: Type.STRING, description: "A brief, simple, and relevant code example to illustrate the lesson's concept. Should be null if not applicable." }
              },
              required: ["title", "content", "activity"]
            }
          }
        },
        required: ["title", "lessons"]
      }
    }
  },
  required: ["title", "description", "modules"]
};

export const generateCourse = async (topic: string): Promise<Course> => {
  try {
    const prompt = `Create a comprehensive yet easy-to-understand course about "${topic}". The language should be simple and aimed at beginners. The course should be structured with multiple modules, and each module should contain several lessons. For each lesson, provide concise content, a practical activity, and a simple, relevant code example where applicable (e.g., for technical topics). The output must be a valid JSON object matching the provided schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: courseSchema,
      },
    });
    
    const jsonText = response.text.trim();
    const courseData = JSON.parse(jsonText);

    return courseData as Course;
  } catch (error) {
    console.error("Error generating course:", error);
    throw new Error("Failed to generate course. The topic may be too broad or the AI service is currently unavailable. Please try again with a more specific topic.");
  }
};

export const generatePracticeCode = async (topic: string, difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<string> => {
  try {
    const prompt = `Generate a ${difficulty} level, simple and practical code example for a beginner learning about "${topic}". The code should be well-commented to explain each part. Choose a suitable programming language for the topic (e.g., Python for Data Science, JavaScript for Web Development). Return only the raw code with comments, without any surrounding text or markdown code block syntax.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error generating practice code:", error);
    throw new Error("Failed to generate practice code. The AI service might be busy. Please try again later.");
  }
};

const microLessonSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A concise, one-paragraph summary of the entire course." },
        diagram: { type: Type.STRING, description: "A text-based (ASCII) diagram showing the relationship between course modules." }
    },
    required: ["summary", "diagram"]
};

export const generateMicroLessonSummary = async (course: Course): Promise<{ summary: string; diagram: string; }> => {
    try {
        const prompt = `Given the following course structure, create a crisp summary and a simple text-based (ASCII) diagram representing the flow of the course modules. The summary should be a short paragraph. The diagram should visually connect the module titles in a logical flow.
        Course Title: ${course.title}
        Modules: ${course.modules.map(m => m.title).join(', ')}
        Return a valid JSON object with two keys: "summary" and "diagram".`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: microLessonSchema,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating micro-lesson summary:", error);
        throw new Error("Failed to generate micro-lesson summary. Please try again later.");
    }
};