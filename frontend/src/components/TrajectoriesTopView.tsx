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
  visibleClubTypes: string[];
  bounds: Record<string, { min: number; max: number }>;
  width?: number;
  height?: number;
}

const TrajectoriesTopViewComponent: React.FC<TrajectoriesTopViewProps> = ({ data, visibleClubTypes, bounds, width = 700, height = 400 }) => {
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
      totalDistance: parseFloat(d["Total Distance"]),
      totalDeviationDistance: parseFloat(d["Total Deviation Distance"]),
      clubType: d["Club Type"]
    }));
    if (!parsedData.length) return;

    const margin = { top: 40, right: 30, bottom: 70, left: 60 };
    const w = containerWidth - margin.left - margin.right;
    const h = containerHeight - margin.top - margin.bottom;

    const svg = d3.select(topView.current);
    svg.selectAll('*').remove();
    const group = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const maxAbsDeviation = bounds["Total Deviation Distance"]
      ? Math.max(Math.abs(bounds["Total Deviation Distance"].min), Math.abs(bounds["Total Deviation Distance"].max))
      : d3.max(parsedData, d => Math.abs(d.totalDeviationDistance)) || 0;

    const xExtent: [number, number] = [
      -maxAbsDeviation,
      maxAbsDeviation
    ];
    const yExtent: [number, number] = [
      0,
      bounds["Total Distance"] ? bounds["Total Distance"].max : d3.max(parsedData, d => d.totalDistance) || 0
    ];

    const xScale = d3.scaleLinear().domain(xExtent).range([0, w]).nice();
    const yScale = d3.scaleLinear().domain(yExtent).range([h, 0]).nice();

    // Add X-axis label
    group.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(xScale))
      .call(g => g.append('text')
        .attr('x', w / 2)
        .attr('y', 50)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .text('Deviation (Yards)'));

    // Add Y-axis label
    group.append('g')
      .call(d3.axisLeft(yScale).ticks(Math.ceil(yExtent[1] / 20)))
      .call(g => g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -h / 2)
        .attr('y', -45)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .text('Total (Yards)'));

    const yTicks = yScale.ticks(Math.ceil(yExtent[1] / 20));
    yTicks.forEach(tick => {
      group.append('line')
        .attr('x1', 0)
        .attr('x2', w)
        .attr('y1', yScale(tick))
        .attr('y2', yScale(tick))
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2');
    });

    const maxYardage = yExtent[1];
    const circleSteps = Math.floor(maxYardage / 50);
    for (let i = 1; i <= circleSteps; i++) {
      const radius = yScale(0) - yScale(i * 50);
      group.append('circle')
        .attr('cx', xScale(0))
        .attr('cy', yScale(0))
        .attr('r', radius)
        .attr('stroke', '#ccc')
        .attr('fill', 'none')
        .attr('stroke-dasharray', '4 2');
    }

    parsedData.forEach((d) => {
      if (!visibleClubTypes.includes(d.clubType)) return;
      group.append('line')
        .attr('x1', xScale(0))
        .attr('y1', yScale(0))
        .attr('x2', xScale(d.totalDeviationDistance))
        .attr('y2', yScale(d.totalDistance))
        .attr('stroke', CLUB_TYPE_COLORS[d.clubType])
        .attr('stroke-width', 1.8);
    });

  }, [data, containerWidth, containerHeight, visibleClubTypes, bounds]);

  return (
    <svg
      ref={topView}
      width="100%"
      height="100%"
    />
  );
};

export default TrajectoriesTopViewComponent;
