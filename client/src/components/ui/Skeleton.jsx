export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function ProductSkeletonGrid() {
  return (
    <div className="product-grid">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="product-card" key={index}>
          <Skeleton className="product-media" />
          <Skeleton className="line wide" />
          <Skeleton className="line short" />
        </div>
      ))}
    </div>
  );
}
