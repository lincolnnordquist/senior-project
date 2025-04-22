import React from "react";

interface SkeletonLoaderProps {
  isDarkMode: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ isDarkMode }) => {
  const placeholders = Array.from({ length: 3 });

  const theme = {
    cardBackground: isDarkMode ? '#2d3748' : '#ffffff',
    borderColor: isDarkMode ? '#4a5568' : '#d4e3f0',
    skeletonColor: isDarkMode ? '#4a5568' : '#e0e0e0',
    textColor: isDarkMode ? '#a0aec0' : '#4a6b82',
  };

  return (
    <div>
      {placeholders.map((_, index) => (
        <div
          key={index}
          style={{
            backgroundColor: theme.cardBackground,
            border: `1px solid ${theme.borderColor}`,
            padding: "1rem",
            marginBottom: "1rem",
            boxShadow: isDarkMode ? "0 4px 12px rgba(0, 0, 0, 0.3)" : "0 4px 12px rgba(0, 0, 0, 0.05)",
            borderRadius: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
            <div
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "8px",
                backgroundColor: theme.skeletonColor,
                marginRight: "0.5rem",
              }}
            />
            <div
              style={{
                width: "150px",
                height: "20px",
                backgroundColor: theme.skeletonColor,
                borderRadius: "4px",
              }}
            />
          </div>
          <div
            style={{
              width: "100px",
              height: "20px",
              backgroundColor: theme.skeletonColor,
              borderRadius: "4px",
              marginBottom: "0.5rem",
            }}
          />
          <div
            style={{
              width: "70%",
              height: "16px",
              backgroundColor: theme.skeletonColor,
              borderRadius: "4px",
              marginBottom: "1rem",
            }}
          />
          <div style={{ display: "flex", gap: "0.25rem" }}>
            {Array.from({ length: 5 }).map((_, starIndex) => (
              <div
                key={starIndex}
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: theme.skeletonColor,
                  borderRadius: "50%",
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;