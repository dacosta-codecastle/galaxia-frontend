import BulkCategoryForm from '@/components/admin/categories/BulkCategoryForm';
import PermissionGate from '@/components/auth/PermissionGate';

export default function BulkPage() {
    return (
        <PermissionGate permission="create_categories">
            <BulkCategoryForm />
        </PermissionGate>
    );
}