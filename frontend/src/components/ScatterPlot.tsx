import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { polygonHull } from "d3-polygon";
import { Matrix, EigenvalueDecomposition } from "ml-matrix";
import { CLUB_TYPE_COLORS } from "../constants/clubTypes";

interface Point {
  x: number;
  y: number;
  label: string;
}

interface ScatterPlotProps {
  data: any[];
  visibleClubTypes: string[];
  bounds: Record<string, { min: number; max: number }>;
  distanceType: "Carry" | "Total";
}

const ScatterPlotComponent: React.FC<ScatterPlotProps> = ({ data, visibleClubTypes, bounds, distanceType }) => {
  const yAxisField = distanceType === "Carry" ? "Carry Distance" : "Total Distance";
  const scatterPlot = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 });

  // Determine which deviation distance to use for X based on yAxisField (distanceType)
  const grouped: Record<string, Point[]> = data.reduce((acc, shot) => {
    const type = shot["Club Type"];
    if (!type) return acc;
    if (!acc[type]) acc[type] = [];
    acc[type].push({
      x: parseFloat(shot[yAxisField === "Carry Distance" ? "Carry Deviation Distance" : "Total Deviation Distance"]),
      y: parseFloat(shot[yAxisField]),
      label: shot["﻿Date"]
    });
    return acc;
  }, {});

  const clubTypes = Object.keys(grouped);


  useEffect(() => {
    if (!wrapperRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect) {
          const { width, height } = entry.contentRect;
          setDimensions({
            width,
            height
          });
        }
      }
    });
    resizeObserver.observe(wrapperRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !scatterPlot.current) return;

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("padding", "8px")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("max-width", "300px")
      .style("overflow", "hidden")
      .style("box-sizing", "border-box")
      .style("z-index", "1000")
      .style("display", "none");

    const width = dimensions.width;
    const height = dimensions.height;
    // Match margin to TrajectoriesTopView.tsx
    const margin = { top: 40, right: 30, bottom: 70, left: 60 };

    const svg = d3.select(scatterPlot.current);
    svg.selectAll("*").remove();

    const contentWidth = width - margin.left - margin.right;
    const contentHeight = height - margin.top - margin.bottom;

    svg.append("defs")
      .append("clipPath")
      .attr("id", "plot-area-clip")
      .append("rect")
      .attr("width", contentWidth)
      .attr("height", contentHeight);

    const allPoints: Point[] = Object.values(grouped).flat();

    const deviationKey = yAxisField === "Carry Distance" ? "Carry Deviation Distance" : "Total Deviation Distance";
    const distanceKey = yAxisField;

    // Align xAbsMax and yAbsMax logic with TrajectoriesTopView.tsx
    const xAbsMax = bounds["Total Deviation Distance"]
      ? Math.max(Math.abs(bounds["Total Deviation Distance"].min), Math.abs(bounds["Total Deviation Distance"].max))
      : d3.max(allPoints, d => Math.abs(d.x)) || 0;

    const yAbsMax = bounds[distanceKey]
      ? bounds[distanceKey].max
      : d3.max(allPoints, d => d.y) || 0;

    const xScale = d3.scaleLinear()
      .domain([-xAbsMax, xAbsMax])
      .range([0, contentWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain([0, yAbsMax])
      .range([contentHeight, 0])
      .nice();

    const maxY = yAbsMax;
    const radiusStep = 50;

    const plotGroup = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const clipGroup = plotGroup.append("g")
      .attr("clip-path", "url(#plot-area-clip)");

    for (let r = radiusStep; r <= maxY; r += radiusStep) {
      const radius = yScale(0) - yScale(r);
      clipGroup.append("circle")
        .attr("cx", xScale(0))
        .attr("cy", yScale(0))
        .attr("r", radius)
        .attr("stroke", "black")
        .attr("fill", "none")
        .attr("stroke-dasharray", "4 2");

      clipGroup.append("text")
        .attr("x", xScale(0))
        .attr("y", yScale(r) - 4)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", "#666")
        .text(`${r}`);
    }

    // Add horizontal gridlines (match TrajectoriesTopView)
    clipGroup.selectAll(".grid-line")
      .data(yScale.ticks())
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", 0)
      .attr("x2", contentWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.5);

    // Add vertical line at x = 0
    clipGroup.append("line")
      .attr("x1", xScale(0))
      .attr("x2", xScale(0))
      .attr("y1", 0)
      .attr("y2", contentHeight)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.5);

    plotGroup.append("g")
      // Align X-axis with zero line of Y-axis
      .attr("transform", `translate(0,${yScale(0)})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(Math.ceil((xAbsMax * 2) / 10))
          .tickFormat(d => `${d}`)
      );

    // Add x-axis direction labels
    plotGroup.append("text")
      .attr("x", 10)
      .attr("y", yScale(0) - 10)
      .attr("text-anchor", "start")
      .style("font-size", "12px")
      .style("fill", "#666")
      .text("Left");

    plotGroup.append("text")
      .attr("x", contentWidth - 10 )
      .attr("y", yScale(0) - 10)
      .attr("text-anchor", "end")
      .style("font-size", "12px")
      .style("fill", "#666")
      .text("Right");

    // Add X-axis label (match style/offset to TrajectoriesTopView.tsx)
    plotGroup.append("text")
      .attr("x", contentWidth / 2)
      .attr("y", yScale(0) + 50)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .style("font-size", "12px")
      .text("Deviation (Yards)");

    plotGroup.append("g")
      .call(
        d3.axisLeft(yScale)
          .ticks(Math.ceil(yAbsMax / 20))
          .tickFormat(d => `${d}`)
      );

    // Add Y-axis label
    plotGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -contentHeight / 2)
      .attr("y", -45)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .style("font-size", "12px")
      .text(`${yAxisField.replace(" Distance", "")} (Yards)`);

    Object.entries(grouped).forEach(([type, points]: [string, Point[]], index) => {
      if (!visibleClubTypes.includes(type)) return;
      const color = CLUB_TYPE_COLORS[type];

      const meanX = d3.mean(points, d => d.x) ?? 0;
      const meanY = d3.mean(points, d => d.y) ?? 0;
      const covMatrix = new Matrix([
        [d3.mean(points, d => Math.pow(d.x - meanX, 2)) ?? 0, d3.mean(points, d => (d.x - meanX) * (d.y - meanY)) ?? 0],
        [d3.mean(points, d => (d.x - meanX) * (d.y - meanY)) ?? 0, d3.mean(points, d => Math.pow(d.y - meanY, 2)) ?? 0]
      ]);
      const eig = new EigenvalueDecomposition(covMatrix);
      const eigenValues = eig.realEigenvalues;
      const eigenVectors = eig.eigenvectorMatrix.to2DArray();

      const stdDevMultiplier = 2; // 2σ standard deviation ellipse ~= %95 coverage

      // Draw ellipse representing 1 standard deviation spread
      const rx = Math.sqrt(eigenValues[0]) * stdDevMultiplier;
      const ry = Math.sqrt(eigenValues[1]) * stdDevMultiplier;
      if (isNaN(rx) || isNaN(ry)) return;
      const angle = Math.atan2(eigenVectors[1][0], eigenVectors[0][0]) * (180 / Math.PI);

      clipGroup.append("ellipse")
        .attr("cx", xScale(meanX))
        .attr("cy", yScale(meanY))
        .attr("rx", Math.abs(xScale(meanX + rx) - xScale(meanX)) * 2)
        .attr("ry", Math.abs(yScale(meanY + ry) - yScale(meanY)))
        .attr("transform", `rotate(${angle}, ${xScale(meanX)}, ${yScale(meanY)})`)
        .style("fill", color)
        .style("fill-opacity", 0.1)
        .style("stroke", color)
        .style("stroke-width", 1.5)
        .style("pointer-events", "none");

      clipGroup.selectAll(`.point-${index}`)
        .data(points as Point[])
        .enter()
        .append("circle")
        .attr("class", `point-${index}`)
        .attr("cx", (d: Point) => xScale(d.x))
        .attr("cy", (d: Point) => yScale(d.y))
        .attr("r", 4)
        .attr("fill", color)
        .on("mouseover", function (event, d: Point) {
          tooltip.transition().duration(200)
            .style("opacity", 0.9)
            .style("display", "block");
          tooltip.html(
            Object.entries(
              data.find(s =>
                parseFloat(s["Carry Deviation Distance"]) === d.x &&
                parseFloat(s[yAxisField]) === d.y &&
                s["﻿Date"] === d.label
              ) || {}
            ).map(([key, value]) => `${key}: ${value}`).join("<br/>")
          )
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
          tooltip.transition().duration(500)
            .style("opacity", 0)
            .on("end", () => tooltip.style("display", "none"));
        });
    });

    return () => {
      tooltip.remove();
    };
  }, [data, grouped, yAxisField, dimensions, visibleClubTypes, bounds]);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      <div style={{ flex: '1 1 0%', overflow: "hidden" }}>
        <svg
          ref={scatterPlot}
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        />
      </div>
    </div>
  );
};

export default ScatterPlotComponent;