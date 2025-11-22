import React from "react";
import Icon from "./Icon";

export default function Sidebar() {
  const handleDragStart = (e, actionType, defaultValue = {}) => {
    e.dataTransfer.setData(
      "action",
      JSON.stringify({ type: actionType, ...defaultValue })
    );
  };

  return (
    <div className="w-60 flex-none h-full overflow-y-auto flex flex-col items-start p-2 border-r border-gray-200">
      <div className="font-bold mt-2"> {"Events"} </div>
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, "event_flag")}
        className="flex flex-row flex-wrap bg-yellow-500 text-white px-2 py-1 my-2 text-sm cursor-pointer"
      >
        {"When "}
        <Icon name="flag" size={15} className="text-green-600 mx-2" />
        {"clicked"}
      </div>

      <div className="font-bold mt-2"> {"Motion"} </div>
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, "move", { steps: 10 })}
        className="flex flex-row flex-wrap bg-blue-500 text-white px-2 py-1 my-2 text-sm cursor-pointer"
      >
        {"Move 10 steps"}
      </div>
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, "turn_clockwise", { degrees: 15 })}
        className="flex flex-row flex-wrap bg-blue-500 text-white px-2 py-1 my-2 text-sm cursor-pointer"
      >
        {"Turn "}
        <Icon name="redo" size={15} className="text-white mx-2" />
        {"15 degrees"}
      </div>
      <div
        draggable
        onDragStart={(e) =>
          handleDragStart(e, "turn_anticlockwise", { degrees: 15 })
        }
        className="flex flex-row flex-wrap bg-blue-500 text-white px-2 py-1 my-2 text-sm cursor-pointer"
      >
        {"Turn "}
        <Icon name="undo" size={15} className="text-white mx-2" />
        {"15 degrees"}
      </div>
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, "goto", { x: 0, y: 0 })}
        className="flex flex-row flex-wrap bg-blue-500 text-white px-2 py-1 my-2 text-sm cursor-pointer"
      >
        {"Go to x: 0 y: 0"}
      </div>
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, "repeat", { times: 2 })}
        className="flex flex-row flex-wrap bg-orange-500 text-white px-2 py-1 my-2 text-sm cursor-pointer"
      >
        {"Repeat 2 times"}
      </div>
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, "repeat_forever", {})}
        className="flex flex-row flex-wrap bg-orange-600 text-white px-2 py-1 my-2 text-sm cursor-pointer"
      >
        {"Repeat forever"}
      </div>

      <div className="font-bold mt-2"> {"Looks"} </div>
      <div
        draggable
        onDragStart={(e) =>
          handleDragStart(e, "say", { text: "Hello!", duration: 2 })
        }
        className="flex flex-row flex-wrap bg-purple-500 text-white px-2 py-1 my-2 text-sm cursor-pointer"
      >
        {'Say "Hello!" for 2 seconds'}
      </div>
      <div
        draggable
        onDragStart={(e) =>
          handleDragStart(e, "think", { text: "Hmm...", duration: 2 })
        }
        className="flex flex-row flex-wrap bg-purple-500 text-white px-2 py-1 my-2 text-sm cursor-pointer"
      >
        {'Think "Hmm..." for 2 seconds'}
      </div>
    </div>
  );
}
