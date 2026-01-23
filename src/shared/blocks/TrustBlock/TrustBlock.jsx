import { ShieldCheck, Check } from 'lucide-react';

/**
 * TrustBlock component for displaying trust/safety information.
 * 
 * Props:
 * - variant: 'car' | 'part' (default: 'car')
 *   - 'car' → Safety Tips content
 *   - 'part' → Buyer Protection content
 */
export const TrustBlock = ({ variant = 'car' }) => {
  if (variant === 'part') {
    // Buyer Protection variant (for parts)
    return (
      <div className="rounded-xl border border-border bg-secondary/10 p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-extrabold text-foreground">
          <ShieldCheck size={16} className="text-primary" aria-hidden="true" />
          Buyer protection
        </div>
        <div className="mt-2 flex flex-col gap-2 font-semibold">
          <span className="inline-flex items-center gap-2">
            <Check size={14} className="text-emerald-600" aria-hidden="true" />
            Verified seller
          </span>
          <span className="inline-flex items-center gap-2">
            <Check size={14} className="text-emerald-600" aria-hidden="true" />
            Secure payment
          </span>
        </div>
      </div>
    );
  }

  // Safety Tips variant (for cars)
  const safetyTips = [
    'Meet the seller in a safe public location',
    'Inspect the car thoroughly before purchase',
    'Never pay in advance without seeing the car',
    'Check all documents carefully',
  ];

  return (
    <div className="safety-tips">
      <h3 className="section-title">
        <ShieldCheck size={18} aria-hidden="true" />
        Safety Tips
      </h3>
      <ul>
        {safetyTips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </div>
  );
};
