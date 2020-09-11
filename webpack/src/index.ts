import * as d3 from 'd3';

import { typingService } from './typingCapture';

import {OverallStats} from './display/overallStats';
import {DoubleLetterStats} from './display/doubleLetterStats';
import { scan, pluck } from 'rxjs/operators';


/* Concept of data flow

collect timing from one key to another
put this into data structures, which can be consumed by a subscriber


data object looks like 

first key, all followup keys, timings for those keys
 - src: { dest: [timings] }
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

similar object for reverse index, dest -> source, and others as needed

downstream, we will convert this into a d3 suitable array
[
  { d: {
    a: [7],
    b: [8, 7, 9],
    d: [2]
  },
  { g: ... }
]

*/


let doubleLetterMetrics: any = {};


const outputDiv = d3.select('.metrics-output');

let overallStats = new OverallStats(outputDiv.append('div').attr('class', 'overall') );
let doubleLetterStats = new DoubleLetterStats(outputDiv.append('div').attr('class', 'double'));


typingService.doubleLetterTiming.subscribe(v => {

  const srcKey = v.pair[0].key;

  if( !doubleLetterMetrics[srcKey] ) {
    doubleLetterMetrics[srcKey] = [];
  } 
  doubleLetterMetrics[srcKey].push( v.timing );

  doubleLetterStats.render(doubleLetterMetrics);
  // TODO : Instead, have class method to add timing and handle rendering in the double letter object
  //  better yet, just pass observable to class, and it can do whatever it wants
});


typingService.pairwiseTiming.subscribe(v => {
  
  // Overall timing, regardless of key source or target
  overallStats.addPairwiseTiming(v.timing);
});



/*

Architecture thought:

index.ts stores
{
  'a': Observable
  'b': Observable
}
one for previous key, one for next key

Observable does a scan, to populate the most up to date object

output of this subscription goes to this class (Singleletterstats) for a 'render'

*/



const srcKeyMetrics$ = typingService.pairwiseTiming.pipe(
  // Accumulate into mega object of all keys, creating desired object structure
  scan((acc: any, curr) => { 

    const srcKey = curr.pair[0].key;
    const targetKey = curr.pair[1].key;


    if (!acc[srcKey]) {
      acc[srcKey] = {};
    }
    const s = acc[srcKey];

    if (!s[targetKey]) {
      s[targetKey] = [];
    }

    s[targetKey].push(curr.timing);

    return acc;
  }, {} )
);


srcKeyMetrics$.subscribe( v => {
  console.log(v);
});

srcKeyMetrics$.pipe(
  pluck('a')
).subscribe( v => {
  // metrics specific to source key 'a'
  console.log( 'a?', v);
} );


const targetKeyMetrics = typingService.pairwiseTiming.pipe(
  // Accumulate into mega object of all keys, creating desired object structure
  scan((acc: any, curr) => {

    const srcKey = curr.pair[0].key;
    const targetKey = curr.pair[1].key;


    if (!acc[targetKey]) {
      acc[targetKey] = {};
    }
    const s = acc[targetKey];

    if (!s[srcKey]) {
      s[srcKey] = [];
    }

    s[srcKey].push(curr.timing);

    return acc;
  }, {})
);
