import React, { useState } from 'react';
import { generateJobDescription } from '../services/geminiService';
import { JobDescriptionRequest, JobDescriptionResponse } from '../types';
import { Sparkles, Copy, Check, Loader2 } from 'lucide-react';

const JobGenerator: React.FC = () => {
  const [formData, setFormData] = useState<JobDescriptionRequest>({
    title: '',
    department: '',
    requirements: '',
    tone: 'Formal'
  });
  const [result, setResult] = useState<JobDescriptionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await generateJobDescription(formData);
      setResult(data);
    } catch (err) {
      setError("Falha ao gerar descrição da vaga. Verifique sua chave de API ou tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = `
${result.title}

Resumo:
${result.summary}

Responsabilidades:
${result.responsibilities.map(r => `- ${r}`).join('\n')}

Requisitos:
${result.requirements.map(r => `- ${r}`).join('\n')}

Benefícios:
${result.benefits.map(b => `- ${b}`).join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 p-1.5 rounded-md"><Sparkles className="h-5 w-5" /></span>
            Configurar Vaga
          </h2>
          <p className="text-slate-500 text-sm mt-1">Preencha os detalhes para gerar uma descrição completa.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título da Vaga</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Ex: Desenvolvedor Senior React"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Ex: Engenharia de Software"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Requisitos Chave</label>
            <textarea
              required
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              placeholder="Ex: 5+ anos de XP, TypeScript, Node.js, Inglês fluente..."
              value={formData.requirements}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tom da Comunicação</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              value={formData.tone}
              onChange={(e) => setFormData({...formData, tone: e.target.value as any})}
            >
              <option value="Formal">Formal & Corporativo</option>
              <option value="Casual">Casual & Moderno</option>
              <option value="Inspirador">Inspirador & Visionário</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            {loading ? 'Gerando...' : 'Gerar Descrição'}
          </button>
          
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>

      {/* Output Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative min-h-[500px]">
        {!result ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-slate-300" />
            </div>
            <p>O resultado gerado pela IA aparecerá aqui.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{result.title}</h3>
                <p className="text-indigo-600 font-medium">{formData.department}</p>
              </div>
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-slate-100 rounded-md text-slate-500 hover:text-indigo-600 transition-colors"
                title="Copiar texto"
              >
                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>

            <div className="space-y-4 text-slate-700">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Resumo</h4>
                <p className="text-sm leading-relaxed">{result.summary}</p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Responsabilidades</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {result.responsibilities.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Requisitos</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {result.requirements.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">Benefícios</h4>
                <div className="flex flex-wrap gap-2">
                  {result.benefits.map((item, idx) => (
                    <span key={idx} className="bg-white text-indigo-700 px-3 py-1 rounded-full text-xs font-medium border border-indigo-100 shadow-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobGenerator;
