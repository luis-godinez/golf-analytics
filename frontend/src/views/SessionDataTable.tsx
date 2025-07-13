import React from "react";
import TableComponent from "../components/Table";
import { Box, Typography } from "@mui/material";

interface SessionDataTableProps {
  data: any[];
  units: Record<string, string>;
  selectedDeviceType: "other" | "garmin-r50";
  filename: string;
}

const SessionDataTable: React.FC<SessionDataTableProps> = ({ data, units, selectedDeviceType, filename }) => {
  if (!data || data.length === 0) {
    return <Typography variant="body1">No shot data available.</Typography>;
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TableComponent data={data} units={units} />
    </Box>
  );
};

export default SessionDataTable;