import { FinancialPulse } from './components/FinancialPulse';
import { MenuProfitability } from './components/MenuProfitability';
import { PurchasingAlerts } from './components/PurchasingAlerts';
import { SystemHealth } from './components/SystemHealth';

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Dashboard</h1>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Row 1: Financial Pulse spanning all columns */}
        <div className="xl:col-span-3">
          <FinancialPulse />
        </div>

        {/* Row 2: Profitability and Alerts */}
        <div className="xl:col-span-2">
          <MenuProfitability />
        </div>
        <div>
          <PurchasingAlerts />
        </div>

        {/* Row 3: System Health spanning all columns */}
        <div className="xl:col-span-3">
          <SystemHealth />
        </div>
      </div>
    </div>
  );
}
