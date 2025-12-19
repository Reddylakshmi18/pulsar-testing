
import React, { useState, useEffect } from 'react';
import { Service, AIInsight, ServiceStatus } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  X, Brain, Zap, Shield, AlertTriangle, RefreshCw, ChevronRight, Terminal, Activity
} from 'lucide-react';
import { analyzeServiceHealth } from '../services/geminiService';

interface ServiceDetailProps {
  service: Service;
  onClose: () => void;
  onRefresh: (id: string) => void;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ service, onClose, onRefresh }) => {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    const result = await analyzeServiceHealth(service);
    setInsight(result);
    setAnalyzing(false);
  };

  useEffect(() => {
    handleAIAnalysis();
  }, [service.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900/95 z-10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gray-800 ${service.status === ServiceStatus.HEALTHY ? 'text-emerald-400' : 'text-rose-400'}`}>
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{service.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-mono">{service.url}</span>
                <span>•</span>
                <span className="capitalize">{service.type}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Current Latency</span>
              <p className="text-3xl font-mono font-bold text-emerald-400 mt-1">
                {service.history[service.history.length - 1]?.latency || 0}ms
              </p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">99th Percentile</span>
              <p className="text-3xl font-mono font-bold text-amber-400 mt-1">
                {Math.max(...service.history.map(h => h.latency))}ms
              </p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Availability</span>
              <p className="text-3xl font-mono font-bold text-sky-400 mt-1">99.98%</p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-gray-800/30 border border-gray-800 p-4 rounded-xl h-[300px]">
            <h4 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
              {/* Added missing Activity icon */}
              <Activity className="w-4 h-4" /> Historical Heartbeat Latency (ms)
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={service.history}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                  stroke="#6b7280" 
                  fontSize={10}
                />
                <YAxis stroke="#6b7280" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  labelFormatter={(val) => new Date(val).toLocaleString()}
                />
                <Area type="monotone" dataKey="latency" stroke="#10b981" fillOpacity={1} fill="url(#colorLatency)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* AI Insights Section */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Brain className="w-12 h-12 text-indigo-500/20" />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-indigo-100">Gemini AI Analysis</h3>
              {analyzing && <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />}
            </div>

            {insight ? (
              <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                <p className="text-gray-300 leading-relaxed italic">
                  "{insight.summary}"
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <Shield className="w-3 h-3" /> Recommended Actions
                    </span>
                    <ul className="space-y-2">
                      {insight.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                          <ChevronRight className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {insight.anomaliesFound && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                      <div>
                        <h5 className="text-sm font-bold text-rose-200">Anomalies Detected</h5>
                        <p className="text-xs text-rose-400/80 mt-1">
                          Our analysis detected non-standard latency spikes that correlate with high traffic windows.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : analyzing ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-500 space-y-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150" />
                </div>
                <span className="text-sm font-mono">Synthesizing network metrics...</span>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 italic">
                AI analysis required.
              </div>
            )}
          </div>

          {/* Logs Terminal */}
          <div className="bg-black rounded-xl p-4 border border-gray-800 font-mono text-sm">
            <div className="flex items-center gap-2 mb-2 text-gray-500 border-b border-gray-800 pb-2">
              <Terminal className="w-4 h-4" />
              <span>Real-time Heartbeat Stream</span>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {service.history.slice(-10).reverse().map((h, i) => (
                <div key={i} className="flex items-center gap-4 text-xs">
                  <span className="text-gray-600">[{new Date(h.timestamp).toLocaleTimeString()}]</span>
                  <span className={h.status === ServiceStatus.HEALTHY ? 'text-emerald-500' : 'text-rose-500'}>
                    PING
                  </span>
                  <span className="text-gray-400">latency={h.latency}ms</span>
                  <span className="text-gray-600">status_code=200</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-end gap-3 sticky bottom-0 bg-gray-900">
           <button 
             onClick={() => onRefresh(service.id)}
             className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
           >
             <RefreshCw className="w-4 h-4" /> Trigger Heartbeat
           </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
