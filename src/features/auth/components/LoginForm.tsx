import { useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';

import { useLogin } from '@/features/auth/api/useLogin';
import { useCurrentUser } from '@/features/auth/api/useCurrentUser';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { validateLogin } from '@/features/auth/utils/validation';

type TouchedState = {
  email: boolean;
  password: boolean;
};

/* Иконка: left-4 (16px), ширина 16px → заканчивается на 32px. Отступ текста от иконки: pl-16 (64px) → зазор 32px. Справа для кнопки/иконки: pr-16. */
const inputBase =
  'box-border w-full rounded-xl border border-border bg-secondary/80 py-3 pl-16 pr-16 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const iconLeft = 'absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/80 shrink-0';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const loginMutation = useLogin();
  const currentUserQuery = useCurrentUser({ enabled: false });

  const [values, setValues] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [touched, setTouched] = useState<TouchedState>({
    email: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const errors = useMemo(
    () =>
      validateLogin({
        email: values.email,
        password: values.password,
      }),
    [values.email, values.password]
  );

  const isValid = Object.keys(errors).length === 0;
  const isSubmitting = loginMutation.isPending || currentUserQuery.isFetching;
  const serverError =
    loginMutation.error instanceof Error ? loginMutation.error.message : null;

  const showError = (field: keyof TouchedState) => touched[field] && errors[field];

  const redirectTo = useMemo(() => {
    const from = location.state?.from;
    if (from?.pathname) {
      return `${from.pathname}${from.search ?? ''}`;
    }
    return '/';
  }, [location.state]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ email: true, password: true });

    if (!isValid || isSubmitting) return;

    try {
      const result = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
      setAccessToken(result.accessToken);
      setUser(result.user);
      await currentUserQuery.refetch();
      navigate(redirectTo, { replace: true });
    } catch {
      // handled by mutation error state
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Email
        </label>
        <div className="relative">
          <Mail className={iconLeft} aria-hidden="true" />
          <input
            type="email"
            autoComplete="email"
            className={`${inputBase} ${
              showError('email')
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-border'
            }`}
            placeholder="name@company.com"
            value={values.email}
            onChange={(event) => {
              setValues((prev) => ({ ...prev, email: event.target.value }));
              loginMutation.reset();
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            aria-invalid={Boolean(showError('email'))}
            aria-describedby={showError('email') ? 'login-email-error' : undefined}
          />
          {showError('email') ? (
            <AlertCircle
              className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-destructive"
              aria-hidden="true"
            />
          ) : null}
        </div>
        {showError('email') ? (
          <p id="login-email-error" className="mt-1 text-xs text-destructive">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Password
        </label>
        <div className="relative">
          <Lock className={iconLeft} aria-hidden="true" />
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className={`${inputBase} ${
              showError('password')
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-border'
            }`}
            placeholder="••••••••"
            value={values.password}
            onChange={(event) => {
              setValues((prev) => ({ ...prev, password: event.target.value }));
              loginMutation.reset();
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            aria-invalid={Boolean(showError('password'))}
            aria-describedby={showError('password') ? 'login-password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 shrink-0 text-foreground/70 transition hover:text-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {showError('password') ? (
          <p id="login-password-error" className="mt-1 text-xs text-destructive">
            {errors.password}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={values.remember}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, remember: event.target.checked }))
            }
            className="h-4 w-4 accent-primary"
          />
          Remember me
        </label>
        <button
          type="button"
          className="text-primary transition hover:text-primary/80"
          onClick={() => console.info('Password reset not implemented yet.')}
        >
          Forgot password?
        </button>
      </div>

      {serverError ? (
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          role="alert"
        >
          {serverError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow transition duration-200 hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/60 border-t-transparent" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        Or continue with
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={() => console.info('Google login not implemented yet.')}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/40 text-sm font-semibold text-foreground transition duration-200 hover:bg-muted/50"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background text-base font-bold text-foreground">
          G
        </span>
        Continue with Google
      </button>

      <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          Your data is securely encrypted and never shared.
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link className="text-primary transition hover:text-primary/80" to="/register">
          Register
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
