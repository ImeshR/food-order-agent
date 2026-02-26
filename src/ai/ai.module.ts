import { Module } from '@nestjs/common';
import { AiService } from './ai.service';

@Module({
  providers: [AiService],
  exports: [AiService], // 👈 VERY IMPORTANT
})
export class AiModule {}
