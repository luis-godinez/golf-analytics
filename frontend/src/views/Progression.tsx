import React, { useState, useEffect } from "react";
import AreaChart from "../components/AreaChart";
import { Box } from "@mui/material";
import { Grid as MuiGrid } from "@mui/material";
import DataFilter from "../components/DataFilter";
import { DistanceType, DEFAULT_DISTANCE_TYPE } from "../constants/distanceTypes";

const Grid = MuiGrid as any;

const Progression: React.FC = () => {
  const [allClubTypes, setAllClubTypes] = useState<string[]>([]);

  const [visibleClubTypes, setVisibleClubTypes] = useState<string[]>(allClubTypes);
  const [distanceType, setDistanceType] = useState<DistanceType>(DEFAULT_DISTANCE_TYPE);

  useEffect(() => {
    const fetchAvailableClubs = async () => {
      try {
        const res = await fetch("http://localhost:3001/sessions/bounds");
        const json = await res.json();
        if (Array.isArray(json.availableClubs)) {
          setAllClubTypes(json.availableClubs);
          setVisibleClubTypes(json.availableClubs);
        }
      } catch (err) {
        console.error("Failed to fetch available clubs", err);
      }
    };
    fetchAvailableClubs();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Box sx={{ flexShrink: 0 }}>
        <DataFilter
          distanceType={distanceType}
          setDistanceType={setDistanceType}
          visibleClubTypes={visibleClubTypes}
          setVisibleClubTypes={setVisibleClubTypes}
          availableClubTypes={allClubTypes}
          showDistanceTypeToggle={false}
          showShotQualityToggle={false}
        />
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: "auto", overscrollBehavior: "contain" }}>
        <Grid p={2} container spacing={2} sx={{ background: "lightgray", borderRadius: "8px" }}>
          <Grid item size={6}>
            <AreaChart defaultMetric="Carry Distance" visibleClubTypes={visibleClubTypes} />
          </Grid>
          <Grid item size={6}>
            <AreaChart defaultMetric="Carry Deviation Distance" visibleClubTypes={visibleClubTypes} />
          </Grid>
          <Grid item size={4}>
            <AreaChart defaultMetric="Launch Direction" visibleClubTypes={visibleClubTypes} />
          </Grid>
          <Grid item size={4}>
            <AreaChart defaultMetric="Launch Angle" visibleClubTypes={visibleClubTypes} />
          </Grid>
          <Grid item size={4}>
            <AreaChart defaultMetric="Ball Speed" visibleClubTypes={visibleClubTypes} />
          </Grid>
          <Grid item size={4}>
            <AreaChart defaultMetric="Backspin" visibleClubTypes={visibleClubTypes} />
          </Grid>
          <Grid item size={4}>
            <AreaChart defaultMetric="Sidespin" visibleClubTypes={visibleClubTypes} />
          </Grid>
          <Grid item size={4}>
            <AreaChart defaultMetric="Spin Axis" visibleClubTypes={visibleClubTypes} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Progression;