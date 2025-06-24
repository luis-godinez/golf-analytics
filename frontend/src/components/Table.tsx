import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useState, useEffect } from "react";

interface TableProps {
  data: any[];
  units: Record<string, string>;
}

const TableComponent: React.FC<TableProps> = ({ data, units }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const headers = React.useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).map((key) => {
      const unit = units[key];
      return unit ? `${key} ${unit}` : key;
    });
  }, [data, units]);

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

  const requestSort = (key: string) => {
    setSortConfig((prev) =>
      prev?.key === key && prev.direction === "asc"
        ? { key, direction: "desc" }
        : { key, direction: "asc" }
    );
  };

  const columns: GridColDef[] = rawKeys.map((key, index) => ({
    field: key,
    headerName: units[key] ? `${key} ${units[key]}` : key,
    width: index === 0 ? 150 : undefined,
    flex: index === 0 ? undefined : 1,
    sortable: true,
    filterable: true,
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
    <div style={{ height: '95%', width: "100%", marginTop: "1rem", flexGrow: 1 }}>
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
      />
    </div>
  );
};

export default TableComponent;