import React from "react";

const Label = ({ children, className }) => {
  return (
    <label className={`block font-semibold mb-1 text-gray-700 ${className}`}>
      {children}
    </label>
  );
};

export default Label;
