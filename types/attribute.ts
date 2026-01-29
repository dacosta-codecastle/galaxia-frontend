export interface AttributeValue {
    id?: number;
    value: string;
    slug?: string;
    color_hex?: string | null;
    secondary_color_hex?: string | null;
    swatch_image?: string | null;
    sort_order?: number;

    swatch_file?: File | null;
    swatch_preview?: string | null;
}

export interface Attribute {
    id: number;
    name: string;
    slug: string;
    type: 'select' | 'color' | 'button';
    values: AttributeValue[];
    products_count?: number;
}