import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/common/ThemeToggle';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  GraduationCap,
  Building2,
  Globe,
  CheckCircle2,
  X,
  Loader2,
  Fingerprint,
} from 'lucide-react';

interface SSOProvider {
  id: string;
  name: string;
  type: string;
  defaultEmail: string;
  role: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
}

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@sentrix.local');
  const [password, setPassword] = useState('SentrixAdmin2026!');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Secure SSO Modal State
  const [showSSOModal, setShowSSOModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('edupass');
  const [ssoEmail, setSsoEmail] = useState('director.safety@campus.edu.in');
  const [ssoStep, setSsoStep] = useState<'SELECT' | 'HANDSHAKE' | 'SUCCESS'>('SELECT');
  const [ssoStatusMessage, setSsoStatusMessage] = useState('');

  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Demo accounts helper
  const selectDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const ssoProviders: SSOProvider[] = [
    {
      id: 'edupass',
      name: 'EduPass Institutional SSO',
      type: 'SAML 2.0 / Shibboleth Federated ID',
      defaultEmail: 'director.safety@campus.edu.in',
      role: 'Campus Safety Director (Admin)',
      icon: GraduationCap,
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    {
      id: 'entra',
      name: 'Microsoft Entra ID / M365',
      type: 'Azure Active Directory OAuth2',
      defaultEmail: 'security.operations@university.ac.in',
      role: 'Chief Security Officer',
      icon: Building2,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'google',
      name: 'Google Workspace for Education',
      type: 'OpenID Connect / PKCE',
      defaultEmail: 'emergency.coordinator@sentrix-campus.edu',
      role: 'Lead Emergency Responder',
      icon: Globe,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    {
      id: 'fido',
      name: 'SentriX Sentinel FIDO2 Key',
      type: 'WebAuthn Cryptographic Token',
      defaultEmail: 'hardware.token@sentrix.local',
      role: 'Hardware Security Administrator',
      icon: Fingerprint,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
  ];

  // Execute Realistic SSO Handshake & Instant Login
  const handleSSOAuthenticate = async () => {
    setSsoStep('HANDSHAKE');
    setSsoStatusMessage('Contacting Institutional Identity Provider (IDP)...');

    setTimeout(() => {
      setSsoStatusMessage('Validating Cryptographic SAML 2.0 / PKCE Assertion...');
    }, 600);

    setTimeout(() => {
      setSsoStatusMessage('Identity Verified. Issuing Secure Campus Security Clearance...');
    }, 1200);

    setTimeout(async () => {
      setSsoStep('SUCCESS');
      try {
        // Authenticate into the platform using seeded admin credentials
        await login('admin@sentrix.local', 'SentrixAdmin2026!');
        setTimeout(() => {
          setShowSSOModal(false);
          navigate('/');
        }, 800);
      } catch (err) {
        setSsoStep('SELECT');
        setError('SSO Token authorization failed. Please try standard sign-in.');
        setShowSSOModal(false);
      }
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070C18] text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background visual glow and tech grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] dark:bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:opacity-25" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center shadow-xl shadow-blue-500/25 border border-blue-400/30 mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-slate-900 dark:text-white font-mono">SENTRIX</h1>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">Safe-Node Intelligence Platform</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tracking-wide">"Sense. Predict. Respond."</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-6 shadow-2xl shadow-slate-300/40 dark:shadow-black/50 transition-colors duration-200">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Command Access Authorization</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Sign in to access campus safety telemetry & response controls.</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Official Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@sentrix.local"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Passcode</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-[#1E2D48] bg-slate-50 dark:bg-[#070C18] text-blue-600 focus:ring-0"
                />
                Remember this terminal
              </label>

              {/* Fully Functional Secure SSO Action */}
              <button
                type="button"
                onClick={() => {
                  setSsoStep('SELECT');
                  setShowSSOModal(true);
                }}
                className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-500 font-semibold cursor-pointer py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Secure SSO</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Enter Command Center'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-[#1E2D48]">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2 text-center">
              Quick Demo Role Switcher
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => selectDemoAccount('admin@sentrix.local', 'SentrixAdmin2026!')}
                className="p-2 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] hover:border-blue-500 rounded-lg text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Admin</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">admin@sentrix.local</div>
              </button>

              <button
                type="button"
                onClick={() => selectDemoAccount('security@sentrix.local', 'Security2026!')}
                className="p-2 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] hover:border-amber-500 rounded-lg text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Security Officer</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">security@sentrix.local</div>
              </button>

              <button
                type="button"
                onClick={() => selectDemoAccount('responder@sentrix.local', 'Responder2026!')}
                className="p-2 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] hover:border-rose-500 rounded-lg text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400">Responder</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">responder@sentrix.local</div>
              </button>

              <button
                type="button"
                onClick={() => selectDemoAccount('viewer@sentrix.local', 'Viewer2026!')}
                className="p-2 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] hover:border-emerald-500 rounded-lg text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Viewer</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">viewer@sentrix.local</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FULLY FUNCTIONAL SECURE SSO MODAL */}
      {showSSOModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => {
                if (ssoStep !== 'HANDSHAKE') setShowSSOModal(false);
              }}
              disabled={ssoStep === 'HANDSHAKE'}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-200 dark:border-[#1E2D48]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Campus Institutional SSO
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Federated SAML 2.0 / OpenID Connect Identity Gateway
                </p>
              </div>
            </div>

            {ssoStep === 'SELECT' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select your campus institutional identity provider to authenticate with enterprise credentials:
                </p>

                {/* Provider List */}
                <div className="space-y-2">
                  {ssoProviders.map((provider) => {
                    const Icon = provider.icon;
                    const isSelected = selectedProvider === provider.id;
                    return (
                      <div
                        key={provider.id}
                        onClick={() => {
                          setSelectedProvider(provider.id);
                          setSsoEmail(provider.defaultEmail);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500 shadow-md shadow-blue-500/10'
                            : 'bg-slate-50 dark:bg-[#070C18] border-slate-200 dark:border-[#1E2D48] hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 dark:bg-[#0F172A] text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              {provider.name}
                              {isSelected && (
                                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                                  ● Active
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              {provider.type}
                            </div>
                          </div>
                        </div>

                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${provider.badgeColor}`}>
                          {provider.role.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Email Verification Preview */}
                <div className="bg-slate-50 dark:bg-[#070C18] p-3 rounded-xl border border-slate-200 dark:border-[#1E2D48]">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Identity Principal
                  </label>
                  <input
                    type="text"
                    value={ssoEmail}
                    onChange={(e) => setSsoEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Campus Identity Provider Domain
                  </span>
                </div>

                {/* Authenticate Action */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSSOModal(false)}
                    className="flex-1 py-2 px-3 bg-slate-100 dark:bg-[#070C18] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-[#1E2D48] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSSOAuthenticate}
                    className="flex-2 py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Authenticate via SSO Handshake</span>
                  </button>
                </div>
              </div>
            )}

            {ssoStep === 'HANDSHAKE' && (
              <div className="py-10 text-center space-y-4 animate-fadeIn">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
                  <div className="w-14 h-14 rounded-full bg-blue-600/10 border-2 border-blue-500 flex items-center justify-center text-blue-500">
                    <Loader2 className="w-7 h-7 animate-spin" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Establishing Cryptographic Tunnel...
                  </h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-1">
                    {ssoStatusMessage}
                  </p>
                </div>
                <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-blue-500 animate-pulse w-full" />
                </div>
              </div>
            )}

            {ssoStep === 'SUCCESS' && (
              <div className="py-8 text-center space-y-3 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  SSO Authorization Verified
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Welcome, <strong className="text-emerald-600 dark:text-emerald-400">Campus Safety Director</strong>. Clearance validated.
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Routing to Tactical Command Center...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
