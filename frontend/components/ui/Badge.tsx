import { ReactNode } from 'react';

interface BadgeProps {
  text: string;
  icon?: ReactNode;
  variant?: 'blue' | 'purple' | 'green' | 'red' | 'yellow';
  className?: string;
}

const variantStyles = {
  blue: {
    text: 'text-blue-800',
    bg: 'bg-blue-400/10',
    border: 'border-blue-200',
    iconStroke: '#2563eb',
  },
  purple: {
    text: 'text-purple-800',
    bg: 'bg-purple-400/10',
    border: 'border-purple-200',
    iconStroke: '#9333ea',
  },
  green: {
    text: 'text-green-800',
    bg: 'bg-green-400/10',
    border: 'border-green-200',
    iconStroke: '#16a34a',
  },
  red: {
    text: 'text-red-800',
    bg: 'bg-red-400/10',
    border: 'border-red-200',
    iconStroke: '#dc2626',
  },
  yellow: {
    text: 'text-yellow-800',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-200',
    iconStroke: '#ca8a04',
  },
};

const getDefaultIcon = (strokeColor: string) => (
  <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1.613 8.2a.62.62 0 0 1-.553-.341.59.59 0 0 1 .076-.637l6.048-6.118a.31.31 0 0 1 .375-.069c.061.033.11.084.137.147a.3.3 0 0 1 .014.197L6.537 4.991a.59.59 0 0 0 .07.552.61.61 0 0 0 .504.257h4.276a.62.62 0 0 1 .553.341.59.59 0 0 1-.076.637l-6.048 6.119a.31.31 0 0 1-.375.067.295.295 0 0 1-.15-.344l1.172-3.61a.59.59 0 0 0-.07-.553.61.61 0 0 0-.504-.257z"
      stroke={strokeColor}
      strokeMiterlimit="5.759"
      strokeLinecap="round"
    />
  </svg>
);

export default function Badge({ text, icon, variant = 'blue', className = '' }: BadgeProps) {
  const styles = variantStyles[variant];
  const displayIcon = icon || getDefaultIcon(styles.iconStroke);

  return (
    <div
      className={`flex items-center mt-5 gap-2 text-sm ${styles.text} ${styles.bg} border ${styles.border} rounded-full px-4 py-1 w-fit mx-auto mb-6 ${className}`}
    >
      {displayIcon}
      <span>{text}</span>
    </div>
  );
}

