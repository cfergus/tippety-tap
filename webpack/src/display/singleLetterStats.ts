import { initAlphaTimingAxes, GraphSizing, drawInterquartile, drawExtentLines, drawMedianLine, drawBoxAndWhiskers, updateYAxis } from './graphCommon';
import * as d3 from 'd3';
// TODO: HACK: to bypass type checking, since types aren't release for d3 v6 yet
const dd3 = d3 as any;





export class SingleLetterStats {

  // The parent container in which to do all DOM modification
  parentElement: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
  svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  x: any;
  y: any;

  constructor(parentElement: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    this.parentElement = parentElement;
    const sizing = new GraphSizing();

    this.svg = parentElement
      .append('svg')
      .attr('class', 'double-letter-metrics')
      .attr('width', sizing.svgWidth)
      .attr('height', sizing.svgHeight)
      .append('g')
      .attr('transform',
        'translate(' + sizing.margin.left + ',' + sizing.margin.top + ')');
    ;

    [this.x, this.y] = initAlphaTimingAxes(this.svg, sizing.width, sizing.height);
  }


  render(doubleLetterMetrics: any) {

    // Prepare the data so it's suitable for display, including statistics computation
    const doubleLettersArray = Object.entries<number[]>(doubleLetterMetrics)
      .map(d => {

        const sortedValues = d[1].sort(d3.ascending);

        return {
          key: d[0].toUpperCase(),
          value: sortedValues,
          q1: dd3.quantileSorted(sortedValues, 0.25),
          q2: dd3.quantileSorted(sortedValues, 0.5),
          q3: dd3.quantileSorted(sortedValues, 0.75),
          min: d3.min(sortedValues),
          max: d3.max(sortedValues),
          deviation: d3.deviation(sortedValues)
        };
      });


    // // Redraw y axis based on maximum value
    updateYAxis(this.svg, doubleLettersArray, this.y);

    drawBoxAndWhiskers(this.svg, doubleLettersArray, this.x, this.y);

  }

}