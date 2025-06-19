import React from "react";
import AreaChart from "../components/AreaChart";
import { Box, Container, Paper } from "@mui/material";
import { Grid as MuiGrid } from "@mui/material";

const Grid = MuiGrid as any;

const Progression: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid p={2} container spacing={2} sx={{ background: "lightgray", "border-radius":"8px;"}}>
        <Grid item size={6}>
          <AreaChart defaultMetric="Carry Distance" />
        </Grid>
        <Grid item size={6}>
          <AreaChart defaultMetric="Carry Deviation Distance" />
        </Grid>
        <Grid item size={4}>
          <AreaChart defaultMetric="Launch Direction" />
        </Grid>
        <Grid item size={4}>
          <AreaChart defaultMetric="Launch Angle" />
        </Grid>
        <Grid item size={4}>
          <AreaChart defaultMetric="Ball Speed" />
        </Grid>
        <Grid item size={4}>
          <AreaChart defaultMetric="Backspin" />
        </Grid>
        <Grid item size={4}>
          <AreaChart defaultMetric="Sidespin" />
        </Grid>
        <Grid item size={4}>
          <AreaChart defaultMetric="Spin Axis" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Progression;