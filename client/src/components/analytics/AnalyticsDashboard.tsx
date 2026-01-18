import { useState, useEffect } from 'react';
import { X, BarChart3, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuildSession {
  id: number;
  userPrompt: string;
  status: string;
  provider: string;
  createdAt: string;
}

interface AnalyticsData {
  totalBuilds: number;
  successfulBuilds: number;
  failedBuilds: number;
  recentBuilds: BuildSession[];
  providerUsage: Record<string, number>;
}

interface AnalyticsDashboardProps {
  onClose: () => void;
}

export function AnalyticsDashboard({ onClose }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/analytics', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const successRate = data && data.totalBuilds > 0 
    ? Math.round((data.successfulBuilds / data.totalBuilds) * 100) 
    : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-[#00E5FF]';
      case 'error': return 'text-[#FF6B9D]';
      default: return 'text-[#E879F9]';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'gemini': return 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20';
      case 'claude': return 'bg-[#E879F9]/10 text-[#E879F9] border border-[#E879F9]/20';
      case 'openai': return 'bg-[#FF6B9D]/10 text-[#FF6B9D] border border-[#FF6B9D]/20';
      default: return 'bg-white/5 text-gray-400 border border-white/10';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-vibenicity flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-black" />
            </div>
            <h2 className="text-lg font-semibold text-white">Build Analytics</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            data-testid="button-close-analytics"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-[#FF6B9D]">{error}</div>
          ) : data ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Zap className="w-4 h-4 text-[#00E5FF]" />
                    Total Builds
                  </div>
                  <div className="text-3xl font-bold text-white" data-testid="text-total-builds">
                    {data.totalBuilds}
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <CheckCircle className="w-4 h-4 text-[#00E5FF]" />
                    Successful
                  </div>
                  <div className="text-3xl font-bold text-[#00E5FF]" data-testid="text-successful-builds">
                    {data.successfulBuilds}
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <XCircle className="w-4 h-4 text-[#FF6B9D]" />
                    Failed
                  </div>
                  <div className="text-3xl font-bold text-[#FF6B9D]" data-testid="text-failed-builds">
                    {data.failedBuilds}
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <BarChart3 className="w-4 h-4 text-[#E879F9]" />
                    Success Rate
                  </div>
                  <div className="text-3xl font-bold text-gradient" data-testid="text-success-rate">
                    {successRate}%
                  </div>
                </div>
              </div>

              {Object.keys(data.providerUsage).length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <h3 className="text-sm font-medium text-white mb-4">AI Provider Usage</h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(data.providerUsage).map(([provider, count]) => (
                      <div 
                        key={provider}
                        className={cn("px-4 py-2 rounded-lg text-sm font-medium", getProviderColor(provider))}
                        data-testid={`text-provider-${provider}`}
                      >
                        {provider.charAt(0).toUpperCase() + provider.slice(1)}: {count} builds
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.recentBuilds.length > 0 && (
                <div className="bg-white/5 rounded-xl border border-white/5">
                  <h3 className="text-sm font-medium text-white p-4 border-b border-white/5">
                    Recent Builds
                  </h3>
                  <div className="divide-y divide-white/5">
                    {data.recentBuilds.map(build => (
                      <div 
                        key={build.id} 
                        className="p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                        data-testid={`row-build-${build.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{build.userPrompt}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatDate(build.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("px-2 py-1 rounded-lg text-xs", getProviderColor(build.provider))}>
                            {build.provider}
                          </span>
                          <span className={cn("text-xs font-medium", getStatusColor(build.status))}>
                            {build.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.totalBuilds === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30 text-[#00E5FF]" />
                  <p>No builds yet. Start creating to see your analytics!</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
