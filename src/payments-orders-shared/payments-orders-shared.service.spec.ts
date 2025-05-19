import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsOrdersSharedService } from './payments-orders-shared.service';

describe('PaymentsOrdersSharedService', () => {
  let service: PaymentsOrdersSharedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentsOrdersSharedService],
    }).compile();

    service = module.get<PaymentsOrdersSharedService>(
      PaymentsOrdersSharedService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
