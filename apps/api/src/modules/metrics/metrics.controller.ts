import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../lib/supabase-auth.guard';

@Controller('metrics')
@UseGuards(SupabaseAuthGuard)
export class MetricsController {
  
  @Get('sales')
  getSales() {
    return { value: "Sales: $1.2k" };
  }

  @Get('ticket-time')
  getTicketTime() {
    return { value: "Avg: 4m 12s" };
  }

  @Get('low-stock')
  getLowStock() {
    return { value: "3 Items Low" };
  }
}
