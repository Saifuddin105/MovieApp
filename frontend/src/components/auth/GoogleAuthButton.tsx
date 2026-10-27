import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Info, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number | string;
            },
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleAuthButtonProps {
  mode?: 'signin' | 'signup';
  fromPath?: string;
  onError?: (error: string) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  mode = 'signin',
  fromPath = '/',
  onError,
}) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoName, setDemoName] = useState('Alex Rivera');
  const [demoEmail, setDemoEmail] = useState('alex.rivera@gmail.com');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = async (credential: string) => {
    try {
      setIsLoading(true);
      await loginWithGoogle({ idToken: credential });
      navigate(fromPath, { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Google authentication failed. Please try again.';
      if (onError) onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!googleClientId) return;

    // Load Google Identity Services script if not already present
    const scriptId = 'google-gsi-client';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (res) => handleCredentialResponse(res.credential),
          });
        }
      };
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (res) => handleCredentialResponse(res.credential),
      });
    }
  }, [googleClientId]);

  const handleButtonClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (e) {
        setDemoModalOpen(true);
      }
    } else {
      // Show smooth setup & demo modal if client ID is not yet provided in .env
      setDemoModalOpen(true);
    }
  };

  const handleDemoSignIn = async () => {
    try {
      setIsLoading(true);
      setDemoModalOpen(false);
      await loginWithGoogle({
        idToken: `demo-google-${Date.now()}`,
        demoUser: {
          name: demoName.trim(),
          email: demoEmail.trim(),
          picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
            demoName,
          )}`,
        },
      });
      navigate(fromPath, { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Google authentication failed. Please try again.';
      if (onError) onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const label = mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google';

  return (
    <>
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isLoading}
        className="w-full relative flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#161b26] hover:bg-[#1d2332] active:bg-[#121620] border border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white font-medium text-sm transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed group"
      >
        {/* Google Multicolored SVG Logo */}
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>

        <span>{isLoading ? 'Connecting to Google...' : label}</span>
      </button>

      {/* Google Setup & Demo Quick-Login Modal */}
      <Modal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        title="Google Authentication"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2.5">
            <Info className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-300">
                Google OAuth Setup Instructions
              </p>
              <p className="leading-relaxed text-slate-300">
                To connect real Google accounts, obtain a Client ID from{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 underline"
                >
                  Google Cloud Console
                </a>{' '}
                and add <code className="bg-black/30 px-1 py-0.5 rounded text-amber-300">VITE_GOOGLE_CLIENT_ID</code> to{' '}
                <code className="bg-black/30 px-1 py-0.5 rounded text-amber-300">frontend/.env</code>.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Instant Local Demo Testing</span>
            </div>
            <p className="text-xs text-slate-400">
              You can test the complete Google registration/login flow and database synchronization right now using a demo Google profile:
            </p>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Google Display Name</label>
              <input
                type="text"
                value={demoName}
                onChange={(e) => setDemoName(e.target.value)}
                className="w-full bg-[#181d2a] border border-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                placeholder="Google User Name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Google Email</label>
              <input
                type="email"
                value={demoEmail}
                onChange={(e) => setDemoEmail(e.target.value)}
                className="w-full bg-[#181d2a] border border-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                placeholder="Google Email"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDemoModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isLoading}
              onClick={handleDemoSignIn}
            >
              Continue as Google User
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

