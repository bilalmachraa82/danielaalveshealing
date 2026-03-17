interface SectionFadeProps {
  from: string;
  to: string;
  height?: string;
}

const SectionFade = ({ from, to, height = '100px' }: SectionFadeProps) => (
  <div
    className="w-full -mt-px -mb-px relative z-10 pointer-events-none"
    style={{
      height,
      background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
    }}
    aria-hidden="true"
  />
);

export default SectionFade;
