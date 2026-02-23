# Notification System Setup Guide

This guide explains how to properly inject the completely decoupled Notification Plugin into your existing system.

## 1. Backend Setup

### Mount Routes
In your `app.js` or `server.js`, mount the routes. Ensure your standard Auth Middleware is applied.

```javascript
import notificationRoutes from './routes/notification.routes.js';

app.use('/api/v1/notifications', isAuthenticated, notificationRoutes);
```

### Injecting Hooks (No Controller Mutation)
The greatest strength of this module is that you never have to rewrite your existing logic. You simply apply the hooks to your existing routes.

Example (`task.routes.js`):
```javascript
import { notificationHooks } from '../middleware/notification.hooks.js';

// If this was your old route:
// router.patch('/:taskId/status', updateTaskStatus);

// Simply plug the hook into the middleware pipeline:
router.patch(
  '/:taskId/status', 
  notificationHooks.onStatusChange, // <-- New Hook
  updateTaskStatus
);
```
*(The hook leverages Express's `res.on('finish')` event, ensuring it only fires if your `updateTaskStatus` actually succeeds and sends a 200 response).*

---

## 2. Frontend Setup (Standalone UI)

All React components created operate entirely via simulated local state updates (`mockData.js`). 

### Notification Dropdown (Global Nav)
Import the created component and drop it directly into your global `Navbar` or `Header`.

```jsx
import NotificationDropdown from '../components/NotificationDropdown/NotificationDropdown';

function TopNavbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-slate-900 text-white">
      <div className="logo">My App</div>
      
      <div className="actions flex items-center gap-4">
         {/* Drop it securely here */}
         <NotificationDropdown />
         
         <div className="user-profile">Profile</div>
      </div>
    </nav>
  );
}
```

### Notification Full Page View
Import the page to your central Router:

```jsx
import NotificationPage from '../pages/Notifications/NotificationPage';

// Inside your Router Definitions
<Route path="/notifications" element={<NotificationPage />} />
```

### Converting to Real APIs Later
To connect these to the backend later:
1. In `NotificationDropdown.jsx` and `NotificationPage.jsx` replace the `setTimeout()` calls inside `useEffect` with `axios.get('/api/v1/notifications')`.
2. Swap the state mutations on `handleMarkAsRead()` to call `axios.patch('/api/v1/notifications/${id}/read')`.
