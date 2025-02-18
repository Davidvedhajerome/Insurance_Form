import React from "react";

const Card = React.forwardRef(({ children, className = "", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`p-4 shadow-lg rounded-lg bg-white ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = "Card";

const CardContent = React.forwardRef(({ children, className = "", ...props }, ref) => {
  return (
    <div ref={ref} className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
});
CardContent.displayName = "CardContent";

export { Card, CardContent };
