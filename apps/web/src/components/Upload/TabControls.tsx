import { useState } from "react";
import { Flex, Text } from "@radix-ui/themes";
import "./TabControls.css";

interface TabControlsProps {
  children: React.ReactNode[];
  tabLabels: string[];
  title?: string;
}

export function TabControls({ children, tabLabels, title }: TabControlsProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="tab-controls-container">
      {title && (
        <div className="tab-title">
          <Flex gap="2" align="center" mb="4">
            <svg
              width="18"
              height="18"
              viewBox="0 0 25 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_113_1479)">
                <path
                  d="M19.75 9.25V20.25C19.75 20.8 19.3 21.25 18.75 21.25H6.25C5.7 21.25 5.25 20.8 5.25 20.25V3.75C5.25 3.2 5.7 2.75 6.25 2.75H13.25"
                  stroke="#000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.25 9.25H19.75L13.25 2.75V9.25Z"
                  stroke="#000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 15.25L12.5 12.75L15 15.25"
                  stroke="#000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.5 13.75V18.25"
                  stroke="#000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_113_1479">
                  <rect
                    width="24"
                    height="24"
                    fill="white"
                    transform="translate(0.5)"
                  />
                </clipPath>
              </defs>
            </svg>
            <Text
              size="5"
              weight="bold"
              style={{ color: "#111" }}
            >
              {title}
            </Text>
          </Flex>
        </div>
      )}
      <div className="tab-header">
        {tabLabels.map((label, index) => (
          <div
            key={index}
            className={`tab-text ${activeTab === index ? "active" : ""}`}
            onClick={() => setActiveTab(index)}
          >
            <Text size="3" weight="medium" style={{ color: "#111", cursor: "pointer" }}>
              {label}
            </Text>
          </div>
        ))}
      </div>
      <div className="tab-content">
        {children[activeTab]}
      </div>
    </div>
  );
}