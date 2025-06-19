import React, { useEffect, useRef, useState } from "react";
import TableComponent from "../components/Table";
import ScatterPlotComponent from "../components/ScatterPlot";
import BoxPlotComponent from "../components/BoxPlot";
import TrajectoriesSideViewComponent from "../components/TrajectoriesSideView";
import TrajectoriesTopViewComponent from "../components/TrajectoriesTopView";
import { CLUB_TYPE_ORDER, CLUB_TYPE_COLORS } from "../constants/clubTypes";

interface OverviewProps {
  data: any[];
  selectedDeviceType: string;
  units: Record<string, string>;
  filename: string;
}

const Overview: React.FC<OverviewProps> = ({ data, selectedDeviceType, units, filename }) => {
  const [visibleClubTypes, setVisibleClubTypes] = useState<string[]>([]);
  const [availableClubTypes, setAvailableClubTypes] = useState<string[]>([]);
  const [bounds, setBounds] = useState<Record<string, { min: number; max: number }>>({});

  useEffect(() => {
    setVisibleClubTypes(CLUB_TYPE_ORDER);
  }, []);

  useEffect(() => {
    fetch("http://localhost:3001/sessions/bounds")
      .then((res) => res.json())
      .then((json) => {
        setAvailableClubTypes(json.availableClubs || []);
        setVisibleClubTypes(json.availableClubs || []);
        setBounds(json.bounds || {});
      })
      .catch((err) => console.error("Failed to load club types", err));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "center", margin: "0.5rem 0", flexWrap: "wrap", gap: "0.5rem" }}>
        {(() => {
          const allVisible = visibleClubTypes.length === availableClubTypes.length;
          return (
            <>
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
                return (
                  <span
                    key={club}
                    onClick={() => {
                      setVisibleClubTypes(prev =>
                        prev.includes(club)
                          ? prev.filter(c => c !== club)
                          : [...prev, club]
                      );
                    }}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      backgroundColor: visibleClubTypes.includes(club) ? `${color}20` : "#eee",
                      color: visibleClubTypes.includes(club) ? color : "#999",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      border: `1px solid ${visibleClubTypes.includes(club) ? color : "#ccc"}`,
                      userSelect: "none",
                      cursor: "pointer",
                      opacity: visibleClubTypes.includes(club) ? 1 : 0.5
                    }}
                  >
                    {club}
                  </span>
                );
              })}
            </>
          );
        })()}
      </div>
      <div
        style={{
          flex: 2,
          borderBottom: "1px solid #ccc",
          paddingBottom: "1rem",
          overflow: "hidden",
          display: "flex",
          gap: "1rem",
        }}
      >
        <div style={{ width: '30vw' }}>
        <TrajectoriesTopViewComponent data={data} visibleClubTypes={visibleClubTypes} bounds={bounds} />
        </div>
        <div style={{ width: '30vw'}}>
          <ScatterPlotComponent data={data} visibleClubTypes={visibleClubTypes} bounds={bounds} />
        </div>
        <div style={{ width: '40vw'}}>
          <BoxPlotComponent data={data} bounds={bounds} availableClubs={availableClubTypes} />
          <TrajectoriesSideViewComponent data={data} visibleClubTypes={visibleClubTypes} bounds={bounds} />
        </div>
      </div>
    </div>
  );
};

export default Overview;