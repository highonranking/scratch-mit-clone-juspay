import React from "react";
import { useApp } from "../context/AppContext";
import ActionBlock from "./ActionBlock";

export default function MidArea() {
  const { state, dispatch } = useApp();
  const activeSprite = state.sprites.find((s) => s.id === state.activeSprite);

  const handleDrop = (e) => {
    e.preventDefault();
    const actionData = JSON.parse(e.dataTransfer.getData("action"));
    dispatch({ type: "ADD_ACTION", payload: actionData });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveAction = (index) => {
    dispatch({ type: "REMOVE_ACTION", payload: index });
  };

  const handleUpdateAction = (index, updatedAction) => {
    dispatch({
      type: "UPDATE_SPRITE",
      payload: {
        id: state.activeSprite,
        updates: {
          actions: activeSprite.actions.map((action, idx) =>
            idx === index ? updatedAction : action
          ),
        },
      },
    });
  };

  return (
    <div
      className="flex-1 h-full overflow-auto p-4"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="mb-4 pb-2 border-b border-gray-300">
        <h2 className="font-bold text-lg">
          Actions for {activeSprite?.name || "Sprite"}
        </h2>
        <p className="text-xs text-gray-500">
          Drag blocks here • Click to edit values
        </p>
      </div>

      {activeSprite?.actions.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center text-gray-400">
          Drag and drop blocks here
        </div>
      ) : (
        <div className="space-y-1">
          {activeSprite.actions.map((action, index) => (
            <ActionBlock
              key={index}
              action={action}
              index={index}
              onUpdate={handleUpdateAction}
              onRemove={handleRemoveAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
