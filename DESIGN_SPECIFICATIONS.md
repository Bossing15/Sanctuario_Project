# Admin Interface Design Specifications

## Color Specifications

### Primary Palette
| Element | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| Sidebar | Deep Charcoal-Green | #0D1A12 | Background for sidebar navigation |
| Navbar | Deep Charcoal-Green | #0D1A12 | Background for top navigation bar |
| Main Background | Light Grey | #F5F7F5 | Main content area background |
| Cards | Pure White | #FFFFFF | Content cards and containers |
| Accent | Champagne Gold | #D4C4A8 | Icons, active states, highlights |

### Text Colors
| Element | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| Primary Text | Dark Grey | #1a202c | Main content text |
| Secondary Text | Medium Grey | #64748b | Descriptions, labels |
| Sidebar Text | Champagne Gold | #D4C4A8 | Sidebar icons and active text |
| Navbar Text | White | #FFFFFF | Navbar text and labels |

### Utility Colors
| Element | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| Border | Light Grey | #e2e8f0 | Card borders, dividers |
| Shadow | Black 8% | rgba(0,0,0,0.08) | Soft shadows |
| Hover Background | Very Light Grey | #f8fafc | Hover states |

## Typography

### Font Family
- Primary: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'`
- Fallback: `sans-serif`

### Font Sizes
- Navbar Title: 14px, Semi-bold
- Sidebar Label: 14px, Semi-bold
- Card Title: 16px, Semi-bold
- Body Text: 14px, Regular
- Small Text: 12px, Regular

## Spacing

### Sidebar
- Header Height: 70px
- Item Padding: 12px (0.75rem)
- Item Gap: 8px (0.5rem)
- Menu Padding: 24px (1.5rem)
- Footer Padding: 24px (1.5rem)

### Navbar
- Height: 70px
- Horizontal Padding: 32px (2rem)
- Item Gap: 24px (1.5rem)
- Icon Size: 20px

### Cards
- Padding: 16px
- Border Radius: 8px
- Gap Between Cards: 16px

## Shadows

### Card Shadow
```css
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
```

### Card Hover Shadow
```css
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
```

### Sidebar Shadow
```css
box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
```

### Navbar Shadow
```css
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
```

## Borders

### Card Border
- Width: 1px
- Color: #e2e8f0
- Radius: 8px

### Sidebar Border
- Width: 1px
- Color: rgba(212, 196, 168, 0.1)
- Position: Bottom of header

### Navbar Border
- Width: 1px
- Color: rgba(212, 196, 168, 0.1)
- Position: Bottom

## Transitions & Animations

### Standard Transition
```css
transition: all 0.2s ease;
```

### Sidebar Hover
```css
transition: all 0.2s ease;
- Background color change
- Text color to gold
- Icon brightness increase
```

### Card Hover
```css
transition: all 0.2s ease;
- Transform: translateY(-2px)
- Shadow elevation
```

### Page Load Animation
```css
@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
Duration: 0.5s
Easing: ease-out
Stagger: 0.1s between items
```

## Responsive Breakpoints

### Desktop (1024px+)
- Sidebar Width: 280px
- Navbar Left: 280px
- Main Margin-Left: 280px

### Tablet (768px - 1024px)
- Sidebar Width: 240px
- Navbar Left: 240px
- Main Margin-Left: 240px

### Mobile (< 768px)
- Sidebar: Hidden
- Navbar: Full width, 60px height
- Bottom Navigation: 70px height
- Main Margin-Top: 60px
- Main Margin-Bottom: 180px

### Small Mobile (< 480px)
- Navbar Height: 56px
- Main Margin-Top: 56px
- Bottom Navigation: 70px height

## Active State Styling

### Sidebar Active Item
- Background: rgba(212, 196, 168, 0.12)
- Text Color: #D4C4A8
- Border-Left: 3px solid #D4C4A8
- Padding-Left: calc(1rem - 3px)

### Sidebar Collapsed Active Item
- Background: rgba(212, 196, 168, 0.15)
- Border-Left: None
- Border-Radius: 8px

### Mobile Nav Active Item
- Background: rgba(212, 196, 168, 0.08)
- Text Color: #D4C4A8

## Icon Styling

### Sidebar Icons
- Size: 20px
- Color: #D4C4A8 (with brightness filter)
- Filter: brightness(1.2)
- Hover Filter: brightness(1.3)

### Navbar Icons
- Size: 20px
- Color: #D4C4A8
- Filter: brightness(1.5)

### Mobile Nav Icons
- Size: 24px
- Color: #D4C4A8
- Filter: brightness(1.1)
- Active Filter: brightness(1.5)

## Button Styling

### Primary Button
- Background: Gradient or solid color
- Padding: 12px 24px
- Border-Radius: 8px
- Font-Weight: 600
- Transition: 0.2s ease

### Secondary Button
- Background: Transparent
- Border: 1px solid
- Padding: 12px 24px
- Border-Radius: 8px
- Font-Weight: 600

## Form Elements

### Input Fields
- Height: 44px (minimum for mobile)
- Padding: 12px 16px
- Border: 1px solid #e2e8f0
- Border-Radius: 8px
- Font-Size: 14px
- Focus Border: #D4C4A8

### Select Dropdowns
- Height: 44px (minimum for mobile)
- Padding: 12px 16px
- Border: 1px solid #e2e8f0
- Border-Radius: 8px
- Font-Size: 14px

## Accessibility

### Contrast Ratios
- Text on White: 4.5:1 (WCAG AA)
- Text on Dark: 4.5:1 (WCAG AA)
- Icons on Dark: 3:1 (WCAG AA)

### Focus States
- Outline: 2px solid #D4C4A8
- Outline-Offset: 2px

### Touch Targets
- Minimum Size: 44px x 44px
- Spacing: 8px minimum between targets

## Performance Considerations

### Animations
- Use `transform` and `opacity` for GPU acceleration
- Avoid animating `width`, `height`, `left`, `top`
- Use `will-change` sparingly

### Shadows
- Minimal shadows for better performance
- Use `box-shadow` instead of multiple elements

### Transitions
- Keep duration under 300ms
- Use `ease-out` for entrance animations
- Use `ease-in` for exit animations

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)

## Implementation Checklist

- [ ] All colors match specifications
- [ ] Spacing follows guidelines
- [ ] Shadows are applied correctly
- [ ] Transitions are smooth
- [ ] Animations are staggered
- [ ] Responsive design works
- [ ] Accessibility standards met
- [ ] Performance optimized
- [ ] Cross-browser tested
- [ ] Mobile tested
