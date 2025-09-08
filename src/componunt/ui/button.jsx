export function Button({ 
  children, 
  className = '',
  variant = 'primary',
  ...props 
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white',
    secondary: 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50',
    ghost: 'bg-transparent text-indigo-600 hover:bg-indigo-50'
  };

  return (
    <button
      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 
      shadow-md hover:shadow-lg active:scale-[0.98] ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}