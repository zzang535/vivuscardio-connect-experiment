export default function IconXCircle({ width = 26, height = 26, ...props }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height} 
      viewBox="0 0 26 26" 
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_18793_62155)">
        <circle cx="13.2576" cy="13" r="12.5" fill="#BB2F2F"/>
        <path 
          d="M18.2576 8.03135L8.25757 17.9686M18.2262 18L8.28892 8" 
          stroke="white" 
          strokeWidth="1.875" 
          strokeMiterlimit="10" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_18793_62155">
          <rect width="25" height="25" fill="white" transform="translate(0.757568 0.5)"/>
        </clipPath>
      </defs>
    </svg>
  );
}

