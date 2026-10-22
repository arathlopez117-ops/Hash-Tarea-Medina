import { useState } from 'react';
import { Loader2, BarChart3 } from 'lucide-react';
import { hashData, algorithms, type HashAlgorithmId, type HashResult } from '@/lib/hash';
import { CopyButton } from '@/components/HashDisplay';

const allAlgorithms: HashAlgorithmId[] = [
  'sha256',
  'sha384',
  'sha512',
  'bcrypt',
  'sha256crypt',
  'pbkdf2',
];

const categoryStyles: Record<string, string> = {
  fast: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  slow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  crypt: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  kdf: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const categoryLabels: Record<string, string> = {
  fast: 'Hash rápido',
  slow: 'Hash lento',
  crypt: 'Crypt',
  kdf: 'KDF',
};

export function ComparisonTool() {
  const [text, setText] = useState('Hola mundo');
  const [results, setResults] = useState<HashResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!text) return;
    setLoading(true);
    const allResults = await Promise.all(
      allAlgorithms.map((alg) => hashData(alg, text))
    );
    setResults(allResults);
    setLoading(false);
  };

  const maxTime = results.length > 0 ? Math.max(...results.map((r) => r.timeMs)) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Comparación de Algoritmos</h3>
            <p className="mt-0.5 text-sm text-slate-400">
              Compara los 6 algoritmos hash aplicados al mismo texto: tamaño, velocidad y formato de salida.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Texto de prueba
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe un texto..."
              className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>
          <button
            onClick={handleCompare}
            disabled={!text || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
            Comparar todos
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <>
          {/* Performance chart */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
            <h4 className="mb-4 text-sm font-semibold text-white">Rendimiento (tiempo de ejecución)</h4>
            <div className="space-y-3">
              {results.map((r) => {
                const info = algorithms[r.algorithm];
                const pct = maxTime > 0 ? (r.timeMs / maxTime) * 100 : 0;
                return (
                  <div key={r.algorithm}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">{info.name}</span>
                      <span className="text-slate-500">{r.timeMs.toFixed(3)} ms</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-500"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results table */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
            <h4 className="mb-4 text-sm font-semibold text-white">Resultado por algoritmo</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="pb-3 pr-4">Algoritmo</th>
                    <th className="pb-3 pr-4">Tipo</th>
                    <th className="pb-3 pr-4">Bits</th>
                    <th className="pb-3 pr-4">Longitud</th>
                    <th className="pb-3 pr-4">Tiempo</th>
                    <th className="pb-3">Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => {
                    const info = algorithms[r.algorithm];
                    return (
                      <tr key={r.algorithm} className="border-b border-white/5">
                        <td className="py-3 pr-4">
                          <span className="font-medium text-white">{info.name}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-block rounded border px-2 py-0.5 text-xs ${categoryStyles[info.category]}`}
                          >
                            {categoryLabels[info.category]}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-400">{info.hashSizeBits}</td>
                        <td className="py-3 pr-4 text-slate-400">{r.hash.length}</td>
                        <td className="py-3 pr-4 text-slate-400">{r.timeMs.toFixed(3)} ms</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <code className="max-w-xs truncate font-mono text-xs text-emerald-300">
                              {r.hash}
                            </code>
                            <CopyButton text={r.hash} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Algorithm reference cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {allAlgorithms.map((id) => {
          const info = algorithms[id];
          return (
            <div
              key={id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{info.name}</span>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-xs ${categoryStyles[info.category]}`}
                  >
                    {categoryLabels[info.category]}
                  </span>
                </div>
                <span className="text-xs text-slate-500">{info.hashSizeBits} bits</span>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-slate-400">{info.description}</p>
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Características
                  </span>
                  <ul className="mt-1 space-y-0.5">
                    {info.features.map((f, i) => (
                      <li key={i} className="text-xs text-slate-400">
                        • {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-500/70">
                    Nota de seguridad
                  </span>
                  <p className="mt-0.5 text-xs text-slate-500">{info.securityNote}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
