import React from 'react';
import {
  Home,
  TrendingUp,
  ShieldAlert,
  Plane,
  GraduationCap,
  Sparkles,
  HeartHandshake,
  HelpCircle,
  LucideProps
} from 'lucide-react';

interface JarIconProps extends LucideProps {
  name: string;
}

export const JarIcon: React.FC<JarIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'Home':
      return <Home {...props} />;
    case 'TrendingUp':
      return <TrendingUp {...props} />;
    case 'ShieldAlert':
      return <ShieldAlert {...props} />;
    case 'Plane':
      return <Plane {...props} />;
    case 'GraduationCap':
      return <GraduationCap {...props} />;
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'HeartHandshake':
      return <HeartHandshake {...props} />;
    default:
      return <HelpCircle {...props} />;
  }
};
