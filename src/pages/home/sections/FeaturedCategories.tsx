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
  { icon: Disc, labelKey: 'categories.brakeRotors', slug: 'brake-rotors' },
  { icon: Droplet, labelKey: 'categories.engineOil', slug: 'engine-oil' },
  { icon: Zap, labelKey: 'categories.sparkPlugs', slug: 'spark-plugs' },
  { icon: Battery, labelKey: 'categories.batteries', slug: 'batteries' },
  { icon: CircleDot, labelKey: 'categories.tires', slug: 'tires' },
  { icon: Gauge, labelKey: 'categories.suspension', slug: 'suspension' },
  { icon: Lightbulb, labelKey: 'categories.headlights', slug: 'headlights' },
  { icon: Filter, labelKey: 'categories.filters', slug: 'filters' },
  { icon: Wind, labelKey: 'categories.exhaust', slug: 'exhaust' },
  { icon: CircleOff, labelKey: 'categories.wheels', slug: 'wheels' },
  { icon: Armchair, labelKey: 'categories.interior', slug: 'interior' },
  { icon: Cpu, labelKey: 'categories.electronics', slug: 'electronics' },
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
            label={t(category.labelKey)}
            href={`/parts?category=${category.slug}`}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
