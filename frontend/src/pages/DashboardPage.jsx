import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  Briefcase,
  ClipboardCheck,
  UserPlus,
  Activity,
  Calendar,
  TrendingUp,
  PieChart,
  ChevronRight,
  FolderKanban,
  Upload
} from "lucide-react";
import { motion } from "framer-motion";
import { dashboardService } from "../services/employees";
import MetricCard from "../components/common/MetricCard";
import GlassCard, { CardHeader } from "../components/common/GlassCard";
import LineChart from "../components/charts/LineChart";
import DonutChart from "../components/charts/DonutChart";

const textPrimary = "text-slate-900";
const textSecondary = "text-slate-600";
const glassCardStyle = `
  bg-white/85 
  border border-slate-200/80 
  shadow-sm 
  backdrop-blur-xl 
  rounded-2xl
`;
const glassHoverStyle = `
  hover:border-blue-500/30 
  hover:shadow-md
  transition-all duration-300 ease-out
`;

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const floatingBlob = {
  animate: {
    y: [0, -30, 0],
    x: [0, 15, 0],
    scale: [1, 1.05, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 18, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function DashboardPage() {
  const { user: authUser } = useAuth();
  const user = authUser
    ? { first_name: authUser.firstName || authUser.first_name || "Harshit" }
    : { first_name: "Harshit" };

  const [greeting, setGreeting] = useState("");
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [hiringTrends, setHiringTrends] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projectsDistribution, setProjectsDistribution] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [metricsData, trendsData, deptsData, projectsDistData, activitiesData] = await Promise.all([
        dashboardService.getMetrics().catch(() => null),
        dashboardService.getHiringTrends().catch(() => []),
        dashboardService.getDepartmentDistribution().catch(() => []),
        dashboardService.getProjectDistribution().catch(() => []),
        dashboardService.getRecentActivities().catch(() => [])
      ]);

      if (metricsData) {
        setMetrics({
          total_employees: metricsData.total_employees ?? 142,
          open_positions: metricsData.open_positions ?? 12,
          pending_reviews: metricsData.pending_reviews ?? 5,
          new_hires_this_month: metricsData.new_hires_this_month ?? metricsData.pending_onboarding ?? 8
        });
      } else {
        setMetrics({
          total_employees: 142,
          open_positions: 12,
          pending_reviews: 5,
          new_hires_this_month: 8,
        });
      }

      if (trendsData && trendsData.length > 0) {
        setHiringTrends(trendsData.map(t => ({
          month: t.month,
          hires: t.new_hires ?? t.hires ?? 0
        })));
      } else {
        setHiringTrends([
          { month: "Jan", hires: 10 },
          { month: "Feb", hires: 15 },
          { month: "Mar", hires: 25 },
          { month: "Apr", hires: 18 },
        ]);
      }

      if (deptsData && deptsData.length > 0) {
        setDepartments(deptsData);
      } else {
        setDepartments([
          { name: "Engineering", value: 45 },
          { name: "Sales", value: 30 },
          { name: "Design", value: 15 },
          { name: "HR", value: 10 },
        ]);
      }

      if (projectsDistData && projectsDistData.length > 0) {
        setProjectsDistribution(projectsDistData);
      } else {
        setProjectsDistribution([
          { name: "Active", value: 2 },
          { name: "Planning", value: 1 },
          { name: "Completed", value: 0 },
          { name: "On Hold", value: 0 }
        ]);
      }

      if (activitiesData && activitiesData.length > 0) {
        setActivities(activitiesData.slice(0, 5).map((act, index) => {
          let timeStr = 'Just now';
          try {
            if (act.timestamp) {
              const date = new Date(act.timestamp);
              timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
          } catch (e) {
            // fallback
          }
          return {
            id: act.id || index,
            action: act.description || act.action || "Activity logged",
            time: timeStr,
            target: act.type === 'employee' ? 'Employee Dir' : 'System',
            type: act.type === 'employee' ? 'success' : 'neutral'
          };
        }));
      } else {
        setActivities([
          {
            id: 1,
            action: "System Initialized",
            time: "Just now",
            target: "Developer Node",
            type: "success",
          },
          {
            id: 2,
            action: "Record Updated: Sarah Jenkins",
            time: "2 hrs ago",
            target: "Engineering",
            type: "success",
          },
          {
            id: 3,
            action: "New Entry added: Alex Rivera",
            time: "4 hrs ago",
            target: "Operations",
            type: "neutral",
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    setCurrentDate(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    );
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="min-h-full w-full bg-[#050505] p-6 lg:p-10">
        <div className="animate-pulse space-y-4 mb-8">
          <div className="h-4 bg-white/10 rounded w-32"></div>
          <div className="h-10 bg-white/10 rounded w-80"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white/[0.03] border border-white/5 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[350px] bg-white/[0.03] border border-white/5 rounded-2xl" />
          <div className="h-[350px] bg-white/[0.03] border border-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full w-full bg-slate-50 text-slate-900 p-6 lg:p-10 overflow-y-auto custom-scrollbar overflow-x-hidden">
      {/* Background Neon Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#60a5fa", "#818cf8", "#38bdf8"] }} transition={{ ...floatingBlob.animate.transition, backgroundColor: { duration: 20, repeat: Infinity, ease: "linear" } }} className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] rounded-full blur-[140px] opacity-30 mix-blend-multiply" />
        <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#c084fc", "#60a5fa", "#c084fc"] }} transition={{ ...floatingBlob.animate.transition, delay: 2, backgroundColor: { duration: 25, repeat: Infinity, ease: "linear" } }} className="absolute top-[30%] -right-[10%] w-[700px] h-[700px] rounded-full blur-[130px] opacity-25 mix-blend-multiply" />
      </div>

      <div className="relative z-10 w-full">
        {/* HEADER */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-slate-500 text-xs font-semibold">
            <Calendar size={12} className="text-blue-600" />
            <span>{currentDate}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {greeting},{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              {user?.first_name}
            </span>
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            System health, headcount summaries, and administrative control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/leave-management')}
            className="px-4 py-2.5 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold rounded-xl hover:bg-violet-500/20 transition-all flex items-center gap-2"
          >
            <Calendar size={14} /> Leave Approvals
          </button>
          <a
            href="http://localhost:8000/api/v1/employees/export/excel"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center gap-2"
          >
            <Upload size={14} /> Export Excel / CSV
          </a>
        </div>
      </motion.div>

      {/* STATS METRICS GRID */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {[
          { title: "Total Employees", value: metrics?.total_employees || 0, change: "+12%", icon: Users, route: "/employees", iconColor: "primary" },
          { title: "Active Positions", value: metrics?.open_positions || 0, change: "+5", icon: Briefcase, route: "/employees", iconColor: "amber" },
          { title: "Pending Actions", value: metrics?.pending_reviews || 0, change: "-3", icon: ClipboardCheck, route: "/employees", iconColor: "teal" },
          { title: "New Hires This Month", value: metrics?.new_hires_this_month || 0, change: "+8", icon: UserPlus, route: "/employees", iconColor: "emerald" }
        ].map((item, idx) => (
          <div
            key={idx}
            onClick={() => navigate(item.route)}
            className="cursor-pointer"
          >
            <MetricCard
              title={item.title}
              value={item.value}
              change={item.change}
              changeType="positive"
              icon={item.icon}
              iconColor={item.iconColor}
              subtitle="vs last month"
            />
          </div>
        ))}
      </motion.div>

      {/* CHARTS & RECENT ACTIVITY SECTION */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Line Chart */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className={`${glassCardStyle} ${glassHoverStyle}`}>
            <CardHeader
              title="Hiring Trends"
              subtitle="Monthly acquisition velocity"
              icon={TrendingUp}
            />
            <div className="mt-6 h-64 w-full relative z-10">
              <LineChart
                data={hiringTrends}
                dataKey="hires"
                xAxisKey="month"
                height={240}
              />
            </div>
          </GlassCard>

          {/* Recent Activity list */}
          <GlassCard className={`${glassCardStyle} ${glassHoverStyle}`}>
            <CardHeader
              title="Workspace Events"
              subtitle="Recent changes in employee roster"
              icon={Activity}
            />
            <div className="mt-4 space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.4)]" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{activity.action}</p>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">{activity.target}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{activity.time}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Donut Distribution Chart & Projects Quick Access */}
        <div className="space-y-6">
          <GlassCard className={`${glassCardStyle} ${glassHoverStyle}`}>
            <CardHeader
              title="Department Headcount"
              subtitle="Employee distribution"
              icon={PieChart}
            />
            <div className="mt-6 min-h-[250px] flex items-center justify-center relative z-10 pb-4">
              <DonutChart
                data={departments}
                height={200}
                innerRadius={55}
                outerRadius={80}
              />
            </div>
          </GlassCard>

          <GlassCard className={`${glassCardStyle} ${glassHoverStyle}`}>
            <CardHeader
              title="Project Status Overview"
              subtitle="Portfolio health & status"
              icon={FolderKanban}
            />
            <div className="mt-6 min-h-[250px] flex items-center justify-center relative z-10 pb-4">
              <DonutChart
                data={projectsDistribution}
                colors={['#f97316', '#3b82f6', '#10b981', '#64748b']}
                height={200}
                innerRadius={55}
                outerRadius={80}
              />
            </div>
          </GlassCard>

          <GlassCard
            onClick={() => navigate('/projects')}
            className={`${glassCardStyle} ${glassHoverStyle} cursor-pointer p-6 relative overflow-hidden group`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  <FolderKanban size={18} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Projects Hub</span>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>

            <h4 className="text-lg font-bold text-slate-900 mb-1">Projects & Team Allocations</h4>
            <p className="text-xs text-slate-600 mb-4">
              Manage client projects, allocate engineers, and track delivery deadlines in real time.
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 text-xs">
              <span className="text-slate-600 font-medium">Explore All Projects</span>
              <span className="text-blue-600 font-bold group-hover:underline">Open Portfolio &rarr;</span>
            </div>
          </GlassCard>
        </div>

      </motion.div>
      </div>
    </div>
  );
}
