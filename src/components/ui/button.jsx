import React from "react";

const Button = ({ children, className = "", onClick, disabled = false }) => {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-semibold transition duration-200 ease-in-out ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-80"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
