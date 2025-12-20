# Plan: Convert Command Menu Actions to Modal Popover

## Overview

Convert CommandMenuActions from absolute positioned div to a Popover with `modal=true` to prevent interaction with command menu and other elements when active. Anchor popover to the footer element.

## Current State

- **command-menu.tsx:669-693**: Footer renders with actions button, CommandMenuActions rendered absolutely positioned inside footer
- **command-menu.tsx:684-690**: CommandMenuActions positioned `absolute right-1.5 bottom-full z-50 mb-2`
- **command-menu-actions.tsx:200-254**: Returns standalone div with no popover wrapper
- Actions currently closeable via Escape key, but background remains interactive

## Required Changes

### 1. Update `command-menu-actions.tsx`

- Remove root `<div>` wrapper (lines 201-254)
- Return just the content (search input + actions list)
- Component becomes content-only, not self-contained

### 2. Update `command-menu.tsx` Footer (lines 669-693)

- Wrap footer in `<Popover>` with `modal={true}`
- Make actions button a `<PopoverTrigger>`
- Wrap current CommandMenuActions in `<PopoverContent>`
- Use `<PopoverAnchor>` on footer container to anchor popover
- Remove absolute positioning styles from actions container (line 684)

### 3. State Management

- Remove `actionsOpen` state management via `actionsViewOpenAtom` (line 209)
- Popover controls open/close internally
- Keep `selectedItem` state for determining if footer shows
- Remove manual open/close logic (lines 676, 479-485)

### 4. Keyboard Shortcuts

- **Escape**: Remove manual handling in command-menu.tsx (lines 387-396) - Popover handles this
- **⌘O**: Update to use Popover's `onOpenChange` instead of state setter (lines 376-384)
- Keep Escape handling in command-menu-actions.tsx for date picker navigation (lines 78-92)

### 5. PopoverContent Props

- `modal={true}` - blocks interaction with background
- `align="end"` - align to right side of footer
- `side="top"` - position above footer
- `sideOffset={8}` - spacing from footer
- `onOpenAutoFocus={(e) => e.preventDefault()}` - keep search input focused

## Implementation Order

1. Modify command-menu-actions.tsx to return content only
2. Wrap footer in Popover structure in command-menu.tsx
3. Remove actionsOpen state and related logic
4. Update keyboard shortcuts
5. Test modal behavior and anchoring

## Edge Cases

- When actions popover open and user presses Escape in date picker, should go back to actions not close popover
- When actions popover open and command menu closes (Escape), popover should also close
- Clicking outside actions should close popover but not command menu
- Focus management between command input and actions search input

## Resolved Requirements

- Actions button click: Opens actions popover, keeps command menu open
- ⌘O scope: Only active when command menu is open
