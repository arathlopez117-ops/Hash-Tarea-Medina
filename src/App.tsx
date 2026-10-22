import { useState } from 'react';
import {
  ShieldCheck,
  PenTool,
  Lock,
  BarChart3,
  Hash,
  Github,
  Shield,
} from 'lucide-react';
import { IntegrityTool } from '@/components/tools/IntegrityTool';
import { SignatureTool } from '@/components/tools/SignatureTool';
import { PasswordTool } from '@/components/tools/PasswordTool';
import { ComparisonTool } from '@/components/tools/ComparisonTool';

type Tab = 'integrity' | 'signature' | 'password' | 'comparison';

const tabs: { id: Tab; label: string; icon: typeof ShieldCheck; description: string }[] = [
  {
    id: 'integrity',
    label: 'Integridad',
    icon: ShieldCheck,
    description: 'Verificación de integridad de datos',
  },
  {
    id: 'signature',
    label: 'Firmas Digitales',
    icon: PenTool,
    description: 'Firma y verificación de mensajes',
  },
  {
    id: 'password',
    label: 'Contraseñas',
    icon: Lock,
    description: 'Gestión segura de contraseñas',
  },
  {
    id: 'comparison',
    label: 'Comparación',
    icon: BarChart3,
    description: 'Análisis comparativo de algoritmos',
  },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('integrity');

  return (
    <div className="min-h-screen bg-[#0a0e14] text-slate-200">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-sky-500/5 blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="border-b border-white/5 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-sky-500 shadow-lg shadow-emerald-500/20">
                  <Hash className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                    HashCrypto Lab
                  </h1>
                  <p className="hidden text-xs text-slate-500 sm:block">
                    Algoritmos hash & validación de datos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="h-4 w-4 text-emerald-500/60" />
                <span className="hidden sm:inline">SHA-256 · SHA-384 · SHA-512 · BCRYPT · SHA256CRYPT · PBKDF2</span>
                <span className="sm:hidden">6 algoritmos</span>
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              Herramienta educativa de criptografía
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Algoritmos Hash y
              <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                {' '}Validación de Datos
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">
              Aplicación web para explorar la integridad de la información, firmas digitales y
              gestión de contraseñas utilizando seis algoritmos hash diferentes.
            </p>
          </div>
        </section>

        {/* Tabs */}
        <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
                    active
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        active ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {tab.label}
                    </p>
                    <p className="hidden text-xs text-slate-500 sm:block">{tab.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {activeTab === 'integrity' && <IntegrityTool />}
          {activeTab === 'signature' && <SignatureTool />}
          {activeTab === 'password' && <PasswordTool />}
          {activeTab === 'comparison' && <ComparisonTool />}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Hash className="h-4 w-4 text-emerald-500/60" />
                <span>HashCrypto Lab — Herramienta educativa de criptografía</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <span>SHA-2 Family</span>
                <span>BCRYPT</span>
                <span>SHA256CRYPT</span>
                <span>PBKDF2</span>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-slate-600">
              Nota: BCRYPT, SHA256CRYPT y PBKDF2 utilizan simulaciones. SHA-256/384/512 usan la Web Crypto API nativa del navegador.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
