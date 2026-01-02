import { LayoutDashboard } from 'lucide-react';

import { ActivityList } from './components/activity-list';
import { DashboardCharts } from './components/dashboard-charts';
import { DashboardToolbar } from './components/dashboard-toolbar';
import { MetricsCards } from './components/metrics-cards';
import { useDashboardController } from './hooks/use-dashboard-controller';

export default function DashboardView() {
  // 1. Controller: Detém toda a inteligência e estado
  const {
    filter,
    selectedDate,
    sprintConfig,
    currentSprintRange,
    currentMonthValue,
    monthOptions,
    stats,
    activities,
    chartData,
    updateSearch,
    handleSprintNavigate,
    formatDateDisplay,
  } = useDashboardController();

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <LayoutDashboard className="text-blue-500" /> Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Visão geral de produtividade, métricas e entregas.
          </p>
        </div>
      </div>

      {/* Toolbar (Isolada) */}
      <DashboardToolbar
        filter={filter}
        selectedDate={selectedDate}
        sprintConfig={sprintConfig}
        currentSprintRange={currentSprintRange}
        currentMonthValue={currentMonthValue}
        monthOptions={monthOptions}
        onUpdateSearch={updateSearch}
        onSprintNavigate={handleSprintNavigate}
        formatDate={formatDateDisplay}
      />

      {/* Conteúdo */}
      <MetricsCards stats={stats} />
      {filter !== 'day' && chartData.length > 0 && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <DashboardCharts data={chartData} />
        </div>
      )}

      <ActivityList activities={activities} currentFilter={filter} />
    </div>
  );
}
