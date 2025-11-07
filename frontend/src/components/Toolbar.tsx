import React, { useState } from "react";
import {
  MousePointer,
  Pencil,
  Minus,
  ArrowRight,
  Square,
  Circle,
  Type,
  Eraser,
  RotateCcw,
  RotateCw,
  Trash2,
  Save,
} from "lucide-react";
import { Tool, Shape } from "../types";

interface Props {
  tool: Tool | string;
  setTool: (tool: Tool | string) => void;
  color: string;
  setColor: (color: string) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  undo: () => void;
  redo: () => void;
  clearPage: () => void;
  load: () => void;
  save: () => void;
  selectedShape?: Shape | null;
  setShapes: (shapes: Shape[]) => void;
  shapes: Shape[];
  onChangeHistory: (shapes: Shape[]) => void;
}

const Toolbar: React.FC<Props> = ({
  tool,
  setTool,
  color,
  setColor,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  undo,
  redo,
  clearPage,
  save,
  load,
  selectedShape,
  setShapes,
  shapes,
  onChangeHistory,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false); 

  const tools = [
    { id: "select", icon: <MousePointer />, label: "Select" },
    { id: "pencil", icon: <Pencil />, label: "Pencil" },
    { id: "line", icon: <Minus />, label: "Line" },
    { id: "arrow", icon: <ArrowRight />, label: "Arrow" },
    { id: "rect", icon: <Square />, label: "Rectangle" },
    { id: "circle", icon: <Circle />, label: "Circle" },
    { id: "text", icon: <Type />, label: "Text" },
    { id: "eraser", icon: <Eraser />, label: "Eraser" },
  ];

  const handleSizeChange = (value: number) => {
    if (!selectedShape) return;
    const updatedShapes = shapes.map((s) => {
      if (s.id === selectedShape.id) {
        if (s.type === "text") s.fontSize = value;
        else if (s.type === "rect" || s.type === "circle") s.width = value;
      }
      return s;
    });
    setShapes(updatedShapes);
    onChangeHistory(updatedShapes);
  };

  return (
    <div className="bg-white shadow-md border border-gray-200 rounded-md p-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4 w-full max-w-6xl mx-auto">
      {/* Tool buttons */}
      <div className="flex flex-wrap gap-2 ml-14 sm:ml-4">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`p-2 rounded-md transition-all ${
              tool === t.id ? "bg-blue-500 text-white shadow" : "hover:bg-gray-100 text-gray-600"
            }`}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}
      </div>

      {/* Mobile toggle for advanced controls */}
      <button
        className="md:hidden p-2 border rounded-md"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        ⚙️
      </button>

      {/* Advanced controls desktop always visible, mobile toggle */}
      <div
        className={`flex flex-wrap items-center gap-2 md:gap-4 ${
          showAdvanced ? "flex" : "hidden"
        } md:flex`}
      >
        {/* Color Picker */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 border rounded-md cursor-pointer"
          />
        </div>

        {/* Font family and size */}
        <div className="flex items-center gap-2">
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm"
          >
            <option value="Arial">Arial</option>
            <option value="Courier New">Courier</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times</option>
            <option value="Verdana">Verdana</option>
          </select>

          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="border rounded-md px-2 py-1 text-sm"
          >
            {[12, 16, 20, 24, 28, 32, 40].map((s) => (
              <option key={s} value={s}>
                {s}px
              </option>
            ))}
          </select>

          {selectedShape && (
            <input
              type="number"
              min={1}
              value={selectedShape.type === "text" ? selectedShape.fontSize : selectedShape.width ?? 50}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="border rounded px-2 py-1 w-20"
              title="Resize selected shape / font size"
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button onClick={undo} className="p-2 rounded-md hover:bg-gray-100 text-gray-700" title="Undo">
            <RotateCcw />
          </button>
          <button onClick={redo} className="p-2 rounded-md hover:bg-gray-100 text-gray-700" title="Redo">
            <RotateCw />
          </button>
          <button onClick={clearPage} className="p-2 rounded-md hover:bg-gray-100 text-gray-700" title="Clear">
            <Trash2 />
          </button>
          <button onClick={save} className="p-2 rounded-md hover:bg-gray-100 text-gray-700" title="Save">
            <Save />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
