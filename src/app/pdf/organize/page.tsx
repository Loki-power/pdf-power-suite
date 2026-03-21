"use client";

import { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { UploadCloudIcon, DownloadIcon, Loader2, Trash2Icon, GripVerticalIcon, Grid2x2Icon, RotateCwIcon } from "lucide-react";

// Setup PDF.js worker dynamically later inside the component to avoid SSR issues
// with DOMMatrix and other browser APIs.

interface PageData {
  id: string;
  originalIndex: number;
  thumbnailUrl: string;
}

// Draggable Sortable Item Component
function SortablePage({ 
  page, 
  onDelete, 
  index 
}: { 
  page: PageData, 
  onDelete: (id: string) => void,
  index: number 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Card className={`overflow-hidden border-2 transition-all ${isDragging ? 'border-primary ring-4 ring-primary/20' : 'border-border/50 hover:border-primary/50'}`}>
        <CardContent className="p-2 relative bg-muted/20">
          <div className="absolute top-2 left-2 bg-background/80 backdrop-blur rounded-md px-2 py-1 text-xs font-bold border shadow-sm z-10">
            {index + 1}
          </div>
          
          <div 
            className="absolute top-2 right-2 bg-destructive/90 text-destructive-foreground p-1.5 rounded-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm z-10 hover:bg-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(page.id); }}
            title="Delete page"
          >
            <Trash2Icon className="h-4 w-4" />
          </div>

          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing w-full flex justify-center py-4 bg-background border rounded-md touch-none">
             {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={page.thumbnailUrl} 
              alt={`Page ${page.originalIndex + 1}`} 
              className="h-32 sm:h-48 object-contain pointer-events-none drop-shadow-md"
            />
          </div>
          <div className="flex items-center justify-center mt-2 text-xs text-muted-foreground w-full py-1">
            <GripVerticalIcon className="h-3 w-3 mr-1" /> Drag to reorder
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrganizePages() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  
  const { addHistoryItem } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf") {
        toast.error("Please select a valid PDF file");
        return;
      }
      setFile(selected);
      setIsRendering(true);
      
      try {
        // Dynamically import pdf.js to avoid SSR issues with browser globals like DOMMatrix
        // Use unpkg explicitly to avoid Webpack strict __esModule export errors
        // @ts-ignore
        const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

        const arrayBuffer = await selected.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        setFileBytes(bytes);

        // Render thumbnails using PDF.js
        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        
        const newPages: PageData[] = [];
        
        // Render each page to an offscreen canvas
        for (let i = 1; i <= totalPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 }); // Scale down for thumbnail
          
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          if (context) {
            await page.render({ canvasContext: context as any, viewport: viewport, canvasFactory: undefined } as any).promise;
            newPages.push({
              id: `page-${i-1}-${Date.now()}`,
              originalIndex: i - 1,
              thumbnailUrl: canvas.toDataURL("image/jpeg", 0.8)
            });
          }
        }
        
        setPages(newPages);
        toast.success(`Loaded ${totalPages} pages successfully`);
      } catch (error) {
        console.error("Error parsing PDF:", error);
        toast.error("Failed to read PDF. It might be corrupt or encrypted.");
        setFile(null);
      } finally {
        setIsRendering(false);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDeletePage = (id: string) => {
    setPages(pages.filter(p => p.id !== id));
  };

  const saveOrganizedPdf = async () => {
    if (!fileBytes || pages.length === 0) return;

    try {
      setIsProcessing(true);
      
      const originalPdf = await PDFDocument.load(fileBytes);
      const newPdf = await PDFDocument.create();
      
      const indicesToCopy = pages.map(p => p.originalIndex);
      const copiedPages = await newPdf.copyPages(originalPdf, indicesToCopy);
      
      copiedPages.forEach((p) => {
        newPdf.addPage(p);
      });
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `organized-${file?.name || 'document.pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
      
      addHistoryItem({ action: `Organized / extracted ${pages.length} pages`, filename: file?.name || "document.pdf", module: "organize" });
      toast.success("PDF saved completely offline!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to compile new PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          Organize <span className="gradient-text">Pages</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Visually reorder or delete pages from your PDF completely in your browser.
        </p>
      </div>

      {!file ? (
         <Card className="glass mt-8 p-12 border-2 border-dashed border-blue-500/20 hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
              <UploadCloudIcon className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-semibold">Upload PDF Document</h3>
            <p className="text-muted-foreground">Select a file to extract its pages visually.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-background/50 border glass">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              {isRendering ? <Loader2 className="h-8 w-8 text-blue-500 animate-spin" /> : <Grid2x2Icon className="h-8 w-8 text-blue-500 shrink-0" />}
              <div>
                <p className="font-medium truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-muted-foreground">{pages.length} Pages remaining</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Button variant="outline" onClick={() => { setFile(null); setPages([]); setFileBytes(null); }}>
                Cancel
              </Button>
              <Button onClick={saveOrganizedPdf} disabled={isProcessing || isRendering || pages.length === 0} className="gap-2">
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <DownloadIcon className="h-4 w-4" />}
                Save New PDF
              </Button>
            </div>
          </div>

          {isRendering ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Rendering pages locally...</p>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-muted/10 border">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={pages.map(p => p.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {pages.map((page, index) => (
                      <SortablePage 
                        key={page.id} 
                        page={page} 
                        index={index}
                        onDelete={handleDeletePage}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="application/pdf"
        onChange={handleFileChange}
      />
    </div>
  );
}
