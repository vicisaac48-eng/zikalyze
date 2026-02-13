const DashboardSkeleton = () => {
  return (
    <div className="md:ml-16 lg:ml-64 pb-bottom-nav md:pb-0">
      <div 
        className="fixed inset-0 md:left-16 lg:left-64 pb-16 md:pb-0 z-30 skeleton-fade-in" 
        style={{ 
          backgroundColor: '#0a0f1a',
          backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(112, 255, 193, 0.03) 0%, transparent 50%)'
        }}
      >
        {/* Main content area skeleton with professional design */}
        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 h-full overflow-hidden">
          {/* Header skeleton */}
          <div className="h-14 sm:h-16 bg-gray-800/40 rounded-xl skeleton-shimmer skeleton-pulse backdrop-blur-sm" />
          
          {/* Ticker skeleton */}
          <div className="h-10 sm:h-12 bg-gray-800/40 rounded-lg skeleton-shimmer skeleton-pulse backdrop-blur-sm" />
          
          {/* Time filter skeleton */}
          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="h-8 w-12 bg-gray-800/40 rounded-lg skeleton-shimmer flex-shrink-0"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          
          {/* On-chain metrics skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="h-20 sm:h-24 bg-gray-800/40 rounded-xl skeleton-shimmer skeleton-pulse backdrop-blur-sm"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          
          {/* Charts row skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-3">
              <div className="h-6 w-32 bg-gray-800/40 rounded skeleton-shimmer" />
              <div className="h-56 sm:h-64 md:h-72 bg-gray-800/40 rounded-xl skeleton-shimmer skeleton-pulse backdrop-blur-sm" />
            </div>
            <div className="space-y-3">
              <div className="h-6 w-40 bg-gray-800/40 rounded skeleton-shimmer" />
              <div className="h-56 sm:h-64 md:h-72 bg-gray-800/40 rounded-xl skeleton-shimmer skeleton-pulse backdrop-blur-sm" />
            </div>
          </div>
          
          {/* AI Metrics cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="space-y-3 p-4 bg-gray-800/30 rounded-xl skeleton-shimmer backdrop-blur-sm"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Circular avatar */}
                <div className="h-10 w-10 bg-gray-700/50 rounded-full skeleton-shimmer" />
                {/* Title */}
                <div className="h-4 w-24 bg-gray-700/50 rounded skeleton-shimmer" />
                {/* Value */}
                <div className="h-8 w-32 bg-gray-700/50 rounded skeleton-shimmer" />
                {/* Description */}
                <div className="h-3 w-full bg-gray-700/50 rounded skeleton-shimmer" />
                <div className="h-3 w-3/4 bg-gray-700/50 rounded skeleton-shimmer" />
              </div>
            ))}
          </div>
          
          {/* Large content area skeleton */}
          <div className="space-y-3">
            <div className="h-6 w-48 bg-gray-800/40 rounded skeleton-shimmer" />
            <div className="h-80 sm:h-96 bg-gray-800/40 rounded-xl skeleton-shimmer skeleton-pulse backdrop-blur-sm" />
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

export default DashboardSkeleton;
