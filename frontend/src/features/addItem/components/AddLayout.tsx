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
      <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:bottom-4 sm:mx-0 sm:rounded-[var(--radius-card)] sm:border sm:bg-card/95 sm:p-4 sm:shadow-[var(--shadow-card)]">
        {footer}
      </div>
    </div>
  );
};

export default AddLayout;
