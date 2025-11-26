import * as React from "react";

export const TelegramIcon = ({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M21.5 4.5L17.5 19.5C17.5 19.5 17.1 20.5 16 20C14.9 19.5 12 17.5 10.5 16.5C10.1 16.2 10.2 15.9 10.5 15.5C11.2 14.6 14.5 10.5 14.5 10.5C14.8 10.1 14.5 9.9 14 10.1C13.3 10.4 9.5 12.3 8.2 12.9C7.7 13.1 7.4 13 6.9 12.9C5.7 12.6 4.1 12.1 4.1 12.1C3 11.7 3 11 4.2 10.5L20.2 4.1C21.2 3.7 21.8 4.1 21.5 4.5Z" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);
