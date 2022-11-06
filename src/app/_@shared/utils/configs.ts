export let DELAY = 1000;
export let RUN_PROBABILITY = 0.25;
export let NODE_LINK_PROBABILITY = 0.5;
export let COEFFICIENT_OF_SUFFICIENCY = 1.7;

export let P = 0.8;
export let Q = 1 - P;

export const PAUSE_DELAY = 1000;
export const FALSE_PROBABILITY = 0.5;
export const CAN_DISABLE_EDGE = false;

export function update(values) {
  DELAY = values.delay;
  RUN_PROBABILITY = values.runProbability;
  NODE_LINK_PROBABILITY = values.nodeLinkProbability;
  COEFFICIENT_OF_SUFFICIENCY = values.coefOfSufficiency;
}
