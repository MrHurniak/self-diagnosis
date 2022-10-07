export let DELAY = 1000;
export let RUN_PROBABILITY = 0.25;
export let NODE_LINK_PROBABILITY = 0.5;

export const PAUSE_DELAY = 1000;

export function update(values) {
  DELAY = values.delay;
  RUN_PROBABILITY = values.runProbability;
  NODE_LINK_PROBABILITY = values.nodeLinkProbability;
}
