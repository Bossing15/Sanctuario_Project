# Admin Modal Design Standards - Implementation Guide

## Overview

All admin modals in the Sanctuario project now follow a unified, modern design system using the Forest Green and Gold palette. This document serves as a reference for maintaining consistency across the application.

## Design Specifications

### Color Palette

| Element | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| Primary Green | Forest Green | #1B3022 | Primary buttons, accents |
| Secondary Green | Sage Green | #2A4D36 | Borders, hover states |
| Dark Green | Deep Forest | #0D1410 | Overlay background |
| Background | White | #FFFFFF | Modal container |
| Text Primary | Dark Grey | #1f2937 | Main text |
| Text Secondary | Medium Grey | #6b7280 | Secondary text |
| Text Tertiary | Light Grey | #9ca3af | Tertiary text |
| Border | Light Grey | #e5e7eb | Input borders |
| Danger | Red | #dc2626 | Delete/reject actions |
| Success | Green | #059669 | Success messages |
| Warning | Amber | #f59e0b | Warning messages |

### Typography

- **Font Family**: Inter, Poppins, sans-serif
- **Header (h2)**: 20px, weight 700, color #0D1A12
- **Section Title**: 13px, weight 700, uppercase, letter-spacing 0.5px
- **Body Text**: 14px, weight 500, color #1f2937
- **Small Text**: 12px, weight 400, color #9ca3af
- **Label**: 12px, weight 700, uppercase, color #9ca3af

### Spacing

- **Modal Padding**: 24px
- **Section Margin**: 24px bottom
- **Form Group Margin**: 16px bottom
- **Gap Between Items**: 12px
- **Border Radius**: 8px (inputs), 16px (modal)

### Shadows

- **Modal Shadow**: `0 20px 50px -12px rgba(13, 20, 16, 0.3)`
- **Button Hover**: `0 4px 12px rgba(27, 48, 34, 0.3)`
- **Overlay Blur**: 4px

## Modal Structure

### Standard Layout

```
┌─────────────────────────────────────────┐
│ ┌─ Sage Green Border (2px)              │
│ │                                       │
│ │  Title                            ×   │ ← Close Button
│ ├─────────────────────────────────────┤
│ │                                       │
│ │  SECTION TITLE                        │
│ │  Content goes here...                 │
│ │                                       │
│ │  ANOTHER SECTION                      │
│ │  More content...                      │
│ │                                       │
│ ├─────────────────────────────────────┤
│ │                                       │
│ │                    [Cancel] [Action]  │ ← Right-aligned buttons
│ │                                       │
│ └─────────────────────────────────────┘
```

### Component Hierarchy

1. **Modal Overlay** (`.modal-overlay`)
   - Fixed positioning, full screen
   - Deep forest green background with 60% opacity
   - 4px blur effect
   - Fade-in animation (300ms)

2. **Modal Container** (`.modern-modal`)
   - White background
   - 16px border radius
   - Soft depth shadow
   - 2px sage green top border
   - Scale-in animation (0.95→1.0, 300ms)

3. **Modal Header** (`.modern-modal-header`)
   - Flex layout with space-between
   - Light gradient background
   - Bottom border (1px #f0f0f0)
   - 24px padding

4. **Modal Content** (`.modern-modal-content`)
   - 24px padding
   - Scrollable if content exceeds max-height
   - Custom scrollbar styling

5. **Modal Footer** (`.modern-modal-footer`)
   - Flex layout, right-aligned
   - Light grey background
   - Top border (1px #f0f0f0)
   - 16px padding

## Button Styles

### Primary Button (`.modal-btn-primary`)
```css
Background: #1B3022 (Forest Green)
Text: White
Padding: 10px 20px
Border Radius: 8px
Font Weight: 600
Font Size: 14px
Hover: #2A4D36 (Sage Green)
Hover Effect: translateY(-2px), shadow
Transition: 200ms ease
```

### Secondary Button (`.modal-btn-secondary`)
```css
Background: Transparent
Border: 1px solid #d1d5db
Text: #6b7280
Padding: 10px 20px
Border Radius: 8px
Font Weight: 600
Font Size: 14px
Hover: #f3f4f6 background, #1f2937 text
Transition: 200ms ease
```

### Danger Button (`.modal-btn-danger`)
```css
Background: Transparent
Border: 1px solid #d1d5db
Text: #6b7280
Padding: 10px 20px
Border Radius: 8px
Font Weight: 600
Font Size: 14px
Hover: #fee2e2 background, #dc2626 text
Transition: 200ms ease
```

## Form Elements

### Input/Textarea (`.modal-form-group input/textarea`)
```css
Width: 100%
Padding: 10px 12px
Border: 1px solid #e5e7eb
Border Radius: 8px
Font Size: 14px
Font Family: Inherit
Background: White
Transition: 200ms ease

Focus:
  Outline: None
  Border Color: #1B3022
  Box Shadow: 0 0 0 3px rgba(27, 48, 34, 0.1)
```

## Message Styles

### Error Message (`.modal-error-message`)
```css
Background: #fee2e2
Border Left: 4px solid #dc2626
Color: #991b1b
Padding: 12px 16px
Border Radius: 6px
Font Size: 14px
Font Weight: 500
```

### Success Message (`.modal-success-message`)
```css
Background: #d1fae5
Border Left: 4px solid #059669
Color: #065f46
Padding: 12px 16px
Border Radius: 6px
Font Size: 14px
Font Weight: 500
```

### Warning Message (`.modal-warning-message`)
```css
Background: #fef3c7
Border Left: 4px solid #f59e0b
Color: #92400e
Padding: 12px 16px
Border Radius: 6px
Font Size: 14px
Font Weight: 500
```

## Animations

### Scale-In (Modal Entry)
```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
Duration: 300ms
Timing: cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Fade-In (Overlay)
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
Duration: 300ms
Timing: ease-out
```

### Close Button Rotation
```css
Hover: rotate(90deg)
Transition: 200ms ease
```

## Responsive Breakpoints

### Mobile (< 640px)
- Modal width: 95%
- Modal max-height: 95vh
- Border radius: 12px
- Header padding: 16px
- Content padding: 16px
- Footer: flex-direction column
- Buttons: width 100%
- Info grid: grid-template-columns 1fr

### Tablet (640px - 1024px)
- Modal width: 90%
- Modal max-height: 90vh
- Standard spacing maintained

### Desktop (> 1024px)
- Modal width: 600px (max)
- Modal max-height: 90vh
- Full spacing and animations

## Implementation Checklist

When creating or updating a modal, ensure:

- [ ] Import `../styles/modern-modal.css`
- [ ] Use `.modal-overlay` for background
- [ ] Use `.modern-modal` for container
- [ ] Use `.modern-modal-header` with title and close button
- [ ] Use `.modern-modal-content` for content area
- [ ] Use `.modal-section` for content sections
- [ ] Use `.modal-section-title` for section headers
- [ ] Use `.modal-form-group` for form inputs
- [ ] Use `.modal-info-grid` for info displays
- [ ] Use `.modal-btn-primary`, `.modal-btn-secondary`, `.modal-btn-danger` for buttons
- [ ] Use `.modal-error-message`, `.modal-success-message` for feedback
- [ ] Use `.modern-modal-footer` for action buttons
- [ ] Test on mobile, tablet, and desktop
- [ ] Verify keyboard navigation (Tab, Enter, Escape)
- [ ] Test with screen readers
- [ ] Verify animations are smooth
- [ ] Check color contrast for accessibility

## Common Patterns

### Confirmation Modal
```jsx
<div className="modal-overlay" onClick={onCancel}>
  <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
    <div className="modern-modal-header">
      <h2>Confirm Action</h2>
      <button className="modern-modal-close" onClick={onCancel}>×</button>
    </div>
    <div className="modern-modal-content">
      <div className="modal-section">
        <p>Are you sure you want to proceed?</p>
      </div>
    </div>
    <div className="modern-modal-footer">
      <button className="modal-btn-secondary" onClick={onCancel}>Cancel</button>
      <button className="modal-btn-primary" onClick={onConfirm}>Confirm</button>
    </div>
  </div>
</div>
```

### Form Modal
```jsx
<div className="modal-overlay" onClick={onClose}>
  <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
    <div className="modern-modal-header">
      <h2>Edit Information</h2>
      <button className="modern-modal-close" onClick={onClose}>×</button>
    </div>
    <div className="modern-modal-content">
      <div className="modal-section">
        <span className="modal-section-title">Personal Information</span>
        <div className="modal-form-group">
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>
    </div>
    <div className="modern-modal-footer">
      <button className="modal-btn-secondary" onClick={onClose}>Cancel</button>
      <button className="modal-btn-primary" onClick={handleSave}>Save</button>
    </div>
  </div>
</div>
```

### Info Display Modal
```jsx
<div className="modal-overlay" onClick={onClose}>
  <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
    <div className="modern-modal-header">
      <h2>Details</h2>
      <button className="modern-modal-close" onClick={onClose}>×</button>
    </div>
    <div className="modern-modal-content">
      <div className="modal-section">
        <span className="modal-section-title">Information</span>
        <div className="modal-info-grid">
          <div className="modal-info-item">
            <label>Field Name</label>
            <span>Value</span>
          </div>
        </div>
      </div>
    </div>
    <div className="modern-modal-footer">
      <button className="modal-btn-secondary" onClick={onClose}>Close</button>
    </div>
  </div>
</div>
```

## Troubleshooting

### Modal not appearing
- Check if `.modal-overlay` has `z-index: 1000`
- Verify `position: fixed` on overlay
- Ensure modal is not hidden by parent overflow

### Animations not smooth
- Check if CSS transitions are properly defined
- Verify GPU acceleration with `transform` and `opacity`
- Avoid animating `width` or `height`

### Buttons not aligned
- Use `.modern-modal-footer` with `justify-content: flex-end`
- Ensure buttons have `min-width` for consistency
- Use `gap` for spacing between buttons

### Text overflow
- Use `word-wrap: break-word` for long text
- Set `max-width` on text containers
- Use `text-overflow: ellipsis` for truncation

---

**Last Updated**: April 28, 2026
**Version**: 1.0
**Status**: Active - All modals implemented
