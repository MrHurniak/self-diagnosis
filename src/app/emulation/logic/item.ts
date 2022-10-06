import {
  DELAY,
  IDS_DELIMITER,
  PAUSE_DELAY,
  RUN_PROBABILITY
} from '../../_@shared/utils/constants';
import { Processing, State } from './emulation.service';
import { EventEmitter } from '@angular/core';
import { copy } from '../../_@shared/utils/common.util';
import { RandomService } from '../../_@shared/services/random.service';

export interface Item {

  readonly id: string;
  active: boolean;

  pass(callerId: string, result): void;

  stop(stopId): void;

  isActive(): boolean;
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
              private diagnostic: EventEmitter<string>) {
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
      console.log('stop', this.id);

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
      if (RUN_PROBABILITY < Math.random()) {
        this.delay(() => this.process());
        return;
      }

      console.log('start', this.id);
      this.notifyProcess('processing', true);

      const next = RandomService.randomInt(0, this.edges.length);
      this.delay(() => this.callProcess(this.edges[next]));
    });
  }

  private callProcess(edge: Edge): void {
    this.callFunc(() => {
      const edgeActive = edge.isActive();
      this.updateResult(edge, edgeActive);

      if (edgeActive) {
        edge.pass(this.id, this.result);
      }

      this.notifyProcess('processing', false);
      this.delay(() => this.process());
    });
  }

  pass(id: string, result): void {
    console.log('pass', this.id);
    this.notifyProcess('processing', true);

    this.append(result); // !merge results

    if (this.checkFinished()) { // !check finished
      this.diagnostic.emit(this.id);
      this.stop(Date.now());
      return;
    }

    this.delay(() => this.notifyProcess('processing', false));
  }

  private checkFinished(): boolean {
    return this.result < 0;
  }

  private append(result): void {
    this.result--;
  }

  private updateResult(edge: Edge, active: boolean): void {
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

export class Edge implements Item {

  public readonly id;
  public active = true;
  public nodes: Node[] = [];

  constructor(id1: number, id2: number,
              private state: State,
              private processing: EventEmitter<Processing>) {
    this.id = `${id1}${IDS_DELIMITER}${id2}`;
  }

  public isActive(): boolean {
    return this.active
      && !this.nodes.some(node => !node.isActive());
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

  pass(id: string, result): void {
    this.callFunc(() => {
      this.notifyProcess('processing', true);

      const validNodes = this.nodes.filter(node => node?.id !== id);

      this.delay(() => this.call(validNodes, result));
    });
  }

  private call(validNodes: Node[], result): void {
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
