# Theme System Guide

## Overview

The theme system allows you to easily switch between different color themes in your STL Forge application. The themes are defined in `src/app/globals.css` and can be switched using the theme switcher component in the bottom-right corner of the screen.

## Available Themes

1. **Dark Theme** (Default) - The original dark theme with cyan accent for public areas and yellow for studio
2. **Lavender Theme** - Sophisticated purple theme with lavender primary and golden olive accents
3. **Light Theme** - Clean light theme with blue accent for public areas and yellow for studio

## How to Use Theme Colors in Your Components

Instead of using hardcoded colors like `bg-[#131618]`, use the theme variables:

### Background Colors
- `bg-background` - Main background color
- `bg-background-secondary` - Secondary background (slightly lighter)
- `bg-background-card` - Card/panel background
- `bg-background-hover` - Hover state background

### Text Colors
- `text-text-primary` - Primary text color
- `text-text-secondary` - Secondary text color
- `text-text-muted` - Muted/disabled text

### Primary Colors
- `bg-primary` - Primary accent color (cyan for public, yellow/purple for studio)
- `hover:bg-primary-hover` - Primary hover state
- `text-primary-foreground` - Text color on primary background

### Border Colors
- `border-border` - Default border color
- `hover:border-border-hover` - Border hover state

### Status Colors
- `text-success` / `bg-success` - Success state
- `text-error` / `bg-error` - Error state
- `text-warning` / `bg-warning` - Warning state
- `text-info` / `bg-info` - Info state

## Studio-Specific Styling

The theme system provides dedicated variables for studio pages, allowing complete customization of the studio environment:

### Studio-Specific Variables

When inside studio pages (with the `in-studio` class), these additional variables are available:

#### Colors
- `bg-accent` / `text-accent` - Studio accent color (yellow by default)
- `hover:bg-accent-hover` - Accent hover state
- `text-accent-foreground` - Text color on accent background

#### Backgrounds
- `bg-background` - Maps to studio-specific background
- `bg-background-secondary` - Studio secondary background
- `bg-background-card` - Studio card background
- `bg-background-hover` - Studio hover background

#### Text Colors
- `text-text-primary` - Studio primary text
- `text-text-secondary` - Studio secondary text
- `text-text-muted` - Studio muted text

#### Borders
- `border-border` - Studio border color
- `hover:border-border-hover` - Studio border hover

### How It Works
The `StudioClientLayout` component automatically adds the `in-studio` class, which:
1. Overrides all color variables with studio-specific versions
2. Enables the accent color utilities (bg-accent, text-accent, etc.)
3. Applies studio-specific backgrounds, text colors, and borders
4. Maintains consistency across all studio pages

### Creating Studio Themes
You can now create completely different themes for studio pages by defining these variables:
- `--color-primary-studio`
- `--color-background-studio`
- `--color-text-studio-primary`
- `--color-border-studio`
- `--color-accent-studio`
- And all their variations (hover, secondary, etc.)

## Examples

### Before (hardcoded colors):
```jsx
<div className="bg-[#131618] text-white border-[#2A2D30]">
  <button className="bg-[#FDD811] text-black hover:bg-[#fde047]">
    Click me
  </button>
</div>
```

### After (theme variables):
```jsx
<div className="bg-background text-text-primary border-border">
  <button className="bg-primary text-primary-foreground hover:bg-primary-hover">
    Click me
  </button>
</div>
```

## Updating Existing Components

To update your components to use the theme system:

1. Replace hardcoded background colors:
   - `bg-[#131618]` → `bg-background`
   - `bg-[#1A1C21]` → `bg-background-card`
   - `bg-[#151B23]` → `bg-background-secondary`

2. Replace text colors:
   - `text-white` → `text-text-primary`
   - `text-gray-400` → `text-text-secondary`
   - `text-gray-600` → `text-text-muted`

3. Replace accent colors:
   - `bg-[#FDD811]` → `bg-primary`
   - `text-black` (on yellow) → `text-primary-foreground`

4. Replace border colors:
   - `border-[#2A2D30]` → `border-border`

## Adding New Themes

To add a new theme, edit `src/app/globals.css` and add a new theme class:

```css
.theme-custom {
  --color-primary: #your-color;
  --color-primary-hover: #your-hover-color;
  --color-primary-foreground: #text-on-primary;
  
  --color-background: #your-bg;
  --color-background-secondary: #your-bg-secondary;
  --color-background-card: #your-card-bg;
  --color-background-hover: #your-hover-bg;
  
  /* ... other colors ... */
}
```

Then add it to the themes array in `src/components/ui/ThemeSwitcher.tsx`.

## Testing Themes

1. Run your development server
2. Click the theme switcher button in the bottom-right corner
3. Select different themes to see how they look
4. The selected theme is saved to localStorage and persists across sessions

## Tips

- Always test your components with multiple themes to ensure good contrast
- Use semantic color names (primary, secondary, etc.) instead of color-specific names
- Consider accessibility - ensure sufficient contrast between text and background colors
- The light theme may need special attention as it inverts the typical dark/light relationships
