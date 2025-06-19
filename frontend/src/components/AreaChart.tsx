import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { Box, Paper, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const allowlist = [
  "Club Speed", "Attack Angle", "Club Path", "Club Face", "Face to Path",
  "Ball Speed", "Smash Factor", "Launch Angle", "Launch Direction", "Backspin",
  "Sidespin", "Spin Rate", "Spin Axis", "Apex Height", "Carry Distance",
  "Carry Deviation Angle", "Carry Deviation Distance", "Total Distance",
  "Total Deviation Angle", "Total Deviation Distance"
];

type DataPoint = {
  date: string;
  value: number;
  units?: string;
};

type Series = {
  club: string;
  data: DataPoint[];
};

const AreaChart: React.FC<{ defaultMetric: string }> = ({ defaultMetric }) => {
  const [metric, setMetric] = useState(defaultMetric);
  const [seriesData, setSeriesData] = useState<Series[]>([]);
  const [units, setUnits] = useState("");
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        const res = await fetch(`http://localhost:3001/sessions/progression-summary?metric=${encodeURIComponent(metric)}`);
        const json = await res.json();
      
        if (!Array.isArray(json.series)) {
          console.error("Unexpected response:", json);
          setSeriesData([]);
          setUnits("");
          return;
        }
      
        setSeriesData(json.series);
        setUnits(json.units || "");
      };
    fetchData();
  }, [metric]);

  useEffect(() => {
    if (!svgRef.current || seriesData.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const allDates = Array.from(
        new Set(seriesData.map(s => s.data).reduce((acc, arr) => acc.concat(arr.map(d => d.date)), [] as string[]))
      ).sort();
      
    const allValues = seriesData.map(s => s.data).reduce((acc, arr) => acc.concat(arr.map(d => d.value)), [] as number[]);
    const minY = d3.min(allValues) ?? 0;
    const maxY = d3.max(allValues) ?? 1;
    const x = d3.scalePoint<string>().domain(allDates).range([0, innerWidth]);
    const y = d3.scaleLinear().domain([minY, maxY]).nice().range([innerHeight, 0]);

    const color = d3.scaleOrdinal<string, string>(d3.schemeCategory10).domain(seriesData.map(d => d.club));

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(d => d));

    g.append("g").call(d3.axisLeft(y));
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 30)
      .attr("x", -innerHeight / 2)
      .attr("dy", "-1em")
      .attr("text-anchor", "middle")
      .attr("fill", "#333")
      .text(units);
    // Style y-axis tick lines as light gray and extend across chart
    g.selectAll(".tick line")
      .attr("stroke", "#eee")
      .attr("x2", innerWidth);

    // Draw horizontal zero line if 0 is within the y-domain
    if (minY < 0 && maxY > 0) {
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .attr("stroke", "#999")
        .attr("stroke-width", 1);
    }

    const line = d3
      .line<DataPoint>()
      .x(d => x(d.date)!)
      .y(d => y(d.value));

    seriesData.forEach(s => {
      g.append("path")
        .datum(s.data)
        .attr("fill", "none")
        .attr("stroke", color(s.club)!)
        .attr("stroke-width", 1.5)
        .attr("d", line);

      // Add club label at the end of the line
      if (s.data.length > 0) {
        g.append("text")
          .attr("transform", `translate(${innerWidth},${y(s.data[s.data.length - 1].value)})`)
          .attr("dy", "0.35em")
          .attr("text-anchor", "end")
          .attr("fill", color(s.club)!)
          .text(s.club);
      }
    });
  }, [seriesData, units]);

  return (
    <Paper
      elevation={2}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "400px",
        boxSizing: "border-box",
        borderRadius: "8px",
        overflow: "hidden",
        p: 1,
      }}
    >
      <FormControl fullWidth size="small" sx={{ mb: 1 }}>
        <InputLabel>Metric</InputLabel>
        <Select value={metric} label="Metric" onChange={(e) => setMetric(e.target.value)}>
          {allowlist.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ flex: 1 }}>
        <svg ref={svgRef} width="100%" height="100%"></svg>
      </Box>
    </Paper>
  );
};

export default AreaChart;