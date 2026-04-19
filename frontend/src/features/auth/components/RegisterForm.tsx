import { useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, User } from 'lucide-react';

import { useRegister } from '@/features/auth/api/useRegister';
import { useCurrentUser } from '@/features/auth/api/useCurrentUser';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { validateRegister } from '@/features/auth/utils/validation';

import './AuthFormFields.scss';

type TouchedState = {
  fullName: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
  termsAccepted: boolean;
};

/* Левый отступ текста от иконки задаётся в AuthFormFields.scss (.auth-input-with-left-icon). Поле с иконкой справа (пароль): pr-16. */
const inputBase =
  'auth-input-with-left-icon box-border w-full rounded-xl border border-border bg-secondary/80 py-3 pr-4 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const iconLeft = 'absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/80 shrink-0';

const RegisterForm = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const registerMutation = useRegister();
  const currentUserQuery = useCurrentUser({ enabled: false });

  const [values, setValues] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });
  const [touched, setTouched] = useState<TouchedState>({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    termsAccepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const errors = useMemo(
    () =>
      validateRegister({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        termsAccepted: values.termsAccepted,
      }),
    [values]
  );

  const isValid = Object.keys(errors).length === 0;
  const isSubmitting = registerMutation.isPending || currentUserQuery.isFetching;
  const rawServerError =
    registerMutation.error instanceof Error ? registerMutation.error.message : null;
  const serverError = useMemo(() => {
    if (!rawServerError) return null;
    if (rawServerError === 'Account already exists for this email') return t('errors.emailExists');
    if (rawServerError === 'Email is required') return t('validation.emailRequired');
    return rawServerError;
  }, [rawServerError, t]);

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
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true,
    });

    if (!isValid || isSubmitting) return;

    try {
      const result = await registerMutation.mutateAsync({
        fullName: values.fullName,
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
          {t('register.fullName')}
        </label>
        <div className="relative">
          <User className={iconLeft} aria-hidden="true" />
          <input
            type="text"
            autoComplete="name"
            className={`${inputBase} ${showError('fullName')
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-border'
              }`}
            placeholder={t('register.fullNamePlaceholder')}
            value={values.fullName}
            onChange={(event) => {
              setValues((prev) => ({ ...prev, fullName: event.target.value }));
              registerMutation.reset();
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
            aria-invalid={Boolean(showError('fullName'))}
            aria-describedby={showError('fullName') ? 'register-fullname-error' : undefined}
          />
        </div>
        {showError('fullName') ? (
          <p id="register-fullname-error" className="mt-1 text-xs text-destructive">
            {t(errors.fullName!)}
          </p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {t('register.email')}
        </label>
        <div className="relative">
          <Mail className={iconLeft} aria-hidden="true" />
          <input
            type="email"
            autoComplete="email"
            className={`${inputBase} ${showError('email')
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-border'
              }`}
            placeholder={t('register.emailPlaceholder')}
            value={values.email}
            onChange={(event) => {
              setValues((prev) => ({ ...prev, email: event.target.value }));
              registerMutation.reset();
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            aria-invalid={Boolean(showError('email'))}
            aria-describedby={showError('email') ? 'register-email-error' : undefined}
          />
        </div>
        {showError('email') ? (
          <p id="register-email-error" className="mt-1 text-xs text-destructive">
            {t(errors.email!)}
          </p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {t('register.password')}
        </label>
        <div className="relative">
          <Lock className={iconLeft} aria-hidden="true" />
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className={`${inputBase} pr-16 ${showError('password')
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-border'
              }`}
            placeholder={t('register.passwordPlaceholder')}
            value={values.password}
            onChange={(event) => {
              setValues((prev) => ({ ...prev, password: event.target.value }));
              registerMutation.reset();
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            aria-invalid={Boolean(showError('password'))}
            aria-describedby={showError('password') ? 'register-password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 shrink-0 text-foreground/70 transition hover:text-foreground"
            aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {showError('password') ? (
          <p id="register-password-error" className="mt-1 text-xs text-destructive">
            {t(errors.password!)}
          </p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {t('register.confirmPassword')}
        </label>
        <div className="relative">
          <Lock className={iconLeft} aria-hidden="true" />
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className={`${inputBase} ${showError('confirmPassword')
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-border'
              }`}
            placeholder={t('register.confirmPasswordPlaceholder')}
            value={values.confirmPassword}
            onChange={(event) => {
              setValues((prev) => ({
                ...prev,
                confirmPassword: event.target.value,
              }));
              registerMutation.reset();
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
            aria-invalid={Boolean(showError('confirmPassword'))}
            aria-describedby={
              showError('confirmPassword') ? 'register-confirm-error' : undefined
            }
          />
        </div>
        {showError('confirmPassword') ? (
          <p id="register-confirm-error" className="mt-1 text-xs text-destructive">
            {t(errors.confirmPassword!)}
          </p>
        ) : null}
      </div>

      <div>
        <label className="flex cursor-pointer items-center gap-4 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={values.termsAccepted}
            onChange={(event) => {
              setValues((prev) => ({ ...prev, termsAccepted: event.target.checked }));
              registerMutation.reset();
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, termsAccepted: true }))}
            className="h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/50 bg-secondary/80 accent-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="ml-2 leading-tight">
            {t('register.termsPrefix')}{' '}
            <button
              type="button"
              onClick={() => console.info('Terms of Service not implemented yet.')}
              className="font-semibold text-foreground transition hover:text-primary"
            >
              {t('register.termsLink')}
            </button>{' '}
            {t('register.and')}{' '}
            <button
              type="button"
              onClick={() => console.info('Privacy Policy not implemented yet.')}
              className="font-semibold text-foreground transition hover:text-primary"
            >
              {t('register.privacyLink')}
            </button>
            {t('register.termsSuffix')}
          </span>
        </label>
        {showError('termsAccepted') ? (
          <p className="mt-1 text-xs text-destructive">{t(errors.termsAccepted!)}</p>
        ) : null}
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
            {t('register.submitLoading')}
          </>
        ) : (
          t('register.submit')
        )}
      </button>

      <button
        type="button"
        onClick={() => console.info('Google login not implemented yet.')}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/40 text-sm font-semibold text-foreground transition duration-200 hover:bg-muted/50"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background text-base font-bold text-foreground">
          G
        </span>
        {t('register.signUpWithGoogle')}
      </button>

      <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          {t('register.securityNote')}
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        {t('register.haveAccount')}{' '}
        <Link className="text-primary transition hover:text-primary/80" to="/login">
          {t('register.loginLink')}
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
