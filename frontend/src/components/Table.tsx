import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useState } from "react";
import Box from '@mui/material/Box';
import "../styles/Table.css";

interface TableProps {
  data: any[];
  units: Record<string, string>;
}

const TableComponent: React.FC<TableProps> = ({ data, units }) => {
  const [sortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);


  const rawKeys = React.useMemo(() => (data.length > 0 ? Object.keys(data[0]) : []), [data]);
  const rows = React.useMemo(() => (data.length > 0 ? data : []), [data]);

  const sortedRows = React.useMemo(() => {
    if (!sortConfig || rows.length === 0) return rows;
    return [...rows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === bVal) return 0;
      if (sortConfig.direction === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [rows, sortConfig]);

  if (rows.length === 0) return <div>Not enough data to display.</div>;


  const columns: GridColDef[] = rawKeys.map((key, index) => ({
    field: key,
    headerName: units[key] ? `${key} ${units[key]}` : key,
    width: index === 0 ? 150 : 120,
    sortable: true,
    filterable: true,
    headerClassName: 'wrap-header',
    minWidth: 100,
  }));

  const rowsWithId = sortedRows.map((row, index) => {
    const roundedRow: Record<string, any> = {};
    for (const key in row) {
      const value = row[key];
      const num = Number(value);
      roundedRow[key] = !isNaN(num) ? num.toFixed(1) : value;
    }
    return { id: index, ...roundedRow };
  });

  return (
    <Box sx={{ height: '95%', width: "100%", marginTop: "1rem", flexGrow: 1, overflowX: "auto" }}>
      <DataGrid
        rows={rowsWithId}
        columns={columns}
        checkboxSelection
        disableRowSelectionOnClick
        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25, page: 0 },
          },
        }}
        getRowClassName={(params) => {
          const clubType = params.row["Club Type"];
          return clubType ? `club-row-${clubType.replace(/\s+/g, "-")}` : "";
        }}
      />
    </Box>
  );
};

export default TableComponent;