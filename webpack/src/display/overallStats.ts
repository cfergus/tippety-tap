import { initAlphaTimingAxes, GraphSizing, SourceKeyMetric, drawBoxAndWhiskers, updateYAxis } from './graphCommon'; 
import * as d3 from 'd3';
const dd3 = d3 as any;

export class OverallStats {

  parentElement: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
  svg: d3.Selection<SVGGElement,unknown,HTMLElement,any>;
  x: d3.ScaleBand<string>;
  y: d3.ScaleLinear<number, number>;

  timings: number[] = [];

  constructor( parentElement: d3.Selection<d3.BaseType,unknown,HTMLElement,any> ) {

    this.parentElement = parentElement;
    
    const sizing = new GraphSizing();

    this.svg = parentElement
      .append('svg')
      .attr('class', 'overall-metrics-output')
      .attr('width', sizing.svgWidth)
      .attr('height', sizing.svgHeight)
      .append('g')
      .attr('transform',
        'translate(' + sizing.margin.left + ',' + sizing.margin.top + ')');
      ;

    [this.x,this.y] = initAlphaTimingAxes(this.svg, sizing.width, sizing.height, ['All Keys']);


    this.parentElement.append('div').attr('class', 'overall-indicators')
      .append('h2').text('Overall Indicators');
  }

  // Add a pairwise timing, regardless of keys
  addPairwiseTiming( timing: number ) {
    this.timings.push( timing );
    this.render();
  }

  render() {

    const t = this.timings.sort( d3.ascending );

    const stats: SourceKeyMetric = {
      key: 'All Keys',
      value: t,
      q1: dd3.quantileSorted(t, 0.25),
      q2: dd3.quantileSorted(t, 0.5),
      q3: dd3.quantileSorted(t, 0.75),
      min: d3.min(t),
      max: d3.max(t),
      deviation: d3.deviation(t)
    }

    // Key indicators box
    const statsBox = this.parentElement
      .select('div.overall-indicators')
      .selectAll('div.indicators')
      .data([stats])
      .join('div')
      .attr('class', 'indicators')
      // .text('') // TODO : For some reason, it keeps appending divs unless this is here
      // joining data at wrong level?
      ;
      // ;
    statsBox.text('');

    statsBox.append('div').text( d => `${d.value.length} key pairs`);
    statsBox.append('div').text( d => `${d.deviation} deviation`);



    // Graphs
    drawBoxAndWhiskers( this.svg, [stats], this.x, this.y );

    updateYAxis(this.svg, [stats], this.y);

    // this.parentElement
    //   .select('div')
    //   .datum(this.timings)
    //   .enter()
    //     .append( 'div' )
    //     .text( d=> `length ${d.length}`)
  }
}