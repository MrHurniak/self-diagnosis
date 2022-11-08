export let DELAY = 1000;
export let RUN_PROBABILITY = 0.25;
export let NODE_LINK_PROBABILITY = 0.5;
export let COEFFICIENT_OF_SUFFICIENCY = 1.7;
export let ACCURACY = 0.8;

export let TEST_ENABLED = true;
export let TEST_REGENERATE_MATRIX = false;
export let TEST_DISABLED_NODES_COUNT = 2;
export let TEST_CYCLES = 100;

export let P = 0.8;
export let Q = 1 - P;

export const PAUSE_DELAY = 1000;
export const FALSE_PROBABILITY = 0.5;
export const CAN_DISABLE_EDGE = false;

restoreSettings();

export function update(settings, save = true) {
  if (!settings) return;

  DELAY = settings.delay || DELAY;
  RUN_PROBABILITY = settings.runProbability || RUN_PROBABILITY;
  NODE_LINK_PROBABILITY = settings.nodeLinkProbability || NODE_LINK_PROBABILITY;
  COEFFICIENT_OF_SUFFICIENCY = settings.coefOfSufficiency || COEFFICIENT_OF_SUFFICIENCY;
  ACCURACY = settings.accuracy || ACCURACY;
  TEST_ENABLED = settings.testEnabled;
  TEST_REGENERATE_MATRIX = settings.testRegenerateMatrix;
  TEST_DISABLED_NODES_COUNT = settings.testDisabledNodesCount || TEST_DISABLED_NODES_COUNT;
  TEST_CYCLES = settings.testCycles || TEST_CYCLES;

  if (save) {
    saveSettings();
  }
}

function saveSettings(): void {
  const configs = {
    delay: DELAY,
    runProbability: RUN_PROBABILITY,
    nodeLinkProbability: NODE_LINK_PROBABILITY,
    coefOfSufficiency: COEFFICIENT_OF_SUFFICIENCY,
    accuracy: ACCURACY,
    testEnabled: TEST_ENABLED,
    testDisabledNodesCount: TEST_DISABLED_NODES_COUNT,
    testCycles: TEST_CYCLES,
    testRegenerateMatrix: TEST_REGENERATE_MATRIX,
  };

  localStorage.setItem('settings', JSON.stringify(configs));
}

function restoreSettings(): void {
  update(
    JSON.parse(localStorage.getItem('settings')),
    false
  );
}
