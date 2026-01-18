import { Check, X, Minus, Sparkles, Zap, Globe, DollarSign, Code } from 'lucide-react';

interface Feature {
  name: string;
  vibenicity: boolean | 'partial' | 'unique';
  replit: boolean | 'partial';
  lovable: boolean | 'partial';
  bolt: boolean | 'partial';
  v0: boolean | 'partial';
}

const features: Feature[] = [
  { name: 'AI Code Generation', vibenicity: true, replit: true, lovable: true, bolt: true, v0: true },
  { name: 'Linguistics Engine (Slang Translation)', vibenicity: 'unique', replit: false, lovable: false, bolt: false, v0: false },
  { name: 'Multi-Provider AI (GPT, Claude, Gemini)', vibenicity: true, replit: 'partial', lovable: false, bolt: false, v0: false },
  { name: 'Free Planning Mode', vibenicity: 'unique', replit: false, lovable: false, bolt: false, v0: false },
  { name: 'Live Code Preview', vibenicity: true, replit: true, lovable: true, bolt: true, v0: true },
  { name: 'Template Library', vibenicity: true, replit: true, lovable: true, bolt: true, v0: 'partial' },
  { name: 'Multi-Format Export (ZIP/GitHub)', vibenicity: true, replit: true, lovable: true, bolt: true, v0: 'partial' },
  { name: 'Version History & Undo', vibenicity: true, replit: true, lovable: 'partial', bolt: 'partial', v0: false },
  { name: '535+ Cultural Dialect Terms', vibenicity: 'unique', replit: false, lovable: false, bolt: false, v0: false },
  { name: 'Gen Z / AAVE / Tech Slang Support', vibenicity: 'unique', replit: false, lovable: false, bolt: false, v0: false },
  { name: 'Real-time Build Streaming', vibenicity: true, replit: true, lovable: true, bolt: true, v0: true },
  { name: 'Resizable Panel Layout', vibenicity: true, replit: true, lovable: true, bolt: 'partial', v0: false },
];

const competitors = [
  { id: 'vibenicity', name: 'Vibenicity', color: 'from-[#00E5FF] to-[#E879F9]' },
  { id: 'replit', name: 'Replit Agent', color: 'from-orange-400 to-orange-600' },
  { id: 'lovable', name: 'Lovable', color: 'from-pink-400 to-pink-600' },
  { id: 'bolt', name: 'Bolt.new', color: 'from-yellow-400 to-yellow-600' },
  { id: 'v0', name: 'v0.dev', color: 'from-gray-400 to-gray-600' },
];

function StatusIcon({ status }: { status: boolean | 'partial' | 'unique' }) {
  if (status === 'unique') {
    return (
      <div className="flex items-center gap-1">
        <Sparkles className="w-4 h-4 text-[#E879F9]" />
        <span className="text-[10px] text-[#E879F9] font-medium uppercase">Unique</span>
      </div>
    );
  }
  if (status === true) {
    return <Check className="w-4 h-4 text-[#00E5FF]" />;
  }
  if (status === 'partial') {
    return <Minus className="w-4 h-4 text-yellow-400" />;
  }
  return <X className="w-4 h-4 text-gray-600" />;
}

export function ComparisonChart() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-6">
            <Zap className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-sm text-gray-300">Feature Comparison</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How <span className="text-gradient">Vibenicity</span> Stacks Up
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            See how our unique linguistics engine and multi-provider AI support compare to the competition
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-vibenicity flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">11 Dialects</h3>
            <p className="text-sm text-gray-400">Gen Z, AAVE, Tech, Gaming, UK, Southern, and more</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-vibenicity flex items-center justify-center mx-auto mb-4">
              <Code className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">535+ Terms</h3>
            <p className="text-sm text-gray-400">Comprehensive slang dictionary for natural coding</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-vibenicity flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Free Planning</h3>
            <p className="text-sm text-gray-400">Refine prompts without consuming AI tokens</p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-2 p-4 border-b border-white/5 bg-white/5">
            <div className="col-span-1 text-sm font-medium text-gray-400">Feature</div>
            {competitors.map(comp => (
              <div key={comp.id} className="text-center">
                <div className={`text-xs font-semibold ${comp.id === 'vibenicity' ? 'text-gradient' : 'text-gray-300'}`}>
                  {comp.name}
                </div>
              </div>
            ))}
          </div>

          {/* Table Body */}
          <div className="divide-y divide-white/5">
            {features.map((feature, idx) => (
              <div 
                key={feature.name}
                className={`grid grid-cols-6 gap-2 p-4 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}
              >
                <div className="col-span-1 text-sm text-gray-300 flex items-center">
                  {feature.name}
                </div>
                <div className="flex justify-center items-center">
                  <StatusIcon status={feature.vibenicity} />
                </div>
                <div className="flex justify-center items-center">
                  <StatusIcon status={feature.replit} />
                </div>
                <div className="flex justify-center items-center">
                  <StatusIcon status={feature.lovable} />
                </div>
                <div className="flex justify-center items-center">
                  <StatusIcon status={feature.bolt} />
                </div>
                <div className="flex justify-center items-center">
                  <StatusIcon status={feature.v0} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mt-6 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#E879F9]" />
            <span>Unique to Vibenicity</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Full support</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="w-3.5 h-3.5 text-yellow-400" />
            <span>Partial support</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="w-3.5 h-3.5 text-gray-600" />
            <span>Not available</span>
          </div>
        </div>
      </div>
    </section>
  );
}
