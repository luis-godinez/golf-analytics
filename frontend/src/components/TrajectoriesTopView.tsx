import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CLUB_TYPE_COLORS } from "../constants/clubTypes";
import { drawGridAndAxes, appendClipPath, DEFAULT_MARGIN, calculateContentSize } from "./SharedPlotStyle";

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

    const margin = DEFAULT_MARGIN;
    const { contentWidth, contentHeight } = calculateContentSize(containerWidth, containerHeight, margin);

    const svg = d3.select(topView.current as SVGSVGElement);
    svg.selectAll('*').remove();

    appendClipPath(svg, "plot-area-clip", contentWidth, contentHeight);

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

    const xScale = d3.scaleLinear().domain(xExtent).range([0, contentWidth]).nice();
    const yScale = d3.scaleLinear().domain(yExtent).range([contentHeight, 0]).nice();

    // Use shared function to draw grid and axes, passing clipGroup as second argument
    drawGridAndAxes(plotGroup, clipGroup, {
      xScale,
      yScale,
      width: containerWidth,
      height: containerHeight,
      contentWidth,
      contentHeight,
      margin,
      bounds,
      distanceType
    }, 'Deviation (Yards)', `${distanceType} (Yards)`);

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
