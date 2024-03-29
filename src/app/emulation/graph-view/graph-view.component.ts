import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GraphEvent } from '../emulation.component.types';
import { IDS_DELIMITER, PRESENT } from '../../_@shared/utils/constants';
import { MathUtil } from '../../_@shared/utils/math.util';
import { CAN_DISABLE_EDGE } from '../../_@shared/utils/configs';

interface Node {
  id: string,
  x: number,
  y: number,
  color?: string,
  canDisable?: boolean,
}

interface Edge {
  id: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color?: string,
  canDisable?: boolean,
}

@Component({
  selector: 'app-graph-view',
  templateUrl: './graph-view.component.html',
  styleUrls: ['./graph-view.component.scss']
})
export class GraphViewComponent {

  @Output() graphEvent = new EventEmitter<GraphEvent>()
  @Input() editDisabled = false;
  @Input() highlighted = {};
  @Input() disabled: string[] = [];

  public readonly width = 700;
  public readonly height = 500;
  public readonly nodeRadius = 15;

  selected: Node | Edge;

  edges: Edge[] = [];
  nodes: Node[] = [];

  @Input()
  set matrix(matrix: string[][]) {
    this.nodes = this.createNodes(matrix.length);
    this.edges = this.createEdges(this.nodes, matrix);
  }

  select(element: Node | Edge): void {
    if (this.selected === element) {
      this.selected = null;
      return;
    }
    this.selected = element;
  }

  getColor(element: Node | Edge): string {
    if (this.highlighted.hasOwnProperty(element.id)) {
      return this.highlighted[element.id] === 'processing' ? 'red' : 'green';
    }
    if (this.selected === element) {
      return 'blue';
    }
    return this.isDisabled(element) ? 'gray' : 'black';
  }

  toggle(element: Node | Edge): void {
    if (!element.canDisable) {
      return;
    }

    this.graphEvent.emit({
      id: element.id,
      target: element.id.includes(IDS_DELIMITER) ? 'edge' : 'node',
      type: 'toggle',
    });
  }

  deselect(): void {
    this.selected = null;
  }

  delete(element: Node | Edge): void {
    if (this.editDisabled) return;

    this.graphEvent.emit({
      id: element.id,
      target: element.id.includes(IDS_DELIMITER) ? 'edge' : 'node',
      type: 'delete',
    })
  }

  addNode() {
    if (this.editDisabled) return;

    this.graphEvent.emit({
      target: 'node',
      type: 'add',
    })
  }

  addEdge() {
    if (this.editDisabled) return;

    this.graphEvent.emit({
      target: 'edge',
      type: 'add',
    });
  }

  removeEdge() {
    if (this.editDisabled) return;

    this.graphEvent.emit({
      target: 'edge',
      type: 'delete',
    });
  }

  isDisabled(element: Node | Edge): boolean {
    return this.disabled.indexOf(element.id) > -1;
  }

  private createNodes(count: number): Node[] {
    const xCenter = this.width / 2;
    const yCenter = this.height / 2;
    const radius = Math.min(xCenter, yCenter) - 1.5 * this.nodeRadius;

    const angle = 360 / count;

    const nodes: Node[] = [];

    for (let i = 0; i < count; i++) {
      const nodeAngle = angle * i - 90;

      const posX = radius * Math.cos(MathUtil.toRadians(nodeAngle));
      const posY = radius * Math.sin(MathUtil.toRadians(nodeAngle));

      nodes.push({
        id: `${i}`,
        x: Math.round(posX + xCenter),
        y: Math.round(posY + yCenter),
        canDisable: true,
      })
    }
    return nodes;
  }

  private createEdges(nodes: Node[], matrix: string[][]): Edge[] {
    const edges: Edge[] = [];
    for (let i = 0; i < matrix.length; i++) {
      for (let j = i; j < matrix[i].length; j++) {
        if (i == j) continue;
        if (matrix[i][j] === PRESENT) {
          const node1 = nodes[i];
          const node2 = nodes[j];

          edges.push({
            id: `${node1.id}${IDS_DELIMITER}${node2.id}`,
            x1: node1.x,
            y1: node1.y,
            x2: node2.x,
            y2: node2.y,
            canDisable: CAN_DISABLE_EDGE,
          });
        }
      }
    }
    return edges;
  }
}
