import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl bg-white shadow-elevated animate-slide-up`}>
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="text-lg font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-muted hover:bg-gray-100 hover:text-ink transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
