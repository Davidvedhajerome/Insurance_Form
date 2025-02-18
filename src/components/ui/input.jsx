import React from "react";

const Input = ({ type = "text", placeholder, onChange, disabled }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      disabled={disabled}
      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
    />
  );
};

export default Input;
