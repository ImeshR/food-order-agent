import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import { OrderState } from '../order/order-state.interface';

@Injectable()
export class AiService {
    private groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    async processMessage(message: string | undefined, state: OrderState) {
        if (!message || !message.trim()) {
            return { reply: "Sorry, I didn't catch that. Could you please repeat?" };
        }

        const prompt = `You are a food ordering assistant.

Available items:
- Chicken Burger
- Beef Burger
- Pizza
- Coke

Current order state:
Item: ${state.item ?? 'not selected'}
Size: ${state.size ?? 'not selected'}
Quantity: ${state.quantity ?? 'not selected'}
Addons: ${state.addons?.join(', ') || 'none'}
Address: ${state.address ?? 'not selected'}

User said: "${message}"

Respond ONLY in JSON format. No markdown, no code fences, just raw JSON.
If the user provides order information, include those fields:
{
  "item": "...",
  "size": "...",
  "quantity": number,
  "address": "...",
  "confirmed": true/false,
  "reply": "Natural spoken response here"
}
If no order info, just:
{
  "reply": "Natural spoken response here"
}`;

        const completion = await this.groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            response_format: { type: 'json_object' },
        });

        const raw = completion.choices[0]?.message?.content ?? '';

        try {
            return JSON.parse(raw);
        } catch {
            return { reply: raw.trim() };
        }
    }
}
