import React from "react";
import "./BetterButton.css";

interface BetterButtonProps {
  children: React.ReactNode;
  padding?: string;
  radius?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const BetterButton = React.forwardRef<HTMLButtonElement, BetterButtonProps>(
  ({ children, padding = "8px 10px", radius = "4px", active = false, disabled = false, onClick }, ref) => {
    return (
      <button
        ref={ref}
        className={`button-resting ${active ? "button-active" : ""}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding,
          width: "fit-content",
          fontSize: "12px",
          borderRadius: radius,
        }}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    );
  }
);

BetterButton.displayName = "BetterButton";

export default BetterButton;
