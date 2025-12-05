import type { SVGProps } from 'react';

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
    <defs>
      <linearGradient id="a" x1="0%" x2="100%" y1="0%" y2="100%">
        <stop
          offset="0%"
          style={{
            stopColor: '#1447e6',
            stopOpacity: 1,
          }}
        />
        <stop
          offset="100%"
          style={{
            stopColor: '#20028f',
            stopOpacity: 1,
          }}
        />
      </linearGradient>
    </defs>
    <rect width={512} height={512} fill="url(#a)" rx={64} />
    <text
      x="50%"
      y="50%"
      fill="#fff"
      dominantBaseline="central"
      fontFamily="Roboto, Arial, Helvetica, sans-serif"
      fontSize={256}
      fontWeight="bold"
      textAnchor="middle"
    >
      {'\r\n    DT\r\n  '}
    </text>
  </svg>
);

export const Logo = SvgComponent;
