import {
  DiagnosticInternalResult,
  Processing,
  State
} from './emulation.service';
import { EventEmitter } from '@angular/core';
import { copy } from '../../_@shared/utils/common.util';
import { RandomService } from '../../_@shared/services/random.service';
import { ProcessingEventType } from './emulation.types';
import { DELAY, RUN_PROBABILITY, PAUSE_DELAY } from '../../_@shared/utils/configs';
import {
  ERROR_STATE,
  IDS_DELIMITER,
  SUCCESS_STATE,
  UNKNOWN
} from 'src/app/_@shared/utils/constants';

export interface Item {

  readonly id: string;
  active: boolean;

  pass(callerId: string, result): void;

  stop(stopId): void;

  isActive(callerId: string): boolean;
}

export class Node implements Item {

  public readonly id;
  public active = true;
  public edges: Edge[] = [];

  private readonly initValue;
  private result;
  private stopId;

  constructor(id: number,
              initValue,
              private state: State,
              private processing: EventEmitter<Processing>,
              private diagnostic: EventEmitter<DiagnosticInternalResult>) {
    this.id = `${id}`;
    this.result = copy(initValue);
    this.initValue = initValue;
  }

  isActive(): boolean {
    return this.active;
  }

  stop(stopId): void {
    this.callFunc(() => {
      if (this.stopId === stopId || this.stopId > stopId) {
        return;
      }

      this.notifyProcess('stop', true);

      this.result = copy(this.initValue); // !reset
      this.stopId = stopId;

      this.delay(() => this.callStop(stopId));
    });
  }

  private callStop(stopId): void {
    this.callFunc(() => {
      this.edges.forEach(edge => edge.stop(stopId));
      this.notifyProcess('stop', false);
    });
  }

  process(): void {
    this.callFunc(() => {
      if (RUN_PROBABILITY < Math.random() || !this.edges.length) {
        this.delay(() => this.process());
        return;
      }

      this.notifyProcess('processing', true);

      const next = RandomService.randomInt(0, this.edges.length);
      this.delay(() => this.callProcess(this.edges[next]));
    });
  }

  private callProcess(edge: Edge): void {
    this.callFunc(() => {
      const edgeActive = edge.isActive(this.id);
      console.log(edgeActive);
      this.updateResult(edge, edgeActive);

      if (edgeActive) {
        edge.pass(this.id, this.result.matrix);
      }

      this.notifyProcess('processing', false);
      this.delay(() => this.process());
    });
  }

  pass(id: string, result: string[][]): void {
    this.notifyProcess('processing', true);

    this.append(result); // !merge results

    if (this.checkFinished()) { // !check finished
      this.diagnostic.emit({ nodeId: this.id, result: this.result.matrix });
      this.stop(Date.now());
      return;
    }

    this.delay(() => this.notifyProcess('processing', false));
  }

  private checkFinished(): boolean {
    return this.result?.counter < 0;
  }

  private append(result: string[][]): void {
    this.result.counter--;
    const current = this.result.matrix;

    for (let i = 0; i < current.length; i++) {
      for (let j = 0; j < current[i].length; j++) {
        const value = result[i][j];
        if (value !== UNKNOWN
          && value !== current[i][j]
        ) {
          current[i][j] = value;
        }
      }
    }
  }

  private updateResult(edge: Edge, active: boolean): void {
    const id2 = edge.id.split(IDS_DELIMITER)
      .filter(id => id !== this.id)
      .map(id => parseInt(id, 10))[0];
    const id1 = parseInt(this.id, 10);
    const matrix = this.result.matrix;
    const sign = active ? SUCCESS_STATE : ERROR_STATE;

    if (matrix[id1][id2] !== sign) {
      matrix[id1][id2] = sign;
    }
  }

  private notifyProcess(type: ProcessingEventType, value: boolean) {
    this.processing.emit({
      id: this.id,
      value,
      type
    });
  }

  private callFunc(callback: Function): void {
    if (!this.state.started) return;
    if (this.state.paused) {
      this.delay(() => this.callFunc(callback), PAUSE_DELAY);
      return;
    }
    callback();
  }

  private delay(callback: Function, delay = DELAY): void {
    setTimeout(callback, delay);
  }
}

export class Edge implements Item {

  public readonly id;
  public active = true;
  public nodes: Node[] = [];

  constructor(id1: number, id2: number,
              private state: State,
              private processing: EventEmitter<Processing>) {
    this.id = `${id1}${IDS_DELIMITER}${id2}`;
  }

  public isActive(callerId: string): boolean {
    return this.active
      && this.nodes.find(node => node.id !== callerId).isActive();
  }

  stop(stopId: string): void {
    this.callFunc(() => {
      this.notifyProcess('stop', true);
      this.delay(() => this.callStop(stopId));
    });
  }

  private callStop(stopId: string): void {
    this.callFunc(() => {
      this.nodes.forEach(node => node.stop(stopId));
      this.notifyProcess('stop', false);
    });
  }

  pass(id: string, result: string[][]): void {
    this.callFunc(() => {
      this.notifyProcess('processing', true);

      const validNodes = this.nodes.filter(node => node?.id !== id);

      this.delay(() => this.call(validNodes, result));
    });
  }

  private call(validNodes: Node[], result: string[][]): void {
    this.callFunc(() => {
      validNodes.forEach(node => node.pass(this.id, result));
      this.notifyProcess('processing', false);
    });
  }

  private notifyProcess(type, value: boolean) {
    this.processing.emit({
      id: this.id,
      value,
      type
    });
  }

  private callFunc(callback: Function): void {
    if (!this.state.started) return;
    if (this.state.paused) {
      this.delay(() => this.callFunc(callback), PAUSE_DELAY);
      return;
    }
    callback();
  }

  private delay(callback: Function, delay = DELAY): void {
    setTimeout(callback, delay);
  }
}
