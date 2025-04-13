

import React from "react";

const SkeletonLoader: React.FC = () => {
  const placeholders = Array.from({ length: 3 });

  return (
    <div>
      {placeholders.map((_, index) => (
        <div
          key={index}
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #d4e3f0",
            padding: "1rem",
            marginBottom: "1rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            borderRadius: "8px",
            color: "#4a6b82",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
            <div
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "8px",
                backgroundColor: "#d4e3f0",
                marginRight: "0.5rem",
              }}
            />
            <div
              style={{
                width: "150px",
                height: "20px",
                backgroundColor: "#d4e3f0",
                borderRadius: "4px",
              }}
            />
          </div>
          <div
            style={{
              width: "100px",
              height: "20px",
              backgroundColor: "#d4e3f0",
              borderRadius: "4px",
              marginBottom: "0.5rem",
            }}
          />
          <div
            style={{
              width: "70%",
              height: "16px",
              backgroundColor: "#d4e3f0",
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
                  backgroundColor: "#d4e3f0",
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