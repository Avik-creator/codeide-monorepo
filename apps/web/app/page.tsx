"use client";

import React, { useState, useEffect } from "react";
import MonacoEditor from "../components/Editor";
import Tabsbar from "../components/TabsBar";
import Explorer from "../components/Explorer";
import Xterm from "../components/Xterm";
import Sidebar from "../components/Sidebar";
import Bottombar from "../components/Bottombar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@repo/ui/components/ui/resizable";
import { languageShortForms } from "../lib/languages";

const HomePage = () => {
  const [tabs, setTabs] = useState<any[]>([]);
  const [activeFilePath, setActiveFilePath] = useState("");
  const [fileContent, setFileContent] = useState("");

  const [languageType, setLanguageType] = useState("");

  const fetchFileContent = async (filePath: string) => {
    try {
      const response = await fetch(`http://localhost:9000/files/${encodeURIComponent(filePath)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch file content");
      }

      const content = await response.text();

      if (filePath.split(".").pop() == "json") {
        setFileContent(JSON.parse(JSON.stringify(content, null, "\t")));
      } else {
        setFileContent(content);
      }
    } catch (error) {
      console.error("Error fetching file content:", error);
    }
  };

  useEffect(() => {
    if (activeFilePath) {
      fetchFileContent(activeFilePath);
    }
  }, [activeFilePath]);

  const handleFileSelect = async (filePath: string) => {
    if (!tabs.find(tab => tab.path === filePath)) {
      setTabs(prevTabs => [...prevTabs, { path: filePath, name: filePath.split("/").pop() }]);
    }
    // Set active file path
    setActiveFilePath(filePath);

    const fileExtension = filePath.split(".").pop();
    if (fileExtension) {
      if (fileExtension && fileExtension in languageShortForms) {
        setLanguageType(languageShortForms[fileExtension as keyof typeof languageShortForms]);
      }
    }
    // Fetch file content for the newly selected file

    await fetchFileContent(filePath);
  };

  const handleTabClick = async (filePath: string) => {
    setActiveFilePath(filePath);
    const fileExtension = filePath.split(".").pop();
    if (fileExtension) {
      if (fileExtension && fileExtension in languageShortForms) {
        setLanguageType(languageShortForms[fileExtension as keyof typeof languageShortForms]);
      }
    }
    await fetchFileContent(filePath);
  };

  const handleRun = async () => {
    if (activeFilePath && fileContent) {
      await handleSave();
      try {
        const fileExtension = activeFilePath.split(".").pop();
        const apiEndpoint =
          fileExtension == "java" ? "http://localhost:9000/run-java" : "http://localhost:9000/run-cpp";
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: fileContent }),
        });

        if (!response.ok) {
          throw new Error("Failed to run file");
        }

        const result = await response.text();
        console.log("Result:", result);
      } catch (error) {
        console.error("Error running file:", error);
      }
    }
  };

  const handleTabClose = async (filePath: string) => {
    setTabs(prevTabs => {
      const updatedTabs = prevTabs.filter(tab => tab.path !== filePath);
      if (filePath === activeFilePath) {
        if (updatedTabs.length > 0) {
          const newActiveFilePath = updatedTabs[0].path;
          setActiveFilePath(newActiveFilePath);
          fetchFileContent(newActiveFilePath);
          setLanguageType(languageShortForms[newActiveFilePath.split(".").pop() as keyof typeof languageShortForms]);
        } else {
          setActiveFilePath("");
          setFileContent("");
          setLanguageType("");
        }
      }
      return updatedTabs;
    });
  };

  console.log("activeFilePath", languageType);

  const handleSave = React.useCallback(async () => {
    if (activeFilePath && fileContent) {
      try {
        const response = await fetch(`http://localhost:9000/files/${encodeURIComponent(activeFilePath)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: fileContent }),
        });

        if (!response.ok) {
          throw new Error("Failed to save file");
        }
      } catch (error) {
        console.error("Error saving file:", error);
      }
    }
  }, [activeFilePath, fileContent]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleSave();
    }, 5000);

    return () => clearInterval(interval);
  }, [fileContent, handleSave]);

  return (
    <div className="flex w-screen h-screen flex-col">
      <div className="flex w-full h-full flex-row">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20}>
            <div className="flex w-full h-full flex-row">
              <Sidebar />

              <div className="flex h-full">{<Explorer onFileSelect={handleFileSelect} />}</div>

              <div className="flex w-full h-full flex-col">
                <div className="flex w-full">
                  <Tabsbar
                    tabs={tabs}
                    handleRun={handleRun}
                    activeTab={activeFilePath}
                    onTabClick={handleTabClick}
                    onTabClose={handleTabClose}
                    handleSave={handleSave}
                  />
                </div>
                <span className="text-white ml-2 text-[15px] pb-1">
                  {tabs.length > 0 ? `User > ${activeFilePath.split("/").join(" > ")}` : ""}
                </span>

                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel defaultSize={70}>
                    <div className="flex w-[calc(100%-2vw)] h-[calc(100%-0.2vw)]">
                      {activeFilePath && tabs.length > 0 ? (
                        <MonacoEditor
                          value={fileContent}
                          language={languageType}
                          onChange={(newValue: string) => setFileContent(newValue)}
                        />
                      ) : (
                        <div className="flex justify-center items-center w-full h-full text-white">
                          <p>No file selected</p>
                        </div>
                      )}
                    </div>
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={30}>
                    <Xterm />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <Bottombar />
    </div>
  );
};

export default HomePage;
