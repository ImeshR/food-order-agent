import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import Groq from 'groq-sdk';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * GET /ai/models  – list available Groq models
   */
  @Get('ai/models')
  async listGroqModels() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return { error: 'GROQ_API_KEY not set in .env' };
    try {
      const groq = new Groq({ apiKey });
      const list = await groq.models.list();
      return {
        keyPrefix: apiKey.slice(0, 8) + '...',
        models: list.data.map((m: any) => m.id),
      };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  /**
   * GET /ai/chat?message=hello  – quick text chat to verify Groq key works
   * Open in browser: http://localhost:3000/ai/chat?message=say+hello
   */
  @Get('ai/chat')
  async testChat(@Query('message') message: string) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return { error: 'GROQ_API_KEY not set in .env' };
    if (!message) return { hint: 'Add ?message=your+question, e.g. /ai/chat?message=say+hello' };

    try {
      const groq = new Groq({ apiKey });
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: message }],
      });
      const reply = completion.choices[0]?.message?.content ?? '';
      return { model: 'llama-3.3-70b-versatile', reply };
    } catch (e: any) {
      return { error: e.message };
    }
  }
}
