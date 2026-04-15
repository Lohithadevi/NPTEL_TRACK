export default function SkeletonCard() {
  return (
    <div className="bg-navy-800 border border-navy-700 rounded p-6 animate-pulse">
      <div className="h-4 bg-navy-700 rounded w-1/3 mb-3"></div>
      <div className="h-3 bg-navy-700 rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-navy-700 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-navy-700 rounded w-1/4"></div>
    </div>
  );
}
