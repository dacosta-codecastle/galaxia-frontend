export interface Sport {
    id: number;
    name: string;
    slug: string;
    is_featured: boolean;
    sort_order: number;
    icon?: string | null;
    image?: string | null;

    seo?: {
        title?: string;
        description?: string;
        canonical_url?: string;
        robots_index: boolean;
        robots_follow: boolean;
        og_image?: string | null;
    };

    products_count?: number;
}