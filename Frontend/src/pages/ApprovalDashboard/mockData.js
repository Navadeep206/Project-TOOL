/**
 * Mock Data for the Standalone Approval Dashboard UI.
 * Realistic set reflecting the Backend's expected output.
 */
export const approvalRequestsMock = [
    {
        requestId: "REQ-001004B",
        requesterId: "usr_alice_dev",
        requesterRole: "MEMBER",
        projectId: "proj_falcon",
        requestType: "deadline_extension",
        targetEntityId: "task_api_auth",
        currentStatus: "pending",
        approvalLevel: "manager",
        approverId: null,
        reason: "Blocked by 3rd party API outage. Need 2 extra days to integrate SSO.",
        comments: "",
        createdAt: "2023-11-08T10:00:00.000Z",
        updatedAt: "2023-11-08T10:00:00.000Z"
    },
    {
        requestId: "REQ-112233C",
        requesterId: "usr_bob_lead",
        requesterRole: "MANAGER",
        projectId: "proj_falcon",
        requestType: "delete_project",
        targetEntityId: "proj_falcon",
        currentStatus: "in_review",
        approvalLevel: "admin",
        approverId: null,
        reason: "Client contract was terminated. We need to purge the repository per compliance rules.",
        comments: "",
        createdAt: "2023-11-10T14:30:00.000Z",
        updatedAt: "2023-11-10T14:30:00.000Z"
    },
    {
        requestId: "REQ-998877D",
        requesterId: "usr_charlie_lead",
        requesterRole: "MANAGER",
        projectId: "proj_omega",
        requestType: "role_change",
        targetEntityId: "usr_alice_dev",
        currentStatus: "approved",
        approvalLevel: "admin",
        approverId: "admin_super_01",
        reason: "Promoting Alice to Project Manager for the Omega initiative.",
        comments: "Approved. Great work Alice. Access control updated.",
        createdAt: "2023-10-15T09:15:00.000Z",
        updatedAt: "2023-10-16T10:05:00.000Z"
    },
    {
        requestId: "REQ-445566E",
        requesterId: "usr_dana_dev",
        requesterRole: "MEMBER",
        projectId: "proj_omega",
        requestType: "archive_project",
        targetEntityId: "proj_omega",
        currentStatus: "rejected",
        approvalLevel: "admin",
        approverId: "admin_super_01",
        reason: "Project is basically done, can we archive it so it disappears from my list?",
        comments: "Rejected. Final code review is still pending from the Security team.",
        createdAt: "2023-10-20T11:00:00.000Z",
        updatedAt: "2023-10-21T16:30:00.000Z"
    },
    {
        requestId: "REQ-778899F",
        requesterId: "usr_evo_manager",
        requesterRole: "MANAGER",
        projectId: "proj_titan",
        requestType: "remove_user",
        targetEntityId: "usr_rogue_contractor",
        currentStatus: "approved",
        approvalLevel: "admin",
        approverId: "admin_super_02",
        reason: "Contractor's term expired yesterday. Needs immediate offboarding.",
        comments: "Approved. Network access revoked as well.",
        createdAt: "2023-11-01T08:00:00.000Z",
        updatedAt: "2023-11-01T08:30:00.000Z"
    }
];
