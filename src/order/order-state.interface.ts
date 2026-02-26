export interface OrderState {
    item?: string;
    size?: string;
    quantity?: number;
    addons?: string[];
    address?: string;
    confirmed: boolean;
}
