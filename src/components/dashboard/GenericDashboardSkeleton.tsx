/**
 * Generic Dashboard Page Skeleton
 * 
 * Professional loading skeleton with glassmorphism and diagonal shimmer animation.
 * Used across all dashboard pages for consistent UX on native mobile apps.
 * 
 * @returns {JSX.Element} Full-page skeleton loader with professional animations
 */
const GenericDashboardSkeleton = () => {
  return (
    <div className="md:ml-16 lg:ml-64 pb-bottom-nav md:pb-0">
      <div 
        className="fixed inset-0 md:left-16 lg:left-64 pb-16 md:pb-0 z-30 skeleton-fade-in" 
        style={{ 
          backgroundColor: '#0a0f1a',
          backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(112, 255, 193, 0.03) 0%, transparent 50%)'
        }}
        role="status"
        aria-live="polite"
        aria-label="Loading content"
      >
        {/* Main content area skeleton with professional design */}
        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 h-full overflow-hidden">
          {/* Header skeleton */}
          <div className="h-14 sm:h-16 bg-gray-800/40 rounded-xl skeleton-shimmer skeleton-pulse backdrop-blur-sm" />
          
          {/* Action bar skeleton */}
          <div className="flex gap-2 sm:gap-3">
            <div className="h-10 flex-1 bg-gray-800/40 rounded-lg skeleton-shimmer skeleton-pulse backdrop-blur-sm" />
            <div className="h-10 w-24 sm:w-32 bg-gray-800/40 rounded-lg skeleton-shimmer skeleton-pulse backdrop-blur-sm" />
          </div>
          
          {/* Cards grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="h-32 sm:h-36 bg-gray-800/40 rounded-xl skeleton-shimmer skeleton-pulse backdrop-blur-sm"
                style={{ animationDelay: `${i * 0.08}s` }}
              />
            ))}
          </div>
          
          {/* Large content blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-3">
              <div className="h-6 w-32 bg-gray-800/40 rounded skeleton-shimmer" />
              <div className="h-64 sm:h-72 bg-gray-800/40 rounded-xl skeleton-shimmer skeleton-pulse backdrop-blur-sm" />
            </div>
            <div className="space-y-3">
              <div className="h-6 w-40 bg-gray-800/40 rounded skeleton-shimmer" />
              <div className="h-64 sm:h-72 bg-gray-800/40 rounded-xl skeleton-shimmer skeleton-pulse backdrop-blur-sm" />
            </div>
          </div>
          
          {/* Bottom content area */}
          <div className="space-y-3">
            <div className="h-6 w-48 bg-gray-800/40 rounded skeleton-shimmer" />
            <div className="h-48 sm:h-64 bg-gray-800/40 rounded-xl skeleton-shimmer skeleton-pulse backdrop-blur-sm" />
          </div>
        </div>
        
        {/* Subtle overlay for smooth transition */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/10 pointer-events-none"
        />
      </div>
    </div>
  );
};

export default GenericDashboardSkeleton;