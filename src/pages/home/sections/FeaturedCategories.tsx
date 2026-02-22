import { useTranslation } from 'react-i18next';
import {
  Disc,
  Droplet,
  Zap,
  Battery,
  CircleDot,
  Gauge,
  Lightbulb,
  Filter,
  Wind,
  CircleOff,
  Armchair,
  Cpu,
} from 'lucide-react';
import CategoryCard from '@/shared/ui/CategoryCard';
import SectionHeader from '@/shared/ui/SectionHeader';

const CATEGORIES = [
  { icon: Disc, label: 'Brake Rotors', slug: 'brake-rotors' },
  { icon: Droplet, label: 'Engine Oil', slug: 'engine-oil' },
  { icon: Zap, label: 'Spark Plugs', slug: 'spark-plugs' },
  { icon: Battery, label: 'Batteries', slug: 'batteries' },
  { icon: CircleDot, label: 'Tires', slug: 'tires' },
  { icon: Gauge, label: 'Suspension', slug: 'suspension' },
  { icon: Lightbulb, label: 'Headlights', slug: 'headlights' },
  { icon: Filter, label: 'Filters', slug: 'filters' },
  { icon: Wind, label: 'Exhaust', slug: 'exhaust' },
  { icon: CircleOff, label: 'Wheels', slug: 'wheels' },
  { icon: Armchair, label: 'Interior', slug: 'interior' },
  { icon: Cpu, label: 'Electronics', slug: 'electronics' },
];

const FeaturedCategories = () => {
  const { t } = useTranslation('home');

  return (
    <section className="py-8">
      <SectionHeader
        title={t('sections.featuredCategories', 'Featured Categories')}
        linkText={t('common.viewAll', 'View All')}
        linkHref="/parts"
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {CATEGORIES.map((category) => (
          <CategoryCard
            key={category.slug}
            icon={<category.icon size={28} strokeWidth={1.5} />}
            label={category.label}
            href={`/parts?category=${category.slug}`}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
