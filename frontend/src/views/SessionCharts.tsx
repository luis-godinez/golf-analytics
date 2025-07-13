import React, { useEffect, useState } from "react";
import ScatterPlotComponent from "../components/ScatterPlot";
import BoxPlotComponent from "../components/BoxPlot";
import TrajectoriesSideViewComponent from "../components/TrajectoriesSideView";
import TrajectoriesTopViewComponent from "../components/TrajectoriesTopView";
import DataFilter from "../components/DataFilter";
import { DistanceType, DEFAULT_DISTANCE_TYPE } from "../constants/distanceTypes";
import { ShotQualityType } from "../constants/shotQualityTypes";

interface OverviewProps {
  shots: any[];
  selectedDeviceType: string;
  units: Record<string, string>;
  filename: string;
  availableClubs: string[];
  bounds: Record<string, { min: number; max: number }>;
}

const SessionCharts: React.FC<OverviewProps> = ({
  shots,
  selectedDeviceType,
  units,
  filename,
  availableClubs,
  bounds
}) => {
  const [visibleClubTypes, setVisibleClubTypes] = useState<string[]>([]);
  const [availableClubTypes, setAvailableClubTypes] = useState<string[]>([]);
  const [localBounds, setLocalBounds] = useState<Record<string, { min: number; max: number }>>({});
  const [distanceType, setDistanceType] = useState<DistanceType>(DEFAULT_DISTANCE_TYPE);
  const [shotQualities, setShotQualities] = useState<ShotQualityType[]>(["", "GOOD", "BAD"]);

  useEffect(() => {
    setAvailableClubTypes(availableClubs);
    setVisibleClubTypes(availableClubs);
    setLocalBounds(bounds);
  }, [availableClubs, bounds]);

  const showShotQualityToggle = true;

  const filteredData = (shots ?? []).filter((shot) => {
    const tag = shot.Tag ?? "";
    return shotQualities.includes(tag);
  });

  const clubFilteredData = React.useMemo(() => {
    if (visibleClubTypes.length === 0) {
      return [];
    }
    return filteredData.filter((shot) => visibleClubTypes.includes(shot["Club Type"]));
  }, [filteredData, visibleClubTypes]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "auto" }}>
      <DataFilter
        distanceType={distanceType}
        setDistanceType={setDistanceType}
        visibleClubTypes={visibleClubTypes}
        setVisibleClubTypes={setVisibleClubTypes}
        availableClubTypes={availableClubTypes}
        shotQualities={shotQualities}
        setShotQualities={setShotQualities}
        showShotQualityToggle={showShotQualityToggle}
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
        <TrajectoriesTopViewComponent data={clubFilteredData} bounds={localBounds} distanceType={distanceType} />
        </div>
        <div style={{ width: '30vw'}}>
          <ScatterPlotComponent data={clubFilteredData} bounds={localBounds} distanceType={distanceType} />
        </div>
        <div style={{ width: '40vw'}}>
          <BoxPlotComponent data={clubFilteredData} bounds={localBounds} availableClubs={availableClubTypes} distanceType={distanceType}/>
          <TrajectoriesSideViewComponent data={clubFilteredData} bounds={localBounds} />
        </div>
      </div>
    </div>
  );
};

export default SessionCharts;