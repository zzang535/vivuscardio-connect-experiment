import React from "react";

const IconVentilation = ({ width = 20, height = 20, color = "#999999", ...props }) => {
  return (
    <svg 
      width={width}
      height={height}
      viewBox="0 0 20 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path 
        d="M0.800049 10.0857H15.4571C17.4138 10.0857 19 8.49952 19 6.54286C19 4.58619 17.4138 3 15.4571 3C13.5005 3 11.9143 4.58619 11.9143 6.54286C11.9143 6.75383 11.9327 6.9605 11.9681 7.16133M10.3333 15.3669C10.3333 16.8397 11.5272 18.0336 13 18.0336C14.4728 18.0336 15.6667 16.8397 15.6667 15.3669C15.6667 13.8942 14.4728 12.7002 13 12.7002L2 12.7002M2 7.50038L7 7.50043C8.08944 7.50043 8.9726 6.61727 8.9726 5.52783C8.9726 4.43839 8.08944 3.55523 7 3.55523C6.02216 3.55523 5.2105 4.26672 5.05447 5.20025" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconVentilation;

