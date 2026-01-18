import { useState } from 'react';
import { projectTemplates, ProjectTemplate } from '@/lib/templates';
import { cn } from '@/lib/utils';
import { Search, X, Sparkles } from 'lucide-react';

interface TemplateSelectorProps {
  onSelect: (template: ProjectTemplate) => void;
  onClose: () => void;
}

const categories = [
  { id: 'all', label: 'All', icon: '📋' },
  { id: 'web', label: 'Web Apps', icon: '🌐' },
  { id: 'utility', label: 'Utilities', icon: '🔧' },
  { id: 'mobile', label: 'Mobile', icon: '📱' },
  { id: 'api', label: 'APIs', icon: '🔌' },
  { id: 'game', label: 'Games', icon: '🎮' },
] as const;

export function TemplateSelector({ onSelect, onClose }: TemplateSelectorProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredTemplates = projectTemplates.filter(template => {
    const matchesSearch = search === '' || 
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-vibenicity flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <h2 className="text-lg font-semibold text-white">Start from a Template</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            data-testid="button-close-templates"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[#00E5FF]/50"
              data-testid="input-template-search"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                  activeCategory === cat.id
                    ? "bg-gradient-vibenicity text-black"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                )}
                data-testid={`button-category-${cat.id}`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No templates found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => onSelect(template)}
                  className="text-left p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#00E5FF]/30 rounded-xl transition-all group"
                  data-testid={`button-template-${template.id}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white group-hover:text-[#00E5FF] transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.tags.slice(0, 3).map(tag => (
                          <span 
                            key={tag}
                            className="px-2 py-0.5 bg-white/5 text-gray-500 text-[10px] rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500">
            Select a template to auto-fill your prompt, or close to start from scratch
          </p>
        </div>
      </div>
    </div>
  );
}
