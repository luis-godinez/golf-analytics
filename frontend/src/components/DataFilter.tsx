import React from "react";
import { CLUB_TYPE_COLORS, CLUB_TYPE_ORDER } from "../constants/clubTypes";

interface DataFilterProps {
  distanceType: "Carry" | "Total";
  setDistanceType: (type: "Carry" | "Total") => void;
  visibleClubTypes: string[];
  setVisibleClubTypes: React.Dispatch<React.SetStateAction<string[]>>;
  availableClubTypes: string[];
  showDistanceTypeToggle?: boolean;
}

const DataFilter: React.FC<DataFilterProps> = ({
  distanceType,
  setDistanceType,
  visibleClubTypes,
  setVisibleClubTypes,
  availableClubTypes,
  showDistanceTypeToggle,
}) => {
  const allVisible = visibleClubTypes.length === availableClubTypes.length;

  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "0.5rem 0", flexWrap: "wrap", gap: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        {showDistanceTypeToggle !== false && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.25rem 0.25rem",
              backgroundColor: "#f5f5f5",
              borderRadius: "999px",
              border: "1px solid black",
            }}
          >
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#666" }}>Distance:</span>
            {(["Carry", "Total"] as const).map((type) => (
              <span
                key={type}
                onClick={() => setDistanceType(type)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  backgroundColor: distanceType === type ? "#00000020" : "#eee",
                  color: distanceType === type ? "#000" : "#999",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  border: `1px solid ${distanceType === type ? "#000" : "#ccc"}`,
                  userSelect: "none",
                  cursor: "pointer",
                  opacity: 1
                }}
              >
                {type}
              </span>
            ))}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.25rem 0.25rem",
            backgroundColor: "#f5f5f5",
            border: "1px solid black",
            borderRadius: "999px",
            flexWrap: "wrap"
          }}
        >
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#666" }}>Clubs:</span>
          <span
            onClick={() => {
              setVisibleClubTypes(allVisible ? [] : availableClubTypes);
            }}
            style={{
              padding: "4px 10px",
              borderRadius: "999px",
              backgroundColor: allVisible ? "#00000020" : "#eee",
              color: allVisible ? "#000" : "#999",
              fontWeight: 600,
              fontSize: "0.85rem",
              border: `1px solid ${allVisible ? "#000" : "#ccc"}`,
              userSelect: "none",
              cursor: "pointer",
              opacity: 1
            }}
          >
            All/None
          </span>
          {[...CLUB_TYPE_ORDER].filter(club => availableClubTypes.includes(club)).map((club) => {
            const color = CLUB_TYPE_COLORS[club];
            const isVisible = visibleClubTypes.includes(club);
            return (
              <span
                key={club}
                onClick={() => {
                  setVisibleClubTypes((prev: string[]): string[] =>
                    isVisible
                      ? prev.filter((c: string) => c !== club)
                      : [...prev, club]
                  );
                }}
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  backgroundColor: isVisible ? `${color}20` : "#eee",
                  color: isVisible ? color : "#999",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  border: `1px solid ${isVisible ? color : "#ccc"}`,
                  userSelect: "none",
                  cursor: "pointer",
                  opacity: isVisible ? 1 : 0.5
                }}
              >
                {club}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DataFilter;