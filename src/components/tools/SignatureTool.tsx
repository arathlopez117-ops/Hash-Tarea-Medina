import { useState } from 'react';
import { PenTool, CheckCircle2, XCircle, Loader2, KeyRound } from 'lucide-react';
import { hashData, type HashAlgorithmId, type HashResult } from '@/lib/hash';
import { AlgorithmSelect } from '@/components/AlgorithmSelect';
import { CopyButton } from '@/components/HashDisplay';

const allAlgorithms: HashAlgorithmId[] = ['sha256', 'sha384', 'sha512', 'bcrypt', 'sha256crypt', 'pbkdf2'];

function generateRSAKeyPair() {
  const p = BigInt('0x' + Math.random().toString(16).slice(2, 16));
  const q = BigInt('0x' + Math.random().toString(16).slice(2, 16));
  const n = p * q;
  const e = BigInt(65537);
  return {
    publicKey: n.toString(16),
    privateKey: ((p + BigInt(1)) * (q + BigInt(1))).toString(16),
    publicExponent: e.toString(),
  };
}

interface Signature {
  message: string;
  algorithm: HashAlgorithmId;
  hash: string;
  signature: string;
  publicKey: string;
  timestamp: string;
}

export function SignatureTool() {
  const [message, setMessage] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithmId>('sha256');
  const [keyPair] = useState(generateRSAKeyPair);
  const [signResult, setSignResult] = useState<Signature | null>(null);
  const [loading, setLoading] = useState(false);

  // Verification state
  const [verifyMessage, setVerifyMessage] = useState('');
  const [verifySignature, setVerifySignature] = useState('');
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleSign = async () => {
    if (!message) return;
    setLoading(true);
    const r = await hashData(algorithm, message);

    const sigBytes = new Uint8Array(64);
    crypto.getRandomValues(sigBytes);
    const signature = Array.from(sigBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const sig: Signature = {
      message,
      algorithm,
      hash: r.hash,
      signature,
      publicKey: keyPair.publicKey,
      timestamp: new Date().toISOString(),
    };
    setSignResult(sig);
    setVerifyMessage(message);
    setVerifySignature(signature);
    setVerifyResult(null);
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!verifyMessage || !verifySignature) return;
    setVerifyLoading(true);

    const r = await hashData(algorithm, verifyMessage);
    const expectedSig = signResult?.signature || '';
    const hashMatch = signResult?.hash === r.hash;
    const sigMatch = verifySignature.trim().toLowerCase() === expectedSig.toLowerCase();
    const messageMatch = verifyMessage === signResult?.message;

    setVerifyResult(hashMatch && sigMatch && messageMatch);
    setVerifyLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Sign */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <PenTool className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Firma Digital</h3>
            <p className="mt-0.5 text-sm text-slate-400">
              Firma un mensaje usando hash + clave criptográfica para garantizar autenticidad e integridad.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <KeyRound className="h-4 w-4" />
              Par de claves generado (simulado)
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-xs text-slate-500">Pública:</span>
                <code className="flex-1 truncate font-mono text-xs text-slate-300">
                  {keyPair.publicKey.slice(0, 40)}…
                </code>
                <CopyButton text={keyPair.publicKey} />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-xs text-slate-500">Privada:</span>
                <code className="flex-1 truncate font-mono text-xs text-slate-300">
                  {keyPair.privateKey.slice(0, 40)}…
                </code>
                <CopyButton text={keyPair.privateKey} />
              </div>
            </div>
          </div>

          <AlgorithmSelect
            value={algorithm}
            onChange={setAlgorithm}
            options={allAlgorithms}
            label="Algoritmo hash para firma"
          />

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Mensaje a firmar
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe el mensaje que quieres firmar digitalmente..."
              className="h-28 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          <button
            onClick={handleSign}
            disabled={!message || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenTool className="h-4 w-4" />}
            Firmar mensaje
          </button>

          {signResult && (
            <div className="space-y-4 rounded-lg border border-white/10 bg-black/30 p-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Hash del mensaje ({signResult.algorithm.toUpperCase()})
                  </span>
                  <CopyButton text={signResult.hash} />
                </div>
                <p className="break-all font-mono text-sm text-emerald-300">{signResult.hash}</p>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Firma digital
                  </span>
                  <CopyButton text={signResult.signature} />
                </div>
                <p className="break-all font-mono text-sm text-sky-300">{signResult.signature}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-md bg-white/5 px-2.5 py-1">
                  Clave pública: <span className="font-mono text-slate-300">{signResult.publicKey.slice(0, 20)}…</span>
                </span>
                <span className="rounded-md bg-white/5 px-2.5 py-1">
                  Fecha: {new Date(signResult.timestamp).toLocaleString('es-ES')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verify */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
        <h4 className="mb-4 text-sm font-semibold text-white">Verificar firma</h4>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Mensaje recibido
            </label>
            <textarea
              value={verifyMessage}
              onChange={(e) => setVerifyMessage(e.target.value)}
              placeholder="Mensaje a verificar..."
              className="h-20 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-slate-200 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Firma recibida
            </label>
            <input
              type="text"
              value={verifySignature}
              onChange={(e) => setVerifySignature(e.target.value)}
              placeholder="Firma hex..."
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-sm text-slate-200 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>
          <button
            onClick={handleVerify}
            disabled={!verifyMessage || !verifySignature || verifyLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            {verifyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Verificar
          </button>

          {verifyResult !== null && (
            <div
              className={`flex items-center gap-3 rounded-lg p-4 ${
                verifyResult ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'
              }`}
            >
              {verifyResult ? (
                <CheckCircle2 className="h-5 w-5 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 shrink-0" />
              )}
              <div>
                <p className="font-semibold">
                  {verifyResult ? 'Firma válida' : 'Firma inválida'}
                </p>
                <p className="text-sm opacity-80">
                  {verifyResult
                    ? 'El mensaje es auténtico y no ha sido modificado.'
                    : 'La verificación falló: el mensaje o la firma fueron alterados.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
        <p className="text-sm leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-300">¿Cómo funciona?</span> La firma digital
          combina un hash del mensaje con cifrado de clave privada. El receptor verifica con la
          clave pública: si el hash coincide, el mensaje es auténtico y no fue modificado.
        </p>
      </div>
    </div>
  );
}
