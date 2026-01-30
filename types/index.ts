export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    group_name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions?: Permission[];
    users_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'disabled' | 'pending';
    role: string;
    roles?: Role[];
    permissions?: string[];
    avatar?: string;
    image_url?: string;
    phone?: string;
    last_login_at?: string;
    email_verified_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Banner {
    id: number;
    title: string;
    image_desktop_url?: string;
    full_image_desktop: string;
    full_image_mobile?: string;
    link?: string;
    active: boolean;
    pivot?: {
        sort_order: number;
        start_at: string | null;
        end_at: string | null;
        is_active: boolean;
    };
}

export interface BannerGroup {
    id: number;
    key: string;
    name: string;
    page: string;
    layout_type: 'slider' | 'grid' | 'single';
    max_items: number;
    banners_count?: number;
    banners?: Banner[];
}


export interface AuthResponse {
    user: User;
    access_token: string;
    token_type?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    prev_page_url?: string;
    next_page_url?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
}


export type IconName =
    | 'LayoutDashboard' | 'Users' | 'Image' | 'Settings'
    | 'ShoppingCart' | 'FileText' | 'Package' | 'BarChart'
    | 'Shield' | 'Globe' | 'Bell' | 'ShoppingBag'
    | 'CreditCard' | 'Receipt' | 'Store' | 'Box'
    | 'Warehouse' | 'Dumbbell' | 'HeartPulse' | 'Trophy' | 'Target';

export interface AttributeValue {
    id?: number;
    value: string;
    color_hex?: string;
    secondary_color_hex?: string;
    swatch_image?: string;
    swatch_image_url?: string;
    swatch_file?: File;
    category_codes?: number[];
}

export interface Attribute {
    id: number;
    name: string;
    type: 'select' | 'color' | 'button';
    values: AttributeValue[];
}