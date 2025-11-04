import React from "react";

const IconCompression = ({ width = 20, height = 20, color = "#999999", ...props }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height} 
      viewBox="0 0 20 20" 
      fill="none"
      {...props}
    >
      <path 
        d="M18.9995 18.0224H0.999512M18.9995 9.72231C16.4185 11.7058 13.2546 12.7811 9.99952 12.7811C6.74443 12.7811 3.58051 11.7058 0.999526 9.72231M18.9995 14.0123C13.1531 15.932 6.84598 15.932 0.999526 14.0123M9.99951 1.23242V10.0024M9.99951 10.0024L13.2395 6.76242M9.99951 10.0024L6.75951 6.76242" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeMiterlimit="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconCompression;

