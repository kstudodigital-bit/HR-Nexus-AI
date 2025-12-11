import { GoogleGenAI, Type, Schema } from "@google/genai";
import { 
  JobDescriptionRequest, 
  JobDescriptionResponse, 
  ResumeAnalysisRequest, 
  ResumeAnalysisResponse,
  InterviewPrepRequest,
  InterviewScriptResponse
} from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

// --- Schemas ---

const jobDescriptionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "O título final da vaga otimizado." },
    summary: { type: Type.STRING, description: "Um resumo atraente da vaga." },
    responsibilities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de responsabilidades." },
    requirements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de requisitos técnicos e soft skills." },
    benefits: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de benefícios e diferenciais da empresa." },
  },
  required: ["title", "summary", "responsibilities", "requirements", "benefits"],
};

const resumeAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    matchScore: { type: Type.INTEGER, description: "Pontuação de 0 a 100 indicando a adequação." },
    summary: { type: Type.STRING, description: "Resumo executivo da análise." },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Pontos fortes do candidato." },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Pontos fracos ou lacunas." },
    missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Palavras-chave importantes da vaga ausentes no currículo." },
    recommendation: { type: Type.STRING, enum: ['Rejeitar', 'Considerar', 'Forte Candidato', 'Contratar'] },
  },
  required: ["matchScore", "summary", "strengths", "weaknesses", "missingKeywords", "recommendation"],
};

const interviewScriptSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    introduction: { type: Type.STRING, description: "Texto de introdução para o entrevistador usar." },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['Técnica', 'Comportamental', 'Situacional'] },
          expectedAnswerKeyPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Pontos chave que o candidato deve mencionar." }
        },
        required: ["question", "type", "expectedAnswerKeyPoints"]
      }
    },
    conclusion: { type: Type.STRING, description: "Texto de encerramento da entrevista." }
  },
  required: ["introduction", "questions", "conclusion"],
};

// --- API Calls ---

export const generateJobDescription = async (data: JobDescriptionRequest): Promise<JobDescriptionResponse> => {
  const prompt = `
    Atue como um recrutador especialista. Crie uma descrição de vaga para a posição de "${data.title}" no departamento de "${data.department}".
    
    Os requisitos principais são:
    ${data.requirements}
    
    O tom da descrição deve ser: ${data.tone}.
    
    Certifique-se de que a descrição seja inclusiva, profissional e atraente.
    Responda APENAS com o JSON estruturado solicitado.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: jobDescriptionSchema,
      temperature: 0.7,
    },
  });

  if (!response.text) throw new Error("No content generated");
  return JSON.parse(response.text) as JobDescriptionResponse;
};

export const analyzeResume = async (data: ResumeAnalysisRequest): Promise<ResumeAnalysisResponse> => {
  const prompt = `
    Você é um sistema de ATS (Applicant Tracking System) avançado.
    
    DESCRIÇÃO DA VAGA:
    ${data.jobDescription}
    
    CONTEÚDO DO CURRÍCULO:
    ${data.resumeText}
    
    Analise o currículo em relação à vaga. Seja crítico e objetivo.
    Responda APENAS com o JSON estruturado solicitado.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: resumeAnalysisSchema,
      temperature: 0.2, // Low temperature for consistent analysis
    },
  });

  if (!response.text) throw new Error("No content generated");
  return JSON.parse(response.text) as ResumeAnalysisResponse;
};

export const generateInterviewScript = async (data: InterviewPrepRequest): Promise<InterviewScriptResponse> => {
  const prompt = `
    Crie um roteiro de entrevista estruturado para uma posição de nível ${data.level} para o cargo de ${data.role}.
    O foco técnico/específico da entrevista deve ser: ${data.focus}.
    
    Gere perguntas desafiadoras e relevantes para o nível de senioridade. Inclua perguntas técnicas profundas e comportamentais.
    Responda APENAS com o JSON estruturado solicitado.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: interviewScriptSchema,
      temperature: 0.6,
    },
  });

  if (!response.text) throw new Error("No content generated");
  return JSON.parse(response.text) as InterviewScriptResponse;
};
