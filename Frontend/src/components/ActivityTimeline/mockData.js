/**
 * Mock Data for the Standalone Timeline UI.
 * Realistic set reflecting the Backend's expected output.
 */
export const sampleActivities = [
    {
        _id: "act_001",
        projectId: "proj_999",
        userId: "usr_101",
        userName: "Navadeep G",
        userRole: "Admin",
        actionType: "create",
        entityType: "project",
        message: "Navadeep G created the project 'ProjectS0009 Core'",
        oldValue: {},
        newValue: { name: "ProjectS0009 Core" },
        isSystemGenerated: false,
        createdAt: new Date(Date.now() - 50000).toISOString() // ~1 min ago
    },
    {
        _id: "act_002",
        projectId: "proj_999",
        userId: "usr_101",
        userName: "Navadeep G",
        userRole: "Admin",
        actionType: "create",
        entityType: "task",
        message: "Navadeep G created the task 'Setup CI/CD Pipeline'",
        oldValue: {},
        newValue: { title: "Setup CI/CD Pipeline", priority: "High" },
        isSystemGenerated: false,
        createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hr ago
    },
    {
        _id: "act_003",
        projectId: "proj_999",
        userId: "usr_102",
        userName: "Sarah Jenkins",
        userRole: "Manager",
        actionType: "assign",
        entityType: "task",
        message: "Sarah Jenkins assigned the task 'Setup CI/CD Pipeline' to David Lee",
        oldValue: { assignee: "Unassigned" },
        newValue: { assignee: "David Lee" },
        isSystemGenerated: false,
        createdAt: new Date(Date.now() - 7200000).toISOString() // 2 hrs ago
    },
    {
        _id: "act_004",
        projectId: "proj_999",
        userId: "usr_103",
        userName: "David Lee",
        userRole: "Member",
        actionType: "status",
        entityType: "task",
        message: "David Lee changed the task status to 'In Progress'",
        oldValue: { status: "Todo" },
        newValue: { status: "In Progress" },
        isSystemGenerated: false,
        createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
        _id: "act_005",
        projectId: "proj_999",
        userId: "sys_001",
        userName: "Workflow Bot",
        userRole: "System",
        actionType: "update",
        entityType: "task",
        message: "Workflow Bot updated the task 'Setup CI/CD Pipeline' due date.",
        oldValue: { dueDate: "2023-11-01" },
        newValue: { dueDate: "2023-11-05" },
        isSystemGenerated: true,
        createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
        _id: "act_006",
        projectId: "proj_999",
        userId: "usr_101",
        userName: "Navadeep G",
        userRole: "Admin",
        actionType: "delete",
        entityType: "file",
        message: "Navadeep G deleted the file 'old_architecture_diagram.png'",
        oldValue: { fileName: "old_architecture_diagram.png" },
        newValue: {},
        isSystemGenerated: false,
        createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    },
    {
        _id: "act_007",
        projectId: "proj_999",
        userId: "usr_103",
        userName: "David Lee",
        userRole: "Member",
        actionType: "status",
        entityType: "task",
        message: "David Lee changed the task status to 'Completed'",
        oldValue: { status: "In Progress" },
        newValue: { status: "Completed" },
        isSystemGenerated: false,
        createdAt: new Date(Date.now() - 345600000).toISOString() // 4 days ago
    }
];
