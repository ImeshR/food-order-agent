import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';
import { VoiceTokenService } from './voice-token.service';
import { AiModule } from '../ai/ai.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [AiModule, OrderModule],
  controllers: [VoiceController],
  providers: [VoiceTokenService],
})
export class VoiceModule {}
