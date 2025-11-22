# Scratch Starter

A MIT Scratch-like visual programming editor built with React

## Setup

```bash
npm install
npm start
```

Open http://localhost:3000

## What's Implemented

### Motion Blocks
- Move X steps
- Turn clockwise/anticlockwise
- Go to x, y position
- Repeat (N times or forever)

### Looks Blocks
- Say (speech bubble)
- Think (thought bubble)

### Features
- Drag-and-drop blocks from sidebar to build sequences
- Click blocks to edit values
- Multiple sprites support
- Each sprite has independent actions
- Play button runs all sprites together

### Collision Detection (Hero Feature)
When sprites collide (distance < 100px):
- Actions swap between the two sprites
- Animation continues with swapped actions
- Example: Sprite moving right + Sprite moving left → they swap directions after collision

To test:
1. Create 2 sprites
2. Sprite 1: `Go to x:-100`, `Move 10`, `Repeat forever`
3. Sprite 2: `Go to x:100`, `Turn 180`, `Move 10`, `Repeat forever`
4. Hit Play and check console logs

## Structure

```
src/
├── components/
│   ├── Sidebar.js          # Draggable blocks
│   ├── MidArea.js          # Drop zone for actions
│   ├── PreviewArea.js      # Animation canvas
│   ├── ActionBlock.js      # Individual block component
│   └── CatSprite.js        # SVG sprite
├── context/
│   └── AppContext.js       # State management
└── App.js
```

## Implementation Notes

- Using Context API for state (no Redux)
- HTML5 drag-and-drop (no react-dnd)
- Collision detection runs on every move/goto action
- Animations use setTimeout for sequencing (500ms intervals)
- Collision tracking prevents duplicate swaps

## Stack

- React 17
- Tailwind CSS
- Webpack 5

Built for Juspay ReactJS Challenge 2025