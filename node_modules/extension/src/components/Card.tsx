import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "", title }) => {
  return (
    <div
      className={`bg-gray-600 text-white rounded-lg shadow-md p-4 ${className}`}
    >
      {title && (
        <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
      )}
      {children}
    </div>
  );
};

export default Card;
