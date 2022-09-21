import { Component, EventEmitter, Input, Output } from '@angular/core';

interface Node {
  id: string,
  x: number,
  y: number,
  color?: string,
  disabled?: boolean,
}

interface Edge {
  id: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color?: string,
  disabled?: boolean,
}

@Component({
  selector: 'app-graph-view',
  templateUrl: './graph-view.component.html',
  styleUrls: ['./graph-view.component.scss']
})
export class GraphViewComponent {

  @Output() graphEvent = new EventEmitter<{ id: string }>()

  public readonly width = 700;
  public readonly height = 500;
  public readonly nodeRadius = 15;

  selected: Node | Edge;

  edges: Edge[] = [];
  nodes: Node[] = [];

  constructor() { }

  @Input()
  set matrix(matrix: string[][]) {
    if (!matrix.length) {
      return;
    }
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

  private createNodes(count: number): Node[] {
    const xCenter = this.width / 2;
    const yCenter = this.height / 2;
    const radius = Math.min(xCenter, yCenter) - 1.5 * this.nodeRadius;

    const angle = 360 / count;

    const nodes: Node[] = [];

    for (let i = 0; i < count; i++) {
      const nodeAngle = angle * i - 90;

      const posX = radius * Math.cos(this.toRadians(nodeAngle));
      const posY = radius * Math.sin(this.toRadians(nodeAngle));

      nodes.push({
        id: `${i}`,
        x: Math.round(posX + xCenter),
        y: Math.round(posY + yCenter),
      })
    }
    return nodes;
  }

  private createEdges(nodes: Node[], matrix: string[][]): Edge[] {
    const edges: Edge[] = [];
    for (let i = 0; i < matrix.length; i++) {
      for (let j = i; j < matrix[i].length; j++) {
        if (i == j) continue;
        if (matrix[i][j] === '1') {
          const node1 = nodes[i];
          const node2 = nodes[j];

          edges.push({
            id: `${node1.id}:${node2.id}`,
            x1: node1.x,
            y1: node1.y,
            x2: node2.x,
            y2: node2.y,
          });
        }
      }
    }
    return edges;
  }

  private toRadians(angle): number {
    return angle * (Math.PI / 180);
  }

  getColor(element: Node | Edge): string {
    if (this.selected === element) {
      return '#2c5777';
    }
    return element.disabled ? 'gray' : 'black';
  }

  toggle(element: Node | Edge): void {
    element.disabled = !element.disabled; // TODO temp

    this.graphEvent.emit({
      id: element.id,
    });
  }

  deselect(): void {
    this.selected = null;
  }

  delete(element: Node | Edge): void {
    // TODO promt modal
  }
}
