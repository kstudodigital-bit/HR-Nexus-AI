export enum AppView {
  JOB_GENERATOR = 'JOB_GENERATOR',
  RESUME_ANALYZER = 'RESUME_ANALYZER',
  INTERVIEW_PREP = 'INTERVIEW_PREP',
}

export interface JobDescriptionRequest {
  title: string;
  department: string;
  requirements: string;
  tone: 'Formal' | 'Casual' | 'Inspirador';
}

export interface JobDescriptionResponse {
  title: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

export interface ResumeAnalysisRequest {
  jobDescription: string;
  resumeText: string;
}

export interface ResumeAnalysisResponse {
  matchScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  recommendation: 'Rejeitar' | 'Considerar' | 'Forte Candidato' | 'Contratar';
}

export interface InterviewPrepRequest {
  role: string;
  level: 'Júnior' | 'Pleno' | 'Sênior' | 'Especialista' | 'Gestão';
  focus: string;
}

export interface InterviewQuestion {
  question: string;
  type: 'Técnica' | 'Comportamental' | 'Situacional';
  expectedAnswerKeyPoints: string[];
}

export interface InterviewScriptResponse {
  introduction: string;
  questions: InterviewQuestion[];
  conclusion: string;
}
