export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const scale = size === 'sm' ? 0.7 : size === 'lg' ? 1.3 : 1;
  return (
    <div className="flex items-center gap-2" style={{ transform: `scale(${scale})`, transformOrigin: 'left center' }}>
      <div style={{ width: 36, height: 36, background: '#1e1040', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/*
          Inline skater running RIGHT:
          - head top-left area, body leaning forward to the right
          - left arm swings back-up, right arm swings forward-down
          - right leg strides forward with inline skate blade
          - left leg pushes off behind with inline skate blade
          - wavy speed lines to the LEFT of the figure
        */}
        <svg width="30" height="30" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">

          {/* Head */}
          <circle cx="13" cy="5" r="3" fill="#A78BFA"/>

          {/* Torso: lean forward to the right, shoulder→hip */}
          <path d="M14 8 L20 14" stroke="#A78BFA" strokeWidth="2.2" strokeLinecap="round"/>

          {/* Left arm (behind body): swings up-back to the left */}
          <path d="M16 10 L10 8" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round"/>

          {/* Right arm (front): swings forward-down to the right */}
          <path d="M18 11 L24 14" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round"/>

          {/* Right leg (front/stride): hip→knee→inline blade pointing right */}
          <path d="M20 14 L24 20 L30 21" stroke="#A78BFA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>

          {/* Left leg (push-off): hip→knee→inline blade angled behind */}
          <path d="M20 14 L16 20 L11 22" stroke="#A78BFA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>

          {/* === 3 wavy speed lines to the LEFT === */}
          <path d="M2 10 C3 8.8, 4.2 8.8, 5.2 10 C6.2 11.2, 7.4 11.2, 8.4 10"   stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M2 14 C3 12.8, 4.2 12.8, 5.2 14 C6.2 15.2, 7.4 15.2, 8.4 14" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M2 18 C3 16.8, 4.2 16.8, 5.2 18 C6.2 19.2, 7.4 19.2, 8.4 18" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" fill="none"/>

        </svg>
      </div>
      <div>
        <div className="font-bold text-white text-sm leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>SkateComp</div>
        <div className="text-xs leading-tight" style={{ color: '#8B7DAB', fontSize: 10 }}>Inline Skate Competition</div>
      </div>
    </div>
  );
}
