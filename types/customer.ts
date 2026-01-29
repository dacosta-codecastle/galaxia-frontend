export interface CustomerAddress {
    id: number;
    alias: string;
    type: 'shipping' | 'billing';
    phone?: string;
    details: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        country: string;
        zip_code: string;
    };
    formatted: string;
    is_default: boolean;
}

export interface CustomerProfile {
    id: number;
    name: string;
    email: string;
    phone?: string;
    birth_date?: string;
    marketing_opt_in: boolean;
    billing?: {
        tax_id?: string;
        legal_name?: string;
    };
    avatar?: string;
}