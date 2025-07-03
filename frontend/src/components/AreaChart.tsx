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

type AreaChartProps = {
  defaultMetric: string;
  visibleClubTypes: string[];
  hoveredDate: string | null;
  setHoveredDate: (date: string | null) => void;
};

const AreaChart: React.FC<AreaChartProps> = ({ defaultMetric, visibleClubTypes, hoveredDate, setHoveredDate }) => {
  const [metric, setMetric] = useState(defaultMetric);
  const [seriesData, setSeriesData] = useState<Series[]>([]);
  const [units, setUnits] = useState("");
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (visibleClubTypes.length === 0) {
      setSeriesData([]);
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }
      return;
    }
    
    const fetchData = async () => {
        const res = await fetch(`http://localhost:3001/sessions/progression-summary?metric=${encodeURIComponent(metric)}&clubs=${visibleClubTypes.join(",")}`);
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
  }, [metric, visibleClubTypes]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const currentDates = Array.from(
      new Set(seriesData.flatMap(s => s.data.map(d => d.date)))
    ).sort();

    const allValues = seriesData.flatMap(s => s.data.map(d => d.value));
    const minY = d3.min(allValues) ?? 0;
    const maxY = d3.max(allValues) ?? 1;

    const x = d3.scalePoint<string>()
      .domain(currentDates)
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([minY, maxY])
      .nice()
      .range([innerHeight, 0]);

    const color = d3.scaleOrdinal<string, string>(d3.schemeCategory10).domain(seriesData.map(d => d.club));

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    svg.on("mouseleave", () => {
      setHoveredDate(null);
      g.selectAll(".hover-point").remove();
      g.selectAll(".tooltip-group").remove();
    });

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

    g.selectAll(".tick line")
      .attr("stroke", "#eee")
      .attr("x2", innerWidth);

    if (minY < 0 && maxY > 0) {
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .attr("stroke", "#999")
        .attr("stroke-width", 1);
    }

    if (seriesData.length === 0) {
      return;
    }

    const line = d3
      .line<DataPoint>()
      .x(d => x(d.date)!)
      .y(d => y(d.value));

    seriesData.forEach(s => {
      const colorStroke = color(s.club)!;
      const sorted = s.data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      g.append("path")
        .datum(sorted)
        .attr("fill", "none")
        .attr("stroke", colorStroke)
        .attr("stroke-width", 1.5)
        .attr("d", line);
    });

    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event);
        const closestDate = x.domain().reduce((a, b) => {
          return Math.abs(x(b)! - mx) < Math.abs(x(a)! - mx) ? b : a;
        });
        setHoveredDate(closestDate);
      })
      .on("mouseout", () => {
        setHoveredDate(null);
      });

    if (hoveredDate && currentDates.includes(hoveredDate)) {
      g.selectAll(".hover-point").remove();
      g.selectAll(".tooltip-group").remove();

      const tooltipPoints = seriesData.map(s => {
        const point = s.data.find(d => d.date === hoveredDate);
        return point ? { club: s.club, value: point.value } : null;
      }).filter(Boolean) as { club: string; value: number }[];

      tooltipPoints.forEach(p => {
        g.append("circle")
          .attr("class", "hover-point")
          .attr("cx", x(hoveredDate)!)
          .attr("cy", y(p.value))
          .attr("r", 4)
          .attr("fill", color(p.club)!);
      });

      const cx = x(hoveredDate)!;
      const cy = innerHeight / 2;
      const padding = 80;

      const group = g.append("g")
        .attr("class", "tooltip-group")
        .attr("transform", `translate(${cx}, ${cy})`);

      group.append("text")
        .attr("font-size", "14px")
        .attr("y", 0)
        .selectAll("tspan")
        .data(tooltipPoints)
        .join("tspan")
        .attr("x", padding + 4)
        .attr("dy", (_, i) => i === 0 ? "1em" : "1.2em")
        .text(p => `${p.club}: ${p.value.toFixed(1)} ${units}`)
        .attr("fill", p => color(p.club)!);

      const textNode = group.select("text").node();
      const bbox = textNode ? (textNode as SVGTextElement).getBBox() : { width: 120, height: 20 };

      const tooltipWidth = bbox.width + 8;
      const tooltipHeight = bbox.height + 8;

      // If near right edge, shift tooltip box to the left
      const tooltipX = (cx + margin.left + tooltipWidth + padding > innerWidth + margin.left)
        ? -tooltipWidth - padding
        : padding;

      group.select("text").attr("y", -bbox.height / 2 );
      group.select("text").selectAll("tspan").attr("x", tooltipX + 4);

      group.append("rect")
        .attr("x", tooltipX)
        .attr("y", -tooltipHeight / 2)
        .attr("width", tooltipWidth)
        .attr("height", tooltipHeight)
        .attr("fill", "white")
        .attr("stroke", "#ccc")
        .attr("rx", 4)
        .attr("ry", 4);

      group.select("rect").lower();
    } else {
      g.selectAll(".hover-point").remove();
      g.selectAll(".tooltip-group").remove();
    }

// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesData, units, hoveredDate]);

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
        position: "relative",
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