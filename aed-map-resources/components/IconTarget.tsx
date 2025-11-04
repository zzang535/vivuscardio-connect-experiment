export default function IconTarget({ size = 20, color = "#999999", ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_213_4291)">
        <path
          d="M19 10C19 14.9706 14.9706 19 10 19M19 10C19 5.02944 14.9706 1 10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19M19 10L15 10.0013M10 19L9.99935 15.0007M5 10L1.00067 10.0013M10.0007 5.00065L9.99935 1.00132"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle
          cx="10"
          cy="10"
          r="2"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_213_4291">
          <rect width="20" height="20" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}
