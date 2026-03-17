interface SectionDividerProps {
  fromColor?: string;
  toColor?: string;
  flip?: boolean;
}

const SectionDivider = ({ fromColor = 'hsl(var(--background))', toColor = 'hsl(var(--cream))', flip = false }: SectionDividerProps) => (
  <div className="relative -mt-px -mb-px" style={{ transform: flip ? 'scaleY(-1)' : undefined }}>
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className="w-full h-12 md:h-16 lg:h-20 block"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`wave-grad-${flip ? 'f' : 'n'}-${fromColor.replace(/[^a-z0-9]/gi, '')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fromColor} />
          <stop offset="100%" stopColor={toColor} />
        </linearGradient>
      </defs>
      <path
        d="M0,0 L0,40 Q360,80 720,40 Q1080,0 1440,40 L1440,0 Z"
        fill={fromColor}
      />
      <path
        d="M0,40 Q360,80 720,40 Q1080,0 1440,40 L1440,80 L0,80 Z"
        fill={toColor}
      />
    </svg>
  </div>
);

export default SectionDivider;
