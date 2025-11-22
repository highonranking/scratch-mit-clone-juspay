import React, { useEffect, useRef } from "react";
import CatSprite from "./CatSprite";
import { useApp } from "../context/AppContext";

export default function PreviewArea() {
  const { state, dispatch } = useApp();
  const animationRefs = useRef({});
  const collisionTrackerRef = useRef(new Set()); // Track which pairs have collided

  useEffect(() => {
    if (state.isPlaying) {
      collisionTrackerRef.current = new Set();
      state.sprites.forEach((sprite) => {
        executeActions(sprite);
      });
    } else {
      // Stop all animations
      Object.values(animationRefs.current).forEach((timeouts) => {
        timeouts.forEach((timeout) => clearTimeout(timeout));
      });
      animationRefs.current = {};
      collisionTrackerRef.current = new Set();
    }
  }, [state.isPlaying]);

  const executeActions = (sprite) => {
    const timeouts = [];
    let delay = 0;

    const getCurrentSprite = () => {
      return state.sprites.find((s) => s.id === sprite.id) || sprite;
    };

    const processAction = (action, repeatCount = 1) => {
      for (let i = 0; i < repeatCount; i++) {
        switch (action.type) {
          case "move":
            timeouts.push(
              setTimeout(() => {
                const current = getCurrentSprite();
                const radians = (current.rotation * Math.PI) / 180;
                const newX = current.x + action.steps * Math.cos(radians);
                const newY = current.y + action.steps * Math.sin(radians);
                dispatch({
                  type: "UPDATE_SPRITE",
                  payload: { id: sprite.id, updates: { x: newX, y: newY } },
                });
                checkCollisions(sprite.id, newX, newY);
              }, delay)
            );
            delay += 500;
            break;

          case "turn_clockwise":
            timeouts.push(
              setTimeout(() => {
                const current = getCurrentSprite();
                dispatch({
                  type: "UPDATE_SPRITE",
                  payload: {
                    id: sprite.id,
                    updates: { rotation: current.rotation + action.degrees },
                  },
                });
              }, delay)
            );
            delay += 500;
            break;

          case "turn_anticlockwise":
            timeouts.push(
              setTimeout(() => {
                const current = getCurrentSprite();
                dispatch({
                  type: "UPDATE_SPRITE",
                  payload: {
                    id: sprite.id,
                    updates: { rotation: current.rotation - action.degrees },
                  },
                });
              }, delay)
            );
            delay += 500;
            break;

          case "goto":
            timeouts.push(
              setTimeout(() => {
                dispatch({
                  type: "UPDATE_SPRITE",
                  payload: {
                    id: sprite.id,
                    updates: { x: action.x, y: action.y },
                  },
                });
                checkCollisions(sprite.id, action.x, action.y);
              }, delay)
            );
            delay += 500;
            break;

          case "say":
            timeouts.push(
              setTimeout(() => {
                dispatch({
                  type: "UPDATE_SPRITE",
                  payload: {
                    id: sprite.id,
                    updates: { message: action.text, messageType: "say" },
                  },
                });
              }, delay)
            );
            delay += action.duration * 1000;
            timeouts.push(
              setTimeout(() => {
                dispatch({
                  type: "UPDATE_SPRITE",
                  payload: {
                    id: sprite.id,
                    updates: { message: "", messageType: "" },
                  },
                });
              }, delay)
            );
            break;

          case "think":
            timeouts.push(
              setTimeout(() => {
                dispatch({
                  type: "UPDATE_SPRITE",
                  payload: {
                    id: sprite.id,
                    updates: { message: action.text, messageType: "think" },
                  },
                });
              }, delay)
            );
            delay += action.duration * 1000;
            timeouts.push(
              setTimeout(() => {
                dispatch({
                  type: "UPDATE_SPRITE",
                  payload: {
                    id: sprite.id,
                    updates: { message: "", messageType: "" },
                  },
                });
              }, delay)
            );
            break;

          default:
            break;
        }
      }
    };

    let actionQueue = [];
    for (let i = 0; i < sprite.actions.length; i++) {
      const action = sprite.actions[i];
      if (action.type === "repeat" && actionQueue.length > 0) {
        const lastAction = actionQueue[actionQueue.length - 1];
        processAction(lastAction, action.times);
      } else if (action.type === "repeat_forever" && actionQueue.length > 0) {
        const lastAction = actionQueue[actionQueue.length - 1];
        processAction(lastAction, 10); 
      } else if (action.type !== "repeat" && action.type !== "repeat_forever") {
        actionQueue.push(action);
        processAction(action, 1);
      }
    }

    animationRefs.current[sprite.id] = timeouts;
  };

  const checkCollisions = (spriteId, newX, newY) => {
    const currentSprite = state.sprites.find((s) => s.id === spriteId);
    if (!currentSprite) return;

    state.sprites.forEach((otherSprite) => {
      if (otherSprite.id !== spriteId) {
        const distance = Math.sqrt(
          Math.pow(newX - otherSprite.x, 2) + Math.pow(newY - otherSprite.y, 2)
        );

        if (distance < 100) {
          const collisionKey = [spriteId, otherSprite.id].sort().join('-');
          
          if (collisionTrackerRef.current.has(collisionKey)) {
            return; 
          }
          
          collisionTrackerRef.current.add(collisionKey);
          
          
          if (animationRefs.current[spriteId]) {
            animationRefs.current[spriteId].forEach((timeout) => clearTimeout(timeout));
          }
          if (animationRefs.current[otherSprite.id]) {
            animationRefs.current[otherSprite.id].forEach((timeout) => clearTimeout(timeout));
          }
          
          dispatch({
            type: "SWAP_SPRITE_ACTIONS",
            payload: { sprite1Id: spriteId, sprite2Id: otherSprite.id },
          });
          
                    setTimeout(() => {
            const updatedSprite1 = state.sprites.find((s) => s.id === spriteId);
            const updatedSprite2 = state.sprites.find((s) => s.id === otherSprite.id);
            
            if (updatedSprite1) {
              const sprite1WithNewActions = { ...updatedSprite1, actions: otherSprite.actions };
              executeActions(sprite1WithNewActions);
            }
            if (updatedSprite2) {
              const sprite2WithNewActions = { ...updatedSprite2, actions: currentSprite.actions };
              executeActions(sprite2WithNewActions);
            }
          }, 100);
        }
      }
    });
  };

  const handlePlayPause = () => {
    if (state.isPlaying) {
      dispatch({ type: "SET_PLAYING", payload: false });
      state.sprites.forEach((sprite) => {
        dispatch({ type: "RESET_SPRITE_POSITION", payload: sprite.id });
      });
    } else {
      dispatch({ type: "SET_PLAYING", payload: true });
    }
  };

  const handleAddSprite = () => {
    dispatch({ type: "ADD_SPRITE" });
  };

  const handleSelectSprite = (spriteId) => {
    dispatch({ type: "SET_ACTIVE_SPRITE", payload: spriteId });
  };

  return (
    <div className="flex-none h-full overflow-y-auto p-2 flex flex-col">
      <div className="mb-4 flex gap-2">
        <button
          onClick={handlePlayPause}
          className={`flex-1 ${
            state.isPlaying ? "bg-red-500" : "bg-green-500"
          } text-white px-4 py-2 rounded font-bold hover:opacity-80 transition-opacity`}
        >
          {state.isPlaying ? "⏹ Stop" : "▶ Play"}
        </button>
        <button
          onClick={handleAddSprite}
          className="bg-blue-500 text-white px-4 py-2 rounded font-bold hover:opacity-80 transition-opacity"
        >
          + Sprite
        </button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {state.sprites.map((sprite) => (
          <div
            key={sprite.id}
            className={`relative flex items-center gap-1 px-3 py-1 rounded text-sm whitespace-nowrap transition-colors ${
              state.activeSprite === sprite.id
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <button
              onClick={() => handleSelectSprite(sprite.id)}
              className="flex-1"
            >
              {sprite.name}
            </button>
            {state.sprites.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    window.confirm(
                      `Delete ${sprite.name}? This will remove all its actions.`
                    )
                  ) {
                    dispatch({ type: "DELETE_SPRITE", payload: sprite.id });
                  }
                }}
                className="ml-1 hover:text-red-500 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {state.sprites.length === 1 && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
          💡 <strong>Tip:</strong> Create multiple sprites to test collision detection!
        </div>
      )}

      <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden shadow-inner">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-full h-px bg-gray-400"></div>
          <div className="absolute w-px h-full bg-gray-400"></div>
        </div>

        {state.sprites.map((sprite) => (
          <div
            key={sprite.id}
            className="absolute transition-all duration-500 ease-in-out"
            style={{
              left: `calc(50% + ${sprite.x}px)`,
              top: `calc(50% + ${sprite.y}px)`,
              transform: `translate(-50%, -50%) rotate(${sprite.rotation}deg)`,
            }}
          >
            <CatSprite />
            {sprite.message && (
              <div
                className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded text-sm whitespace-nowrap shadow-lg ${
                  sprite.messageType === "say"
                    ? "bg-white border-2 border-gray-300"
                    : "bg-gray-100 border-2 border-gray-400 rounded-full"
                }`}
              >
                {sprite.message}
                {sprite.messageType === "say" && (
                  <div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-300"
                    style={{ marginTop: "-2px" }}
                  />
                )}
              </div>
            )}
          </div>
        ))}

        {state.sprites.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            No sprites yet. Click "+ Sprite" to add one.
          </div>
        )}
      </div>

      <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600 flex justify-between">
        <span>Sprites: {state.sprites.length}</span>
        <span>
          Actions: {state.sprites.find((s) => s.id === state.activeSprite)?.actions.length || 0}
        </span>
        <span className={state.isPlaying ? "text-green-600 font-bold" : ""}>
          {state.isPlaying ? "● Playing" : "○ Stopped"}
        </span>
      </div>
    </div>
  );
}
