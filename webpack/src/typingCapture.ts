import { fromEvent, merge } from 'rxjs';
import { groupBy, mergeMap, map, mergeAll, tap, distinctUntilChanged, pairwise, filter } from 'rxjs/operators';


const keyDowns = fromEvent<KeyboardEvent>(document, 'keydown');
const keyUps = fromEvent<KeyboardEvent>(document, 'keyup');

const keyPress = merge(keyDowns, keyUps);

/*
Ideas
remove shift from analysis? Include it as a modifier?
Box and whisker plot of timing
Radial chart with keys of interest [a-z0-9 ], include overall average as circle
*/

// tap( e => console.log( 'Straight from press', e ) ),
const keystrokeTiming = keyPress.pipe(
  groupBy(e => e.keyCode),
  // distinctUntilChanged( undefined, e => e.type),
  mergeAll()
);

// Time from keydown to next keydown
const pairwiseTiming = keyDowns.pipe(
  pairwise(),
  map(pair => {
    return {
      pair: pair,
      timing: pair[1].timeStamp - pair[0].timeStamp
    }
  })
);

// Time from keydown of a key to a second keydown of the same key
// Only triggers if they are in sequence, hence a 'double letter' ("dd", "ee")
const doubleLetterTiming = pairwiseTiming.pipe(
  filter(val => {
    return val.pair[0].keyCode === val.pair[1].keyCode;
  })
);



export const typingService = {
  keystrokeTiming: keystrokeTiming,
  pairwiseTiming: pairwiseTiming,
  doubleLetterTiming: doubleLetterTiming
};
