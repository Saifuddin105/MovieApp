import { Module } from '@nestjs/common';
import { WatchedController } from './watched.controller';
import { WatchedService } from './watched.service';

@Module({
  controllers: [WatchedController],
  providers: [WatchedService],
  exports: [WatchedService],
})
export class WatchedModule {}

