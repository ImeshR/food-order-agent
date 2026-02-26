import { Module } from '@nestjs/common';
import { OrderService } from './order.service';

@Module({
  providers: [OrderService],
  exports: [OrderService], // 👈 ALSO IMPORTANT
})
export class OrderModule {}
