import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const api = axios.create({
    baseURL: (import.meta.env.VITE_API_BASE_URL || 'https://project-tool-1.onrender.com/api'),
    withCredentials: true
});

export const useProjects = () => {
    return useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await api.get('/projects');
            return res.data.data || [];
        }
    });
};

export const useTasks = () => {
    return useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const res = await api.get('/tasks');
            return res.data.data || [];
        }
    });
};

export const usePaginatedProjects = (page = 1, limit = 10, search = '') => {
    return useQuery({
        queryKey: ['paginatedProjects', page, limit, search],
        queryFn: async () => {
            const res = await api.get('/projects', { params: { page, limit, search } });
            return res.data;
        }
    });
};

export const usePaginatedTasks = (page = 1, limit = 50, search = '', projectId = '', stage = '') => {
    return useQuery({
        queryKey: ['paginatedTasks', page, limit, search, projectId, stage],
        queryFn: async () => {
            const res = await api.get('/tasks', { params: { page, limit, search, projectId, stage } });
            return res.data;
        }
    });
};

export const useTeams = () => {
    return useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const res = await api.get('/teams');
            return res.data.data || [];
        }
    });
};

// Mutations
export const useAddProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newProject) => {
            const res = await api.post('/projects', newProject);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });
};

export const useDeleteProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const res = await api.delete(`/projects/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });
};

export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, role }) => {
            const res = await api.put(`/users/${userId}/role`, { role });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
};
export const useUpdateProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }) => {
            const res = await api.put(`/projects/${id}`, updates);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });
};

export const useAddTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newTask) => {
            const res = await api.post('/tasks', newTask);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }) => {
            const res = await api.put(`/tasks/${id}`, updates);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await api.delete(`/tasks/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });
};

export const useAddTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newTeam) => {
            const res = await api.post('/teams', newTeam);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        }
    });
};

export const useDeleteTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await api.delete(`/teams/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        }
    });
};

export const useUpdateMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ teamId, memberId, updates }) => {
            const res = await api.put(`/teams/${teamId}/members/${memberId}`, updates);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        }
    });
};
export const useRemoveMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ teamId, memberId }) => {
            await api.delete(`/teams/${teamId}/members/${memberId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        }
    });
};

export const useAddMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ teamId, userId, role }) => {
            const res = await api.post(`/teams/${teamId}/members`, { user: userId, role });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        }
    });
};
export const useCreateApproval = () => {
    return useMutation({
        mutationFn: async (approvalData) => {
            const res = await api.post('/v1/approvals', approvalData);
            return res.data;
        }
    });
};
