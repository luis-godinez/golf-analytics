import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { drawGridAndAxes, appendClipPath, DEFAULT_MARGIN, calculateContentSize } from "./SharedPlotStyle";
import { Matrix, EigenvalueDecomposition } from "ml-matrix";
import { CLUB_TYPE_COLORS } from "../constants/clubTypes";

interface Point {
  x: number;
  y: number;
  label: string;
}

interface ScatterPlotProps {
  data: any[];
  bounds: Record<string, { min: number; max: number }>;
  distanceType: "Carry" | "Total";
}

const ScatterPlotComponent: React.FC<ScatterPlotProps> = ({ data, bounds, distanceType }) => {
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
    if (!scatterPlot.current) return;

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
    const margin = DEFAULT_MARGIN;

    const { contentWidth, contentHeight } = calculateContentSize(width, height, margin);

    const svg = d3.select(scatterPlot.current);
    // Do not clear all elements, only clear points and ellipses to keep axes and grid
    svg.selectAll("circle").remove();
    svg.selectAll("ellipse").remove();

    // Append defs and clipPath using shared function
    appendClipPath(svg, "plot-area-clip", contentWidth, contentHeight);

    // Scales based on bounds
    const allPoints: Point[] = Object.values(grouped).flat();

    const distanceKey = yAxisField;

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

    // Clear and redraw axes and grid
    svg.selectAll("g.axis").remove();
    svg.selectAll("g.grid").remove();

    const plotGroup = svg.select("g.plot-group");
    if (plotGroup.empty()) {
      svg.append("g").attr("class", "plot-group").attr("transform", `translate(${margin.left},${margin.top})`);
    }
    const plotG = svg.select<SVGGElement>("g.plot-group");
    // Clear the plot group to avoid overlapping charts
    plotG.selectAll("*").remove();

    const clipGroup = plotG.select("g.clip-group");
    if (clipGroup.empty()) {
      plotG.append("g").attr("class", "clip-group").attr("clip-path", "url(#plot-area-clip)");
    }
    const clipG = plotG.select<SVGGElement>("g.clip-group");

    // Draw grid and axes using shared function
    drawGridAndAxes(plotG, clipG, {
      xScale,
      yScale,
      width,
      height,
      contentWidth,
      contentHeight,
      margin,
      bounds,
      distanceType
    }, "Deviation (Yards)", `${yAxisField.replace(" Distance", "")} (Yards)`);

    // If no data, skip plotting points and ellipses
    if (!data || data.length === 0) {
      tooltip.remove();
      return;
    }

    Object.entries(grouped).forEach(([type, points]: [string, Point[]], index) => {
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

      clipG.append("ellipse")
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

      clipG.selectAll(`.point-${index}`)
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
  }, [data, grouped, yAxisField, dimensions, bounds]);

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