import React from 'react';
import {
  Construction,
  Lightbulb,
  Trash2,
  Droplets,
  Trees,
  ShieldAlert,
  Volume2,
  HelpCircle,
  LucideProps,
} from 'lucide-react';
import { CategoryType } from '../types';

interface CategoryIconProps extends LucideProps {
  category: CategoryType | string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, ...props }) => {
  switch (category) {
    case 'road':
      return <Construction {...props} />;
    case 'street_light':
      return <Lightbulb {...props} />;
    case 'garbage':
      return <Trash2 {...props} />;
    case 'water_supply':
      return <Droplets {...props} />;
    case 'tree_blocking':
      return <Trees {...props} />;
    case 'road_obstacle':
      return <ShieldAlert {...props} />;
    case 'noise':
      return <Volume2 {...props} />;
    case 'other':
    default:
      return <HelpCircle {...props} />;
  }
};
