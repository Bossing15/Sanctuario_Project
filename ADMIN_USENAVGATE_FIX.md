# Admin App useNavigate() Error - FIXED

## Issue
Error in admin app: `useNavigate() may be used only in the context of a <Router> component`

This error occurred when the admin app tried to initialize, preventing the entire admin dashboard from loading.

## Root Cause
The `useTokenExpiration()` hook was being called in the **App component** (outside the Router), but the hook uses `useNavigate()` which requires being inside a Router context.

**Before (Incorrect):**
```
App Component (outside Router)
  ├─ useTokenExpiration() ❌ (uses useNavigate - needs Router context)
  └─ Router
      └─ Layout Component
```

## Solution
Moved the `useTokenExpiration()` hook call from the App component to the Layout component (which is inside the Router).

**After (Correct):**
```
App Component (outside Router)
  └─ Router
      └─ Layout Component
          ├─ useTokenExpiration() ✅ (inside Router context)
          └─ Routes
```

## Changes Made

### File: `resources/js/src/App.jsx`

**1. Removed from App component:**
```javascript
// REMOVED - This was causing the error
const App = () => {
  // ...
  useTokenExpiration();  // ❌ REMOVED
  // ...
}
```

**2. Added to Layout component:**
```javascript
const Layout = ({ children, collapsed, setCollapsed }) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  // Check token expiration (inside Router context)
  useTokenExpiration();  // ✅ ADDED - Now inside Router

  useEffect(() => {
    // ...
  }, []);
  // ...
}
```

## Result

✅ Admin app loads without errors  
✅ Token expiration checking works correctly  
✅ Auto-logout on token expiration works  
✅ useNavigate() hook works properly  

## How It Works

1. **App component** renders the Router
2. **Router** wraps the Layout component
3. **Layout component** (inside Router) calls `useTokenExpiration()`
4. `useTokenExpiration()` can now safely use `useNavigate()`
5. Token expiration is checked every 60 seconds
6. User is auto-logged out when token expires

## Testing

✅ Admin app loads without console errors  
✅ Dashboard displays correctly  
✅ Navigation works  
✅ Token expiration checking is active  

## Notes

- This is the same fix that was applied to the client app previously
- The hook now has proper Router context
- All token expiration features work as intended
- No breaking changes to existing functionality

---

**Status**: ✅ Fixed  
**Date**: April 29, 2026  
**Tested**: Yes
