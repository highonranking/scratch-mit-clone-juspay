import React from "react";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";
import HelpPanel from "./components/HelpPanel";
import { AppProvider } from "./context/AppContext";

export default function App() {
  return (
    <AppProvider>
      <div className="bg-blue-100 font-sans h-screen flex flex-col">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Scratch Visual Editor</h1>
              <p className="text-sm text-blue-100">
                Build animations with drag-and-drop blocks
              </p>
            </div>
            <div className="text-right text-xs text-blue-100">
              <div>Juspay Assignment</div>
              <div>ReactJS Challenge</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-row p-3">
          <div className="flex-1 overflow-hidden flex flex-row bg-white border-2 border-gray-200 rounded-xl mr-2 shadow-lg">
            <Sidebar /> <MidArea />
          </div>
          <div className="w-1/3 overflow-hidden flex flex-row bg-white border-2 border-gray-200 rounded-xl ml-2 shadow-lg">
            <PreviewArea />
          </div>
        </div>
        <HelpPanel />
      </div>
    </AppProvider>
  );
}
