// Minh họa nền trời: mây dải dẹt và máy bay vẽ một nét bay từ ghim vị trí. Chỉ trang trí, ẩn trên màn hình nhỏ.
export function HeroDecor() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 520 380"
      className="pointer-events-none hidden w-full max-w-[560px] justify-self-end md:block"
    >
      <g className="fill-white/80">
        <rect x="250" y="14" width="200" height="16" rx="8" />
        <rect x="300" y="38" width="130" height="14" rx="7" />
        <rect x="330" y="340" width="180" height="16" rx="8" />
        <rect x="380" y="362" width="120" height="14" rx="7" />
      </g>
      <g className="fill-primary/10">
        <rect x="0" y="338" width="210" height="14" rx="7" />
        <rect x="50" y="358" width="150" height="12" rx="6" />
      </g>
      <g
        transform="translate(50 50) scale(1.35)"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-primary"
      >
        <path d="M64 192C112 206 152 190 158 150C164 116 192 112 212 100" strokeDasharray="1 9" />
        <g transform="translate(50 160)">
          <path d="M0 -22C-12 -22 -20 -13 -20 -3C-20 12 0 32 0 32C0 32 20 12 20 -3C20 -13 12 -22 0 -22Z" />
          <circle cx="0" cy="-3" r="6" />
        </g>
        <g transform="translate(250 70) rotate(45) translate(-50 -50) scale(1.15) translate(-7 -7)" strokeWidth="1.8">
          <path d="M50 6C54 6 56 12 56 22V40C70 48 84 56 92 62C93 64 93 68 91 69L56 58V78C60 82 64 85 66 88C67 90 67 93 65 93L50 89L35 93C33 93 33 90 34 88C36 85 40 82 44 78V58L9 69C7 68 7 64 8 62C16 56 30 48 44 40V22C44 12 46 6 50 6Z" />
        </g>
      </g>
    </svg>
  );
}
