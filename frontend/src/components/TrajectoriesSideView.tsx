import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { CLUB_TYPE_COLORS } from "../constants/clubTypes";

interface ShotData {
  carryDistance: number; // in yards
  apexHeight: number; // in meters
  clubType: string;
  launchAngle: number; // degrees
  ballSpeed: number; // km/h
  backspin: number; // rpm
  airDensity: number; // g/L
  totalDistance: number;
  totalDeviationDistance: number;
}

interface TrajectoriesSideViewProps {
  data: ShotData[];
  bounds: Record<string, { min: number; max: number }>;
  width?: number;
  height?: number;
}


const TrajectoriesSideViewComponent: React.FC<TrajectoriesSideViewProps> = ({ data, bounds, width = 700, height = 400 }) => {
  const sideView = useRef<SVGSVGElement | null>(null);
  const topView = useRef<SVGSVGElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(width);

  // Responsive container width
  useEffect(() => {
    function handleResize() {
      if (sideView.current) {
        const w = sideView.current.parentElement?.clientWidth || width;
        setContainerWidth(w);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width]);

  useEffect(() => {
    const parsedData: ShotData[] = data.map((d: any) => ({
      carryDistance: parseFloat(d["Carry Distance"]),
      apexHeight: parseFloat(d["Apex Height"]),
      clubType: d["Club Type"],
      launchAngle: parseFloat(d["Launch Angle"]),
      ballSpeed: parseFloat(d["Ball Speed"]),
      backspin: parseFloat(d["Backspin"]),
      airDensity: parseFloat(d["Air Density"]),
      totalDistance: parseFloat(d["Total Distance"]),
      totalDeviationDistance: parseFloat(d["Total Deviation Distance"]),
    }));
    // Proceed to draw axes even if parsedData is empty
    // console.log("Sample trajectory data point:", parsedData[0]);

    const margin = { top: 40, right: 30, bottom: 70, left: 60 };
    const w = containerWidth - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const svg = d3.select(sideView.current);
    svg.selectAll('*').remove();

    // Use configured bounds regardless of data length
    const xExtent = [
      0,
      bounds["Total Distance"] ? bounds["Total Distance"].max : 100
    ] as [number, number];
    const yExtent = [
      0,
      bounds["Apex Height"] ? bounds["Apex Height"].max * 1.09361 : 30
    ] as [number, number];

    const xScale = d3.scaleLinear().domain([Math.min(0, xExtent[0]), xExtent[1]]).range([0, w]).nice();
    const yScale = d3.scaleLinear().domain([0, yExtent[1]]).range([h, 0]).nice();

    // Axis generators
    const xAxis = d3.axisBottom(xScale).ticks(8);
    const yAxis = d3.axisLeft(yScale).ticks(6);

    // Append group container
    const group = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Draw axes
    group.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(xAxis)
      .call(g => g.append('text')
        .attr('x', w / 2)
        .attr('y', 50)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('font-size', '12px')
        .text('Carry + Roll (Yards)'));

    group.append('g')
      .call(yAxis)
      .call(g => g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -h / 2)
        .attr('y', -45)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('font-size', '12px')
        .text('Height (Meters)'));

    // Only plot trajectories if data is available
    if (parsedData.length > 0) {
      parsedData.forEach((d) => {
        const points: { x: number; y: number }[] = [];
        const apexYards = d.apexHeight * 1.09361;
        const carry = d.carryDistance;
        const steps = 30;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const x = t * carry;
          const y = 4 * apexYards * t * (1 - t);
          points.push({ x, y });
        }

        const carryDistance = d.carryDistance;
        const totalDistance = !isNaN(d.totalDistance) ? d.totalDistance : carryDistance;
        const rollDistance = Math.max(0, totalDistance - carryDistance);
        const descentProxy = apexYards / carryDistance;
        const bounceApex = descentProxy * rollDistance * 0.5;

        const rollArchPoints: { x: number, y: number }[] = [];
        const rollSteps = 20;
        for (let j = 0; j <= rollSteps; j++) {
          const t = j / rollSteps;
          const x = carryDistance + t * rollDistance;
          const y = 4 * bounceApex * t * (1 - t);
          rollArchPoints.push({ x, y });
        }

        const line = d3.line<{ x: number, y: number }>()
          .x(p => xScale(p.x))
          .y(p => yScale(p.y))
          .curve(d3.curveBasis);

        const rollLine = d3.line<{ x: number, y: number }>()
          .x(p => xScale(p.x))
          .y(p => yScale(p.y))
          .curve(d3.curveLinear);

        group.append('path')
          .datum(points)
          .attr('fill', 'none')
          .attr('stroke', CLUB_TYPE_COLORS[d.clubType])
          .attr('stroke-width', 1)
          .attr('d', line(points));

        group.append('path')
          .datum(rollArchPoints)
          .attr('fill', 'none')
          .attr('stroke', CLUB_TYPE_COLORS[d.clubType])
          .attr('stroke-width', 0.8)
          .attr("stroke-dasharray", "3,3")
          .attr('d', rollLine);
      });
    }

  }, [data, containerWidth, height, bounds]);

  return (
    <>
      <svg ref={sideView} width={containerWidth} height={height} />
      <svg ref={topView} width={containerWidth} height={height} />
    </>
  );
};

export default TrajectoriesSideViewComponent;