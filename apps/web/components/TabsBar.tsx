import React from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Save, UserRoundCheck } from "lucide-react";
import Tab from "./Tab";

interface TabsbarProps {
  tabs: Array<{
    path: string;
    name: string;
  }>;
  activeTab: string;
  onTabClick: (path: string) => void;
  onTabClose: (path: string) => void;
  handleSave: () => void;
  handleRun: () => void;
}

export default function Tabsbar({ tabs, activeTab, onTabClick, onTabClose, handleSave, handleRun }: TabsbarProps) {
  return (
    <div className="flex items-center flex-row h-8 w-full min-h-[2rem] border-b bg-background">
      <div className="flex flex-grow overflow-x-auto">
        {tabs.map(tab => (
          <Tab
            key={tab.path}
            tab={tab}
            isActive={tab.path === activeTab}
            onClick={() => onTabClick(tab.path)}
            onClose={() => onTabClose(tab.path)}
          />
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={handleSave} className="px-2 h-full rounded-none border-l">
        <Save className="h-4 w-4 mr-1" />
        Save
      </Button>

      <Button variant="ghost" size="sm" onClick={handleRun} className="px-2 h-full rounded-none border-l">
        <UserRoundCheck className="h-4 w-4 mr-1" />
        Run
      </Button>
    </div>
  );
}
