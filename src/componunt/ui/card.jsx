export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white/0 backdrop-blur-3xl rounded-2xl shadow-xl 
      border border-white/50  overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`p-8 ${className}`}>
      {children}
    </div>
  );
}