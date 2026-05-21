/**
 * Mock Data simulating the Notification API output
 */
export const notificationsMock = [
    {
        _id: "notif_001",
        recipientId: "usr_alice",
        senderId: null,
        type: "deadline_approaching",
        message: "Deadline Warning: 'Database Architecture Revamp' is due in 12 hours.",
        metadata: { projectId: "proj_99", taskId: "task_01" },
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        sender: null // System
    },
    {
        _id: "notif_002",
        recipientId: "usr_alice",
        senderId: "usr_bob",
        type: "task_assigned",
        message: "Bob The Builder assigned you to a new task 'Implement Redis Caching'.",
        metadata: { projectId: "proj_99", taskId: "task_02" },
        isRead: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        sender: { fullname: "Bob The Builder", profileImage: null }
    },
    {
        _id: "notif_003",
        recipientId: "usr_alice",
        senderId: "usr_charlie",
        type: "status_changed",
        message: "Charlie updated the status of 'Frontend Overhaul' to In Review.",
        metadata: { projectId: "proj_101", newStatus: "In Review" },
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        sender: { fullname: "Charlie Director", profileImage: null }
    },
    {
        _id: "notif_004",
        recipientId: "usr_alice",
        senderId: "usr_admin",
        type: "role_update",
        message: "Your system privileges have been elevated to MANAGER.",
        metadata: { newRole: "MANAGER" },
        isRead: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        sender: { fullname: "Security Admin", profileImage: null }
    },
    {
        _id: "notif_005",
        recipientId: "usr_alice",
        senderId: "usr_bob",
        type: "comment_added",
        message: "Bob commented: 'Can we try to launch this by Thursday instead?'",
        metadata: { taskId: "task_01" },
        isRead: true,
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        sender: { fullname: "Bob The Builder", profileImage: null }
    }
];
