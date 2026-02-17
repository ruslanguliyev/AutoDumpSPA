import type { ReactNode } from 'react';

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footerNote?: ReactNode;
};

const AuthLayout = ({ title, subtitle, children, footerNote }: AuthLayoutProps) => {
  return (
    <div data-theme="dark" className="min-h-screen bg-background text-foreground">
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(circle at center, rgba(var(--muted-foreground), 0.2) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative w-full max-w-[420px] rounded-2xl border border-border bg-card/95 p-6 shadow-[var(--shadow)] backdrop-blur sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              AD
            </div>
            <div className="text-sm font-semibold text-muted-foreground">AutoDump</div>
            <h1 className="mt-3 text-2xl font-semibold text-foreground">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>

          {children}
        </div>
      </div>

      {footerNote ? (
        <div className="-mt-8 flex justify-center pb-6 text-xs text-muted-foreground/70">
          {footerNote}
        </div>
      ) : null}
    </div>
  );
};

export default AuthLayout;
