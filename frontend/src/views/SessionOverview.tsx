import React, { useEffect, useState } from "react";
import ScatterPlotComponent from "../components/ScatterPlot";
import BoxPlotComponent from "../components/BoxPlot";
import TrajectoriesSideViewComponent from "../components/TrajectoriesSideView";
import TrajectoriesTopViewComponent from "../components/TrajectoriesTopView";
import { CLUB_TYPE_ORDER } from "../constants/clubTypes";
import DataFilter from "../components/DataFilter";
import { DistanceType, DEFAULT_DISTANCE_TYPE } from "../constants/distanceTypes";
import { ShotQualityType, DEFAULT_SHOT_QUALITY_TYPE } from "../constants/shotQualityTypes";

interface OverviewProps {
  data: any[];
  selectedDeviceType: string;
  units: Record<string, string>;
  filename: string;
}

const SessionOverview: React.FC<OverviewProps> = ({ data, selectedDeviceType, units, filename }) => {
  const [visibleClubTypes, setVisibleClubTypes] = useState<string[]>([]);
  const [availableClubTypes, setAvailableClubTypes] = useState<string[]>([]);
  const [bounds, setBounds] = useState<Record<string, { min: number; max: number }>>({});
  const [distanceType, setDistanceType] = useState<DistanceType>(DEFAULT_DISTANCE_TYPE);
  const [shotQualities, setShotQualities] = useState<ShotQualityType[]>(["", "GOOD", "BAD"]);

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

  // Determine which shot qualities are available in this dataset
  const hasGood = data.some((shot) => shot.Tag === "GOOD");
  const hasBad = data.some((shot) => shot.Tag === "BAD");

  const showShotQualityToggle = hasGood || hasBad;

  const filteredData = data.filter((shot) => {
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
        <TrajectoriesTopViewComponent data={clubFilteredData} bounds={bounds} distanceType={distanceType} />
        </div>
        <div style={{ width: '30vw'}}>
          <ScatterPlotComponent data={clubFilteredData} bounds={bounds} distanceType={distanceType} />
        </div>
        <div style={{ width: '40vw'}}>
          <BoxPlotComponent data={clubFilteredData} bounds={bounds} availableClubs={availableClubTypes} distanceType={distanceType}/>
          <TrajectoriesSideViewComponent data={clubFilteredData} bounds={bounds} />
        </div>
      </div>
    </div>
  );
};

export default SessionOverview;