import UserList from "@/components/admin/users/UserList";
import PermissionGate from "@/components/auth/PermissionGate";

export const metadata = {
    title: 'Usuarios | Galaxia Admin',
};

export default function UsersPage() {
    return (
        <PermissionGate permission="view_users">
            <UserList />
        </PermissionGate>
    );
}