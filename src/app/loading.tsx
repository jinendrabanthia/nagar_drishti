import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-[100]">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-100/50 rounded-full blur-[80px] -z-10"></div>
      
      <div className="relative flex flex-col items-center">
        {/* Logo Container with animations */}
        <div className="relative w-24 h-24 mb-6">
          {/* Pulsing ring behind logo */}
          <div className="absolute inset-0 rounded-full border-2 border-teal-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          
          <div className="relative w-full h-full rounded-full shadow-xl shadow-teal-500/20 overflow-hidden border-2 border-white animate-pulse">
            <Image 
              src="/logo.jpg" 
              alt="Loading..." 
              fill 
              className="object-cover"
              priority
            />
          </div>
        </div>
        
        {/* Text */}
        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          Nagar Drishti
        </h2>
        <p className="text-slate-500 text-sm mt-2 font-medium">
          Loading civic data...
        </p>

        {/* Loading Bar */}
        <div className="w-32 h-1.5 bg-slate-200 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full animate-[progress_1.5s_ease-in-out_infinite] origin-left" style={{ width: '100%' }}></div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); transform-origin: left; }
          50% { transform: scaleX(1); transform-origin: left; }
          50.1% { transform: scaleX(1); transform-origin: right; }
          100% { transform: scaleX(0); transform-origin: right; }
        }
      `}</style>
    </div>
  );
}
