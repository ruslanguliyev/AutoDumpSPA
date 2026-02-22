import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

type SectionHeaderProps = {
  title: string;
  linkText?: string;
  linkHref?: string;
  className?: string;
};

const SectionHeader = ({
  title,
  linkText,
  linkHref,
  className = '',
}: SectionHeaderProps) => {
  return (
    <div className={`mb-6 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        <div className="h-6 w-1 rounded-full bg-warning" />
        <h2 className="text-lg font-bold uppercase tracking-wide text-foreground">
          {title}
        </h2>
      </div>
      {linkText && linkHref && (
        <Link
          to={linkHref}
          className="flex items-center gap-1 text-sm font-medium text-warning transition-colors hover:text-warning/80"
        >
          {linkText}
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
