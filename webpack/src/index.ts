import * as d3 from 'd3';

import { typingService } from './typingCapture';

import {OverallStats} from './display/overallStats';
import {DoubleLetterStats} from './display/doubleLetterStats';

const numberFormat = d3.format('.0f');



let metricsDataByFirstKey: any = {};  // Record<string, ?>
let metricsDataBySecondKey: any = {};  // Record<string, ?>
let doubleLetterMetrics: any = {};


const outputDiv = d3.select('.metrics-output');
// TODO : sub-containers for each stats output

let overallStats = new OverallStats(outputDiv);
let doubleLetterStats = new DoubleLetterStats(outputDiv);


// option - scan() to accumulate objects
typingService.doubleLetterTiming.subscribe(v => {
  console.log("double", v);

  const srcKey = v.pair[0].key;

  if( !doubleLetterMetrics[srcKey] ) {
    doubleLetterMetrics[srcKey] = [];
  } 
  doubleLetterMetrics[srcKey].push( v.timing );

  doubleLetterStats.render(doubleLetterMetrics);
});


typingService.pairwiseTiming.subscribe(v => {
  console.log( 'pair', v );

  const srcKey = v.pair[0].key;
  const targetKey = v.pair[1].key;

  // Source timing
  if( !metricsDataByFirstKey[srcKey] ) {
    metricsDataByFirstKey[srcKey] = {};
  }
  const s = metricsDataByFirstKey[srcKey];
  if( !s[targetKey] ) {
    s[targetKey] = [];
  }
  s[targetKey].push(v.timing);

  // Target timing
  if (!metricsDataBySecondKey[targetKey]) {
    metricsDataBySecondKey[targetKey] = {};
  }
  const t = metricsDataBySecondKey[targetKey];
  if (!t[srcKey]) {
    t[srcKey] = [];
  }
  t[srcKey].push(v.timing);

  // Overall
  overallStats.addPairwiseTiming(v.timing);

});



/* Concept of data flow

timing for single keys 

scan to create mega object ?
// src: { dest: [timings] }
{
  'd': {
    'a': [7],
    'b': [8, 7, 9],
    'd': [2]
  }, 
  'g': {
    'a': [1,2]
  }
}

turn this into d3 suitable object
[
  { d: { 
    a: [7], 
    b: [8, 7, 9], 
    d: [2]
  },
  { g: ... }
]

*/