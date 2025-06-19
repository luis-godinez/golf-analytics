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
}

const ScatterPlotComponent: React.FC<ScatterPlotProps> = ({ data, visibleClubTypes, bounds }) => {
  const [yAxisField, setYAxisField] = React.useState<"Carry Distance" | "Total Distance">("Carry Distance");
  const scatterPlot = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 });

  const grouped: Record<string, Point[]> = data.reduce((acc, shot) => {
    const type = shot["Club Type"];
    if (!type) return acc;
    if (!acc[type]) acc[type] = [];
    acc[type].push({
      x: parseFloat(shot["Carry Deviation Distance"]),
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
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const svg = d3.select(scatterPlot.current);
    svg.selectAll("*").remove();

    const contentWidth = width - margin.left - margin.right;
    const contentHeight = height - margin.top - margin.bottom;

    const allPoints: Point[] = Object.values(grouped).flat();

    const deviationKey = yAxisField === "Carry Distance" ? "Carry Deviation Distance" : "Total Deviation Distance";
    const distanceKey = yAxisField;

    const xAbsMax = bounds[deviationKey] ? Math.max(Math.abs(bounds[deviationKey].min), Math.abs(bounds[deviationKey].max)) : 50;
    const yAbsMax = bounds[distanceKey] ? Math.max(Math.abs(bounds[distanceKey].min), Math.abs(bounds[distanceKey].max)) : 100;

    const xScale = d3.scaleLinear()
      .domain([-xAbsMax, xAbsMax])
      .range([0, contentWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, yAbsMax])
      .range([contentHeight, 0]);

    const maxY = yAbsMax;
    const radiusStep = 50;

    const group = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    for (let r = radiusStep; r <= maxY; r += radiusStep) {
      const radius = yScale(0) - yScale(r);
      group.append("circle")
        .attr("cx", xScale(0))
        .attr("cy", yScale(0))
        .attr("r", radius)
        .style("fill", "none")
        .style("stroke", "#ccc")
        .style("stroke-dasharray", "2,2")
        .style("stroke-opacity", 0.5);

      group.append("text")
        .attr("x", xScale(0))
        .attr("y", yScale(r) - 4)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", "#666")
        .text(`${r}`);
    }

    group.append("g")
      .attr("transform", `translate(0,${contentHeight})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(10)
          .tickSize(-contentHeight)
          .tickFormat(d3.format("~s"))
      )
      .selectAll("line")
      .style("stroke", "#ccc")
      .style("stroke-opacity", 0.3);

    // Add x-axis direction labels
    group.append("text")
      .attr("x", 10)
      .attr("y", contentHeight - 10)
      .attr("text-anchor", "start")
      .style("font-size", "12px")
      .style("fill", "#666")
      .text("Left");

    group.append("text")
      .attr("x", contentWidth - 10 )
      .attr("y", contentHeight - 10)
      .attr("text-anchor", "end")
      .style("font-size", "12px")
      .style("fill", "#666")
      .text("Right");

    // Add X-axis label
    group.append("text")
      .attr("x", contentWidth/2)
      .attr("y", contentHeight + 10)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Deviation (Yards)");

    group.append("g")
      .call(d3.axisLeft(yScale).ticks(10));

    // Add Y-axis label
    group.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 5)
      .attr("x", -contentHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Yards");

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

      group.append("ellipse")
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

      group.selectAll(`.point-${index}`)
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
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem", flex: '0 0 auto' }}>
        <label style={{ marginRight: "1rem" }}>
          <input
            type="radio"
            name="yAxisField"
            value="Carry Distance"
            checked={yAxisField === "Carry Distance"}
            onChange={() => setYAxisField("Carry Distance")}
          />
          Carry Distance
        </label>
        <label>
          <input
            type="radio"
            name="yAxisField"
            value="Total Distance"
            checked={yAxisField === "Total Distance"}
            onChange={() => setYAxisField("Total Distance")}
          />
          Total Distance
        </label>
      </div>
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