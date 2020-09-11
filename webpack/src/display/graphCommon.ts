import * as d3 from 'd3';


const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ".split("");

export interface SourceKeyMetric {
  key: string,
  value: Array<Number>,
  min: number,
  max: number,
  q1: number,
  q2: number,
  q3: number,
  deviation: number
}
// Should use deviation too. A good measure of consistency

export class GraphSizing {

  // TODO : Override with constructor, etc

  margin = { top: 10, right: 30, bottom: 30, left: 40 };
  width = 560 - this.margin.left - this.margin.right; // Width of chartable space
  height = 400 - this.margin.top - this.margin.bottom; // Height of chartable space
  svgWidth = this.width + this.margin.left + this.margin.right;
  svgHeight = this.height + this.margin.top + this.margin.bottom;
}



// Create axes with letters at the x, timing as the y
export function initAlphaTimingAxes(
    svg: any, 
    width: number, 
    height: number, 
    xDomain: string[] = alphabet): [d3.ScaleBand<string>,d3.ScaleLinear<number, number>] {

  // X scale - key pressed
  const x = d3.scaleBand()
    .domain(xDomain)
    .range([0, width])
    .paddingInner(0.1)
  // .paddingOuter(0.5);

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Y scale - timing info
  const y = d3.scaleLinear()
    .domain([0, 10000])
    .range([height, 0]);

  svg.append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(y));

  return [x, y];
}


export function drawBoxAndWhiskers(svg: any,
    data: SourceKeyMetric[],
    x: d3.ScaleBand<string>,
    y: d3.ScaleLinear<number, number>) {

  drawExtentLines(svg, data, x, y);
  drawInterquartile(svg, data, x, y);
  drawMedianLine(svg, data, x, y);
  // TODO : Should individual points be rendered as well? Or too noisy?
}

// Draw extent lines
export function drawExtentLines(svg: any,
  data: SourceKeyMetric[],
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>) {

  svg.selectAll('line.extent')
    .data(data)
    .join('line')
    .attr('class', 'extent')
    .attr('x1', (d: SourceKeyMetric) => x(d.key) + x.bandwidth() / 2)
    .attr('x2', (d: SourceKeyMetric) => x(d.key) + x.bandwidth() / 2)
    .attr('y1', (d: SourceKeyMetric) => y(d.max))
    .attr('y2', (d: SourceKeyMetric) => y(d.min))
    ;
}


// Draw the box that surrounds the interquartile range
export function drawInterquartile(
    svg: any, 
    data: SourceKeyMetric[], 
    x:d3.ScaleBand<string>, 
    y:d3.ScaleLinear<number,number>) {

  svg.selectAll('rect.interquartile-box')
    .data(data)
    .join('rect')
    .attr('class', 'interquartile-box')
    .attr('x', (d: SourceKeyMetric) => x(d.key))
    .attr('y', (d: SourceKeyMetric) => y(d.q3))
    .attr('height', (d: SourceKeyMetric) => y(d.q1) - y(d.q3))
    .attr('width', () => x.bandwidth())
    ;
}

export function drawMedianLine(
    svg: any,
    data: SourceKeyMetric[],
    x: d3.ScaleBand<string>,
    y: d3.ScaleLinear<number, number>) {

  svg.selectAll('line.median')
    .data(data)
    .join('line')
    .attr('class', 'median')
    .attr('x1', (d: SourceKeyMetric) => x(d.key))
    .attr('x2', (d: SourceKeyMetric) => x(d.key) + x.bandwidth())
    .attr('y1', (d: SourceKeyMetric) => y(d.q2))
    .attr('y2', (d: SourceKeyMetric) => y(d.q2))
    ;
}


export function updateYAxis(
    svg: any, 
    data: SourceKeyMetric[], 
    y: d3.ScaleLinear<number, number>) {

  const timingMax = d3.max(data, d => d3.max(d.value));

  // Redraw y axis based on maximum value
  y.domain([0, timingMax]);
  svg.selectAll('g.y.axis').call(d3.axisLeft(y));

}