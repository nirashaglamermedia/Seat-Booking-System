import { Test, TestingModule } from '@nestjs/testing';
import { BookingSeatController } from './booking_seat.controller';

describe('BookingSeatController', () => {
  let controller: BookingSeatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingSeatController],
    }).compile();

    controller = module.get<BookingSeatController>(BookingSeatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
