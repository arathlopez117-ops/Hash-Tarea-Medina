import { useState } from 'react';
import { Lock, Loader2, CheckCircle2, XCircle, Eye, EyeOff, Plus, Trash2, RefreshCw } from 'lucide-react';
import { hashData, type HashAlgorithmId } from '@/lib/hash';
import { AlgorithmSelect } from '@/components/AlgorithmSelect';
import { CopyButton } from '@/components/HashDisplay';

const allAlgorithms: HashAlgorithmId[] = ['sha256', 'sha384', 'sha512', 'bcrypt', 'sha256crypt', 'pbkdf2'];

interface StoredPassword {
  id: number;
  service: string;
  username: string;
  algorithm: HashAlgorithmId;
  hash: string;
  salt: string;
  rounds?: number;
  iterations?: number;
  keyLength?: number;
}

export function PasswordTool() {
  const [algorithm, setAlgorithm] = useState<HashAlgorithmId>('bcrypt');
  const [password, setPassword] = useState('');
  const [service, setService] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stored, setStored] = useState<StoredPassword[]>([]);
  const [lastStored, setLastStored] = useState<StoredPassword | null>(null);

  // Verification
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleStore = async () => {
    if (!password || !service) return;
    setLoading(true);
    const salt =
      Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    const options: Record<string, unknown> = { salt };
    if (algorithm === 'bcrypt') options.rounds = 10;
    if (algorithm === 'pbkdf2') {
      options.iterations = 100000;
      options.keyLength = 32;
    }

    const result = await hashData(algorithm, password, options);
    const entry: StoredPassword = {
      id: Date.now(),
      service,
      username: username || '—',
      algorithm,
      hash: result.hash,
      salt,
      rounds: algorithm === 'bcrypt' ? 10 : undefined,
      iterations: algorithm === 'pbkdf2' ? 100000 : undefined,
      keyLength: algorithm === 'pbkdf2' ? 32 : undefined,
    };
    setStored((prev) => [entry, ...prev]);
    setLastStored(entry);
    setPassword('');
    setVerifyResult(null);
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!lastStored || !verifyPassword) return;
    setVerifyLoading(true);

    const options: Record<string, unknown> = { salt: lastStored.salt };
    if (lastStored.rounds) options.rounds = lastStored.rounds;
    if (lastStored.iterations) options.iterations = lastStored.iterations;
    if (lastStored.keyLength) options.keyLength = lastStored.keyLength;

    const result = await hashData(lastStored.algorithm, verifyPassword, options);
    setVerifyResult(result.hash === lastStored.hash);
    setVerifyLoading(false);
  };

  const removeEntry = (id: number) => {
    setStored((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Store password */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Gestión de Contraseñas</h3>
            <p className="mt-0.5 text-sm text-slate-400">
              Almacena contraseñas de forma segura usando hash con salt. Nunca se guarda la contraseña original.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <AlgorithmSelect
            value={algorithm}
            onChange={setAlgorithm}
            options={allAlgorithms}
            label="Algoritmo de hash"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Servicio / Sitio
              </label>
              <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="ej: Gmail, GitHub, Banco..."
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Usuario (opcional)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej: usuario@email.com"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contraseña a proteger
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Escribe una contraseña..."
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 pr-11 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleStore}
            disabled={!password || !service || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Almacenar contraseña
          </button>

          {lastStored && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Contraseña almacenada para "{lastStored.service}"
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-xs text-slate-500">Hash:</span>
                  <code className="flex-1 truncate font-mono text-xs text-slate-300">{lastStored.hash}</code>
                  <CopyButton text={lastStored.hash} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-xs text-slate-500">Salt:</span>
                  <code className="flex-1 truncate font-mono text-xs text-slate-300">{lastStored.salt}</code>
                  <CopyButton text={lastStored.salt} />
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded bg-white/5 px-2 py-0.5">Algoritmo: {lastStored.algorithm.toUpperCase()}</span>
                  {lastStored.rounds && (
                    <span className="rounded bg-white/5 px-2 py-0.5">Rounds: {lastStored.rounds}</span>
                  )}
                  {lastStored.iterations && (
                    <span className="rounded bg-white/5 px-2 py-0.5">Iter: {lastStored.iterations.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verify password */}
      {lastStored && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
          <h4 className="mb-4 text-sm font-semibold text-white">Verificar contraseña</h4>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Contraseña a verificar para "{lastStored.service}"
              </label>
              <input
                type="text"
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                placeholder="Escribe la contraseña..."
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
            <button
              onClick={handleVerify}
              disabled={!verifyPassword || verifyLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              {verifyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Verificar
            </button>
          </div>

          {verifyResult !== null && (
            <div
              className={`mt-4 flex items-center gap-3 rounded-lg p-4 ${
                verifyResult ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'
              }`}
            >
              {verifyResult ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
              <div>
                <p className="font-semibold">
                  {verifyResult ? 'Contraseña correcta' : 'Contraseña incorrecta'}
                </p>
                <p className="text-sm opacity-80">
                  {verifyResult
                    ? 'La contraseña coincide con el hash almacenado.'
                    : 'La contraseña NO coincide. Acceso denegado.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vault */}
      {stored.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
          <h4 className="mb-4 text-sm font-semibold text-white">
            Almacén de contraseñas ({stored.length})
          </h4>
          <div className="space-y-3">
            {stored.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{entry.service}</span>
                    <span className="text-xs text-slate-500">· {entry.username}</span>
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      {entry.algorithm.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-slate-500">{entry.hash}</p>
                </div>
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="ml-3 shrink-0 rounded-md p-2 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
        <p className="text-sm leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-300">¿Cómo funciona?</span> Las contraseñas nunca
          se almacenan en texto plano. Se aplica un hash con salt aleatorio usando algoritmos lentos
          (BCRYPT, SHA256CRYPT, PBKDF2) que dificultan ataques de fuerza bruta. Para verificar, se
          recalcula el hash y se compara.
        </p>
      </div>
    </div>
  );
}
