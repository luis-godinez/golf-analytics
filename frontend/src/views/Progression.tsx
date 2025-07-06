import React, { useState, useEffect } from "react";
import AreaChart from "../components/AreaChart";
import { Box, Alert } from "@mui/material";
import { Grid as MuiGrid } from "@mui/material";
import DataFilter from "../components/DataFilter";
import { DistanceType, DEFAULT_DISTANCE_TYPE } from "../constants/distanceTypes";

const Grid = MuiGrid as any;

const Progression: React.FC = () => {
  const [allClubTypes, setAllClubTypes] = useState<string[]>([]);
  const [visibleClubTypes, setVisibleClubTypes] = useState<string[]>([]);
  const [distanceType, setDistanceType] = useState<DistanceType>(DEFAULT_DISTANCE_TYPE);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState<number>(0);

  useEffect(() => {
    const fetchAvailableClubs = async () => {
      try {
        const res = await fetch("http://localhost:3001/sessions");
        const json = await res.json();
        const allClubs = json.flatMap((session: any) => session.availableClubs || []);
        const uniqueClubs: string[] = Array.from(new Set(allClubs));
        setAllClubTypes(uniqueClubs);
        setVisibleClubTypes(uniqueClubs);
        setSessionCount(json.length);
      } catch (err) {
        console.error("Failed to fetch sessions for available clubs", err);
      }
    };
    fetchAvailableClubs();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", position: "relative" }}>
      <Box sx={{ flexShrink: 0 }}>
        {allClubTypes.length > 0 && (
          <DataFilter
            distanceType={distanceType}
            setDistanceType={setDistanceType}
            visibleClubTypes={visibleClubTypes}
            setVisibleClubTypes={setVisibleClubTypes}
            availableClubTypes={allClubTypes}
            showDistanceTypeToggle={false}
            showShotQualityToggle={false}
          />
        )}
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: "auto", overscrollBehavior: "contain" }}>
        {sessionCount < 2 ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <Box sx={{ maxWidth: 400, width: "100%" }}>
              <Alert severity="warning" variant="outlined">
                Upload 2 or more sessions to see progression charts.
              </Alert>
            </Box>
          </Box>
        ) : (
          <Grid p={2} container spacing={2} sx={{ background: "lightgray", borderRadius: "8px" }}>
            <Grid size={6}>
              <AreaChart
                defaultMetric="Carry Distance"
                visibleClubTypes={visibleClubTypes}
                hoveredDate={hoveredDate}
                setHoveredDate={setHoveredDate}
              />
            </Grid>
            <Grid size={6}>
              <AreaChart
                defaultMetric="Carry Deviation Distance"
                visibleClubTypes={visibleClubTypes}
                hoveredDate={hoveredDate}
                setHoveredDate={setHoveredDate}
              />
            </Grid>
            <Grid size={4}>
              <AreaChart
                defaultMetric="Launch Direction"
                visibleClubTypes={visibleClubTypes}
                hoveredDate={hoveredDate}
                setHoveredDate={setHoveredDate}
              />
            </Grid>
            <Grid size={4}>
              <AreaChart
                defaultMetric="Launch Angle"
                visibleClubTypes={visibleClubTypes}
                hoveredDate={hoveredDate}
                setHoveredDate={setHoveredDate}
              />
            </Grid>
            <Grid size={4}>
              <AreaChart
                defaultMetric="Ball Speed"
                visibleClubTypes={visibleClubTypes}
                hoveredDate={hoveredDate}
                setHoveredDate={setHoveredDate}
              />
            </Grid>
            <Grid size={4}>
              <AreaChart
                defaultMetric="Backspin"
                visibleClubTypes={visibleClubTypes}
                hoveredDate={hoveredDate}
                setHoveredDate={setHoveredDate}
              />
            </Grid>
            <Grid size={4}>
              <AreaChart
                defaultMetric="Sidespin"
                visibleClubTypes={visibleClubTypes}
                hoveredDate={hoveredDate}
                setHoveredDate={setHoveredDate}
              />
            </Grid>
            <Grid size={4}>
              <AreaChart
                defaultMetric="Spin Axis"
                visibleClubTypes={visibleClubTypes}
                hoveredDate={hoveredDate}
                setHoveredDate={setHoveredDate}
              />
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Progression;