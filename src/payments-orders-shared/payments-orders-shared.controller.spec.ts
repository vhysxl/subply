import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsOrdersSharedController } from './payments-orders-shared.controller';
import { PaymentsOrdersSharedService } from './payments-orders-shared.service';

describe('PaymentsOrdersSharedController', () => {
  let controller: PaymentsOrdersSharedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsOrdersSharedController],
      providers: [PaymentsOrdersSharedService],
    }).compile();

    controller = module.get<PaymentsOrdersSharedController>(
      PaymentsOrdersSharedController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
