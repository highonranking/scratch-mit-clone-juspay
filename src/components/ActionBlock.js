import React, { useState } from "react";
import Icon from "./Icon";

export default function ActionBlock({ action, index, onUpdate, onRemove }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState(action);

  const handleSave = () => {
    onUpdate(index, editValues);
    setIsEditing(false);
  };

  const getActionColor = (type) => {
    if (type.startsWith("move") || type.startsWith("turn") || type === "goto") {
      return "bg-blue-500";
    }
    if (type === "say" || type === "think") {
      return "bg-purple-500";
    }
    if (type === "repeat") {
      return "bg-orange-500";
    }
    return "bg-yellow-500";
  };

  const renderDisplay = () => {
    switch (action.type) {
      case "move":
        return `Move ${action.steps} steps`;
      case "turn_clockwise":
        return (
          <>
            Turn <Icon name="redo" size={15} className="text-white mx-1" />{" "}
            {action.degrees} degrees
          </>
        );
      case "turn_anticlockwise":
        return (
          <>
            Turn <Icon name="undo" size={15} className="text-white mx-1" />{" "}
            {action.degrees} degrees
          </>
        );
      case "goto":
        return `Go to x: ${action.x} y: ${action.y}`;
      case "say":
        return `Say "${action.text}" for ${action.duration}s`;
      case "think":
        return `Think "${action.text}" for ${action.duration}s`;
      case "repeat":
        return `Repeat ${action.times} times`;
      case "repeat_forever":
        return "Repeat forever ∞";
      case "event_flag":
        return (
          <>
            When <Icon name="flag" size={15} className="text-green-600 mx-1" /> clicked
          </>
        );
      default:
        return action.type;
    }
  };

  const renderEditForm = () => {
    switch (action.type) {
      case "move":
        return (
          <div className="flex items-center gap-2">
            <span>Move</span>
            <input
              type="number"
              value={editValues.steps}
              onChange={(e) =>
                setEditValues({ ...editValues, steps: parseInt(e.target.value) })
              }
              className="w-16 px-2 py-1 text-black rounded"
            />
            <span>steps</span>
          </div>
        );
      case "turn_clockwise":
      case "turn_anticlockwise":
        return (
          <div className="flex items-center gap-2">
            <span>Turn</span>
            <input
              type="number"
              value={editValues.degrees}
              onChange={(e) =>
                setEditValues({ ...editValues, degrees: parseInt(e.target.value) })
              }
              className="w-16 px-2 py-1 text-black rounded"
            />
            <span>degrees</span>
          </div>
        );
      case "goto":
        return (
          <div className="flex items-center gap-2">
            <span>x:</span>
            <input
              type="number"
              value={editValues.x}
              onChange={(e) =>
                setEditValues({ ...editValues, x: parseInt(e.target.value) })
              }
              className="w-16 px-2 py-1 text-black rounded"
            />
            <span>y:</span>
            <input
              type="number"
              value={editValues.y}
              onChange={(e) =>
                setEditValues({ ...editValues, y: parseInt(e.target.value) })
              }
              className="w-16 px-2 py-1 text-black rounded"
            />
          </div>
        );
      case "say":
      case "think":
        return (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editValues.text}
              onChange={(e) => setEditValues({ ...editValues, text: e.target.value })}
              className="flex-1 px-2 py-1 text-black rounded"
            />
            <span>for</span>
            <input
              type="number"
              value={editValues.duration}
              onChange={(e) =>
                setEditValues({ ...editValues, duration: parseInt(e.target.value) })
              }
              className="w-12 px-2 py-1 text-black rounded"
            />
            <span>s</span>
          </div>
        );
      case "repeat":
        return (
          <div className="flex items-center gap-2">
            <span>Repeat</span>
            <input
              type="number"
              value={editValues.times}
              onChange={(e) =>
                setEditValues({ ...editValues, times: parseInt(e.target.value) })
              }
              className="w-16 px-2 py-1 text-black rounded"
            />
            <span>times</span>
          </div>
        );
      case "repeat_forever":
        return <div>Repeat forever ∞ (no editing needed)</div>;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex flex-row items-center justify-between ${getActionColor(
        action.type
      )} text-white px-3 py-2 my-2 text-sm rounded`}
    >
      {isEditing ? (
        <>
          <div className="flex-1">{renderEditForm()}</div>
          <div className="flex gap-2 ml-2">
            <button
              onClick={handleSave}
              className="text-white hover:text-green-200 font-bold"
            >
              ✓
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-white hover:text-red-200"
            >
              ✕
            </button>
          </div>
        </>
      ) : (
        <>
          <span
            className="flex items-center flex-1 cursor-pointer"
            onClick={() => action.type !== "event_flag" && setIsEditing(true)}
          >
            {renderDisplay()}
          </span>
          <button
            onClick={() => onRemove(index)}
            className="ml-2 text-white hover:text-red-200"
          >
            🗑
          </button>
        </>
      )}
    </div>
  );
}
