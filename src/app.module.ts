import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VoiceModule } from './voice/voice.module';
import { AiModule } from './ai/ai.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [VoiceModule, AiModule, OrderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
