import React from 'react';
import * as Icons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = '', size = 24 }) => {
  // Safe lookup for dynamic icons
  const LucideIcon = (Icons as any)[name];

  if (!LucideIcon) {
    // Fallback icon if name not found
    const DefaultIcon = Icons.HelpCircle;
    return <DefaultIcon className={className} size={size} />;
  }

  return <LucideIcon className={className} size={size} />;
};
