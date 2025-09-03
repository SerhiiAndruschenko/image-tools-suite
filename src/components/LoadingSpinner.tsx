export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative">
        {/* Main spinning circle */}
        <div className="w-20 h-20 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
        
        {/* Secondary spinning circle with delay */}
        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDelay: '-0.5s' }}></div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-2 w-16 h-16 border-2 border-cyan-400 rounded-full animate-pulse opacity-60"></div>
        
        {/* Floating dots */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        </div>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <div className="absolute top-1/2 -left-2 transform -translate-y-1/2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <div className="absolute top-1/2 -right-2 transform -translate-y-1/2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
        </div>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
