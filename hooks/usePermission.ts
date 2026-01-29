import { useAuth } from '@/hooks/useAuth';

export const usePermission = () => {
    const { user } = useAuth();


    const can = (permissionName: string): boolean => {
        if (!user) return false;

        if (user.role === 'Admin') return true;

        return user.permissions?.includes(permissionName) || false;
    };


    const canAny = (permissions: string[]): boolean => {
        if (!user) return false;
        if (user.role === 'Admin') return true;
        return permissions.some(p => user.permissions?.includes(p));
    };

    return { can, canAny, user };
};