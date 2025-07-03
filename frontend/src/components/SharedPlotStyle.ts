import * as d3 from "d3";

export const DEFAULT_MARGIN = { top: 40, right: 30, bottom: 70, left: 60 };

export function calculateContentSize(
  containerWidth: number,
  containerHeight: number,
  margin: { top: number; right: number; bottom: number; left: number }
) {
  return {
    contentWidth: containerWidth - margin.left - margin.right,
    contentHeight: containerHeight - margin.top - margin.bottom,
  };
}

export interface PlotBounds {
  min: number;
  max: number;
}

export interface PlotStyleOptions {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  width: number;
  height: number;
  contentWidth: number;
  contentHeight: number;
  margin: { top: number; right: number; bottom: number; left: number };
  bounds: Record<string, PlotBounds>;
  distanceType: "Carry" | "Total";
}

export function drawGridAndAxes(
  plotGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  clipGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  options: PlotStyleOptions,
  xLabel: string,
  yLabel: string
) {
  const { xScale, yScale, contentWidth, contentHeight, bounds, distanceType } = options;

  // Draw axes
  plotGroup.append('g')
    .attr('transform', `translate(0,${contentHeight})`)
    .call(d3.axisBottom(xScale))
    .call(g => g.append('text')
      .attr('x', contentWidth / 2)
      .attr('y', 50)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .style("font-size", "12px")
      .text(xLabel));

  plotGroup.append('g')
    .call(d3.axisLeft(yScale).ticks(Math.ceil((bounds[distanceType + " Distance"]?.max || 0) / 20)))
    .call(g => g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -contentHeight / 2)
      .attr('y', -45)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .style("font-size", "12px")
      .text(yLabel));

  // Horizontal grid lines
  const yTicks = yScale.ticks(Math.ceil((bounds[distanceType + " Distance"]?.max || 0) / 20));
  plotGroup.selectAll(".horizontal-grid")
    .data(yTicks)
    .enter()
    .append("line")
    .attr("class", "horizontal-grid")
    .attr("x1", 0)
    .attr("x2", contentWidth)
    .attr("y1", yScale)
    .attr("y2", yScale)
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.5);

const maxYardage = bounds[distanceType + " Distance"]?.max || 0;

  // Reference circles
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

  // Labels for concentric circles: show at every 50 yards
  for (let tick = 50; tick <= maxYardage; tick += 50) {
    clipGroup.append("text")
      .attr("x", contentWidth - 40)
      .attr("y", yScale(tick) - 5)
      .attr("fill", "#999")
      .attr("font-size", 10)
      .text(`${tick} yds`);
  }

  // Vertical line at x = 0
  plotGroup.append("line")
    .attr("x1", xScale(0))
    .attr("x2", xScale(0))
    .attr("y1", 0)
    .attr("y2", contentHeight)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.5);
}

export function appendClipPath(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  clipId: string,
  width: number,
  height: number
) {
  const defs = svg.select("defs");
  if (!defs.empty()) {
    defs.select(`#${clipId} rect`)
      .attr("width", width)
      .attr("height", height);
    return;
  }

  svg.append("defs")
    .append("clipPath")
    .attr("id", clipId)
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height);
}
