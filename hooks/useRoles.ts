import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export function useRoles() {
    return useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const { data } = await api.get('/admin/roles');

            return data.roles;
        },
        staleTime: 1000 * 60 * 5,
    });
}