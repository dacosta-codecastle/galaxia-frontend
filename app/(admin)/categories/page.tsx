import CategoryList from '@/components/admin/categories/CategoryList';
import PermissionGate from '@/components/auth/PermissionGate';
export default function CategoriesPage() {
    return (
        <PermissionGate permission="view_categories">
            <CategoryList />
        </PermissionGate>
    );
}