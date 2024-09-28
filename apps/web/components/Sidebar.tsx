"use client";

import React from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@repo/ui/components/ui/tooltip";
import { Files, Github, Code, PenTool, Mail, User, Settings } from "lucide-react";

const sidebarTopItems = [
  { icon: Files, label: "Files" },
  { icon: Github, label: "GitHub" },
  { icon: Code, label: "Code" },
  { icon: PenTool, label: "Edit" },
  { icon: Mail, label: "Mail" },
];

const sidebarBottomItems = [
  { icon: User, label: "Account" },
  { icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <TooltipProvider>
      <div className="flex flex-col justify-between h-full w-12 bg-background border-r">
        <div>
          {sidebarTopItems.map(({ icon: Icon, label }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full h-12">
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div>
          {sidebarBottomItems.map(({ icon: Icon, label }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full h-12">
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
