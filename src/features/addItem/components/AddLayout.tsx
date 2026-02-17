import type { ReactNode } from 'react';

type AddLayoutProps = {
  stepper: ReactNode;
  preview: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

const AddLayout = ({ stepper, preview, footer, children }: AddLayoutProps) => {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-28 pt-8">
      <div className="mb-6">{stepper}</div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">{children}</section>
        <aside className="h-fit lg:sticky lg:top-24">{preview}</aside>
      </div>
      <div className="sticky bottom-4 z-20 mt-8">
        <div className="rounded-2xl border border-border bg-card/95 p-4 shadow-[var(--shadow)] backdrop-blur">
          {footer}
        </div>
      </div>
    </div>
  );
};

export default AddLayout;
