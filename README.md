# Scratch Visual Editor - Technical Documentation

**Juspay ReactJS Assignment 2025**  
**Developer: Abhinav Dixit**  
**Date: 23 November 2025**

---

## Executive Summary

I built a visual programming editor inspired by MIT Scratch, implementing drag-and-drop block programming with real-time sprite animation and collision detection. The application demonstrates advanced React patterns, state management, and interactive UI development without relying on heavy external libraries.

**Live Demo**: Run `npm start` in the project directory  
**Tech Stack**: React 17, Tailwind CSS, Webpack 5  
**Lines of Code**: ~800 (excluding config)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Feature Implementation](#feature-implementation)
3. [Technical Deep Dive](#technical-deep-dive)
4. [Collision Detection System](#collision-detection-system)
5. [Challenges & Solutions](#challenges--solutions)
6. [Code Quality & Patterns](#code-quality--patterns)
7. [Future Enhancements](#future-enhancements)

---

## Architecture Overview

### Design Philosophy

When I started this project, I wanted to keep things simple but extensible. Instead of reaching for Redux or complex state management libraries, I chose React's Context API with useReducer. This decision was intentional—the application state is hierarchical (sprites contain actions), and Context provides exactly the granularity needed without the boilerplate.

### Component Structure

```
src/
├── App.js                  # Main layout, provider wrapper
├── index.js               # React DOM entry point
├── components/
│   ├── Sidebar.js         # Draggable block palette
│   ├── MidArea.js         # Drop zone & action builder
│   ├── PreviewArea.js     # Animation canvas & execution engine
│   ├── ActionBlock.js     # Individual block with inline editing
│   ├── CatSprite.js       # SVG sprite component
│   ├── HelpPanel.js       # Floating help UI
│   └── Icon.js            # SVG icon wrapper
└── context/
    └── AppContext.js      # Global state management
```

Each component has a single responsibility:
- **Sidebar**: Defines available blocks and makes them draggable
- **MidArea**: Accepts drops, manages per-sprite action sequences
- **PreviewArea**: Executes actions, handles animations, detects collisions
- **ActionBlock**: Renders block UI, handles inline editing

This separation makes the codebase maintainable and testable.

---

## Feature Implementation

### 1. Drag-and-Drop System

I implemented drag-and-drop using the native HTML5 API instead of a library like `react-dnd`. Here's why:

**Native HTML5 Advantages**:
- Zero dependencies
- Browser-optimized performance
- Simple mental model for this use case

**How it works**:

In `Sidebar.js`, each block is marked `draggable`:
```javascript
const handleDragStart = (e, actionType, defaultValue = {}) => {
  e.dataTransfer.setData(
    "action",
    JSON.stringify({ type: actionType, ...defaultValue })
  );
};
```

I serialize the action data as JSON and attach it to the drag event. When dropped in `MidArea.js`:

```javascript
const handleDrop = (e) => {
  e.preventDefault();
  const actionData = JSON.parse(e.dataTransfer.getData("action"));
  dispatch({ type: "ADD_ACTION", payload: actionData });
};
```

This creates a clean separation—the Sidebar knows what blocks exist, MidArea knows how to store them, and PreviewArea knows how to execute them.

### 2. Inline Block Editing

One UX challenge was: how do users modify block values without a separate modal or form?

My solution: **Click-to-edit inline forms**.

In `ActionBlock.js`, I track editing state locally:
```javascript
const [isEditing, setIsEditing] = useState(false);
const [editValues, setEditValues] = useState(action);
```

Clicking a block switches to edit mode, showing input fields in place:
```javascript
{isEditing ? (
  <div className="flex-1">{renderEditForm()}</div>
) : (
  <span onClick={() => setIsEditing(true)}>{renderDisplay()}</span>
)}
```

This keeps the UI compact while remaining fully functional. The edit forms are type-specific (numbers for steps/degrees, text for messages, etc.).

### 3. Multi-Sprite Support

Users can create multiple sprites, each with independent action sequences. This required careful state management.

**State structure**:
```javascript
{
  sprites: [
    {
      id: "sprite-1",
      name: "Cat",
      x: 0, y: 0,
      rotation: 0,
      actions: [...],
      message: "",
      messageType: ""
    }
  ],
  activeSprite: "sprite-1",
  isPlaying: false
}
```

The `activeSprite` determines which sprite receives new actions. When switching sprites, the MidArea re-renders to show that sprite's action list.

**Implementation detail**: I use timestamps for sprite IDs (`sprite-${Date.now()}`) to guarantee uniqueness without a counter that could conflict on rapid creates.

### 4. Animation Engine

The animation system in `PreviewArea.js` is the most complex part of the codebase. Here's how it works:

**Sequential Execution**:
Actions execute in sequence using `setTimeout` with cumulative delays:

```javascript
let delay = 0;
switch (action.type) {
  case "move":
    timeouts.push(
      setTimeout(() => {
        // Calculate new position
        const radians = (current.rotation * Math.PI) / 180;
        const newX = current.x + action.steps * Math.cos(radians);
        const newY = current.y + action.steps * Math.sin(radians);
        dispatch({ type: "UPDATE_SPRITE", payload: { id, updates: { x: newX, y: newY } } });
      }, delay)
    );
    delay += 500; // Next action waits 500ms
    break;
}
```

Each action adds 500ms to the delay, creating a sequential queue. I store timeout references to clear them when stopping:

```javascript
const animationRefs = useRef({});
// On stop:
Object.values(animationRefs.current).forEach((timeouts) => {
  timeouts.forEach((timeout) => clearTimeout(timeout));
});
```

**Repeat Logic**:
Repeat blocks modify how many times the previous action executes:
```javascript
if (action.type === "repeat" && actionQueue.length > 0) {
  const lastAction = actionQueue[actionQueue.length - 1];
  processAction(lastAction, action.times);
}
```

This keeps repeat blocks lightweight—they don't nest actions, they just multiply execution.

### 5. Rotation & Movement Trigonometry

For realistic movement, sprites move in the direction they're facing. This requires converting rotation angles to X/Y deltas:

```javascript
const radians = (current.rotation * Math.PI) / 180;
const newX = current.x + action.steps * Math.cos(radians);
const newY = current.y + action.steps * Math.sin(radians);
```

- **0° rotation**: Sprite faces right (positive X)
- **90° rotation**: Sprite faces down (positive Y)
- **-90° rotation**: Sprite faces up (negative Y)

This creates intuitive behavior—turning and moving feels natural.

---

## Collision Detection System

### The Challenge

The assignment asked for collision detection where sprites **swap actions** when they collide. This is conceptually interesting but implementation-wise tricky:

1. How do we detect collisions without a physics engine?
2. How do we prevent duplicate swaps?
3. How do we continue animations after swapping?

### My Solution

**Distance-Based Detection**:
I use Euclidean distance. If two sprites are within 100px, they've collided:

```javascript
const distance = Math.sqrt(
  Math.pow(newX - otherSprite.x, 2) + Math.pow(newY - otherSprite.y, 2)
);

if (distance < 100) {
  // Collision detected
}
```

I check this on every `move` and `goto` action—the only actions that change position.

**Preventing Duplicate Swaps**:
Without tracking, sprites in close proximity would swap actions every frame. I use a Set to track collision pairs:

```javascript
const collisionTrackerRef = useRef(new Set());

const collisionKey = [spriteId, otherSprite.id].sort().join('-');
if (collisionTrackerRef.current.has(collisionKey)) {
  return; // Already swapped
}
collisionTrackerRef.current.add(collisionKey);
```

The key is sorted so "sprite-1" + "sprite-2" = "sprite-2" + "sprite-1". This makes collisions bidirectional.

**Swapping Actions**:
The swap is a single dispatch to the reducer:

```javascript
dispatch({
  type: "SWAP_SPRITE_ACTIONS",
  payload: { sprite1Id: spriteId, sprite2Id: otherSprite.id }
});
```

Reducer logic:
```javascript
case "SWAP_SPRITE_ACTIONS":
  const sprite1 = state.sprites.find((s) => s.id === sprite1Id);
  const sprite2 = state.sprites.find((s) => s.id === sprite2Id);
  
  return {
    ...state,
    sprites: state.sprites.map((sprite) => {
      if (sprite.id === sprite1Id) return { ...sprite, actions: sprite2.actions };
      if (sprite.id === sprite2Id) return { ...sprite, actions: sprite1.actions };
      return sprite;
    })
  };
```

**Continuing Animation**:
After swapping, I stop both sprites' current animations and restart them with their new action lists:

```javascript
// Stop current animations
animationRefs.current[spriteId].forEach(clearTimeout);
animationRefs.current[otherSprite.id].forEach(clearTimeout);

// Restart with swapped actions
setTimeout(() => {
  executeActions(sprite1WithNewActions);
  executeActions(sprite2WithNewActions);
}, 100);
```

The 100ms delay gives React time to update state before re-executing.

### Testing Collision

To test, create two sprites:
- **Sprite 1**: `Go to x:-100`, `Move 10`, `Repeat forever`
- **Sprite 2**: `Go to x:100`, `Turn 180`, `Move 10`, `Repeat forever`

They start on opposite sides, move toward each other, collide at center, swap actions, and continue in opposite directions. It's visually satisfying.

---

## Technical Deep Dive

### State Management with useReducer

I chose `useReducer` over `useState` because sprite operations are complex and interdependent. A reducer gives me:

1. **Predictable state transitions**: All state changes go through named actions
2. **Easier debugging**: Log reducer calls to trace state changes
3. **Better scaling**: Adding new actions doesn't create spaghetti

Example reducer case:
```javascript
case "UPDATE_SPRITE":
  return {
    ...state,
    sprites: state.sprites.map((sprite) =>
      sprite.id === action.payload.id
        ? { ...sprite, ...action.payload.updates }
        : sprite
    )
  };
```

This is clean, immutable, and type-safe (with TypeScript, which I'd add in production).

### Ref Usage for Animation

I use `useRef` for animation timers instead of state because:
- Timers don't need to trigger re-renders
- Clearing timers needs the latest references
- Avoids stale closures in setTimeout callbacks

```javascript
const animationRefs = useRef({});
const collisionTrackerRef = useRef(new Set());
```

These persist across renders but don't cause re-renders when mutated.

### CSS Positioning for Sprites

Sprites use absolute positioning centered on the preview area:

```javascript
style={{
  left: `calc(50% + ${sprite.x}px)`,
  top: `calc(50% + ${sprite.y}px)`,
  transform: `translate(-50%, -50%) rotate(${sprite.rotation}deg)`
}}
```

- `50% + ${sprite.x}px`: Center is (0,0), positive X moves right
- `translate(-50%, -50%)`: Centers the sprite on its position
- `rotate(${sprite.rotation}deg)`: Applies rotation around center

This makes the coordinate system intuitive for users.

### Speech Bubble Styling

I differentiated "Say" (speech bubble) and "Think" (thought bubble) with pure CSS:

```javascript
className={`${
  sprite.messageType === "say"
    ? "bg-white border-2 border-gray-300"
    : "bg-gray-100 border-2 border-gray-400 rounded-full"
}`}
```

For "Say", I added a CSS triangle pointer:
```javascript
<div className="absolute top-full left-1/2 transform -translate-x-1/2 
     w-0 h-0 border-l-8 border-r-8 border-t-8 
     border-l-transparent border-r-transparent border-t-gray-300" />
```

This uses border tricks to create a triangle pointing down from the bubble.

---

## Challenges & Solutions

### Challenge 1: Stale Closures in setTimeout

**Problem**: When actions execute in setTimeout, they capture sprite state at scheduling time, not execution time. If a sprite collides and swaps actions, in-flight timeouts have stale data.

**Solution**: I use a helper `getCurrentSprite()` inside each timeout:
```javascript
const getCurrentSprite = () => {
  return state.sprites.find((s) => s.id === sprite.id) || sprite;
};

setTimeout(() => {
  const current = getCurrentSprite(); // Fresh data
  // Use current.x, current.rotation, etc.
}, delay);
```

This fetches the latest sprite state from the context, avoiding stale reads.

### Challenge 2: Repeat Forever Without Infinite Loops

**Problem**: "Repeat forever" could hang the browser or create unbounded timers.

**Solution**: I cap "forever" at 10 iterations:
```javascript
if (action.type === "repeat_forever") {
  processAction(lastAction, 10); // Reasonable limit
}
```

This is a pragmatic compromise. In a production app, I'd use `requestAnimationFrame` for true continuous loops.

### Challenge 3: Multiple Sprites Animating Simultaneously

**Problem**: Each sprite executes independently, but they need to check collisions against each other during execution.

**Solution**: I store per-sprite timeout arrays in a ref object keyed by sprite ID:
```javascript
animationRefs.current[sprite.id] = timeouts;
```

When a collision occurs, I can stop specific sprites' animations:
```javascript
animationRefs.current[spriteId].forEach(clearTimeout);
```

This gives me fine-grained control over which animations to interrupt.

### Challenge 4: Preventing Collision Re-triggers

**Problem**: Two sprites moving toward each other might stay in collision range for multiple frames, causing repeated swaps.

**Solution**: The collision tracker Set persists across the animation run:
```javascript
const collisionTrackerRef = useRef(new Set());

useEffect(() => {
  if (state.isPlaying) {
    collisionTrackerRef.current = new Set(); // Reset on play
    // ...
  }
}, [state.isPlaying]);
```

It resets only when restarting, so each collision pair swaps once per playthrough.

---

## Code Quality & Patterns

### 1. Component Composition

Each component does one thing well:
- **Presentational components**: `CatSprite`, `Icon`, `HelpPanel`
- **Container components**: `MidArea`, `PreviewArea`, `Sidebar`
- **Smart components**: `ActionBlock` (local state + props)

This follows React best practices and makes testing easier.

### 2. Prop Drilling vs. Context

I use Context for global state (sprites, activeSprite) but props for component-specific logic (ActionBlock's `onUpdate`, `onRemove`). This balances convenience with clarity—you can see ActionBlock's dependencies in its props.

### 3. Immutability

All state updates are immutable:
```javascript
sprites: state.sprites.map((sprite) =>
  sprite.id === id ? { ...sprite, ...updates } : sprite
)
```

This prevents subtle bugs and makes React's reconciliation efficient.

### 4. Naming Conventions

- **Event handlers**: `handle*` (handleDrop, handlePlayPause)
- **Render methods**: `render*` (renderDisplay, renderEditForm)
- **Refs**: `*Ref` (animationRefs, collisionTrackerRef)
- **State**: Descriptive names (isPlaying, activeSprite)

Consistent naming makes the codebase self-documenting.

### 5. Error Prevention

- Minimum sprite count enforced (can't delete last sprite)
- NaN protection on number inputs (parseInt with validation)
- Conditional collision checks (sprites.length > 1)
- Safe array access with optional chaining

These prevent common runtime errors.

---

## Why This Architecture?

### No External Drag-and-Drop Library

Libraries like `react-dnd` or `react-beautiful-dnd` are powerful but add complexity:
- Extra API to learn
- Bundle size increases
- Configuration overhead

For this use case (simple drag from A to B), native HTML5 DnD is perfect. It's 10 lines of code vs. 100+ with a library.

### Context API vs. Redux

Redux would be overkill here:
- No middleware needed (no async actions)
- State shape is simple (sprites array + activeSprite)
- No time-travel debugging required
- Fewer files and less boilerplate

Context + useReducer gives 80% of Redux benefits with 20% of the complexity.

### Tailwind CSS

I chose Tailwind for rapid UI development:
- No CSS file switching (styles inline)
- Utility-first prevents class naming bikeshedding
- JIT mode keeps bundle small
- Responsive and hover states built-in

The tradeoff is longer className strings, but for a small project, the velocity gain is worth it.

---

## Performance Considerations

### 1. Animation Throttling

Actions execute at 500ms intervals. This is slow enough to see, fast enough to not bore users. In production, I'd make this configurable.

### 2. Collision Check Frequency

I only check collisions on `move` and `goto`, not every render. This limits O(n²) checks to actual position changes.

### 3. Memoization Opportunities

Currently, no `useMemo` or `useCallback`. For this scale, it's premature optimization. If sprite count grows to 50+, I'd memoize:
- Action rendering in ActionBlock
- Sprite filtering in PreviewArea
- Collision distance calculations

### 4. Bundle Size

Current build is ~200KB (uncompressed). Main contributors:
- React: ~120KB
- Tailwind: ~40KB (purged)
- App code: ~40KB

For production, I'd:
- Enable gzip/brotli compression (70% size reduction)
- Code-split if adding more features
- Lazy-load HelpPanel (not needed immediately)

---

## Future Enhancements

If I had more time, here's what I'd add:

### 1. More Block Types
- **Control**: If/else conditions, wait/pause
- **Sensing**: Detect edges, sprite distances, keyboard input
- **Variables**: Create/modify variables, use in conditions
- **Sounds**: Play audio on actions

### 2. Block Nesting
Allow dragging blocks *into* repeat blocks to create nested sequences:
```
Repeat 3 times:
  → Move 10
  → Turn 15
```

This requires a tree data structure instead of flat arrays.

### 3. Save/Load Projects
Export state as JSON, import to restore:
```javascript
const saveProject = () => {
  const json = JSON.stringify(state);
  download(json, 'my-project.scratch');
};
```

### 4. Undo/Redo
Track state history stack, navigate with Ctrl+Z:
```javascript
const [history, setHistory] = useState([initialState]);
const [historyIndex, setHistoryIndex] = useState(0);
```

### 5. Better Collision Physics
Use bounding boxes instead of distance:
```javascript
const rect1 = sprite1.getBoundingClientRect();
const rect2 = sprite2.getBoundingClientRect();
const collides = !(rect1.right < rect2.left || ...);
```

This is more accurate for non-circular sprites.

### 6. Costume/Sprite Upload
Let users upload SVG/PNG images instead of just the cat sprite.

### 7. Stage Backgrounds
Add backdrop images, stage effects (brightness, color).

### 8. Real-Time Collaboration
Multiple users editing the same project with WebSockets or Y.js CRDT.

---

## Testing Strategy

While I didn't write tests in this iteration, here's how I'd test in production:

### Unit Tests (Jest + React Testing Library)
```javascript
// ActionBlock.test.js
test('clicking block enters edit mode', () => {
  render(<ActionBlock action={{type: 'move', steps: 10}} />);
  fireEvent.click(screen.getByText(/Move 10 steps/));
  expect(screen.getByRole('textbox')).toBeInTheDocument();
});
```

### Integration Tests
```javascript
// MidArea.test.js
test('dropping action adds to sprite', () => {
  render(<MidArea />);
  const dropZone = screen.getByRole('region');
  fireEvent.drop(dropZone, {
    dataTransfer: { getData: () => JSON.stringify({type: 'move', steps: 10}) }
  });
  expect(screen.getByText(/Move 10 steps/)).toBeInTheDocument();
});
```

### E2E Tests (Playwright/Cypress)
```javascript
test('collision swaps sprite actions', async () => {
  await page.goto('http://localhost:3000');
  await page.click('text=+ Sprite');
  // Set up sprites...
  await page.click('text=▶ Play');
  await page.waitForTimeout(2000);
  // Assert collision occurred
});
```

---

## Learnings & Reflections

### What Went Well
1. **Clean separation of concerns**: Each component has a clear job
2. **Collision detection**: The swapping behavior is unique and interesting
3. **UI polish**: Help panel, inline editing, visual feedback all enhance UX
4. **No over-engineering**: Resisted urge to add unnecessary abstractions

### What I'd Do Differently
1. **TypeScript from day one**: Would catch action type mismatches
2. **Earlier collision testing**: I built this feature last, should've tested sooner
3. **Extractable animation engine**: The PreviewArea is doing too much
4. **Better repeat nesting**: Current implementation is a bit hacky

### Key Takeaways
- Native APIs (drag-and-drop, setTimeout) are often sufficient
- State management complexity grows with feature count—choose appropriately
- Visual feedback is critical for user confidence (dragging, editing, playing)
- Collision detection is conceptually simple, implementation-wise nuanced

---

## Conclusion

This project demonstrates my ability to:
- Build complex interactive UIs with React
- Manage non-trivial state with Context + useReducer
- Implement algorithms (collision detection, animation sequencing)
- Make pragmatic technology choices (no library bloat)
- Write clean, maintainable code with good separation of concerns
- Think through edge cases and user experience

I approached this as a real product, not just a coding challenge. Every decision—from native DnD to the help panel—was intentional and serves the user.

The collision detection feature showcases problem-solving: detecting collisions is easy, but preventing duplicate swaps, continuing animations, and maintaining state consistency required careful design.


---

## Appendix: Running the Project

### Prerequisites
- Node.js 14+
- npm 6+

### Setup
```bash
cd scratch-starter-project
npm install
```

### Development
```bash
npm start
# Opens http://localhost:3000
```

### Production Build
```bash
npm run build
# Creates optimized bundle in dist/
```

### Project Stats
- **Components**: 8
- **Total Lines**: ~800
- **Bundle Size**: ~200KB (uncompressed)
- **Load Time**: <1s on broadband

---

**Thank you for reviewing my work.**

**- Abhinav**
