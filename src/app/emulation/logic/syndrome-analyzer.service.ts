import {
  ERROR_STATE,
  SUCCESS_STATE,
  UNKNOWN
} from '../../_@shared/utils/constants';
import { FALSE_PROBABILITY, P, Q } from '../../_@shared/utils/configs';

export class SyndromeAnalyzer {

  analyze(syndrome: string[][]): Map<number, number> {
    console.time('analyze');

    if (this.isZeroSyndrome(syndrome)) {
      console.log('syndrome is zero');
      return new Map();
    }

    const hypotheses = this.findValidHypotheses(syndrome);
    console.log('Valid hypotheses', hypotheses);

    const pHpAH = this.findPHpAH(hypotheses, syndrome);
    const hypothesisProbability = this.findHypothesisProbability(pHpAH);
    console.log('probabilities', hypothesisProbability, hypotheses);

    const result = this.findFinalResult(hypothesisProbability, hypotheses, syndrome.length);
    console.log('final result', result);

    console.timeEnd('analyze');
    return result;
  }

  /**
   * If sum(Zij) = 0, then all nodes are valid
   * Here if there aren't any element with value '1', then all valid
   *
   * @param syndrome
   */
  private isZeroSyndrome(syndrome: string[][]): boolean {
    for (let i = 0; i < syndrome.length; i++) {
      for (let j = 0; j < syndrome[i].length; j++) {
        if (i === j) continue;
        if (syndrome[i][j] === ERROR_STATE) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Filter all possible (2^n) hypothesis by next rules:
   * Ignore S(i) == 1;
   * S(i) == 0 && S(j) == 0, then rij = 0;
   * S(i) == 0 && S(j) == 1, then rij = 1;
   *
   * If hypothesis doesn't match all this rules, then skip it
   * @param syndrome
   * @private
   */
  private findValidHypotheses(syndrome: string[][]): string[] {
    const size = syndrome.length;
    const validHypothesis = [];

    const combinationSize = Math.pow(2, size);
    for (let counter = 0; counter < combinationSize; counter++) {
      const hypothesis = this.toBinary(counter, size);

      let hypothesisValid = true;
      for (let i = 0; i < size && validHypothesis; i++) {

        if (hypothesis[i] === ERROR_STATE) continue;

        for (let j = 0; j < size && validHypothesis; j++) {
          if (i === j) continue;
          const rij = syndrome[i][j];
          if (rij === UNKNOWN) continue;
          if (hypothesis[j] !== rij) {
            hypothesisValid = false;
            break;
          }
        }
      }

      if (hypothesisValid) {
        validHypothesis.push(hypothesis);
      }
    }
    return validHypothesis;
  }

  /**
   * Returns sum of p(Hi) * p(Hi/A)
   */
  private fullProbability(pHpAH: number[]): number {
    return pHpAH.reduce((sum, current) => sum + current, 0);
  }

  /**
   * Due to the Bayes' Theorem:
   * p(Hi/A) = (p(Hi) * p(A/Hi)) / p(A)
   *
   */
  private findHypothesisProbability(pHpAH: number[]): number[] {
    const fullProbability = this.fullProbability(pHpAH);
    console.log('full probability', fullProbability);

    return pHpAH.map(value => value / fullProbability);
  }

  /**
   * Return map of probabilities, the key is node id and value is node validity
   * probability
   */
  private findFinalResult(hypothesisProbability: number[],
                          validHypothesis: string[], size: number) {
    const result = new Map();

    for (let i = 0; i < validHypothesis.length; i++) {
      for (let j = 0; j < size; j++) {
        if (validHypothesis[i][j] !== ERROR_STATE && !result.has(j)) {
          result.set(j, hypothesisProbability[i]);
        }
      }
    }

    if (result.size < size) {
      for (let i = 0; i < size; i++) {
        if (!result.has(i)) {
          result.set(i, 0);
        }
      }
    }

    return result;
  }

  /**
   * Return list of
   *
   * p(Hi)*p(A/Hi)
   *
   * , to be reused in next calculations
   */
  private findPHpAH(validHypotheses: string[], syndrome: string[][]): number[] {
    const apriories = this.findApriories(validHypotheses);
    console.log('apriories', apriories);

    const conditionals = this.findConditionals(validHypotheses, syndrome);
    console.log('conditionals', conditionals);

    const pHpAH = [];
    for (let i = 0; i < validHypotheses.length; i++) {
      pHpAH.push(apriories[i] * conditionals[i]);
    }
    return pHpAH;
  }

  /**
   * Return list of apriories for each of hypothesis.
   * Examples:
   * 100111 => p^2 * q^4 - because 4 invalid and 2 valid nodes in hypothesis
   * 111111 => q^6 - 0 valid and 6 invalid nodes
   */
  private findApriories(validHypotheses: string[]): number[] {
    return validHypotheses.map(hypothesis =>
      [...hypothesis].reduce((mult, current) =>
          (current === ERROR_STATE)
            ? mult * Q
            : mult * P,
        1)
    );
  }

  /**
   * Returns list of conditional probabilities for each of hypothesis.
   * If, by hypothesis, node is invalid then it's check cannot be trusted
   * p(A/Hi)= Pr^m, where m - number of untrusted checks in whole hypothesis
   */
  private findConditionals(validHypotheses: string[], syndrome: string[][]): number[] {
    const size = syndrome.length;
    return validHypotheses.map(hypothesis => {
      let mult = 1;
      for (let j = 0; j < size; j++) {
        if (hypothesis[j] === SUCCESS_STATE) continue;
        const count = syndrome[j].filter(value => value !== UNKNOWN).length;
        mult *= Math.pow(FALSE_PROBABILITY, count);
      }
      return mult;
    });
  }

  /**
   * Returns string that is reversed binary number with given length
   * value = 1, size = 4 -> 1000  (reversed '0001')
   * value = 2, size = 4 -> 0100  (reversed '0010')
   *
   * The result is reversed to match zeroth node with zero index of hypothesis,
   * first node with index=1 etc.
   *
   * @param value - decimal value
   * @param size - size of desired binary number
   */
  private toBinary(value: number, size: number): string {
    const binary = value.toString(2);
    return [...binary].reverse()
      .concat(SUCCESS_STATE.repeat(size - binary.length))
      .join('');
  }
}
