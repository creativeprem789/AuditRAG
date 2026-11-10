"use client";

import React from "react";
import {
  LayoutDashboard,
  Terminal,
  Layers,
  Settings2,
  LogOut,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Terminal, label: "Playground", active: false },
  { icon: Layers, label: "Frameworks", active: false },
  { icon: Settings2, label: "Integrations", active: false },
];

export default function Sidebar() {
  return (
    <aside className="w-[56px] flex-shrink-0 bg-[#0d0d10] border-r border-zinc-800 flex flex-col items-center py-3.5 select-none z-20">
      {/* Sleek App Mark */}
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600/90 to-indigo-700/90 flex items-center justify-center mb-5 shadow-sm">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 22h20L12 2z" />
          <path d="M7 16h10" />
        </svg>
      </div>

      {/* Nav Items */}
      <div className="flex-1 w-full flex flex-col items-center gap-1.5">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex flex-col items-center gap-1 py-2 px-1 text-[10px] transition-colors cursor-pointer ${
              item.active
                ? "text-white bg-white/[0.04]"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
            }`}
          >
            <item.icon size={17} strokeWidth={1.5} />
            <span className="leading-none text-[9.5px]">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Exit Icon — Cleanly centered and aligned */}
      <div className="w-full flex justify-center pb-2">
        <button
          className="text-zinc-500 hover:text-zinc-300 p-2 rounded-md hover:bg-white/[0.03] transition-colors cursor-pointer flex items-center justify-center"
          title="Sign out / Exit"
        >
          <LogOut size={16} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
