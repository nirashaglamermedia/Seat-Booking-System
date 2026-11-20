import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hall } from '../entities/halls.entity';
import { HallsController } from './halls.controller';
import { HallsService } from './halls.service';

@Module({
     imports: [TypeOrmModule.forFeature([Hall])],
  controllers: [HallsController],
  providers: [HallsService],
})
export class HallsModule {}
