import { Zap, Globe, Code, ArrowRight, Sparkles, MessageSquare, Layers } from 'lucide-react';
import { ComparisonChart } from '@/components/comparison/ComparisonChart';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Gradient orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#00E5FF] opacity-[0.08] blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[-15%] w-[500px] h-[500px] bg-[#E879F9] opacity-[0.08] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[30%] w-[400px] h-[400px] bg-[#FF6B9D] opacity-[0.06] blur-[100px] rounded-full" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/vibenicity-logo.png" 
              alt="Vibenicity" 
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="font-bold text-lg tracking-tight text-gradient">Vibenicity</span>
          </div>
          <a 
            href="/api/login"
            className="px-5 py-2.5 bg-gradient-vibenicity font-semibold rounded-full text-sm hover:opacity-90 transition-all hover:scale-105 text-black"
            data-testid="button-login"
          >
            Start Building
          </a>
        </div>
      </nav>

      <main className="relative pt-28">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm mb-8">
              <Sparkles className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-gray-300">535+ slang terms across 11 cultural dialects</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              Build apps in
              <span className="text-gradient block mt-2">your native tongue</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The AI code generator that understands how you actually speak. 
              Gen Z, AAVE, tech slang, gaming terms — just describe what you want and watch it build.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/api/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-vibenicity font-bold rounded-full text-lg hover:opacity-90 transition-all hover:scale-105 text-black glow-cyan"
                data-testid="button-get-started"
              >
                Start Building Free
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            
            <p className="mt-6 text-sm text-gray-500">
              No credit card required • Powered by GPT-5, Claude & Gemini
            </p>
          </div>

          {/* Demo Card */}
          <div className="mt-20 glass rounded-2xl p-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-[#00E5FF]" />
              <span className="text-sm font-medium text-gray-300">Live Translation Demo</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                <div className="text-xs font-medium text-[#00E5FF] mb-3 uppercase tracking-wider">Your Input</div>
                <p className="text-base font-mono text-white/90 leading-relaxed">
                  "yo build me a fire dashboard that's lowkey clean and no cap responsive af"
                </p>
              </div>
              <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                <div className="text-xs font-medium text-[#E879F9] mb-3 uppercase tracking-wider">Translated</div>
                <p className="text-base font-mono text-white/90 leading-relaxed">
                  "Build an impressive dashboard with minimalist design and fully responsive layout"
                </p>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
              <Layers className="w-4 h-4" />
              8 dialect terms decoded in real-time
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built for the way you communicate</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              No more translating your thoughts into formal technical language. Just speak naturally.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass rounded-2xl p-6 glass-hover transition-all">
              <div className="w-12 h-12 bg-[#00E5FF]/10 rounded-xl flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-[#00E5FF]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">11 Cultural Dialects</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Gen Z, AAVE, Tech, Startup, Gaming, Southern, UK, Hip-Hop, Hispanic, and more.
              </p>
            </div>
            
            <div className="glass rounded-2xl p-6 glass-hover transition-all">
              <div className="w-12 h-12 bg-[#E879F9]/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#E879F9]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-AI Engine</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Choose between GPT-5, Claude, or Gemini for code generation based on your needs.
              </p>
            </div>
            
            <div className="glass rounded-2xl p-6 glass-hover transition-all">
              <div className="w-12 h-12 bg-[#FF6B9D]/10 rounded-xl flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-[#FF6B9D]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Live Preview</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                See your generated React apps running in real-time with instant hot-reload.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison Chart */}
        <ComparisonChart />
      </main>

      <footer className="relative border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          <p className="flex items-center justify-center gap-2">
            <span className="text-gradient font-medium">Vibenicity</span>
            <span>—</span>
            <span>Making code accessible to everyone</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
