import React, { useState, useRef } from 'react';
import { analyzeResume } from '../services/geminiService';
import { ResumeAnalysisResponse } from '../types';
import { FileSearch, Upload, AlertCircle, CheckCircle, XCircle, Loader2, FileText } from 'lucide-react';

const ResumeAnalyzer: React.FC = () => {
  const [jobDesc, setJobDesc] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [result, setResult] = useState<ResumeAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple text file reading. For PDF/Docx in a real app, we'd need a backend parser or heavy library.
    // Assuming for this demo user uploads .txt or copies content.
    if (file.type === "text/plain" || file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setResumeText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    } else {
      setError("Por favor, envie um arquivo .txt ou .md para esta demonstração, ou cole o texto diretamente.");
    }
  };

  const handleAnalyze = async () => {
    if (!jobDesc.trim() || !resumeText.trim()) {
      setError("Por favor, preencha a descrição da vaga e o conteúdo do currículo.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeResume({ jobDescription: jobDesc, resumeText });
      setResult(data);
    } catch (err) {
      setError("Erro ao analisar currículo. Verifique se o conteúdo é válido.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 ring-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 ring-yellow-200';
    return 'text-red-600 bg-red-50 ring-red-200';
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 h-full">
      {/* Left Column: Inputs */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Job Description Input */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            1. Descrição da Vaga
          </label>
          <textarea
            className="w-full h-40 p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            placeholder="Cole a descrição da vaga aqui..."
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
          />
        </div>

        {/* Resume Input */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-slate-800">
              2. Currículo do Candidato
            </label>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <Upload className="h-3 w-3" /> Carregar .txt
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".txt,.md"
              onChange={handleFileUpload}
            />
          </div>
          <textarea
            className="w-full h-40 p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-slate-600"
            placeholder="Cole o texto do currículo ou faça upload de um arquivo de texto..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <FileSearch className="h-5 w-5" />}
          {loading ? 'Analisando...' : 'Comparar e Analisar'}
        </button>
      </div>

      {/* Right Column: Results */}
      <div className="lg:col-span-7">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px] p-6 relative">
          {!result ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <FileSearch className="h-10 w-10 text-slate-300" />
              </div>
              <p className="text-center max-w-sm">
                Os insights da análise aparecerão aqui após comparar o currículo com a descrição da vaga.
              </p>
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
              
              {/* Header Score */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Resultado da Análise</h2>
                  <p className="text-slate-500 text-sm mt-1">Baseado na comparação semântica</p>
                </div>
                <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-full ring-4 ${getScoreColor(result.matchScore)} bg-opacity-10`}>
                  <span className="text-3xl font-bold">{result.matchScore}%</span>
                  <span className="text-[10px] font-bold uppercase mt-1">Match</span>
                </div>
              </div>

              {/* Recommendation */}
              <div className={`p-4 rounded-lg flex items-start gap-3 ${
                result.recommendation === 'Contratar' || result.recommendation === 'Forte Candidato' ? 'bg-green-50 text-green-900 border border-green-200' :
                result.recommendation === 'Considerar' ? 'bg-yellow-50 text-yellow-900 border border-yellow-200' :
                'bg-red-50 text-red-900 border border-red-200'
              }`}>
                {result.recommendation === 'Contratar' || result.recommendation === 'Forte Candidato' ? <CheckCircle className="h-5 w-5 mt-0.5" /> : 
                 result.recommendation === 'Considerar' ? <AlertCircle className="h-5 w-5 mt-0.5" /> : <XCircle className="h-5 w-5 mt-0.5" />}
                <div>
                  <h4 className="font-bold text-sm uppercase mb-1">Recomendação: {result.recommendation}</h4>
                  <p className="text-sm opacity-90">{result.summary}</p>
                </div>
              </div>

              {/* Grid Analysis */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-700 flex items-center gap-2 mb-3">
                    <CheckCircle className="h-4 w-4" /> Pontos Fortes
                  </h4>
                  <ul className="space-y-2">
                    {result.strengths.map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 bg-green-50/50 p-2 rounded border-l-2 border-green-500">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-red-700 flex items-center gap-2 mb-3">
                    <XCircle className="h-4 w-4" /> Pontos de Atenção
                  </h4>
                  <ul className="space-y-2">
                    {result.weaknesses.map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 bg-red-50/50 p-2 rounded border-l-2 border-red-500">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Missing Keywords */}
              {result.missingKeywords.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-800 mb-2 text-sm">Palavras-chave Ausentes</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((kw, i) => (
                      <span key={i} className="bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded text-xs">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
