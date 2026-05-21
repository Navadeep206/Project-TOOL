# Approval Workflow System Integration Guide

This guide explains how to integrate the newly generated "Approval Workflow Plug-In" into your existing application without mutating existing logic.

## 1. Backend Setup

### Mount Routes
In your `app.js` or `server.js`, import the Approval routes and mount them.

```javascript
import approvalRoutes from './routes/approval.routes.js';

// Apply your global authentication middleware to protect it.
// e.g., app.use('/api/v1/approvals', authenticateJWT, approvalRoutes);
app.use('/api/v1/approvals', approvalRoutes);
```

### Understanding the Architecture
- **State Machine**: The `approval.service.js` strictly governs transitions (e.g., cannot transition from `approved` to `rejected`).
- **RBAC Matrix**: The `approval.middleware.js` enforces that:
  - `deadline_extension` requests route to `MANAGER` level users.
  - Destructive requests (`delete_project`, `remove_user`, `role_change`) strictly demand `ADMIN` clearance.

### Reacting to Approvals (Future Step)
Currently, this plugin manages the workflow **state**. To actually execute the destruction of a project or user removal when an Admin clicks 'Approve', you should wire a callback or an event emitter inside `approval.service.js` under `processTransition()`:

```javascript
// Example modification inside approval.service.js:
if (newStatus === 'approved') {
  if (request.requestType === 'delete_project') {
     await Project.findByIdAndDelete(request.targetEntityId);
  }
  request.currentStatus = 'executed'; // Move from approved to executed automatically
}
```

---

## 2. Frontend Setup (Standalone React Component)

The constructed UI (`ApprovalDashboard.jsx`) is disconnected from the network and utilizes `mockData.js`, so you can immediately preview it.

### Usage
Import and render in your Router setup or inside an Admin control panel.

```jsx
import ApprovalDashboard from '../pages/ApprovalDashboard/ApprovalDashboard';

function AdminPanel() {
  return (
    <div>
      {/* Drop in the full dashboard */}
      <ApprovalDashboard />
    </div>
  );
}
```

### Hooking up to the API Later
When transitioning away from mock data:
1. Replace `requests` state initialization in `ApprovalDashboard.jsx` with an empty array.
2. Add a `useEffect` that calls `axios.get('/api/v1/approvals/pending')` and `axios.get('/api/v1/approvals/history')` depending on the active tab.
3. In `handleConfirmAction()`, swap the local state mutation with an actual API call to `PATCH /api/v1/approvals/:id/decide` with `{ decision: 'approve', comments }`.
