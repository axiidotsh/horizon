# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Horizon is a productivity application built with Next.js 15, React 19, and TypeScript. The project uses the Next.js App Router architecture and is configured with modern tooling including Tailwind CSS v4, shadcn/ui components, and React Compiler.

## Development Commands

### Package Management

This project uses **pnpm** as the package manager.

### Core Commands

- `pnpm dev` - Start development server on http://localhost:3000
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint on the codebase

### Git Hooks

The project uses Husky with a pre-commit hook that runs `lint-staged`:

- Automatically runs `eslint --fix` and `prettier --write` on staged `.js`, `.jsx`, `.ts`, `.tsx` files
- Automatically runs `prettier --write` on `.json`, `.md`, `.css` files

## Code Architecture

### Project Structure

```
src/
├── app/              # Next.js App Router pages and layouts
├── lib/              # Utility functions (e.g., cn helper)
└── styles/           # Global CSS with Tailwind configuration
```

### Technology Stack

- **Framework**: Next.js 15.5.6 with App Router
- **React**: 19.1.0 with React Compiler enabled (`reactCompiler: true` in next.config.ts)
- **Styling**: Tailwind CSS v4 with custom theme configuration
- **UI Components**: shadcn/ui (New York style) with Radix UI primitives
- **Icons**: Lucide React
- **Validation**: Zod v4
- **Notifications**: Sonner (toast notifications)
- **Theme**: next-themes for dark mode support

### Path Aliases

TypeScript and shadcn/ui are configured with the following path aliases:

- `@/*` → `./src/*`
- `@/components` → `./src/components`
- `@/lib` → `./src/lib`
- `@/ui` → `./src/components/ui`
- `@/hooks` → `./src/hooks`

### Styling Configuration

#### Tailwind CSS

- Using Tailwind CSS v4 (PostCSS-based configuration)
- Custom CSS variables defined in `src/styles/globals.css`
- Design system uses OKLCH color space for better color handling
- CSS variable-based theming for light/dark modes
- Plugins: `tailwindcss-animate`, `tailwindcss-debug-screens`, `tw-animate-css`
- Debug screens enabled in development (see `debug-screens` class in layout.tsx)

#### Color System

The project uses a comprehensive design token system with CSS variables:

- Semantic colors: `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`
- UI element colors: `card`, `popover`, `border`, `input`, `ring`
- Chart colors: `chart-1` through `chart-5`
- Sidebar colors: `sidebar`, `sidebar-primary`, `sidebar-accent`, etc.
- Border radius tokens: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`

All colors are defined in OKLCH format for both light and dark themes.

#### shadcn/ui Configuration

- Style variant: "new-york"
- Base color: zinc
- CSS variables mode enabled
- Icon library: Lucide
- Components are configured to use `src/styles/globals.css`

### Code Quality Tools

#### ESLint

- Uses Next.js recommended configurations: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Custom ignore patterns: `.next/`, `out/`, `build/`, `next-env.d.ts`

#### Prettier

- Tab width: 2 spaces
- Print width: 80 characters
- Single quotes, semicolons enabled
- Plugins: `prettier-plugin-organize-imports` (auto-organizes imports), `prettier-plugin-tailwindcss` (sorts Tailwind classes)

### TypeScript Configuration

- Target: ES2017
- Strict mode enabled
- Module resolution: bundler (Next.js optimized)
- JSX: `react-jsx` (React 19's new JSX transform)
- Incremental compilation enabled
- Path alias `@/*` maps to `./src/*`

## Key Technical Decisions

### React Compiler

This project has React Compiler enabled (`next.config.ts`). This is an experimental feature that optimizes React components automatically. Be mindful of this when debugging component behavior.

### Font Configuration

The project uses Inter font loaded via `next/font/google` with a CSS variable (`--font-sans`).

### Layout Configuration

The root layout (`src/app/layout.tsx`) includes:

- `suppressHydrationWarning` on `<html>` for theme support
- Conditional `debug-screens` class in development
- Antialiased text rendering

## Development Notes

### When Adding Components

- Use shadcn/ui CLI for adding new components: `npx shadcn@latest add [component-name]`
- Components will be added to the configured aliases paths
- All components use the New York style variant with zinc base color

### When Working with Styles

- Global styles and theme configuration are in `src/styles/globals.css`
- Use semantic color tokens (e.g., `bg-background`, `text-foreground`) rather than hardcoded colors
- The design system supports both light and dark modes via CSS variables
- Tailwind classes will be auto-sorted by Prettier on save

### When Writing Code

- Imports will be automatically organized by Prettier on commit
- ESLint and Prettier run automatically on staged files via pre-commit hook
- Use the `cn()` utility from `@/lib/utils` for conditional Tailwind classes
