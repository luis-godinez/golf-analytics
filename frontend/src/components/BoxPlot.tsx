import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { CLUB_TYPE_COLORS, CLUB_TYPE_ORDER } from "../constants/clubTypes";

interface BoxPlotProps {
  data: any[];
  bounds: Record<string, { min: number; max: number }>;
  availableClubs: string[];
  distanceType: "Carry" | "Total";
}

const BoxPlotComponent: React.FC<BoxPlotProps> = ({ data, bounds, availableClubs, distanceType }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!wrapperRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      setDimensions({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    resizeObserver.observe(wrapperRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const margin = { top: 20, right: 30, bottom: 100, left: 50 };
    const width = dimensions.width;
    const height = dimensions.height;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const orderedClubTypes = CLUB_TYPE_ORDER.filter(club => availableClubs.includes(club));
    const y = d3.scaleBand()
      .domain(orderedClubTypes)
      .range([0, height - margin.top - margin.bottom])
      .padding(0.3);

    // Use global bounds for selected distance type if available
    const xMax = bounds[`${distanceType} Distance`]?.max ?? 200;
    const x = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, width - margin.left - margin.right]);

    g.append("g")
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll("text")
      .attr("x", 6)
      .attr("text-anchor", "start")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .style("fill", d => CLUB_TYPE_COLORS[d as string] || "black");

    // X-axis label (dynamic distance type)
    svg.append("text")
      .attr("x", margin.left + (width - margin.left - margin.right) / 2)
      .attr("y", height - 15)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(`${distanceType} Distance (Yards)`);

    g.append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x));

    if (data.length === 0) {
      return; // Axes and labels remain; no boxes or whiskers drawn
    }

    const grouped = d3.group(data, d => d["Club Type"]);

    // Compute boxplot data
    const boxData = Array.from(grouped.entries()).map(([clubType, shots]) => {
      const values = shots.map(d => +d[`${distanceType} Distance`]).sort(d3.ascending);
      const q1 = d3.quantile(values, 0.25) ?? 0;
      const median = d3.quantile(values, 0.5) ?? 0;
      const q3 = d3.quantile(values, 0.75) ?? 0;
      const min = values[0];
      const max = values[values.length - 1];
      return { clubType, min, q1, median, q3, max };
    }).sort((a, b) => a.median - b.median);

    const boxDataMap = new Map(boxData.map(d => [d.clubType, d]));

    orderedClubTypes.forEach(clubType => {
      const d = boxDataMap.get(clubType);
      if (!d) return;

      const center = y(d.clubType)! + y.bandwidth() / 2;
      const color = CLUB_TYPE_COLORS[d.clubType] || "gray";

      // Whiskers
      g.append("line")
        .attr("y1", center)
        .attr("y2", center)
        .attr("x1", x(d.min))
        .attr("x2", x(d.max))
        .attr("stroke", color)
        .attr("stroke-width", 5);

      // Min label
      g.append("text")
        .attr("y", center)
        .attr("x", x(d.min))
        .attr("dx", "-0.5em")
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .text(`${d.min.toFixed(1)}`)
        .style("font-size", "10px");

      // Max label
      g.append("text")
        .attr("y", center)
        .attr("x", x(d.max))
        .attr("dx", "0.5em")
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "middle")
        .text(`${d.max.toFixed(1)}`)
        .style("font-size", "10px");

      // Box
      g.append("rect")
        .attr("y", y(d.clubType)!)
        .attr("x", x(d.q1))
        .attr("height", y.bandwidth())
        .attr("width", x(d.q3) - x(d.q1))
        .attr("stroke", "black")
        .attr("fill", color);

      // Median line
      g.append("line")
        .attr("y1", y(d.clubType)!)
        .attr("y2", y(d.clubType)! + y.bandwidth())
        .attr("x1", x(d.median))
        .attr("x2", x(d.median))
        .attr("stroke", "black");

      // Median label as a pill (snapped to median line for visual consistency)
      const medianLabel = `${d.median.toFixed(1)}`;
      const labelPadding = 4;
      const fontSize = 10;
      const textWidth = medianLabel.length * (fontSize * 0.6);
      const pillWidth = textWidth + labelPadding * 2;
      const pillHeight = fontSize + 2;

      const pillGroup = g.append("g")
        .attr("transform", `translate(${x(d.median) - pillWidth / 2}, ${center - pillHeight / 2})`);

      pillGroup.append("rect")
        .attr("width", pillWidth)
        .attr("height", pillHeight)
        .attr("rx", pillHeight / 2)
        .attr("fill", "white")
        .attr("stroke", "black");

      pillGroup.append("text")
        .attr("x", pillWidth / 2)
        .attr("y", pillHeight / 2 + 1)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(medianLabel)
        .style("font-size", `${fontSize}px`)
        .style("fill", "black");
    });
  }, [data, dimensions, availableClubs, bounds, distanceType]);

  return (
    <div ref={wrapperRef} style={{ width: "100%", height: "50%" }}>
      <svg ref={svgRef} viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} width="100%" height="100%" />
    </div>
  );
};

export default BoxPlotComponent;