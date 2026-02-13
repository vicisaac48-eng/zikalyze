const DashboardSkeleton = () => {
  return (
    <div className="md:ml-16 lg:ml-64 pb-bottom-nav md:pb-0">
      <div className="fixed inset-0 md:left-16 lg:left-64 pb-16 md:pb-0 z-30" style={{ backgroundColor: '#0a0f1a' }}>
        {/* Main content area skeleton */}
        <div className="p-4 space-y-4 h-full overflow-hidden">
          {/* Header */}
          <div className="h-16 bg-gray-800/50 rounded-xl skeleton-shimmer" />
          
          {/* Ticker */}
          <div className="h-12 bg-gray-800/50 rounded-lg skeleton-shimmer" />
          
          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-64 bg-gray-800/50 rounded-xl skeleton-shimmer" />
            <div className="h-64 bg-gray-800/50 rounded-xl skeleton-shimmer" />
          </div>
          
          {/* Metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                {/* Circular avatar */}
                <div className="h-12 w-12 bg-gray-800/50 rounded-full skeleton-shimmer" />
                {/* Text lines */}
                <div className="h-20 bg-gray-800/50 rounded-lg skeleton-shimmer" />
              </div>
            ))}
          </div>
          
          {/* Large content area */}
          <div className="h-96 bg-gray-800/50 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
