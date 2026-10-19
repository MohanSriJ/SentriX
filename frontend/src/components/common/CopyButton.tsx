import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface CopyButtonProps {
  text: string;
  label?: string;
  tooltip?: string;
  className?: string;
  iconOnly?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label,
  tooltip = 'Copy to clipboard',
  className = '',
  iconOnly = false,
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success('Copied to Clipboard', text);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : tooltip}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono transition-all ${
        copied
          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
          : 'bg-slate-100 dark:bg-[#070C18] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1E2D48] hover:border-slate-400 dark:hover:border-slate-600'
      } ${className}`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 animate-fadeIn" />
      ) : (
        <Copy className="w-3.5 h-3.5 shrink-0 opacity-70 hover:opacity-100" />
      )}
      {!iconOnly && <span>{copied ? 'Copied' : label || text}</span>}
    </button>
  );
};
