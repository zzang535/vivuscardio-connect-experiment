export default function IconAedStatus({ size = 20, color = "#999999", ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <path
        d="M1 5C1 3.34315 2.34315 2 4 2H16C17.6569 2 19 3.34315 19 5V15C19 16.6569 17.6569 18 16 18H4C2.34315 18 1 16.6569 1 15V5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7.91675 8.27778L11.0417 5.5L10.2605 7.72222H12.0834L8.95841 10.5L9.73966 8.27778H7.91675Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 14.25C5.5 14.6642 5.16421 15 4.75 15C4.33579 15 4 14.6642 4 14.25C4 13.8358 4.33579 13.5 4.75 13.5C5.16421 13.5 5.5 13.8358 5.5 14.25Z"
        fill="#1AAF0D"
        stroke="#1AAF0D"
        strokeWidth="1.5"
      />
      <path
        d="M16 14.25C16 14.6642 15.6642 15 15.25 15C14.8358 15 14.5 14.6642 14.5 14.25C14.5 13.8358 14.8358 13.5 15.25 13.5C15.6642 13.5 16 13.8358 16 14.25Z"
        fill="#F85402"
        stroke="#F85402"
        strokeWidth="1.5"
      />
    </svg>
  );
}
