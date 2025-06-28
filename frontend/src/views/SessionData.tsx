import React from "react";
import TableComponent from "../components/Table";
import { Box, Typography } from "@mui/material";

interface SessionDataProps {
  data: any[];
  units: Record<string, string>;
  selectedDeviceType: "other" | "garmin-r50";
  filename: string;
}

const SessionData: React.FC<SessionDataProps> = ({ data, units, selectedDeviceType, filename }) => {
  if (!data || data.length === 0) {
    return <Typography variant="body1">No shot data available.</Typography>;
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TableComponent data={data} units={units} />
    </Box>
  );
};

export default SessionData;