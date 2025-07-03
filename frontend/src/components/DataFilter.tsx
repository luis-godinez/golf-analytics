import React from "react";
import { CLUB_TYPE_COLORS, CLUB_TYPE_ORDER } from "../constants/clubTypes";
import { DistanceType, DISTANCE_TYPE_OPTIONS } from "../constants/distanceTypes";
import { ShotQualityType, SHOT_QUALITY_OPTIONS } from "../constants/shotQualityTypes";

interface DataFilterProps {
  distanceType: DistanceType;
  setDistanceType: (type: DistanceType) => void;
  visibleClubTypes: string[];
  setVisibleClubTypes: React.Dispatch<React.SetStateAction<string[]>>;
  availableClubTypes: string[];
  showDistanceTypeToggle?: boolean;
  showShotQualityToggle: boolean;
  shotQualities?: ShotQualityType[];
  setShotQualities?: (qualities: ShotQualityType[]) => void;
  availableShotQualities?: ShotQualityType[];
}

const filterContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  padding: "0.25rem 0.25rem",
  backgroundColor: "#f5f5f5",
  border: "1px solid lightgray",
  borderRadius: "999px",
  flexWrap: "wrap",
};

const DataFilter: React.FC<DataFilterProps> = ({
  distanceType,
  setDistanceType,
  visibleClubTypes,
  setVisibleClubTypes,
  availableClubTypes,
  showDistanceTypeToggle,
  showShotQualityToggle,
  shotQualities,
  setShotQualities,
  availableShotQualities,
}) => {
  const allVisible = visibleClubTypes.length === availableClubTypes.length;

  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "0.5rem 0", flexWrap: "wrap", gap: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        {showDistanceTypeToggle !== false && (
          <div style={filterContainerStyle}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#666" }}>Distance:</span>
            {DISTANCE_TYPE_OPTIONS.map((type) => (
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
        {showShotQualityToggle && (
          <div style={filterContainerStyle}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#666" }}>Tag:</span>
            {(availableShotQualities || SHOT_QUALITY_OPTIONS).map((quality) => {
              const isSelected = shotQualities?.includes(quality);
              return (
                <span
                  key={quality}
                  onClick={() => {
                    if (!setShotQualities || !shotQualities) return;
                    if (isSelected) {
                      setShotQualities(shotQualities.filter((q) => q !== quality));
                    } else {
                      setShotQualities([...shotQualities, quality]);
                    }
                  }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    backgroundColor: isSelected ? "white" : "#eee",
                    color: isSelected ? "#000" : "#999",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    border: `1px solid ${isSelected ? "#000" : "#ccc"}`,
                    userSelect: "none",
                    cursor: "pointer",
                    opacity: 1,
                  }}
                >
                  {quality === "" ? "❓" : quality === "GOOD" ? "👍" : "👎"}
                </span>
              );
            })}
          </div>
        )}
        <div style={filterContainerStyle}>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#666" }}>Clubs:</span>
          <span
            onClick={() => {
              setVisibleClubTypes(allVisible ? [] : availableClubTypes);
            }}
            style={{
              padding: "4px 10px",
              borderRadius: "999px",
              backgroundColor: allVisible ? "white" : "#eee",
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