export interface Brand {
    id: number;
    name: string;
    slug: string;
    description?: string;
    is_featured: boolean;
    logo?: string | null;

    seo?: {
        title?: string;
        description?: string;
        canonical_url?: string;
        robots_index: boolean;
        robots_follow: boolean;
        og_image?: string | null;
    };

    products_count?: number;
    created_at?: string;
}