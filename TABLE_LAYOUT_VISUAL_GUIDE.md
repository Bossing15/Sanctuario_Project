# MyMaintenanceRequestsPage - Table Layout Visual Guide

## Desktop View (1024px+)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ My Requests                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ID  │ Service/Product Name      │ Status      │ Payment Status  │ Amount      │ Date        │ Actions          │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ #1  │ Grave Maintenance         │ ✓ Completed │ ✓ Paid          │ ₱5,000.00   │ Jan 15, 24  │ [👁] [💳] [✕]  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ #2  │ Columbarium Service       │ ⏳ Pending  │ ⏳ Pending      │ ₱3,500.00   │ Jan 10, 24  │ [👁] [💳]      │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ #3  │ Lawn Lot Reservation      │ ⏳ Pending  │ N/A             │ ₱10,000.00  │ Jan 05, 24  │ [👁] [✕]       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Expanded Row Detail View

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ #1  │ Grave Maintenance         │ ✓ Completed │ ✓ Paid          │ ₱5,000.00   │ Jan 15, 24  │ [👁] [💳] [✕]  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│     │ Invoice: SANC-001-12345                                                                                   │
│     │ Contact: +63 912 345 6789                                                                                 │
│     │ Details: Grave maintenance including cleaning and repairs                                                 │
│     │ Photos: [🖼] [🖼] [🖼]                                                                                    │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Tablet View (768px - 1023px)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ID  │ Service/Product Name  │ Status    │ Payment   │ Amount    │ Date      │ Actions  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ #1  │ Grave Maintenance     │ Completed │ Paid      │ ₱5,000    │ Jan 15    │ [👁][💳]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ #2  │ Columbarium Service   │ Pending   │ Pending   │ ₱3,500    │ Jan 10    │ [👁][💳]│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

## Mobile View (480px - 767px)

```
┌──────────────────────────────────────────────────────────────────┐
│ ID  │ Service Name      │ Status  │ Payment │ Amount  │ Date │ A │
├──────────────────────────────────────────────────────────────────┤
│ #1  │ Grave Maint...    │ ✓ Done  │ ✓ Paid  │ ₱5,000  │ 1/15 │👁│
├──────────────────────────────────────────────────────────────────┤
│     │ Invoice: SANC-001-12345                                    │
│     │ Contact: +63 912 345 6789                                  │
│     │ Details: Grave maintenance including cleaning and repairs  │
└──────────────────────────────────────────────────────────────────┘
```

## Small Mobile View (390px)

```
┌────────────────────────────────────────────────────────┐
│ ID │ Service    │ Status │ Pmt │ Amount │ Date │ Act  │
├────────────────────────────────────────────────────────┤
│ #1 │ Grave M... │ Done   │ Pd  │ ₱5K   │ 1/15 │ 👁   │
├────────────────────────────────────────────────────────┤
│    │ Invoice: SANC-001                                 │
│    │ Contact: +63 912 345 6789                         │
│    │ Details: Grave maintenance...                     │
└────────────────────────────────────────────────────────┘
```

## Status Badge Colors

### Status Badges
- **Pending Review** (Yellow): `#fff3cd` background, `#856404` text
- **In Progress** (Blue): `#cfe2ff` background, `#084298` text
- **Completed** (Green): `#d1e7dd` background, `#0f5132` text

### Payment Status Badges
- **Paid** (Green): `#d1e7dd` background, `#0f5132` text
- **Pending Payment** (Yellow): `#fff3cd` background, `#856404` text
- **Unpaid** (Yellow): `#fff3cd` background, `#856404` text
- **N/A** (Gray): Default styling

## Action Buttons

### Button Types and Icons

1. **View Details** (Eye Icon 👁)
   - Color: Blue (#3b82f6)
   - Always available
   - Expands row to show additional information

2. **Pay Now** (File Icon 💳)
   - Color: Green (#059669)
   - Available when status is "Ready for Payment" or "Approved"
   - Redirects to billing page

3. **Cancel** (X Icon ✕)
   - Color: Red (#dc2626)
   - Available for pending reservations only
   - Shows confirmation dialog before canceling

## Responsive Behavior

### Column Width Adjustments

| Breakpoint | ID | Service Name | Status | Payment | Amount | Date | Actions |
|------------|----|----|--------|---------|--------|------|---------|
| 1024px+ | 60px | 1fr | 120px | 130px | 120px | 100px | 100px |
| 768px | 50px | 1fr | 100px | 110px | 100px | 80px | 80px |
| 480px | 45px | 1fr | 90px | 90px | 80px | 70px | 70px |
| 390px | 40px | 1fr | 70px | 70px | 65px | 60px | 60px |

### Font Size Adjustments

| Breakpoint | Cell Text | Badge Text | Label Text |
|------------|-----------|-----------|-----------|
| 1024px+ | 14px | 12px | 12px |
| 768px | 13px | 11px | 11px |
| 480px | 12px | 10px | 10px |
| 390px | 10-11px | 8-9px | 10px |

### Padding Adjustments

| Breakpoint | Cell Padding | Badge Padding | Button Padding |
|------------|-------------|--------------|----------------|
| 1024px+ | 16px 12px | 6px 12px | 8px 10px |
| 768px | 12px 8px | 4px 8px | 6px 8px |
| 480px | 10px 6px | 4px 6px | 5px 6px |
| 390px | 6px 3px | 2px 4px | 3px 4px |

## Expandable Row Details Layout

### Desktop/Tablet
```
┌─────────────────────────────────────────────────────────────────┐
│ Invoice: SANC-001 │ Contact: +63 912 345 6789 │ Plan: Monthly  │
│ Details: Grave maintenance including cleaning and repairs       │
│ Photos: [🖼] [🖼] [🖼]                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile
```
┌──────────────────────────────────────────┐
│ Invoice: SANC-001                        │
│ Contact: +63 912 345 6789                │
│ Plan: Monthly                            │
│ Details: Grave maintenance...            │
│ Photos: [🖼] [🖼] [🖼]                   │
└──────────────────────────────────────────┘
```

## Data Display Examples

### Maintenance Request Row
```
#1 | Grave Maintenance | Pending Review | N/A | ₱5,000.00 | Jan 15, 24 | [👁]
```

### Maintenance Booking Row
```
#2 | Columbarium Service | Active | Pending Payment | ₱3,500.00 | Jan 10, 24 | [👁][💳]
```

### Purchase Row
```
#3 | Lawn Lot Package | Active | Paid | ₱10,000.00 | Jan 05, 24 | [👁]
```

### Reservation Row
```
#4 | Family Estate | Pending | N/A | ₱15,000.00 | Dec 28, 23 | [👁][✕]
```

## Interaction Flow

### Viewing Details
1. User clicks View Details button (👁)
2. Row expands to show additional information
3. User can view invoice, contact, notes, photos
4. User clicks View Details again to collapse

### Making Payment
1. User clicks Pay Now button (💳)
2. Payment data stored in session storage
3. User redirected to billing page
4. After payment, user returns to requests page

### Canceling Reservation
1. User clicks Cancel button (✕)
2. Confirmation dialog appears
3. If confirmed, reservation is canceled
4. Success message displayed
5. Page refreshes to show updated status

## Empty State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                          📋                                     │
│                                                                 │
│                    No Requests Yet                              │
│                                                                 │
│        You haven't submitted any requests or purchases yet.     │
│                                                                 │
│              [Browse Products & Services]                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Loading State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        ⟳ (spinning)                             │
│                                                                 │
│                  Loading your requests...                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
