# Notification Dropdown Component - Visual Reference & Structure

---

## Component Hierarchy

```
NotificationModal (Portal)
├── notification-dropdown (Container)
│   ├── notification-header
│   │   ├── notification-title ("Notifications")
│   │   └── notification-tabs (Segmented Controller)
│   │       ├── notification-tab (All)
│   │       └── notification-tab (Unread)
│   ├── notification-list (Scrollable)
│   │   └── notification-item (Repeating)
│   │       ├── notification-unread-bar (Conditional)
│   │       ├── notification-icon-circle
│   │       │   └── SVG Icon
│   │       └── notification-content
│   │           ├── notification-header-row
│   │           │   └── notification-item-title
│   │           ├── notification-item-message
│   │           └── notification-item-time
│   └── notification-footer
│       └── notification-footer-button
```

---

## Visual Layout

### Desktop View (420px width)

```
┌─────────────────────────────────────────┐
│ Notifications                           │  ← Dark Header (#0D1A12)
│ ┌─────────────────────────────────────┐ │
│ │ All (6)        Unread (2)           │ │  ← Segmented Controller
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ ▌ 🟢 New Payment Received              │  ← Unread Indicator Bar
│   Maria Dela Cruz completed payment... │
│   5 minutes ago                         │
├─────────────────────────────────────────┤
│ ▌ 🔵 New Client Registration           │
│   Juan Santos registered as a new...   │
│   1 hour ago                            │
├─────────────────────────────────────────┤
│   🟣 Service Request                    │  ← No indicator (read)
│   Pedro Garcia requested Grave...      │
│   2 hours ago                           │
├─────────────────────────────────────────┤
│   🟠 Payment Pending                    │
│   Ana Martinez has a pending payment... │
│   3 hours ago                           │
├─────────────────────────────────────────┤
│   🟢 System Update                      │
│   Database backup completed...          │
│   5 hours ago                           │
├─────────────────────────────────────────┤
│   🔵 Client Update                      │
│   Rosa Cruz updated their profile...    │
│   1 day ago                             │
├─────────────────────────────────────────┤
│        Mark all as read                 │  ← Footer Button
└─────────────────────────────────────────┘
```

---

## Color Scheme

### Icon Circles

| Type | Color | Hex | Icon | Background |
|------|-------|-----|------|------------|
| Payment | Forest Green | #1b5e20 | 💳 Credit Card | #e8f5e9 |
| Client | Blue | #1e40af | 👤+ User+ | #eff6ff |
| Service | Purple | #6b21a8 | 🔧 Wrench | #faf5ff |
| Pending | Orange | #ea580c | ⚠️ Warning | #fff7ed |
| System | Forest Green | #1b5e20 | ✓ Check | #e8f5e9 |

### Text Colors

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Header Background | Dark Charcoal-Green | #0D1A12 | Header section |
| Header Text | White | #FFFFFF | "Notifications" title |
| Active Tab | Gold | #D4C4A8 | Active tab text |
| Inactive Tab | Muted Gold | rgba(212,196,168,0.6) | Inactive tab text |
| Title | Dark Grey | #1a202c | Notification titles |
| Message | Medium Grey | #555555 | Notification messages |
| Timestamp | Medium Grey | #555555 | Time text |
| Unread Bar | Forest Green | #1b5e20 | Left edge indicator |
| Hover Background | Light Sage | #f8faf8 | Hover state |

---

## Spacing & Sizing

### Container
- Width: 420px (desktop), responsive (mobile)
- Max Height: 600px
- Border Radius: 15px
- Top: 70px (below navbar)
- Right: 16px

### Header
- Padding: 20px
- Border Bottom: 1px solid rgba(212,196,168,0.1)

### Segmented Controller
- Padding: 4px
- Gap: 8px
- Border Radius: 20px
- Tab Padding: 8px 16px
- Tab Border Radius: 16px

### Notification Item
- Padding: 16px 20px
- Gap: 16px
- Border Bottom: 1px solid #e5e7eb
- Icon Circle: 48px (desktop), 44px (tablet), 40px (mobile)

### Icon Circle
- Width/Height: 48px (desktop), 44px (tablet), 40px (mobile)
- Border: 2px solid (color-specific)
- Border Radius: 50%

### Text
- Title: 14px, font-weight: 700
- Message: 13px, font-weight: 400
- Timestamp: 12px, font-weight: 500
- Line Clamp: 2 lines on message

### Footer
- Padding: 12px 20px
- Button Padding: 10px 16px
- Border Top: 1px solid #e5e7eb

---

## Animation Specifications

### Dropdown Entry (slideDownFade)
```css
Duration: 0.3s
Easing: cubic-bezier(0.4, 0, 0.2, 1)
From: opacity 0, translateY(-10px)
To: opacity 1, translateY(0)
```

### Hover State
```css
Background: transition 0.2s cubic-bezier(0.4, 0, 0.2, 1)
Transform: translateY(-2px)
Icon Scale: 1.05x
Shadow: 0 20px 40px rgba(0,0,0,0.12)
```

### Tab Transition
```css
Duration: 0.2s
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Properties: color, background-color
```

---

## Responsive Breakpoints

### Desktop (1024px+)
- Dropdown Width: 420px
- Icon Size: 48px
- Padding: 16px
- Font Sizes: 14px (title), 13px (message), 12px (time)

### Tablet (768px - 1023px)
- Dropdown Width: calc(100vw - 32px), max 420px
- Icon Size: 44px
- Padding: 14px
- Font Sizes: 13px (title), 12px (message), 11px (time)

### Mobile (480px - 767px)
- Dropdown Width: calc(100vw - 32px)
- Icon Size: 40px
- Padding: 12px
- Font Sizes: 12px (title), 11px (message), 10px (time)

### Small Mobile (<480px)
- Dropdown Width: calc(100vw - 16px)
- Icon Size: 40px
- Padding: 12px
- Font Sizes: 12px (title), 11px (message), 10px (time)

---

## State Management

### Notification Object Structure
```javascript
{
  id: number,
  type: 'payment' | 'client' | 'service' | 'pending' | 'system',
  title: string,
  message: string,
  time: string,
  read: boolean,
  icon: string,
  color: 'forest-green' | 'blue' | 'purple' | 'orange'
}
```

### Component State
```javascript
activeTab: 'all' | 'unread'
readNotifications: Set<number>
```

### Tab Filtering Logic
```javascript
if (activeTab === 'unread') {
  return notifications.filter(n => !n.read && !readNotifications.has(n.id))
}
return notifications
```

---

## Accessibility Features

### Focus States
- Outline: 2px solid #D4C4A8
- Outline Offset: 2px
- Applied to: tabs, buttons, items

### Keyboard Navigation
- Tab: Navigate through elements
- Enter: Activate buttons
- Escape: Close dropdown (future enhancement)

### Screen Reader
- Semantic HTML structure
- Descriptive button labels
- Proper heading hierarchy
- ARIA labels where needed

### Color Contrast
- Title on Header: #FFFFFF on #0D1A12 (21:1)
- Message on White: #555555 on #FFFFFF (7.5:1)
- Timestamp on White: #555555 on #FFFFFF (7.5:1)
- All meet WCAG AA standards

---

## Icon Specifications

### SVG Properties
- Viewbox: 0 0 24 24
- Stroke Width: 1.5px
- Stroke Linecap: round
- Stroke Linejoin: round
- Fill: none

### Icon Types

#### Payment (Credit Card)
```svg
<path d="M3 10h18M7 15h10m4 0a1 1 0 11-2 0 1 1 0 012 0zM7 6h.01M7 3h5c.582 0 1.063.213 1.367.573m-6.367 5.428V9m0 0a1 1 0 10-2 0m2 0a1 1 0 11-2 0m0-5a1 1 0 10-2 0 1 1 0 012 0z" />
```

#### Client (User+)
```svg
<path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
```

#### Service (Wrench)
```svg
<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
```

#### Pending (Warning)
```svg
<path d="M12 9v2m0 4v2m0-10a9 9 0 110 18 9 9 0 010-18z" />
```

#### System (Check)
```svg
<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
```

---

## CSS Classes Reference

### Container Classes
- `.notification-dropdown` - Main container
- `.notification-header` - Header section
- `.notification-list` - Scrollable list
- `.notification-footer` - Footer section

### Tab Classes
- `.notification-tabs` - Tab container
- `.notification-tab` - Individual tab
- `.notification-tab.active` - Active tab state

### Item Classes
- `.notification-item` - Notification row
- `.notification-item.read` - Read state
- `.notification-item.unread` - Unread state
- `.notification-unread-bar` - Unread indicator
- `.notification-icon-circle` - Icon container
- `.notification-icon-circle.forest-green` - Green icon
- `.notification-icon-circle.blue` - Blue icon
- `.notification-icon-circle.purple` - Purple icon
- `.notification-icon-circle.orange` - Orange icon

### Content Classes
- `.notification-content` - Content wrapper
- `.notification-header-row` - Title row
- `.notification-item-title` - Title text
- `.notification-item-message` - Message text
- `.notification-item-time` - Timestamp text

### Empty State Classes
- `.notification-empty` - Empty state container

### Button Classes
- `.notification-footer-button` - Footer button

---

## Integration Points

### Navbar.jsx
```jsx
<button 
  onClick={() => setShowNotifications(!showNotifications)}
  className="notification-bell"
>
  {/* Bell Icon */}
</button>

<NotificationModal 
  isOpen={showNotifications} 
  onClose={() => setShowNotifications(false)} 
/>
```

### Props
- `isOpen: boolean` - Dropdown visibility
- `onClose: function` - Close handler

---

## Performance Considerations

### Rendering
- Portal rendering prevents layout thrashing
- Efficient state management with Set
- Memoization opportunities for future optimization

### Animations
- CSS transforms for 60fps performance
- GPU acceleration via `will-change`
- No JavaScript animation loops

### Scrolling
- Custom scrollbar styling
- Smooth scrolling behavior
- Efficient overflow handling

---

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | Latest | ✅ Full |
| Edge | Latest | ✅ Full |
| Firefox | Latest | ✅ Full |
| Safari | Latest | ✅ Full |
| iOS Safari | Latest | ✅ Full |
| Chrome Mobile | Latest | ✅ Full |

---

## Future Enhancement Opportunities

1. **Real-time Updates**
   - WebSocket integration for live notifications
   - Auto-refresh mechanism

2. **Notification Actions**
   - Quick action buttons on notifications
   - Swipe-to-dismiss on mobile

3. **Notification Persistence**
   - Backend storage for notifications
   - Notification history

4. **Advanced Filtering**
   - Filter by notification type
   - Date range filtering

5. **Notification Preferences**
   - User-configurable notification types
   - Notification frequency settings

6. **Sound & Desktop Notifications**
   - Audio alerts for new notifications
   - Desktop notification API integration

---

## Troubleshooting Guide

### Issue: Dropdown Not Appearing
**Solution**: Check z-index (should be 9999), verify NotificationModal is imported

### Issue: Icons Not Rendering
**Solution**: Check SVG paths, verify stroke-width is 1.5, check color classes

### Issue: Animations Not Smooth
**Solution**: Check browser hardware acceleration, verify CSS transitions, test in different browser

### Issue: Responsive Issues
**Solution**: Check media query breakpoints, verify viewport meta tag, test with dev tools

### Issue: Scrollbar Not Visible
**Solution**: Check overflow settings, verify scrollbar CSS, test with more notifications

---

## Quick Reference

### Key Files
- Component: `resources/js/src/Components/NotificationModal.jsx`
- Styling: `resources/js/src/Components/NotificationModal.css`
- Integration: `resources/js/src/Components/Navbar.jsx`

### Key Colors
- Dark Header: #0D1A12
- Gold Accent: #D4C4A8
- Forest Green: #1b5e20
- Blue: #1e40af
- Purple: #6b21a8
- Orange: #ea580c

### Key Sizes
- Container Width: 420px
- Icon Size: 48px (desktop), 44px (tablet), 40px (mobile)
- Border Radius: 15px
- Padding: 16px (desktop), 14px (tablet), 12px (mobile)

### Key Animations
- Duration: 0.3s
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Hover Lift: 2px

---

**Last Updated**: April 28, 2026  
**Status**: Complete and Verified
