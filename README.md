# Complete Frontend ↔ Backend Integration Guide

This guide provides step-by-step instructions on how to transition the newly created standalone Frontend modules (Activity History, Approval Workflow, Notification System, and Temporary Access) away from their static `mockData.js` files and wire them up to your live Backend APIs.

---

## Pre-requisites
1. Your Express backend should have these routes mounted in `app.js` or `server.js`:
   - `app.use('/api/v1/activities', activitiesRoutes);`
   - `app.use('/api/v1/approvals', approvalRoutes);`
   - `app.use('/api/v1/notifications', notificationRoutes);`
   - `app.use('/api/v1/access', accessRoutes);`
2. You must have `axios` installed on your frontend (`npm install axios` in your React folder).
3. Ensure you have an `api.js` or `axios` instance configured to handle sending headers (like `Authorization: Bearer <TOKEN>` or `withCredentials: true`), so the backend knows the `req.user`.

<br>

---

## Module 1: Activity History (Timeline)

**Goal:** Fetch real project activity logs instead of static data.

**File to Edit:** `Frontend/src/components/ActivityTimeline/ActivityTimeline.jsx`

**Steps:**
1. Import Axios:
   ```javascript
   import axios from 'axios'; // or your custom api instance
   ```
2. Remove the mock data import:
   ```diff
   - import { activityMockData } from './mockData';
   ```
3. Initialize the `activities` state as an empty array:
   ```diff
   - const [activities, setActivities] = useState(activityMockData);
   + const [activities, setActivities] = useState([]);
   ```
4. Update the `fetchActivities` simulated function to make a real network request:
   ```javascript
   const fetchActivities = async (isLoadMore = false) => {
     try {
       setIsLoading(true);
       
       // Example: Fetching activities for a specific project. 
       // You will likely pass `projectId` as a prop to this component.
       const projectId = "YOUR_DYNAMIC_PROJECT_ID"; 
       
       const response = await axios.get(`/api/v1/activities/project/${projectId}`, {
         params: {
           page: pageRef.current,
           limit: 15,
           // actionType: filterAction // Optional filters
         }
       });

       const newActivities = response.data.data.activities;

       if (newActivities.length === 0) {
         setHasMore(false);
       } else {
         setActivities(prev => isLoadMore ? [...prev, ...newActivities] : newActivities);
         pageRef.current += 1;
       }
     } catch (error) {
       console.error("Failed to fetch activities:", error);
     } finally {
       setIsLoading(false);
       setIsPaginating(false);
     }
   };
   ```

<br>

---

## Module 2: Approval Workflow System

**Goal:** Fetch real pending/historical requests and submit Accept/Reject decisions to the database.

**File to Edit:** `Frontend/src/pages/ApprovalDashboard/ApprovalDashboard.jsx`

**Steps:**
1. Initialize the states empty:
   ```javascript
   const [requests, setRequests] = useState([]);
   ```
2. Add a `useEffect` hook to fetch the data based on the active tab:
   ```javascript
   import axios from 'axios';

   useEffect(() => {
     const loadData = async () => {
       try {
         setIsLoading(true);
         const endpoint = activeTab === 'pending' 
            ? '/api/v1/approvals/pending' 
            : '/api/v1/approvals/history';
            
         const response = await axios.get(endpoint);
         setRequests(response.data.data);
       } catch (error) {
         console.error("Failed to fetch approvals:", error);
       } finally {
         setIsLoading(false);
       }
     };
     
     loadData();
   }, [activeTab]); // Refetches whenever the tab changes
   ```

3. Update the `handleConfirmAction` function to push the decision to the backend:
   ```javascript
   const handleConfirmAction = async (comments) => {
     try {
       const decision = actionType; // 'approved' or 'rejected'
       const requestId = selectedRequest._id; // make sure your model uses _id

       // 1. Send API Request
       await axios.patch(`/api/v1/approvals/${requestId}/decide`, {
         decision: decision,
         comments: comments
       });

       // 2. Remove the request from the pending local state to update the UI instantly
       setRequests(prev => prev.filter(req => req._id !== requestId));
       
       // 3. Close Modal
       handleCloseModal();
       
     } catch (error) {
       console.error("Failed to process decision:", error);
       alert("An error occurred while submitting your decision.");
     }
   };
   ```

<br>

---

## Module 3: Notification System

**Goal:** Get the notification badge to reflect real database events and mark them read.

**File to Edit:** `Frontend/src/components/NotificationDropdown/NotificationDropdown.jsx` (and similarly `NotificationPage.jsx`)

**Steps:**
1. Setup state and fetch on mount:
   ```javascript
   import axios from 'axios';
   const [notifications, setNotifications] = useState([]);
   const [unreadCount, setUnreadCount] = useState(0);

   useEffect(() => {
     const fetchNotifications = async () => {
       try {
         const response = await axios.get('/api/v1/notifications?limit=10');
         setNotifications(response.data.data.notifications);
         setUnreadCount(response.data.data.unreadCount);
       } catch (error) {
         console.error("Notifications fetch error:", error);
       }
     };
     
     fetchNotifications();
     
     // Optionally set up an interval to poll every 60 seconds
     // const interval = setInterval(fetchNotifications, 60000);
     // return () => clearInterval(interval);
   }, []);
   ```

2. Update `handleMarkAsRead`:
   ```javascript
   const handleMarkAsRead = async (e, id) => {
     e.stopPropagation();
     try {
       await axios.patch(`/api/v1/notifications/${id}/read`);
       
       // Update UI Optimistically
       setNotifications(prev => prev.map(n => 
         n._id === id ? { ...n, isRead: true } : n
       ));
       setUnreadCount(prev => Math.max(0, prev - 1));
     } catch (err) {
       console.error(err);
     }
   };
   ```

3. Update `handleMarkAllAsRead`:
   ```javascript
   const handleMarkAllAsRead = async () => {
     try {
       await axios.patch('/api/v1/notifications/read-all');
       setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
       setUnreadCount(0);
     } catch (err) {
       console.error(err);
     }
   };
   ```

<br>

---

## Summary Checklist
- [ ] Connect `axios` configuration (tokens/headers) tightly so the backend always receives `req.user`.
- [ ] Inject the specific Backend hooks (`activity.middleware.js` and `notification.hooks.js`) into your Express routes as outlined in their previous setup guides.
- [ ] Delete or ignore the static `mockData.js` files natively.
- [ ] Wire the backend model state triggers (like what *actually happens* when an Approval is "approved") inside the `approval.service.js`.
