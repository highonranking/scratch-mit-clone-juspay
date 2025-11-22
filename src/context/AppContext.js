import React, { createContext, useContext, useReducer } from "react";

const AppContext = createContext();

const initialState = {
  sprites: [
    {
      id: "sprite-1",
      name: "Cat",
      x: 0,
      y: 0,
      rotation: 0,
      actions: [],
      message: "",
      messageType: "", 
    },
  ],
  activeSprite: "sprite-1",
  isPlaying: false,
};

function appReducer(state, action) {
  switch (action.type) {
    case "ADD_SPRITE":
      const newSprite = {
        id: `sprite-${Date.now()}`,
        name: `Sprite ${state.sprites.length + 1}`,
        x: 0,
        y: 0,
        rotation: 0,
        actions: [],
        message: "",
        messageType: "",
      };
      return {
        ...state,
        sprites: [...state.sprites, newSprite],
        activeSprite: newSprite.id,
      };

    case "SET_ACTIVE_SPRITE":
      return {
        ...state,
        activeSprite: action.payload,
      };

    case "ADD_ACTION":
      return {
        ...state,
        sprites: state.sprites.map((sprite) =>
          sprite.id === state.activeSprite
            ? { ...sprite, actions: [...sprite.actions, action.payload] }
            : sprite
        ),
      };

    case "REMOVE_ACTION":
      return {
        ...state,
        sprites: state.sprites.map((sprite) =>
          sprite.id === state.activeSprite
            ? {
                ...sprite,
                actions: sprite.actions.filter((_, idx) => idx !== action.payload),
              }
            : sprite
        ),
      };

    case "UPDATE_SPRITE":
      return {
        ...state,
        sprites: state.sprites.map((sprite) =>
          sprite.id === action.payload.id
            ? { ...sprite, ...action.payload.updates }
            : sprite
        ),
      };

    case "SWAP_SPRITE_ACTIONS":
      const { sprite1Id, sprite2Id } = action.payload;
      const sprite1 = state.sprites.find((s) => s.id === sprite1Id);
      const sprite2 = state.sprites.find((s) => s.id === sprite2Id);

      if (!sprite1 || !sprite2) return state;

      return {
        ...state,
        sprites: state.sprites.map((sprite) => {
          if (sprite.id === sprite1Id) {
            return { ...sprite, actions: sprite2.actions };
          }
          if (sprite.id === sprite2Id) {
            return { ...sprite, actions: sprite1.actions };
          }
          return sprite;
        }),
      };

    case "SET_PLAYING":
      return {
        ...state,
        isPlaying: action.payload,
      };

    case "DELETE_SPRITE":
      const remainingSprites = state.sprites.filter(
        (s) => s.id !== action.payload
      );
      return {
        ...state,
        sprites: remainingSprites,
        activeSprite:
          state.activeSprite === action.payload
            ? remainingSprites[0]?.id || null
            : state.activeSprite,
      };

    case "RESET_SPRITE_POSITION":
      return {
        ...state,
        sprites: state.sprites.map((sprite) =>
          sprite.id === action.payload
            ? { ...sprite, x: 0, y: 0, rotation: 0, message: "" }
            : sprite
        ),
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
