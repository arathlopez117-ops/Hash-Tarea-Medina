import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
        copied
          ? 'bg-emerald-500/15 text-emerald-300'
          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
      } ${className}`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  );
}

interface HashDisplayProps {
  hash: string;
  algorithm: string;
  timeMs: number;
  metadata?: {
    salt?: string;
    rounds?: number;
    iterations?: number;
    keyLength?: number;
    hashSizeBits: number;
  };
}

export function HashDisplay({ hash, algorithm, timeMs, metadata }: HashDisplayProps) {
  const wordBreakHash = hash.length > 60 ? 'break-all' : 'break-all';

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-white/10 bg-black/30 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Hash {algorithm}
          </span>
          <CopyButton text={hash} />
        </div>
        <p className={`font-mono text-sm text-emerald-300 ${wordBreakHash}`}>{hash}</p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-md bg-white/5 px-2.5 py-1 text-slate-400">
          Longitud: <span className="text-slate-200">{hash.length}</span> caracteres
        </span>
        <span className="rounded-md bg-white/5 px-2.5 py-1 text-slate-400">
          Bits: <span className="text-slate-200">{metadata?.hashSizeBits ?? '—'}</span>
        </span>
        <span className="rounded-md bg-white/5 px-2.5 py-1 text-slate-400">
          Tiempo: <span className="text-slate-200">{timeMs.toFixed(3)} ms</span>
        </span>
        {metadata?.salt && (
          <span className="rounded-md bg-white/5 px-2.5 py-1 text-slate-400">
            Salt: <span className="text-slate-200 font-mono">{metadata.salt.slice(0, 16)}…</span>
          </span>
        )}
        {metadata?.rounds && (
          <span className="rounded-md bg-white/5 px-2.5 py-1 text-slate-400">
            Rounds: <span className="text-slate-200">{metadata.rounds}</span>
          </span>
        )}
        {metadata?.iterations && (
          <span className="rounded-md bg-white/5 px-2.5 py-1 text-slate-400">
            Iteraciones: <span className="text-slate-200">{metadata.iterations.toLocaleString()}</span>
          </span>
        )}
        {metadata?.keyLength && (
          <span className="rounded-md bg-white/5 px-2.5 py-1 text-slate-400">
            Key length: <span className="text-slate-200">{metadata.keyLength} bytes</span>
          </span>
        )}
      </div>
    </div>
  );
}
