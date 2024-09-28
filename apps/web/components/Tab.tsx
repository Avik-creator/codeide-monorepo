"use client";
import { X } from "lucide-react";

interface TabProps {
  tab: { name: string };
  isActive: boolean;
  onClick: () => void;
  onClose: () => void;
}

const Tab = ({ tab, isActive, onClick, onClose }: TabProps) => {
  return (
    <div
      className={`flex justify-between items-center cursor-pointer flex-grow ${
        isActive ? "bg-[#1F1F1F]" : "bg-[#181818]"
      } text-gray-300`}
      onClick={onClick}
    >
      <h1 className="font-bold text-[0.8rem] px-1">{tab.name}</h1>
      <X onClick={onClose} className="w-3 h-3 cursor-pointer" />
    </div>
  );
};

export default Tab;
