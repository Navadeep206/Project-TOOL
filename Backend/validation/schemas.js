import { z } from 'zod';

export const projectSchema = z.object({
    name: z.string().min(3, "Project name must be at least 3 characters").max(100),
    description: z.string().max(500).optional(),
    priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
    status: z.enum(['Planning', 'In Progress', 'Done', 'Completed']).default('Planning'),
    dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid due date format"
    }).optional()
});

export const taskSchema = z.object({
    name: z.string().min(2, "Task name must be at least 2 characters").max(100),
    description: z.string().max(500).optional(),
    status: z.enum(['Pending', 'In Progress', 'Done']).default('Pending'),
    project: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Project ID"),
    team: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Team ID").optional(),
    assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID").optional(),
    priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid start date format"
    }).optional(),
    dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid due date format"
    }).optional()
});
