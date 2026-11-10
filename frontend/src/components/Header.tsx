"use client";

import React from "react";
import { HelpCircle, Bell } from "lucide-react";

export default function Header() {
  return (
    <header className="h-12 bg-[#0d0d10] border-b border-zinc-800 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <span className="text-white font-semibold text-sm tracking-wide">
          AuditRAG
        </span>
        <span className="text-[10px] font-medium bg-[#1a1a22] border border-zinc-700/60 text-zinc-400 px-2 py-0.5 rounded tracking-wider uppercase">
          Technical Playground
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
          <HelpCircle size={17} />
        </button>
        <button className="text-zinc-500 hover:text-zinc-300 transition-colors relative cursor-pointer">
          <Bell size={17} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>
        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] font-medium text-zinc-300 ml-0.5">
          U
        </div>
      </div>
    </header>
  );
}
