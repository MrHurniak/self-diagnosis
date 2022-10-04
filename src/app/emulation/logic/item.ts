import {
  DELAY,
  ERROR,
  IDS_DELIMITER,
  PRESENT,
  UNKNOWN
} from '../../_@shared/utils/constants';
import { Processing, State } from './emulation.service';
import { EventEmitter } from '@angular/core';
import { copy } from '../../_@shared/utils/common.util';

export interface Item {

  readonly id: string;
  active: boolean;

  pass(id: string, result): void;

  stop(id: string): void;

  isActive(): boolean;
}

export class Node implements Item {

  public readonly id;
  public active = true;
  public links: Edge[] = [];

  private result;
  private stopped = false;
  private callStack = [];

  constructor(id: number,
              initValue,
              private state: State,
              private processing: EventEmitter<Processing>,
              private diagnostic: EventEmitter<string>) {
    this.id = `${id}`;
    this.result = copy(initValue);
  }

  isActive(): boolean {
    return this.active;
  }

  stop(id: string): void {
    if (this.stopped) {
      return;
    }
    console.log('stop', this.id);
    this.processing.emit({ id: this.id, value: true, type: 'stop', });

    this.stopped = true;
    this.result = null; // !reset
    this.callStack = [];

    setTimeout(() => {
      this.links.filter(edge => edge.id !== id)
        .forEach(edge => edge.stop(this.id));

      this.processing.emit({ id: this.id, value: false, type: 'stop', });
    }, DELAY);
  }

  pass(id: string, result): void {
    if (!this.isActive() || !this.state.started || this.stopped) {
      return;
    }

    this.processing.emit({ id: this.id, value: true, type: 'processing', });

    this.append(result); // !merge results

    if (this.checkFinished()) { // !check finished
      this.diagnostic.emit(this.id);
      this.stop(null);
      return;
    }

    console.log('pass', this.id);

    this.links.filter(edge => edge.id !== id)
      .forEach(edge => this.callStack.push(edge)); // TODO try to push unique

    setTimeout(() => this.call(), DELAY);
  }

  private call(): void {
    if (!this.isActive() || !this.state.started || this.stopped) {
      return;
    }

    if (this.state.paused) {
      setTimeout(() => this.call(), DELAY);
      return;
    }

    if (!this.callStack.length) {
      this.processing.emit({ id: this.id , value: false, type: 'processing', });
      return;
    }

    let edge = this.callStack.shift();

    const edgeActive = edge.isActive();
    this.updateResult(edge, edgeActive);
    edge.pass(this.id, this.result);

    setTimeout(() => this.call(), DELAY);
  }

  private checkFinished(): boolean {
    return this.result < 0;
  }

  private append(result): void {
    this.result--;
  }

  private updateResult(edge: Edge, active: boolean): void {
  }
}

export class Edge implements Item {

  public readonly id;
  public active = true;
  public links: Node[] = [];

  constructor(id1: number, id2: number,
              private state: State,
              private processing: EventEmitter<Processing>) {
    this.id = `${id1}${IDS_DELIMITER}${id2}`;
  }

  public isActive(): boolean {
    return this.active
      && !this.links.some(node => !node.isActive());
  }

  stop(id: string): void {
    this.processing.emit({ id: this.id, value: true, type: 'stop', });

    setTimeout(() => {
      this.links.filter(node => node.id !== id)
        .forEach(node => node.stop(this.id));

      this.processing.emit({ id: this.id, value: false, type: 'stop', });
    }, DELAY);
  }

  pass(id: string, result): void {
    if (!this.isActive || !this.state.started) {
      return;
    }

    this.processing.emit({ id: this.id, value: true, type: 'processing', });

    console.log('pass', this.id, id);

    const validNodes = this.links.filter(node => node?.id !== id);

    setTimeout(
      () => this.call(validNodes, this.id, result),
      DELAY
    );
  }

  private call(validNodes: Node[], id, result): void {
    if (this.state.paused) {
      setTimeout(() => this.call(validNodes, id, result), DELAY);
      return;
    }

    validNodes.forEach(node => node.pass(id, result));

    this.processing.emit({ id, value: false, type: 'processing', });
  }
}
