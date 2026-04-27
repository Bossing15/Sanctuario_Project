# Notification Dropdown - Quick Testing Guide

## Quick Start

### 1. Start the Development Server
```bash
cd Sanctuario_Project/client-app
npm start
```
Server will run at: http://localhost:3002

### 2. Access Admin Dashboard
- Navigate to http://localhost:3002/login
- Login with admin credentials
- You'll see the notification bell icon in the top-right navbar

---

## Visual Testing Checklist

### Header Section
- [ ] Dark header background (#0D1A12) matches navbar
- [ ] "Notifications" title is white and bold
- [ ] Segmented controller tabs are visible
- [ ] Active tab text is gold (#D4C4A8)
- [ ] Inactive tab text is muted gold

### Icon Circles
- [ ] Payment icon: Forest Green circle with credit card icon
- [ ] Client icon: Blue circle with user+ icon
- [ ] Service icon: Purple circle with wrench icon
- [ ] Pending icon: Orange circle with warning triangle icon
- [ ] All icons are outlined (not filled)
- [ ] Icon circles have 2px borders

### Notification Items
- [ ] Unread notifications have thin green bar on left edge
- [ ] Read notifications don't have the green bar
- [ ] Notification titles are bold
- [ ] Message text is dark grey (#555555)
- [ ] Timestamps are dark grey (#555555)
- [ ] Generous spacing between items

### Hover Effects
- [ ] Entire row gets light sage-grey background
- [ ] Row lifts up 2px on hover
- [ ] Icon circle scales slightly (1.05x)
- [ ] Smooth transition (no jarring changes)
- [ ] Shadow appears on hover

### Dropdown Container
- [ ] 15px rounded corners
- [ ] Soft drop shadow
- [ ] Smooth slideDownFade animation on open
- [ ] Closes when clicking outside
- [ ] Scrollbar visible when content overflows

---

## Functional Testing Checklist

### Tab Switching
- [ ] Click "All" tab - shows all notifications
- [ ] Click "Unread" tab - shows only unread notifications
- [ ] Tab count updates correctly
- [ ] Smooth transition between tabs

### Read/Unread State
- [ ] Click a notification - green bar disappears
- [ ] Notification becomes slightly faded
- [ ] Unread count decreases
- [ ] State persists when switching tabs

### Footer Button
- [ ] "Mark all as read" button is visible
- [ ] Click button - all green bars disappear
- [ ] All notifications become faded
- [ ] Unread count becomes 0

### Close Behavior
- [ ] Click outside dropdown - closes
- [ ] Click bell icon again - opens
- [ ] Smooth open/close animations

---

## Responsive Testing Checklist

### Desktop (1024px+)
- [ ] Dropdown width: 420px
- [ ] Icon circles: 48px
- [ ] Full text visible
- [ ] All spacing generous

### Tablet (768px - 1023px)
- [ ] Dropdown width: responsive (100vw - 32px, max 420px)
- [ ] Icon circles: 44px
- [ ] Text slightly smaller
- [ ] Padding reduced

### Mobile (480px - 767px)
- [ ] Dropdown width: responsive (100vw - 32px)
- [ ] Icon circles: 40px
- [ ] Compact layout
- [ ] Touch-friendly spacing

### Small Mobile (<480px)
- [ ] Dropdown width: responsive (100vw - 16px)
- [ ] Icon circles: 40px
- [ ] Minimal padding
- [ ] Scrollable content

---

## Animation Testing Checklist

### Open Animation
- [ ] Dropdown slides down smoothly
- [ ] Opacity fades in
- [ ] Duration: ~0.3s
- [ ] Easing: smooth cubic-bezier

### Hover Animation
- [ ] Background color changes smoothly
- [ ] Row lifts up 2px
- [ ] Icon scales up slightly
- [ ] All transitions smooth (no jumps)

### Close Animation
- [ ] Dropdown slides up smoothly
- [ ] Opacity fades out
- [ ] Smooth exit

---

## Accessibility Testing Checklist

### Keyboard Navigation
- [ ] Tab key navigates through elements
- [ ] Focus states visible (gold outline)
- [ ] Enter key activates buttons
- [ ] Escape key closes dropdown

### Screen Reader
- [ ] Notification titles are readable
- [ ] Icon purposes are clear
- [ ] Tab labels are descriptive
- [ ] Button labels are clear

### Color Contrast
- [ ] Title text on dark header: sufficient contrast
- [ ] Message text on white: sufficient contrast
- [ ] Timestamps on white: sufficient contrast
- [ ] All text meets WCAG AA standards

---

## Browser Compatibility Testing

### Chrome/Edge (Latest)
- [ ] All features work
- [ ] Animations smooth
- [ ] Responsive design works
- [ ] No console errors

### Firefox (Latest)
- [ ] All features work
- [ ] Animations smooth
- [ ] Responsive design works
- [ ] No console errors

### Safari (Latest)
- [ ] All features work
- [ ] Animations smooth
- [ ] Responsive design works
- [ ] No console errors

### Mobile Browsers
- [ ] iOS Safari: works correctly
- [ ] Chrome Mobile: works correctly
- [ ] Touch interactions smooth
- [ ] Responsive layout correct

---

## Performance Testing

### Animation Performance
- [ ] Animations run at 60fps
- [ ] No stuttering or jank
- [ ] Smooth scrolling
- [ ] No lag on hover

### Load Performance
- [ ] Dropdown opens instantly
- [ ] No delay on interactions
- [ ] Scrolling is smooth
- [ ] No memory leaks

---

## Sample Test Data

The component includes sample notifications:

1. **Payment Notification** (Unread)
   - Type: Payment
   - Icon: Credit Card (Forest Green)
   - Title: "New Payment Received"
   - Message: "Maria Dela Cruz completed payment for Grave Maintenance service"
   - Time: "5 minutes ago"

2. **Client Notification** (Unread)
   - Type: Client
   - Icon: User+ (Blue)
   - Title: "New Client Registration"
   - Message: "Juan Santos registered as a new client"
   - Time: "1 hour ago"

3. **Service Notification** (Read)
   - Type: Service
   - Icon: Wrench (Purple)
   - Title: "Service Request"
   - Message: "Pedro Garcia requested Grave Restoration service"
   - Time: "2 hours ago"

4. **Pending Notification** (Read)
   - Type: Pending
   - Icon: Warning Triangle (Orange)
   - Title: "Payment Pending"
   - Message: "Ana Martinez has a pending payment for Monthly Plan"
   - Time: "3 hours ago"

5. **System Notification** (Read)
   - Type: System
   - Icon: Check Circle (Forest Green)
   - Title: "System Update"
   - Message: "Database backup completed successfully"
   - Time: "5 hours ago"

6. **Client Update Notification** (Read)
   - Type: Client
   - Icon: User+ (Blue)
   - Title: "Client Update"
   - Message: "Rosa Cruz updated their profile information"
   - Time: "1 day ago"

---

## Troubleshooting

### Dropdown Not Appearing
- [ ] Check browser console for errors
- [ ] Verify notification bell icon is visible
- [ ] Check z-index (should be 9999)
- [ ] Verify NotificationModal.jsx is imported in Navbar.jsx

### Icons Not Rendering
- [ ] Check SVG paths in renderIcon() function
- [ ] Verify stroke-width is 1.5
- [ ] Check color classes are applied
- [ ] Verify CSS variables are defined

### Animations Not Smooth
- [ ] Check browser hardware acceleration
- [ ] Verify CSS transitions are defined
- [ ] Check for conflicting CSS
- [ ] Test in different browser

### Responsive Issues
- [ ] Check media query breakpoints
- [ ] Verify viewport meta tag
- [ ] Test with browser dev tools
- [ ] Check for CSS conflicts

---

## Notes for Developers

### Adding New Notification Types
1. Add new case in `renderIcon()` function
2. Add new color variant in CSS
3. Add sample notification to `notifications` array
4. Update color palette if needed

### Customizing Colors
1. Update CSS variables in `:root`
2. Update color palette in NotificationModal.css
3. Update icon circle color classes
4. Test contrast ratios

### Modifying Animations
1. Update `@keyframes` in CSS
2. Adjust duration and easing
3. Test performance
4. Verify smooth transitions

---

## Support

For issues or questions:
1. Check browser console for errors
2. Review NOTIFICATION_REDESIGN_VERIFICATION.md
3. Check DESIGN_SPECIFICATIONS.md for design details
4. Review NotificationModal.jsx and NotificationModal.css

---

**Last Updated**: April 28, 2026  
**Status**: Ready for Testing
