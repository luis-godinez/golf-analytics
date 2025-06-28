import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CLUB_TYPE_COLORS } from "../constants/clubTypes";

interface ShotData {
  totalDistance: number;
  totalDeviationDistance: number;
  clubType: string;
}

interface TrajectoriesTopViewProps {
  data: ShotData[];
  bounds: Record<string, { min: number; max: number }>;
  width?: number;
  height?: number;
  distanceType: "Carry" | "Total";
}

const TrajectoriesTopViewComponent: React.FC<TrajectoriesTopViewProps> = ({ data, bounds, width = 700, height = 400, distanceType }) => {
  const topView = useRef<SVGSVGElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(width);
  const [containerHeight, setContainerHeight] = useState(height);

  useEffect(() => {
    function handleResize() {
      if (topView.current) {
        const el = topView.current.parentElement;
        if (el) {
          setContainerWidth(el.clientWidth || width);
          setContainerHeight(el.clientHeight || height);
        }
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width, height]);

  useEffect(() => {
    const parsedData: ShotData[] = data.map((d: any) => ({
      totalDistance: parseFloat(d[distanceType + " Distance"]),
      totalDeviationDistance: parseFloat(d[distanceType === "Carry" ? "Carry Deviation Distance" : "Total Deviation Distance"]),
      clubType: d["Club Type"]
    }));

    const margin = { top: 40, right: 30, bottom: 70, left: 60 };
    const w = containerWidth - margin.left - margin.right;
    const h = containerHeight - margin.top - margin.bottom;

    const svg = d3.select(topView.current);
    svg.selectAll('*').remove();

    svg.append("defs")
      .append("clipPath")
      .attr("id", "plot-area-clip")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", w)
      .attr("height", h);

    const plotGroup = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const clipGroup = plotGroup.append("g")
      .attr("clip-path", "url(#plot-area-clip)");

    const maxAbsDeviation = bounds["Total Deviation Distance"]
      ? Math.max(Math.abs(bounds["Total Deviation Distance"].min), Math.abs(bounds["Total Deviation Distance"].max))
      : 0;

    const xExtent: [number, number] = [-maxAbsDeviation, maxAbsDeviation];
    const yExtent: [number, number] = [
      0,
      bounds[distanceType + " Distance"] ? bounds[distanceType + " Distance"].max : 0
    ];

    const xScale = d3.scaleLinear().domain(xExtent).range([0, w]).nice();
    const yScale = d3.scaleLinear().domain(yExtent).range([h, 0]).nice();

    // Draw axes
    plotGroup.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(xScale))
      .call(g => g.append('text')
        .attr('x', w / 2)
        .attr('y', 50)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .style("font-size", "12px")
        .text('Deviation (Yards)'));

    plotGroup.append('g')
      .call(d3.axisLeft(yScale).ticks(Math.ceil(yExtent[1] / 20)))
      .call(g => g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -h / 2)
        .attr('y', -45)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .style("font-size", "12px")
        .text(`${distanceType} (Yards)`));

    // Grid lines and reference circles
    const yTicks = yScale.ticks(Math.ceil(yExtent[1] / 20));
    clipGroup.selectAll(".horizontal-grid")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("class", "horizontal-grid")
      .attr("x1", 0)
      .attr("x2", w)
      .attr("y1", yScale)
      .attr("y2", yScale)
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.5);

    const maxYardage = yExtent[1];
    const circleSteps = Math.floor(maxYardage / 50);
    for (let i = 1; i <= circleSteps; i++) {
      const ringYards = i * 50;
      const radius = yScale(0) - yScale(ringYards);
      clipGroup.append('circle')
        .attr('cx', xScale(0))
        .attr('cy', yScale(0))
        .attr('r', radius)
        .attr('stroke', 'black')
        .attr('fill', 'none')
        .attr('stroke-dasharray', '4 2');
    }

    // Add labels for concentric circles at every 50 yards (like ScatterPlot)
    yScale.ticks().forEach((tick) => {
      if (tick % 50 === 0 && tick !== 0) {
        clipGroup.append("text")
          .attr("x", w - 40)
          .attr("y", yScale(tick) - 5)
          .attr("fill", "#999")
          .attr("font-size", 10)
          .text(`${tick} yds`);
      }
    });

    // Add vertical line at x = 0 (to match ScatterPlot)
    clipGroup.append("line")
      .attr("x1", xScale(0))
      .attr("x2", xScale(0))
      .attr("y1", 0)
      .attr("y2", h)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.5);

    // Plot lines only if data
    if (parsedData.length > 0) {
      parsedData.forEach((d) => {
        clipGroup.append('line')
          .attr('x1', xScale(0))
          .attr('y1', yScale(0))
          .attr('x2', xScale(d.totalDeviationDistance))
          .attr('y2', yScale(d.totalDistance))
          .attr('stroke', CLUB_TYPE_COLORS[d.clubType])
          .attr('stroke-width', 1.8);
      });
    }

  }, [data, containerWidth, containerHeight, bounds, distanceType]);

  return (
    <svg
      ref={topView}
      width="100%"
      height="100%"
    />
  );
};

export default TrajectoriesTopViewComponent;
