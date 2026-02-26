import { Injectable } from '@nestjs/common';
import { OrderState } from './order-state.interface';

@Injectable()
export class OrderService {
    private orders: Record<string, OrderState> = {};

    getState(callSid: string): OrderState {
        if (!this.orders[callSid]) {
            this.orders[callSid] = {
                addons: [],
                confirmed: false,
            };
        }
        return this.orders[callSid];
    }

    updateState(callSid: string, updates: Partial<OrderState>) {
        this.orders[callSid] = {
            ...this.getState(callSid),
            ...updates,
        };
        return this.orders[callSid];
    }

    clearState(callSid: string) {
        delete this.orders[callSid];
    }
}
