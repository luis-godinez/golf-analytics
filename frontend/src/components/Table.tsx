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

  return (
    <table style={{ borderCollapse: "collapse", marginTop: "1rem", width: "100%" }}>
      <thead>
        <tr>
          {headers.map((header, i) => (
            <th
              key={rawKeys[i]}
              onClick={() => requestSort(rawKeys[i])}
              style={{
                position: "sticky",
                top: 0,
                background: "white",
                border: "1px solid black",
                padding: "5px",
                cursor: "pointer",
                zIndex: 1,
              }}
            >
              {header}
              {sortConfig?.key === rawKeys[i] ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : ""}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row, i) => (
          <tr key={i}>
            {rawKeys.map((key) => (
              <td key={key} style={{ border: "1px solid black", padding: "5px" }}>
                {String(row[key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableComponent;