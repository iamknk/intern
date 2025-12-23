import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QualityBadgeProps {
  qualityScore: number;
}

interface QualityConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function getQualityConfig(score: number): QualityConfig {
  if (score > 85) {
    return {
      label: 'Excellent',
      variant: 'default',
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
    };
  } else if (score >= 70) {
    return {
      label: 'Good',
      variant: 'secondary',
      icon: CheckCircle,
      color: 'text-yellow-600 dark:text-yellow-400',
    };
  } else if (score >= 50) {
    return {
      label: 'Needs Review',
      variant: 'outline',
      icon: AlertTriangle,
      color: 'text-orange-600 dark:text-orange-400',
    };
  } else {
    return {
      label: 'Poor',
      variant: 'destructive',
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
    };
  }
}

export function QualityBadge({ qualityScore }: QualityBadgeProps) {
  const config = getQualityConfig(qualityScore);
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={config.variant} className="flex items-center gap-1 cursor-help">
            <Icon className={`w-3 h-3 ${config.color}`} />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{qualityScore}% confidence</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

