"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Folder, FileText, File, Plus } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import socket from "../lib/socket";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Input } from "@repo/ui/components/ui/input";

interface ExplorerProps {
  onFileSelect: (path: string) => void;
}

interface FileTree {
  [key: string]: FileTree | null;
}

export default function Explorer({ onFileSelect }: ExplorerProps) {
  const [portfolioOpen, setPortfolioOpen] = useState(true);
  const [fileTree, setFileTree] = useState<FileTree>({});
  const [openDirectories, setOpenDirectories] = useState(new Map<string, boolean>());
  const [newItemName, setNewItemName] = useState("");
  const [creatingItemIn, setCreatingItemIn] = useState<string | null>(null);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    socket.on("file-change", fetchFileTree);
    return () => {
      socket.off("file-change", fetchFileTree);
    };
  }, []);

  useEffect(() => {
    fetchFileTree();
  }, []);

  const fetchFileTree = async () => {
    try {
      const response = await fetch("http://localhost:9000/files");
      if (!response.ok) {
        throw new Error("Failed to fetch file tree");
      }
      const data = await response.json();
      setFileTree(data);
      router.refresh();
    } catch (error) {
      console.error("Error fetching file tree:", error);
    }
  };

  const toggleDirectory = (path: string) => {
    setOpenDirectories(prev => {
      const newMap = new Map(prev);
      const currentState = newMap.get(path) || false;
      newMap.set(path, !currentState);
      return newMap;
    });
  };

  const handleFileClick = (path: string) => {
    onFileSelect(path);
  };

  const createNewItem = async (parentPath: string) => {
    if (!newItemName) return;

    const fullPath = parentPath ? `${parentPath}/${newItemName}` : newItemName;
    const apiEndpoint = isCreatingFile ? "http://localhost:9000/create-file" : "http://localhost:9000/create-folder";
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: fullPath }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create ${isCreatingFile ? "file" : "folder"}`);
      }

      fetchFileTree();
      setNewItemName("");
      setCreatingItemIn(null);
      setIsCreatingFile(false);
    } catch (error) {
      console.error(`Error creating ${isCreatingFile ? "file" : "folder"}:`, error);
    }
  };

  const startCreatingItem = (path: string, isFile: boolean) => {
    setCreatingItemIn(path);
    setIsCreatingFile(isFile);
    setNewItemName("");
    // Open the directory where we're creating the new item
    setOpenDirectories(prev => {
      const newMap = new Map(prev);
      newMap.set(path, true);
      return newMap;
    });
  };

  const renderTree = (node: FileTree, path = "") => {
    return (
      <div key={path} className="pl-4">
        {Object.entries(node).map(([key, value]) => {
          const isDirectory = value !== null;
          const fullPath = path ? `${path}/${key}` : key;
          const isOpen = openDirectories.get(fullPath) || false;

          return (
            <div key={fullPath}>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-grow justify-start px-2 py-1 h-auto"
                  onClick={() => (isDirectory ? toggleDirectory(fullPath) : handleFileClick(fullPath))}
                >
                  {isDirectory ? <Folder className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
                  <span className="text-sm">{key}</span>
                  {isDirectory && (
                    <ChevronRight
                      className={`ml-auto h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                    />
                  )}
                </Button>
                {isDirectory && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="px-2">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => startCreatingItem(fullPath, true)}>
                        <File className="mr-2 h-4 w-4" />
                        <span>New File</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => startCreatingItem(fullPath, false)}>
                        <Folder className="mr-2 h-4 w-4" />
                        <span>New Folder</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              {isDirectory && isOpen && (
                <>
                  {creatingItemIn === fullPath && (
                    <div className="flex items-center mt-2 pl-4">
                      <Input
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                        placeholder={`Enter ${isCreatingFile ? "file" : "folder"} name`}
                        className="flex-grow"
                        onKeyPress={e => {
                          if (e.key === "Enter") {
                            createNewItem(fullPath);
                          }
                        }}
                        autoFocus
                      />
                      <Button onClick={() => createNewItem(fullPath)} className="ml-2">
                        Create
                      </Button>
                    </div>
                  )}
                  {renderTree(value as FileTree, fullPath)}
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-60 border-r bg-background">
      <div className="p-2 font-semibold text-sm uppercase tracking-wide">Explorer</div>
      <div className="px-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="flex-grow justify-start px-2 py-1 h-auto"
            onClick={() => setPortfolioOpen(!portfolioOpen)}
          >
            <ChevronRight
              className={`mr-2 h-4 w-4 transition-transform duration-200 ${portfolioOpen ? "rotate-90" : ""}`}
            />
            <span className="text-sm font-semibold">User</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => startCreatingItem("", true)}>
                <File className="mr-2 h-4 w-4" />
                <span>New File</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => startCreatingItem("", false)}>
                <Folder className="mr-2 h-4 w-4" />
                <span>New Folder</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {portfolioOpen && (
          <ScrollArea className="h-[calc(100vh-6rem)]">
            {creatingItemIn === "" && (
              <div className="flex items-center mt-2">
                <Input
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  placeholder={`Enter ${isCreatingFile ? "file" : "folder"} name`}
                  className="flex-grow"
                  onKeyPress={e => {
                    if (e.key === "Enter") {
                      createNewItem("");
                    }
                  }}
                  autoFocus
                />
                <Button onClick={() => createNewItem("")} className="ml-2">
                  Create
                </Button>
              </div>
            )}
            {renderTree(fileTree)}
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
