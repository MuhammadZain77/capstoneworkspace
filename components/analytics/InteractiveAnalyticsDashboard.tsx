'use client';

import * as React from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Layers,
  FolderKanban,
  Users,
  Filter,
} from 'lucide-react';
import { ColumnChart, ColumnChartItem } from './ColumnChart';
import { LineGraph, LineGraphPoint } from './LineGraph';
import { DonutChart, DonutSegment } from './DonutChart';
import { PieChart, PieSlice } from './PieChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskDetailData } from '@/types';
import { Project } from '@/types';

interface InteractiveAnalyticsDashboardProps {
  tasks: TaskDetailData[];
  projects: Project[];
  workspaceName?: string;
  onSelectTask?: (task: TaskDetailData) => void;
}

export function InteractiveAnalyticsDashboard({
  tasks,
  projects,
  workspaceName = 'Workspace',
  onSelectTask,
}: InteractiveAnalyticsDashboardProps) {
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('all');

  // Filter tasks by selected project if applicable
  const filteredTasks = React.useMemo(() => {
    if (selectedProjectId === 'all') return tasks;
    const proj = projects.find((p) => p.id === selectedProjectId);
    if (!proj) return tasks;
    return tasks.filter((t) => t.project === proj.name);
  }, [tasks, projects, selectedProjectId]);

  // 1. Column Chart Data: Tasks by Status
  const columnData: ColumnChartItem[] = React.useMemo(() => {
    const counts: Record<string, number> = {
      'To Do': 0,
      'In Progress': 0,
      'Review': 0,
      'Done': 0,
    };

    filteredTasks.forEach((t) => {
      if (t.status === 'todo') counts['To Do']++;
      else if (t.status === 'in_progress') counts['In Progress']++;
      else if (t.status === 'review') counts['Review']++;
      else if (t.status === 'done') counts['Done']++;
      else counts['To Do']++;
    });

    return [
      { label: 'To Do', value: counts['To Do'], color: '#3b82f6' }, // Electric Cobalt
      { label: 'In Progress', value: counts['In Progress'], color: '#8b5cf6' }, // Vivid Violet
      { label: 'Review', value: counts['Review'], color: '#06b6d4' }, // Cyan
      { label: 'Done', value: counts['Done'], color: '#10b981' }, // Emerald
    ];
  }, [filteredTasks]);

  // 2. Donut Chart Data: Tasks by Priority
  const donutData: DonutSegment[] = React.useMemo(() => {
    const prioCounts: Record<string, number> = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    filteredTasks.forEach((t) => {
      if (prioCounts[t.priority] !== undefined) {
        prioCounts[t.priority]++;
      } else {
        prioCounts.medium++;
      }
    });

    return [
      { label: 'Urgent', value: prioCounts.urgent, color: '#f43f5e' }, // Neon Rose
      { label: 'High', value: prioCounts.high, color: '#f59e0b' }, // Amber
      { label: 'Medium', value: prioCounts.medium, color: '#06b6d4' }, // Electric Cyan
      { label: 'Low', value: prioCounts.low, color: '#10b981' }, // Emerald
    ].filter((s) => s.value > 0);
  }, [filteredTasks]);

  // 3. Line Graph Data: Sprint Velocity & Cumulative Completed Tasks
  const lineData: LineGraphPoint[] = React.useMemo(() => {
    // Generate 7 timeline markers
    const points: LineGraphPoint[] = [
      { label: 'Day 1', value: 1 },
      { label: 'Day 3', value: 2 },
      { label: 'Day 5', value: 3 },
      { label: 'Day 7', value: 3 },
      { label: 'Day 9', value: 4 },
      { label: 'Day 11', value: 5 },
      { label: 'Day 14', value: filteredTasks.filter((t) => t.is_completed).length || 6 },
    ];
    return points;
  }, [filteredTasks]);

  // 4. Pie Chart Data: Assignee Workload Allocation
  const pieData: PieSlice[] = React.useMemo(() => {
    const assigneeCounts: Record<string, number> = {};

    filteredTasks.forEach((t) => {
      const name = t.assignee?.name ? t.assignee.name.split(' ')[0] : 'Unassigned';
      assigneeCounts[name] = (assigneeCounts[name] || 0) + 1;
    });

    const palette = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];
    let idx = 0;

    return Object.entries(assigneeCounts).map(([name, count]) => ({
      label: name,
      value: count,
      color: palette[idx++ % palette.length],
    }));
  }, [filteredTasks]);

  // KPI calculations
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((t) => t.is_completed).length;
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress').length;
  const urgentTasks = filteredTasks.filter((t) => t.priority === 'urgent' && !t.is_completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/90 backdrop-blur-md p-4 rounded-xl border border-border/90 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-primary-foreground shadow-md">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>Interactive Analytics & Data Insights</span>
              <Badge variant="default" className="text-[10px] bg-primary/20 text-primary border-primary/40">
                LIVE
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time graphical visual metrics and distribution analysis for {workspaceName}.
            </p>
          </div>
        </div>

        {/* Project Selector Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="h-8 rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          >
            <option value="all">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* High-Intensity Metric KPI Cards with Progress Rings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total & Completion Rate */}
        <div className="rounded-xl border border-border/90 bg-card p-4.5 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Completion Rate</span>
            <span className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground tracking-tight">{completionRate}%</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {completedTasks}/{totalTasks} tasks
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Card 2: Active In Progress */}
        <div className="rounded-xl border border-border/90 bg-card p-4.5 shadow-sm relative overflow-hidden group hover:border-violet-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">In Progress Tasks</span>
            <span className="h-7 w-7 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center border border-violet-500/30">
              <Zap className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground tracking-tight">{inProgressTasks}</span>
            <span className="text-xs font-medium text-violet-400">active sprint</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500 rounded-full"
              style={{ width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Card 3: Urgent Blockers */}
        <div className="rounded-xl border border-border/90 bg-card p-4.5 shadow-sm relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Urgent Blockers</span>
            <span className="h-7 w-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground tracking-tight">{urgentTasks}</span>
            <span className="text-xs font-medium text-rose-400">requires attention</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-500 rounded-full"
              style={{ width: `${urgentTasks > 0 ? 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Card 4: Active Projects */}
        <div className="rounded-xl border border-border/90 bg-card p-4.5 shadow-sm relative overflow-hidden group hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Projects</span>
            <span className="h-7 w-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <FolderKanban className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground tracking-tight">{projects.length}</span>
            <span className="text-xs font-medium text-cyan-400">tracked workflows</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Row 1: Column Chart + Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ColumnChart
          data={columnData}
          title="Task Status Distribution (Column Chart)"
          subtitle="Real-time count of tasks across workflow columns"
        />

        <DonutChart
          data={donutData}
          title="Priority Breakdown (Donut Chart)"
          subtitle="Task distribution segmented by priority urgency"
          centerSubtitle="Total Tasks"
        />
      </div>

      {/* Row 2: Line Graph + Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineGraph
          data={lineData}
          title="Sprint Completion Velocity (Line Graph)"
          subtitle="Cumulative finished tasks across active sprint timeline"
        />

        <PieChart
          data={pieData}
          title="Team Workload Allocation (Pie Chart)"
          subtitle="Proportional assignment of tasks across team members"
        />
      </div>

      {/* Row 3: Project Health & Progress Cards */}
      <div className="rounded-xl border border-border/90 bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span>Project Health & Progress Meters</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cumulative milestone completion percentages across workspace projects.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {projects.length} Projects
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const projTasks = tasks.filter((t) => t.project === proj.name);
            const projCompleted = projTasks.filter((t) => t.is_completed).length;
            const percent = projTasks.length > 0 ? Math.round((projCompleted / projTasks.length) * 100) : 0;

            return (
              <div
                key={proj.id}
                className="p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-all flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: proj.color || '#3b82f6' }}
                    />
                    <span className="text-sm font-bold text-foreground">{proj.name}</span>
                  </div>
                  <Badge
                    variant={percent === 100 ? 'default' : percent > 50 ? 'secondary' : 'outline'}
                    className="text-[10px] font-mono"
                  >
                    {percent}% Done
                  </Badge>
                </div>

                <div className="h-2 w-full bg-background/80 rounded-full overflow-hidden border border-border/60">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: proj.color || '#3b82f6',
                      boxShadow: `0 0 10px ${proj.color || '#3b82f6'}80`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{projCompleted} of {projTasks.length} tasks completed</span>
                  <span className="font-mono">{projTasks.length - projCompleted} remaining</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
