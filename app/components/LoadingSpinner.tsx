

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-6 border-amber-500 border-t-transparent animate-spin"></div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
