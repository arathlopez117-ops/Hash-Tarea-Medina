import { useState } from 'react';
import { ShieldCheck, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { hashData, type HashAlgorithmId, type HashResult } from '@/lib/hash';
import { AlgorithmSelect } from '@/components/AlgorithmSelect';
import { HashDisplay, CopyButton } from '@/components/HashDisplay';

const allAlgorithms: HashAlgorithmId[] = ['sha256', 'sha384', 'sha512', 'bcrypt', 'sha256crypt', 'pbkdf2'];

export function IntegrityTool() {
  const [text, setText] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithmId>('sha256');
  const [result, setResult] = useState<HashResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [referenceHash, setReferenceHash] = useState('');
  const [matchResult, setMatchResult] = useState<boolean | null>(null);

  const handleHash = async () => {
    if (!text) return;
    setLoading(true);
    const r = await hashData(algorithm, text);
    setResult(r);
    setMatchResult(null);
    setLoading(false);
  };

  const handleVerify = () => {
    if (!result || !referenceHash) return;
    setMatchResult(result.hash === referenceHash.trim().toLowerCase());
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const content = ev.target?.result as string;
      setText(content);
      setLoading(true);
      const r = await hashData(algorithm, content);
      setResult(r);
      setMatchResult(null);
      setLoading(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Hash generator */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Verificación de Integridad</h3>
            <p className="mt-0.5 text-sm text-slate-400">
              Genera un hash de tu texto o archivo para verificar que no ha sido modificado.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <AlgorithmSelect
            value={algorithm}
            onChange={setAlgorithm}
            options={allAlgorithms}
            label="Algoritmo hash"
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Texto o contenido del archivo
              </label>
              <label className="cursor-pointer text-xs font-medium text-emerald-400 hover:text-emerald-300">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Subir archivo
                </span>
                <input type="file" className="hidden" onChange={handleFile} />
              </label>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Pega aquí el texto a verificar, o sube un archivo..."
              className="h-32 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>

          <button
            onClick={handleHash}
            disabled={!text || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Generar Hash
          </button>

          {result && (
            <HashDisplay
              hash={result.hash}
              algorithm={result.algorithm.toUpperCase()}
              timeMs={result.timeMs}
              metadata={result.metadata}
            />
          )}
        </div>
      </div>

      {/* Verification */}
      {result && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
          <h4 className="mb-4 text-sm font-semibold text-white">Verificar integridad</h4>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Hash de referencia
              </label>
              <input
                type="text"
                value={referenceHash}
                onChange={(e) => setReferenceHash(e.target.value)}
                placeholder="Pega el hash original para comparar..."
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm font-mono text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
            <button
              onClick={handleVerify}
              disabled={!referenceHash}
              className="rounded-lg bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              Comparar
            </button>
          </div>

          {matchResult !== null && (
            <div
              className={`mt-4 flex items-center gap-3 rounded-lg p-4 ${
                matchResult
                  ? 'bg-emerald-500/10 text-emerald-300'
                  : 'bg-red-500/10 text-red-300'
              }`}
            >
              {matchResult ? (
                <CheckCircle2 className="h-5 w-5 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 shrink-0" />
              )}
              <div>
                <p className="font-semibold">
                  {matchResult ? 'Integridad verificada' : 'Integridad comprometida'}
                </p>
                <p className="text-sm opacity-80">
                  {matchResult
                    ? 'Los hashes coinciden. El contenido no ha sido modificado.'
                    : 'Los hashes NO coinciden. El contenido fue alterado.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info panel */}
      <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
        <p className="text-sm leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-300">¿Cómo funciona?</span> La verificación de
          integridad genera una huella digital única (hash) del contenido. Si cambia un solo bit del
          texto o archivo, el hash resultante será completamente diferente, detectando cualquier
          modificación.
        </p>
      </div>
    </div>
  );
}
