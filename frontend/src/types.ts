export type Tool =
  | "select"
  | "pencil"
  | "line"
  | "arrow"
  | "circle"
  | "rect"
  | "text";

export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  color?: string;
  strokeWidth?: number;
  points?: Point[];

  // For line and arrow
  x2?: number;
  y2?: number;

  // For text
  text?: string;
  fontSize?: number;
  fontFamily?: string;

  // Optional metadata
  pageId?: string;
}
