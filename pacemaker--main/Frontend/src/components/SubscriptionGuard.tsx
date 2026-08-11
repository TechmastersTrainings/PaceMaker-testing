'use client';

import { useSubscription, FeatureKey } from '@/hooks/useSubscription';
import SubscribeBlock from './SubscribeBlock';

interface Props {
  feature: FeatureKey;
  featureName?: string;
  children: React.ReactNode;
}

export default function SubscriptionGuard({ feature, featureName, children }: Props) {
  const { loading, canAccess } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!canAccess(feature)) {
    return <SubscribeBlock featureName={featureName} />;
  }

  return <>{children}</>;
}
