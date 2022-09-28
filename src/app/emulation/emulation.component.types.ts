export interface GraphEvent {
  id?: string,
  target: 'node' | 'edge',
  type: 'add' | 'delete' | 'toggle',
}
