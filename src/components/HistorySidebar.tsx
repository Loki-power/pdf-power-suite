"use client";

import { useHistory } from "./HistoryProvider";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { HistoryIcon, XIcon, Trash2Icon, FileTextIcon, ScissorsIcon, ShieldCheckIcon, SearchIcon, SparklesIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function HistorySidebar() {
  const { history, isSidebarOpen, toggleSidebar, clearHistory } = useHistory();

  const getIconForModule = (module: string) => {
    switch (module) {
      case "merge":
      case "split": return <ScissorsIcon className="h-4 w-4 text-blue-500" />;
      case "security": return <ShieldCheckIcon className="h-4 w-4 text-purple-500" />;
      case "finishing": return <SparklesIcon className="h-4 w-4 text-fuchsia-500" />;
      case "intelligence": return <SearchIcon className="h-4 w-4 text-emerald-500" />;
      case "organize": return <FileTextIcon className="h-4 w-4 text-orange-500" />;
      case "convert": return <FileTextIcon className="h-4 w-4 text-cyan-500" />;
      case "image": return <FileTextIcon className="h-4 w-4 text-lime-500" />;
      default: return <FileTextIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-40 bg-background border-2"
        onClick={toggleSidebar}
      >
        <HistoryIcon className="h-5 w-5" />
      </Button>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden" 
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-80 md:w-96 bg-background border-l shadow-2xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 flex-shrink-0 border-b">
          <div className="flex items-center space-x-2">
            <HistoryIcon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Activity History</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex flex-col space-y-4">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-2 opacity-50">
                <HistoryIcon className="h-10 w-10 mb-2" />
                <p>No activity yet.</p>
                <p className="text-sm">Processes you run will appear here.</p>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="flex space-x-3 p-3 rounded-lg border bg-card text-card-foreground">
                  <div className="mt-0.5 shrink-0 bg-muted/50 p-2 rounded-full">
                    {getIconForModule(item.module)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">{item.action}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{item.filename}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t flex-shrink-0 bg-muted/20">
            <Button variant="destructive" className="w-full gap-2" size="sm" onClick={clearHistory}>
              <Trash2Icon className="h-4 w-4" /> Clear History
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
