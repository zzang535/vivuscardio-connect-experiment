export default function IconCheckCircle({ width = 26, height = 26, ...props }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height} 
      viewBox="0 0 26 26" 
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_18793_62160)">
        <circle cx="13.0454" cy="13" r="12.5" fill="#56ED89"/>
        <path 
          d="M19.2954 9.875L11.6497 17.5206L6.79541 12.6664" 
          stroke="white" 
          strokeWidth="2.00056" 
          strokeMiterlimit="10" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_18793_62160">
          <rect width="25" height="25" fill="white" transform="translate(0.54541 0.5)"/>
        </clipPath>
      </defs>
    </svg>
  );
}

