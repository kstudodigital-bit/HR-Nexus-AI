import React, { useState } from 'react';
import { generateInterviewScript } from '../services/geminiService';
import { InterviewPrepRequest, InterviewScriptResponse } from '../types';
import { Users, BookOpen, MessageSquare, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const InterviewPrep: React.FC = () => {
  const [formData, setFormData] = useState<InterviewPrepRequest>({
    role: '',
    level: 'Pleno',
    focus: ''
  });
  const [result, setResult] = useState<InterviewScriptResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateInterviewScript(formData);
      setResult(data);
    } catch (err) {
      setError("Erro ao gerar roteiro. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (idx: number) => {
    setExpandedQuestion(expandedQuestion === idx ? null : idx);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header & Form */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-1">
            <h2 className="text-3xl font-bold mb-2">Preparação de Entrevista</h2>
            <p className="text-indigo-100 opacity-90">
              Gere roteiros estruturados e perguntas técnicas validadas por IA para conduzir entrevistas de alto nível.
            </p>
          </div>
          
          <div className="md:col-span-2 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1 text-indigo-100">Cargo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Product Manager"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1 text-indigo-100">Senioridade</label>
                <select
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50 [&>option]:text-slate-900"
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value as any})}
                >
                  <option value="Júnior">Júnior</option>
                  <option value="Pleno">Pleno</option>
                  <option value="Sênior">Sênior</option>
                  <option value="Especialista">Especialista</option>
                  <option value="Gestão">Gestão</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1 text-indigo-100">Foco Técnico</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Arquitetura de Microsserviços"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  value={formData.focus}
                  onChange={(e) => setFormData({...formData, focus: e.target.value})}
                />
              </div>

              <div className="md:col-span-2 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-indigo-600 font-bold py-3 rounded-lg hover:bg-indigo-50 transition-colors flex justify-center items-center gap-2 shadow-lg"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Users className="h-5 w-5" />}
                  {loading ? 'Criando Roteiro...' : 'Gerar Roteiro Inteligente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          
          {/* Introduction Card */}
          <div className="bg-white border-l-4 border-indigo-500 shadow-sm rounded-r-xl p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              Introdução Sugerida
            </h3>
            <p className="text-slate-600 italic leading-relaxed">"{result.introduction}"</p>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 ml-2">Perguntas do Roteiro</h3>
            
            {result.questions.map((q, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleQuestion(idx)}
                  className="w-full flex items-start justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex gap-4">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm border border-slate-200">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-lg pr-8">{q.question}</h4>
                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded font-medium ${
                        q.type === 'Técnica' ? 'bg-blue-100 text-blue-700' :
                        q.type === 'Comportamental' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {q.type}
                      </span>
                    </div>
                  </div>
                  {expandedQuestion === idx ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </button>
                
                {expandedQuestion === idx && (
                  <div className="px-5 pb-5 pt-0 ml-12">
                    <div className="bg-green-50 rounded-lg p-4 mt-2 border border-green-100">
                      <h5 className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        O que esperar na resposta:
                      </h5>
                      <ul className="list-disc list-inside space-y-1">
                        {q.expectedAnswerKeyPoints.map((point, k) => (
                          <li key={k} className="text-sm text-green-900 opacity-90">{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Conclusion */}
          <div className="bg-slate-800 text-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-2">Encerramento</h3>
            <p className="italic">"{result.conclusion}"</p>
          </div>

        </div>
      )}
    </div>
  );
};

export default InterviewPrep;
