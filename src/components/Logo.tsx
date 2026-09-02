export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const scale = size === 'sm' ? 0.7 : size === 'lg' ? 1.3 : 1;
  return (
    <div className="flex items-center gap-2" style={{ transform: `scale(${scale})`, transformOrigin: 'left center' }}>
      <img 
        src="/favicon.png" 
        alt="SkateComp Logo" 
        style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} 
      />
      <div>
        <div className="font-bold text-white text-sm leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>SkateComp</div>
        <div className="text-xs leading-tight" style={{ color: '#8B7DAB', fontSize: 10 }}>Inline Skate Competition</div>
      </div>
    </div>
  );
}
