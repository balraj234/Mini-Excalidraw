import React, { useRef, useState, useEffect } from "react";
import { Shape, Tool } from "../types";

interface CanvasBoardProps {
  tool: Tool | string;
  color: string;
  fontSize: number;
  fontFamily: string;
  initialShapes: Shape[];
  setInitialShapes: (shapes: Shape[]) => void;
  onChangeHistory: (shapes: Shape[]) => void;
   pageId?: string | null; 
  selectedShape?: Shape | null; 
  setSelectedShape?: (shape: Shape | null) => void;
}

const CanvasBoard: React.FC<CanvasBoardProps> = ({
  tool,
  color,
  fontSize,
  fontFamily,
  initialShapes,
  setInitialShapes,
  onChangeHistory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 2;
      ctxRef.current = ctx;
      drawAllShapes();
    }
  }, []);

  useEffect(() => {
    drawAllShapes();
  }, [initialShapes, selectedId]);

  const drawAllShapes = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initialShapes.forEach((shape) => drawShape(ctx, shape, shape.id === selectedId));
  };

  const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape, selected = false) => {
    ctx.strokeStyle = shape.color ?? "black";
    ctx.fillStyle = shape.color ?? "black";

    if (selected) {
      ctx.save();
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
    }

    switch (shape.type) {
      case "rect":
        ctx.strokeRect(shape.x, shape.y, shape.width ?? 0, shape.height ?? 0);
        break;
      case "circle":
        ctx.beginPath();
        const radius = Math.abs(shape.width ?? 40) / 2;
        ctx.arc(shape.x, shape.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "line":
        ctx.beginPath();
        ctx.moveTo(shape.x, shape.y);
        ctx.lineTo(shape.x2 ?? shape.x, shape.y2 ?? shape.y);
        ctx.stroke();
        break;
      case "arrow":
        if (shape.x2 && shape.y2) {
          const angle = Math.atan2(shape.y2 - shape.y, shape.x2 - shape.x);
          const head = 10;
          ctx.beginPath();
          ctx.moveTo(shape.x, shape.y);
          ctx.lineTo(shape.x2, shape.y2);
          ctx.lineTo(shape.x2 - head * Math.cos(angle - Math.PI / 6), shape.y2 - head * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(shape.x2, shape.y2);
          ctx.lineTo(shape.x2 - head * Math.cos(angle + Math.PI / 6), shape.y2 - head * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        }
        break;
      case "pencil":
        if (shape.points && shape.points.length > 1) {
          ctx.beginPath();
          shape.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
          ctx.stroke();
        }
        break;
      case "text":
        ctx.font = `${shape.fontSize ?? 16}px ${shape.fontFamily ?? "Arial"}`;
        ctx.fillText(shape.text ?? "", shape.x, shape.y);
        break;
    }

    if (selected) ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Eraser
    if (tool === "eraser") {
      const remaining = initialShapes.filter(s => {
        if (s.type === "pencil" && s.points) return !s.points.some(p => Math.hypot(p.x - x, p.y - y) < 8);
        if (s.type === "arrow" || s.type === "line") {
          const x1 = s.x, y1 = s.y, x2 = s.x2 ?? s.x, y2 = s.y2 ?? s.y;
          const distance = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / Math.hypot(y2 - y1, x2 - x1);
          return distance >= 8;
        }
        if (s.type === "circle") return Math.hypot(s.x - x, s.y - y) > (s.width ?? 40) / 2;
        if (s.type === "text") {
          const w = ctxRef.current?.measureText(s.text ?? "").width ?? 50;
          const h = s.fontSize ?? 16;
          return !(x >= s.x && x <= s.x + w && y >= s.y - h && y <= s.y);
        }
        return !(x >= s.x && x <= s.x + (s.width ?? 0) && y >= s.y && y <= s.y + (s.height ?? 0));
      });
      setInitialShapes(remaining);
      onChangeHistory(remaining);
      return;
    }

    // Select
    if (tool === "select") {
      const found = [...initialShapes].reverse().find((s) => {
        if (s.type === "pencil" && s.points) return s.points.some(p => Math.hypot(p.x - x, p.y - y) < 8);
        if (s.type === "arrow" || s.type === "line") {
          const x1 = s.x, y1 = s.y, x2 = s.x2 ?? s.x, y2 = s.y2 ?? s.y;
          const distance = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / Math.hypot(y2 - y1, x2 - x1);
          return distance < 8;
        }
        if (s.type === "circle") return Math.hypot(s.x - x, s.y - y) <= (s.width ?? 40) / 2;
        if (s.type === "text") {
          const w = ctxRef.current?.measureText(s.text ?? "").width ?? 50;
          const h = s.fontSize ?? 16;
          return x >= s.x && x <= s.x + w && y >= s.y - h && y <= s.y;
        }
        return x >= s.x && x <= s.x + (s.width ?? 0) && y >= s.y && y <= s.y + (s.height ?? 0);
      });
      if (found) {
        setSelectedId(found.id);
        setDragOffset({ x: x - found.x, y: y - found.y });
      } else setSelectedId(null);
      return;
    }

    // Text
    if (tool === "text") {
      const input = prompt("Enter text:");
      if (!input) return;
      const newShape: Shape = {
        id: `shape_${Date.now()}`,
        type: "text",
        x, y,
        text: input,
        color, fontSize, fontFamily,
      };
      const updated = [...initialShapes, newShape];
      setInitialShapes(updated);
      onChangeHistory(updated);
      return;
    }

    // Draw new shape
    const newShape: Shape = {
      id: `shape_${Date.now()}`,
      type: tool as Tool,
      x, y,
      color,
      points: tool === "pencil" ? [{ x, y }] : undefined,
    };
    setCurrentShape(newShape);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Move selected
    if (tool === "select" && selectedId && dragOffset) {
      const moved = initialShapes.map((s) =>
        s.id === selectedId ? {
          ...s,
          x: s.x + (x - dragOffset.x - s.x),
          y: s.y + (y - dragOffset.y - s.y),
          points: s.points?.map(p => ({ x: p.x + (x - dragOffset.x - s.x), y: p.y + (y - dragOffset.y - s.y) }))
        } : s
      );
      setInitialShapes(moved);
      return;
    }

    if (!isDrawing || !currentShape) return;

    const updated = { ...currentShape };
    if (updated.type === "pencil") updated.points = [...(updated.points ?? []), { x, y }];
    else if (updated.type === "line" || updated.type === "arrow") { updated.x2 = x; updated.y2 = y; }
    else if (updated.type === "rect" || updated.type === "circle") { updated.width = x - updated.x; updated.height = y - updated.y; }

    setCurrentShape(updated);
    drawAllShapes();
    drawShape(ctxRef.current!, updated);
  };

  const handleMouseUp = () => {
    if (isDrawing && currentShape) {
      const newShapes = [...initialShapes, currentShape];
      setInitialShapes(newShapes);
      onChangeHistory(newShapes);
    }
    setIsDrawing(false);
    setCurrentShape(null);
    setDragOffset(null);
  };

  return (
    <div className="flex justify-center items-center w-full h-full bg-gray-50 ">
      <canvas
        ref={canvasRef}
        width={1100}
        height={700}
        className="border border-gray-300 rounded-lg shadow-md bg-white cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};

export default CanvasBoard;
