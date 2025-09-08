export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-4 py-3 rounded-xl border border-gray-300 
      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
      transition-all duration-200 ${className}`}
      {...props}
    />
  );
}