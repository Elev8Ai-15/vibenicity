export interface DesignTemplate {
  name: string;
  category: 'layout' | 'component' | 'page' | 'utility';
  description: string;
  code: string;
}

export const designTemplates: DesignTemplate[] = [
  {
    name: 'ShadcnButton',
    category: 'component',
    description: 'Modern button component with variants',
    code: `import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  children: ReactNode;
}

export function Button({ variant = 'default', size = 'default', className, children, ...props }: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50';
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  };
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-6 text-lg'
  };
  return (
    <button className={\`\${baseStyles} \${variants[variant]} \${sizes[size]} \${className || ''}\`} {...props}>
      {children}
    </button>
  );
}`
  },
  {
    name: 'Card',
    category: 'component',
    description: 'Content container with shadow and border',
    code: `import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={\`rounded-lg border bg-card text-card-foreground shadow-sm \${className}\`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardProps) {
  return <div className={\`flex flex-col space-y-1.5 p-6 \${className}\`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: CardProps) {
  return <h3 className={\`text-2xl font-semibold leading-none tracking-tight \${className}\`}>{children}</h3>;
}

export function CardContent({ children, className = '' }: CardProps) {
  return <div className={\`p-6 pt-0 \${className}\`}>{children}</div>;
}`
  },
  {
    name: 'Input',
    category: 'component',
    description: 'Form input with consistent styling',
    code: `import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <input
        className={\`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 \${error ? 'border-red-500' : ''} \${className}\`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}`
  },
  {
    name: 'DashboardLayout',
    category: 'layout',
    description: 'Two-column dashboard with sidebar',
    code: `import type { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export function DashboardLayout({ children, sidebar }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r bg-card p-4 hidden md:block">
        {sidebar}
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}`
  },
  {
    name: 'HeroSection',
    category: 'page',
    description: 'Landing page hero with CTA',
    code: `interface HeroProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  onCta?: () => void;
}

export function HeroSection({ title, subtitle, ctaText = 'Get Started', onCta }: HeroProps) {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-primary/10 to-background">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          {title}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {subtitle}
        </p>
        <button 
          onClick={onCta}
          className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all"
        >
          {ctaText}
        </button>
      </div>
    </section>
  );
}`
  },
  {
    name: 'DataTable',
    category: 'component',
    description: 'Simple data table with headers',
    code: `import type { ReactNode } from 'react';

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({ columns, data, onRowClick }: DataTableProps<T>) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr 
              key={i} 
              onClick={() => onRowClick?.(row)}
              className="border-t hover:bg-muted/50 transition-colors cursor-pointer"
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="p-4 align-middle">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`
  },
  {
    name: 'LoadingSpinner',
    category: 'utility',
    description: 'Animated loading indicator',
    code: `interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={\`\${sizes[size]} animate-spin rounded-full border-2 border-muted border-t-primary \${className}\`} />
  );
}`
  },
  {
    name: 'Toast',
    category: 'utility',
    description: 'Toast notification component',
    code: `interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };
  return (
    <div className={\`fixed bottom-4 right-4 \${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right\`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="hover:opacity-75">×</button>
      )}
    </div>
  );
}`
  },
  {
    name: 'Modal',
    category: 'component',
    description: 'Accessible modal dialog',
    code: `import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 animate-in zoom-in-95">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">×</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}`
  },
  {
    name: 'Avatar',
    category: 'component',
    description: 'User avatar with fallback',
    code: `interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ src, alt = 'Avatar', fallback, size = 'md' }: AvatarProps) {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' };
  return (
    <div className={\`\${sizes[size]} rounded-full bg-muted flex items-center justify-center overflow-hidden\`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="text-sm font-medium text-muted-foreground">
          {fallback || alt.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}`
  }
];

export function getTemplatesByCategory(category: DesignTemplate['category']): DesignTemplate[] {
  return designTemplates.filter(t => t.category === category);
}

export function getAllTemplatesAsContext(): string {
  // Return compact descriptions only (not full code) to avoid overwhelming the AI
  return `Use modern shadcn/ui patterns:
- Buttons: rounded-md, variants (default/outline/ghost), sizes (sm/md/lg)
- Cards: bg-white/bg-card, rounded-xl, shadow-sm, p-6, border border-border
- Inputs: rounded-md border border-input px-3 py-2, focus:ring-2 focus:ring-primary
- Layout: min-h-screen, max-w-7xl mx-auto, responsive grid/flex
- Typography: text-foreground, font-semibold headers, text-muted-foreground for secondary
- Colors: Use Tailwind's slate/gray palette, accent with cyan-500/purple-500 for highlights
- Spacing: consistent p-4/p-6/p-8, gap-4/gap-6 for grids
- Icons: Use lucide-react (Check, X, Plus, ChevronRight, etc.)`;
}

export function getTemplateNames(): string[] {
  return designTemplates.map(t => t.name);
}
