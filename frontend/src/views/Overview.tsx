import React, { useEffect, useState } from "react";
import ScatterPlotComponent from "../components/ScatterPlot";
import BoxPlotComponent from "../components/BoxPlot";
import TrajectoriesSideViewComponent from "../components/TrajectoriesSideView";
import TrajectoriesTopViewComponent from "../components/TrajectoriesTopView";
import { CLUB_TYPE_ORDER } from "../constants/clubTypes";
import DataFilter from "../components/DataFilter";

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
  const [distanceType, setDistanceType] = useState<"Carry" | "Total">("Carry");

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
      <DataFilter
        distanceType={distanceType}
        setDistanceType={setDistanceType}
        visibleClubTypes={visibleClubTypes}
        setVisibleClubTypes={setVisibleClubTypes}
        availableClubTypes={availableClubTypes}
      />
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
        <TrajectoriesTopViewComponent data={data} visibleClubTypes={visibleClubTypes} bounds={bounds} distanceType={distanceType} />
        </div>
        <div style={{ width: '30vw'}}>
          <ScatterPlotComponent data={data} visibleClubTypes={visibleClubTypes} bounds={bounds} distanceType={distanceType} />
        </div>
        <div style={{ width: '40vw'}}>
          <BoxPlotComponent data={data} bounds={bounds} availableClubs={availableClubTypes} distanceType={distanceType}/>
          <TrajectoriesSideViewComponent data={data} visibleClubTypes={visibleClubTypes} bounds={bounds} />
        </div>
      </div>
    </div>
  );
};

export default Overview;