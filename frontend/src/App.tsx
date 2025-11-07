import React, { useEffect, useState, useRef } from "react";
import Toolbar from "./components/Toolbar";
import CanvasBoard from "./components/CanvasBoard";
import { Shape, Tool } from "./types";
import { PagesAPI, ShapesAPI } from "./api";

export default function App() {
  const [tool, setTool] = useState<Tool>("select");
  const [color, setColor] = useState("#0f172a");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(16);

  const [pages, setPages] = useState<any[]>([]);
  const [pageId, setPageId] = useState<string | null>(null);
  const [pageName, setPageName] = useState("Project 1");

  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);

  const historyRef = useRef<Shape[][]>([]);
  const pointerRef = useRef<number>(-1);

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Load pages
  useEffect(() => {
    PagesAPI.list().then((p) => {
      setPages(p);
      if (p.length) {
        setPageId(p[0]._id);
        setPageName(p[0].name);
      }
    });
  }, []);

  // Load shapes when pageId changes
  useEffect(() => {
    if (!pageId) return;
    PagesAPI.getShapes(pageId).then((data) => {
      setShapes(data || []);
      historyRef.current = [data || []];
      pointerRef.current = 0;
      setSelectedShape(null);
    });
  }, [pageId]);

  function pushHistory(newShapes: Shape[]) {
    const hist = historyRef.current.slice(0, pointerRef.current + 1);
    hist.push(newShapes.map((s) => ({ ...s })));
    historyRef.current = hist;
    pointerRef.current = hist.length - 1;
  }

  function undo() {
    if (pointerRef.current <= 0) return;
    pointerRef.current--;
    setShapes(historyRef.current[pointerRef.current].map((s) => ({ ...s })));
    setSelectedShape(null);
  }

  function redo() {
    if (pointerRef.current >= historyRef.current.length - 1) return;
    pointerRef.current++;
    setShapes(historyRef.current[pointerRef.current].map((s) => ({ ...s })));
    setSelectedShape(null);
  }

  function clearPage() {
    setShapes([]);
    pushHistory([]);
    setSelectedShape(null);
  }

  async function onSave() {
    if (!pageId) return;
    for (const s of shapes) {
      try {
        await ShapesAPI.create({ ...s, pageId });
      } catch (err) {
        try {
          await ShapesAPI.update(s.id, s);
        } catch (e) {}
      }
    }
    alert("Saved shapes.");
  }

  async function onLoad() {
    if (!pageId) return;
    const data = await PagesAPI.getShapes(pageId);
    setShapes(data || []);
    pushHistory(data || []);
    setSelectedShape(null);
  }

  function newPage() {
       const name = prompt("New page name", `Page ${pages.length + 1}`);
    if (!name || name.trim() === "") return; 
    PagesAPI.create(name).then((p) => {
      setPages((prev) => [...prev, p]);
      setPageId(p._id);
      setPageName(p.name);
      setShapes([]);
      historyRef.current = [[]];
      pointerRef.current = 0;
      setSelectedShape(null);
    });
  }

  function deletePage(id: string) {
    if (!confirm("Are you sure you want to delete this page?")) return;
    PagesAPI.delete(id).then(() => {
      setPages((prev) => prev.filter((p) => p._id !== id));
      if (pageId === id) {
        const nextPage = pages.find((p) => p._id !== id);
        if (nextPage) {
          setPageId(nextPage._id);
          setPageName(nextPage.name);
        } else {
          setPageId(null);
          setPageName("No Page");
          setShapes([]);
        }
      }
      setSelectedShape(null);
    });
  }

  function renamePage(id: string, currentName: string) {
    const newName = prompt("Rename page:", currentName);
    if (!newName || newName === currentName) return;
    PagesAPI.update(id, { name: newName })
      .then(() => {
        setPages((prev) =>
          prev.map((p) => (p._id === id ? { ...p, name: newName } : p))
        );
        if (pageId === id) setPageName(newName);
      })
      .catch(() => alert("Could not rename page."));
  }

  function onChangeHistory(newShapes: Shape[]) {
    setShapes(newShapes);
    pushHistory(newShapes);
  }

  return (
    <div className="h-screen flex flex-col relative">
 
      <div className="relative w-full flex items-center">
        <Toolbar
          tool={tool}
          setTool={(t) => setTool(t as Tool)}
          color={color}
          setColor={setColor}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          fontSize={fontSize}
          setFontSize={setFontSize}
          undo={undo}
          redo={redo}
          clearPage={clearPage}
          save={onSave}
          load={onLoad}
          selectedShape={selectedShape}
          setShapes={setShapes}
          shapes={shapes}
          onChangeHistory={onChangeHistory}
        />

        {/* Hamburger visible on mobile */}
        <button
          className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 absolute left-2 top-2 z-50"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <div className="w-5 h-0.5 bg-gray-800 mb-1"></div>
          <div className="w-5 h-0.5 bg-gray-800 mb-1"></div>
          <div className="w-5 h-0.5 bg-gray-800"></div>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed z-50 top-0 left-0 h-full bg-white shadow-md p-4 overflow-auto 
          w-64 max-w-full sm:w-64 sm:max-w-none
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Pages</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {pages.map((p) => (
            <div
              key={p._id}
              onClick={() => {
                setPageId(p._id);
                setSidebarOpen(false);
              }}
              className="p-2 rounded-md hover:bg-blue-50 cursor-pointer flex justify-between items-center"
            >
              <div>
                <div className="text-sm font-medium text-gray-800">{p.name}</div>
                <div className="text-xs text-gray-400">
                  {new Date(p.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  className="text-yellow-500 text-xs hover:underline"
                  onClick={() => renamePage(p._id, p.name)}
                >
                  Edit
                </button>
                <button
                  className="text-red-500 text-xs hover:underline"
                  onClick={() => deletePage(p._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={newPage}
            className="mt-2 text-blue-500 text-xs hover:underline"
          >
            + New Page
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1">
          <CanvasBoard
            tool={tool}
            color={color}
            fontFamily={fontFamily}
            fontSize={fontSize}
            initialShapes={shapes}
            setInitialShapes={setShapes}
            onChangeHistory={onChangeHistory}
            pageId={pageId}
            selectedShape={selectedShape}
            setSelectedShape={setSelectedShape}
          />
        </main>
      </div>
    </div>
  );
}
