import React from "react";
import TableComponent from "../components/Table";

interface SessionDataProps {
  data: any[];
  units: Record<string, string>;
  selectedDeviceType: "other" | "garmin-r50";
  filename: string;
}

const SessionData: React.FC<SessionDataProps> = ({ data, units, selectedDeviceType, filename }) => {
  if (!data || data.length === 0) {
    return <div>No shot data available.</div>;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TableComponent data={data} units={units} />
    </div>
  );
};

export default SessionData;