import { Controller, Get } from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {
  @Get('stats')
  getStats() {
    return {
      revenue: [
        { name: 'Mon', value: 1200 },
        { name: 'Tue', value: 1900 },
        { name: 'Wed', value: 1500 },
        { name: 'Thu', value: 2200 },
        { name: 'Fri', value: 3100 },
        { name: 'Sat', value: 4500 },
        { name: 'Sun', value: 3800 },
      ],
      ticketTimes: [
        { time: '10:00', minutes: 12 },
        { time: '11:00', minutes: 14 },
        { time: '12:00', minutes: 22 },
        { time: '13:00', minutes: 28 },
        { time: '14:00', minutes: 18 },
        { time: '15:00', minutes: 15 },
        { time: '16:00', minutes: 12 },
      ],
      inventoryAlerts: [
        { item: 'Sourdough Flour', status: 'Low', quantity: '5kg' },
        { item: 'Avocados', status: 'Critical', quantity: '12 units' },
        { item: 'Olive Oil', status: 'Low', quantity: '4 Liters' },
      ],
      summary: {
        totalOrders: 142,
        averageTicketTime: '18m',
        dailyRevenue: '$18,200',
        activeTables: 24,
      }
    };
  }
}
