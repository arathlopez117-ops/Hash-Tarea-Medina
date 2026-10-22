import type { HashAlgorithmId } from '@/lib/hash';

interface AlgorithmSelectProps {
  value: HashAlgorithmId;
  onChange: (id: HashAlgorithmId) => void;
  options?: HashAlgorithmId[];
  label?: string;
}

const defaultOptions: HashAlgorithmId[] = [
  'sha256',
  'sha384',
  'sha512',
  'bcrypt',
  'sha256crypt',
  'pbkdf2',
];

export function AlgorithmSelect({
  value,
  onChange,
  options = defaultOptions,
  label = 'Algoritmo',
}: AlgorithmSelectProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((id) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
              value === id
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            {id === 'pbkdf2' ? 'PBKDF2' : id.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
