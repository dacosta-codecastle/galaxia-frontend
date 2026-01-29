export interface Category {
    id: number;
    name: string;
    slug: string;
    code: number;
    description?: string;
    parent_id?: number | null;
    parent_name?: string;
    sort_order: number;
    is_active: boolean;

    seo?: {
        title?: string;
        description?: string;
        canonical_url?: string;
        robots_index: boolean;
        robots_follow: boolean;
        og_image?: string | null;
    };

    children?: Category[];
    children_count?: number;
    products_count?: number;
    created_at?: string;
}