# Table Layout Implementation Notes

## Component Architecture

### State Management
```javascript
const [expandedRows, setExpandedRows] = useState({});
```
- Tracks which rows are expanded using a key-value object
- Key format: `{type}-{id}` (e.g., "maintenance-request-1")
- Allows multiple rows to be expanded simultaneously

### Data Consolidation
All four data types are rendered in a single table:
1. Maintenance Requests (from inquiries API)
2. Maintenance Bookings (from bookings API with service_id)
3. Purchases (from bookings API with product_id)
4. Reservations (from reservations API)

### Rendering Logic
The `renderTableRow()` function handles all data types:
- Accepts item and type parameters
- Extracts relevant fields based on type
- Returns both collapsed and expanded row JSX
- Handles type-specific actions (pay, cancel, etc.)

## CSS Grid System

### Grid Template Columns
```css
grid-template-columns: 60px 1fr 120px 130px 120px 100px 100px;
```

Breakdown:
- **60px**: ID column (fixed width)
- **1fr**: Service/Product Name (flexible, takes remaining space)
- **120px**: Status (fixed width)
- **130px**: Payment Status (fixed width)
- **120px**: Amount (fixed width)
- **100px**: Date (fixed width)
- **100px**: Actions (fixed width)

### Responsive Adjustments
Grid columns are redefined at each breakpoint to maintain readability:
- 1024px+: Full width columns
- 768px: Slightly reduced widths
- 480px: Compact widths
- 390px: Extra compact widths

## Mobile Optimization Strategy

### 390px Width Optimization
The component is specifically optimized for 390px width (iPhone 12 Pro):

1. **Column Sizing**
   - Reduced from 7 columns to fit within 390px
   - Total width: ~390px with minimal padding
   - Each column gets proportional space

2. **Font Sizes**
   - Body text: 10-11px
   - Labels: 10px
   - Badges: 8-9px
   - Maintains readability while fitting content

3. **Padding/Spacing**
   - Cell padding: 6px 3px (minimal but still clickable)
   - Gap between buttons: 8px
   - Details section: 10px padding

4. **Touch Targets**
   - Buttons: 50x50px minimum (including padding)
   - Meets WCAG accessibility standards
   - Easy to tap on mobile devices

### Responsive Breakpoints
```css
@media (max-width: 1024px) { /* Tablet */ }
@media (max-width: 768px) { /* Mobile */ }
@media (max-width: 480px) { /* Small Mobile */ }
@media (max-width: 390px) { /* Extra Small */ }
```

## Data Mapping Details

### Maintenance Requests
```javascript
serviceName: extractServiceName(item.product_interest)
status: getStatusText(item.status)
paymentStatus: 'N/A'
amount: item.message?.match(/₱([\d,]+)/)?.[1] || '0'
date: formatDate(item.created_at)
```

### Maintenance Bookings
```javascript
serviceName: item.service?.title || item.service?.name
status: item.status || 'Active'
paymentStatus: getPaymentStatusText(item.paymentStatus)
amount: item.total_amount || item.amount
date: formatDate(item.booking_date || item.created_at)
```

### Purchases
```javascript
serviceName: item.service?.name || item.product?.name
status: item.status || 'Active'
paymentStatus: getPaymentStatusText(item.paymentStatus)
amount: item.amount
date: formatDate(item.booking_date || item.created_at)
```

### Reservations
```javascript
serviceName: item.product?.title || item.service?.title
status: item.status (pending/approved/rejected/cancelled/paid)
paymentStatus: 'N/A'
amount: item.amount
date: formatDate(item.created_at)
```

## Action Button Logic

### View Details (Always Available)
```javascript
onClick={() => toggleRowExpanded(rowId)}
```
- Toggles expanded state for the row
- Shows/hides additional details

### Pay Now (Conditional)
Available for:
- Maintenance Requests: status === 'responded' OR 'closed'
- Maintenance Bookings: status === 'readyforpayment'
- Reservations: status === 'approved'

```javascript
onClick={() => {
  const paymentData = { /* ... */ };
  sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
  navigate('/billing');
}}
```

### Cancel (Conditional)
Available for:
- Reservations: status === 'pending'

```javascript
onClick={() => handleCancelReservation(item.id)}
```

## Expandable Row Details

### Structure
```
┌─ Table Row (collapsed) ─┐
│ [ID] [Name] [Status]... │
└────────────────────────┘
┌─ Table Row Details ────┐
│ [Details Content]      │
└────────────────────────┘
```

### Details Grid
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 15px;
```
- Responsive grid that adapts to screen size
- Minimum column width: 200px
- Automatically wraps on smaller screens

### Detail Items
Each detail item contains:
- Label (uppercase, smaller font)
- Value (regular font, word-break enabled)

### Photos Display
```css
grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
gap: 10px;
```
- Responsive photo grid
- Clickable to open image modal
- Hover effect for visual feedback

## Performance Considerations

### Rendering Optimization
1. **Memoization**: Consider using React.memo for renderTableRow if performance issues arise
2. **Lazy Loading**: Could implement virtual scrolling for large datasets
3. **Pagination**: Could add pagination to limit rendered rows

### CSS Optimization
1. **Sticky Header**: Uses `position: sticky` for better UX
2. **Minimal Repaints**: Uses CSS Grid instead of flexbox for better performance
3. **Hardware Acceleration**: Transform and opacity used for smooth animations

## Browser Compatibility

### Supported Features
- CSS Grid: All modern browsers
- Sticky positioning: All modern browsers
- Flexbox: All modern browsers
- CSS Variables: All modern browsers

### Fallbacks
- No fallbacks needed for modern browsers
- Component requires modern browser support

## Accessibility Features

### Semantic HTML
- Uses proper table structure (though CSS Grid based)
- Buttons have clear labels and icons
- Color not the only indicator of status (uses text + color)

### Keyboard Navigation
- All buttons are keyboard accessible
- Tab order follows logical flow
- Enter/Space to activate buttons

### Screen Readers
- Buttons have descriptive titles
- Status badges have text labels
- Icons paired with text labels

## Testing Checklist

### Functionality
- [ ] All data types display correctly
- [ ] Expandable rows work on all screen sizes
- [ ] Payment redirect works
- [ ] Reservation cancellation works
- [ ] Image modal opens from expanded rows
- [ ] Refresh button updates data

### Responsive Design
- [ ] Desktop (1024px+): All columns visible
- [ ] Tablet (768px): Columns adjusted
- [ ] Mobile (480px): Compact layout
- [ ] Small Mobile (390px): Extra compact
- [ ] Horizontal scrolling not needed

### Mobile Specific (390px)
- [ ] All buttons clickable
- [ ] Text readable without zooming
- [ ] Expanded rows display properly
- [ ] Photos grid responsive
- [ ] No horizontal overflow

### Cross-Browser
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari
- [ ] Chrome Mobile

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Touch targets adequate (50x50px)

## Known Limitations

1. **No Sorting**: Column headers are not clickable for sorting
2. **No Filtering**: No filter options available
3. **No Pagination**: All items displayed in single table
4. **No Search**: No search functionality
5. **No Bulk Actions**: Cannot select multiple rows

## Future Enhancement Ideas

1. **Column Sorting**: Click headers to sort by column
2. **Advanced Filtering**: Filter by status, date range, amount
3. **Pagination**: Show 10/25/50 items per page
4. **Search**: Search by service name, ID, or invoice number
5. **Export**: Export table to CSV or PDF
6. **Column Visibility**: Toggle column visibility
7. **Bulk Actions**: Select multiple rows for bulk operations
8. **Row Selection**: Checkbox for selecting rows
9. **Inline Editing**: Edit notes or other fields inline
10. **Advanced Details Modal**: Full-screen details view

## Debugging Tips

### Expanded Rows Not Working
Check `expandedRows` state in React DevTools:
```javascript
// Should show: { "maintenance-request-1": true, "purchase-2": true }
```

### Styling Issues
1. Check CSS Grid columns match between header and rows
2. Verify media query breakpoints are correct
3. Check for conflicting CSS from other stylesheets

### Data Not Displaying
1. Check API responses in Network tab
2. Verify data mapping in renderTableRow function
3. Check console for errors

### Mobile Issues
1. Use Chrome DevTools device emulation
2. Test at exact 390px width
3. Check for horizontal overflow
4. Verify touch targets are adequate

## Code Quality Notes

### Component Size
- Main component: ~600 lines
- CSS file: ~400 lines
- Well-organized and maintainable

### Code Organization
1. Imports at top
2. Component definition
3. State management
4. Fetch functions
5. Helper functions
6. Render logic
7. Return JSX

### Naming Conventions
- camelCase for variables and functions
- PascalCase for components
- Descriptive names for clarity
- Consistent naming patterns

### Comments
- Added where logic is complex
- Explains data mapping
- Documents responsive breakpoints
