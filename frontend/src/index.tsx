import * as React from "react";
import { createRoot } from "react-dom/client";
import { Route, Routes, HashRouter, Navigate } from "react-router-dom";

import { MagicBlockEngineProvider } from "./engine/MagicBlockEngineProvider";

// Import your themed Cyberpunk Insurgency pages
import { PageHome } from "./components/page/PageHome";
import { PageCreate } from "./components/page/PageCreate";
import { PagePlay } from "./components/page/PagePlay";

import "./index.scss";

/**
 * CYBERPUNK INSURGENCY: Global Neural Router
 * Handles all sector transitions and stabilizes the visual interface.
 */
function App() {
  return (
    <div className="App-Wrapper bg-[#050505] min-h-screen text-white selection:bg-cyan-900/50">
      <HashRouter>
        <MagicBlockEngineProvider>
          {/* Main Terminal Content Area */}
          <div className="Content flex flex-col items-center w-full">
            <div className="w-full max-w-[1280px]">
              <Routes>
                {/* Sector 0: The Entry Terminal */}
                <Route path="/" element={<PageHome />} />

                {/* Neural Sync: Initializing Incursion */}
                <Route path="/create" element={<PageCreate />} />

                {/* The Grid: Active Combat Node */}
                <Route path="/play/:id" element={<PagePlay />} />

                {/* Fallback Protocol: Redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </MagicBlockEngineProvider>
      </HashRouter>

      {/* Global Style Injector for the "Deep Black" vibe */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root, body, #app {
          background-color: #050505 !important;
          margin: 0;
          padding: 0;
          color: white;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
        }
        /* Remove the MenuBar spacing if it was causing a white gap */
        .Content {
          background-color: #050505;
        }
      `}} />
    </div>
  );
}

// Target the "app" element defined in your index.html
createRoot(document.getElementById("app")).render(<App />);
