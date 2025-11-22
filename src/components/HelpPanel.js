import React, { useState } from "react";

export default function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-500 text-white w-12 h-12 rounded-full shadow-lg hover:bg-purple-600 transition-colors font-bold text-xl"
        title="Help"
      >
        ?
      </button>

      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3 pb-2 border-b">
            <h3 className="font-bold text-lg">Quick Guide</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <section>
              <h4 className="font-bold text-blue-600 mb-1">Getting Started</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Drag blocks from the left sidebar</li>
                <li>Drop them in the middle area</li>
                <li>Click blocks to edit values</li>
                <li>Press Play to run animations</li>
              </ol>
            </section>

            <section>
              <h4 className="font-bold text-green-600 mb-1">Motion Blocks</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Move X steps - Move forward/back</li>
                <li>Turn X degrees - Rotate sprite</li>
                <li>Go to x:_ y:_ - Jump to position</li>
                <li>Repeat - Loop previous action</li>
              </ul>
            </section>

            <section>
              <h4 className="font-bold text-purple-600 mb-1">Looks Blocks</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Say - Show speech bubble</li>
                <li>Think - Show thought bubble</li>
              </ul>
            </section>

            <section>
              <h4 className="font-bold text-orange-600 mb-1">
                🌟 Collision Feature
              </h4>
              <p className="text-gray-700 mb-1">
                When sprites collide, they swap actions!
              </p>
              <div className="bg-orange-50 p-2 rounded text-xs">
                <strong>Try this:</strong>
                <br />
                1. Create 2 sprites
                <br />
                2. Sprite 1: Go to x:-100, Move 50
                <br />
                3. Sprite 2: Go to x:100, Move -50
                <br />
                4. Press Play and watch them swap!
              </div>
            </section>

            <section>
              <h4 className="font-bold text-red-600 mb-1">Tips</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-xs">
                <li>Center is (0, 0) position</li>
                <li>Rotation: 0° = right, 90° = down</li>
                <li>Delete sprites via ✕ on tabs</li>
                <li>Stop resets all positions</li>
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
