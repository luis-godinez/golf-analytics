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

const AreaChart: React.FC<{ defaultMetric: string; visibleClubTypes: string[] }> = ({ defaultMetric, visibleClubTypes }) => {
  const [metric, setMetric] = useState(defaultMetric);
  const [seriesData, setSeriesData] = useState<Series[]>([]);
  const [units, setUnits] = useState("");
  const [lastYDomain, setLastYDomain] = useState<[number, number] | null>(null);
  const [lastXDomain, setLastXDomain] = useState<string[] | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const lastHoveredDate = useRef<string | null>(null);

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
      
        // Removed filtering here because backend already filters by clubs
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
        new Set(seriesData.map(s => s.data).reduce((acc, arr) => acc.concat(arr.map(d => d.date)), [] as string[]))
      ).sort();
      
    const allValues = seriesData.map(s => s.data).reduce((acc, arr) => acc.concat(arr.map(d => d.value)), [] as number[]);
    const minY = d3.min(allValues) ?? 0;
    const maxY = d3.max(allValues) ?? 1;

    // Update lastXDomain and lastYDomain if data exists, but only if values actually changed
    if (seriesData.length > 0) {
      if (JSON.stringify(lastXDomain) !== JSON.stringify(currentDates)) {
        setLastXDomain(currentDates);
      }
      if (!lastYDomain || lastYDomain[0] !== minY || lastYDomain[1] !== maxY) {
        setLastYDomain([minY, maxY]);
      }
    }

    const x = d3.scalePoint<string>()
      .domain(lastXDomain && seriesData.length === 0 ? lastXDomain : currentDates)
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain(lastYDomain && seriesData.length === 0 ? lastYDomain : [minY, maxY])
      .nice()
      .range([innerHeight, 0]);

    const color = d3.scaleOrdinal<string, string>(d3.schemeCategory10).domain(seriesData.map(d => d.club));

    // Ensure only one tooltip div is created and reused
    let tooltip = d3.select(svgRef.current!.parentNode as HTMLElement).select<HTMLDivElement>(".area-tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select(svgRef.current!.parentNode as HTMLElement)
        .append("div")
        .attr("class", "area-tooltip")
        .style("position", "absolute")
        .style("background", "rgba(255, 255, 255, 0.9)")
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0);
    }

    svg.on("mouseleave", () => {
      tooltip.transition()
        .duration(300)
        .style("opacity", 0);
      g.selectAll(".hover-point").remove();
      lastHoveredDate.current = null;
    });

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
    if ((lastYDomain && lastYDomain[0] < 0 && lastYDomain[1] > 0) || (minY < 0 && maxY > 0)) {
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .attr("stroke", "#999")
        .attr("stroke-width", 1);
    }

    if (seriesData.length === 0) {
      return; // Axes and grid stay visible; no lines drawn
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

      if (sorted.length > 0) {
        g.append("text")
          .attr("transform", `translate(${innerWidth},${y(sorted[sorted.length - 1].value)})`)
          .attr("dy", "0.35em")
          .attr("text-anchor", "end")
          .attr("fill", colorStroke)
          .text(s.club);
      }
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

        const tooltipLines = seriesData.map(s => {
          const point = s.data.find(d => d.date === closestDate);
          if (point) {
            return `<div style="color: ${color(s.club)};"><strong>${s.club}:</strong> ${point.value.toFixed(1)} ${units}</div>`;
          }
          return null;
        }).filter(Boolean).reverse();

        if (tooltipLines.length > 0) {
          tooltip.html(`<strong>${closestDate}</strong><br/>${tooltipLines.join("")}`)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px")
            .transition()
            .duration(200)
            .style("opacity", 1);

          if (lastHoveredDate.current !== closestDate) {
            g.selectAll(".hover-point").remove();

            seriesData.forEach(s => {
              const point = s.data.find(d => d.date === closestDate);
              if (point) {
                g.append("circle")
                  .attr("class", "hover-point")
                  .attr("cx", x(closestDate)!)
                  .attr("cy", y(point.value))
                  .attr("r", 4)
                  .attr("fill", color(s.club)!);
              }
            });

            lastHoveredDate.current = closestDate;
          }
        }
      })
      .on("mouseout", () => {
        tooltip.transition()
          .duration(300)
          .style("opacity", 0);
        g.selectAll(".hover-point").remove();
        lastHoveredDate.current = null;
      });

// eslint-disable-next-line react-hooks/exhaustive-deps
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