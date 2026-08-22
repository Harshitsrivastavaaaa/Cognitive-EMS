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

// Simplified Glass Theme
const glassCardStyle = "bg-white/80 border border-slate-200 shadow-sm backdrop-blur-lg rounded-2xl";
const glassHoverStyle = "hover:border-blue-400/50 hover:shadow-md transition-all duration-300";

// Simplified animation (Staggered children instead of multiple individual triggers)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function DashboardPage() {
  const { user: authUser } = useAuth();
  const userName = authUser?.firstName || authUser?.first_name || "Harshit";
  const navigate = useNavigate();

  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [loading, setLoading] = useState(true);

  // State
  const [metrics, setMetrics] = useState({});
  const [hiringTrends, setHiringTrends] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projectsDistribution, setProjectsDistribution] = useState([]);
  const [activities, setActivities] = useState([]);

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

      // Assign fetched data or fallback defaults
      setMetrics(metricsData || {
        total_employees: 142, open_positions: 12, pending_reviews: 5, new_hires_this_month: 8
      });

      setHiringTrends(trendsData?.length ? trendsData.map(t => ({ month: t.month, hires: t.new_hires ?? t.hires ?? 0 })) : [
        { month: "Jan", hires: 10 }, { month: "Feb", hires: 15 }, { month: "Mar", hires: 25 }, { month: "Apr", hires: 18 }
      ]);

      setDepartments(deptsData?.length ? deptsData : [
        { name: "Engineering", value: 45 }, { name: "Sales", value: 30 }, { name: "Design", value: 15 }, { name: "HR", value: 10 }
      ]);

      setProjectsDistribution(projectsDistData?.length ? projectsDistData : [
        { name: "Active", value: 2 }, { name: "Planning", value: 1 }, { name: "Completed", value: 0 }, { name: "On Hold", value: 0 }
      ]);

      setActivities(activitiesData?.length ? activitiesData.slice(0, 5).map((act, i) => ({
        id: act.id || i,
        action: act.description || act.action || "Activity logged",
        time: act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
        target: act.type === 'employee' ? 'Employee Dir' : 'System'
      })) : [
        { id: 1, action: "System Initialized", time: "Just now", target: "Developer Node" },
        { id: 2, action: "Record Updated: Sarah Jenkins", time: "2 hrs ago", target: "Engineering" },
        { id: 3, action: "New Entry added: Alex Rivera", time: "4 hrs ago", target: "Operations" }
      ]);

    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    setGreeting(hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening");
    setCurrentDate(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="w-full h-full p-6 lg:p-10 animate-pulse text-slate-900">
        <div className="h-8 bg-slate-200 rounded w-64 mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="w-full h-full p-6 lg:p-10 text-slate-900"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* HEADER */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs font-semibold">
            <Calendar size={14} className="text-blue-600" />
            <span>{currentDate}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            {greeting}, <span className="text-blue-600">{userName}</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1">System health, headcount summaries, and administrative control.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/leave-management')}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Calendar size={16} /> Leave Approvals
          </button>
          <a
            href="http://localhost:8000/api/v1/employees/export/excel"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <Upload size={16} /> Export Data
          </a>
        </div>
      </motion.div>

      {/* STATS METRICS GRID */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Employees", value: metrics.total_employees, change: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Active Positions", value: metrics.open_positions, change: "+5", icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" },
          { title: "Pending Actions", value: metrics.pending_reviews, change: "-3", icon: ClipboardCheck, color: "text-teal-600", bg: "bg-teal-50" },
          { title: "New Hires", value: metrics.new_hires_this_month, change: "+8", icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-50" }
        ].map((item, idx) => (
          <div key={idx} onClick={() => navigate('/employees')} className="cursor-pointer">
            <GlassCard className={`${glassCardStyle} ${glassHoverStyle} p-5`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                  <item.icon size={20} />
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{item.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{item.value}</h3>
              <p className="text-sm text-slate-500 font-medium">{item.title}</p>
            </GlassCard>
          </div>
        ))}
      </motion.div>

      {/* CHARTS & RECENT ACTIVITY SECTION */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Charts & Activity) */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className={glassCardStyle}>
            <CardHeader title="Hiring Trends" subtitle="Monthly acquisition velocity" icon={TrendingUp} />
            <div className="mt-6 h-64 w-full">
              <LineChart data={hiringTrends} dataKey="hires" xAxisKey="month" height={240} />
            </div>
          </GlassCard>

          <GlassCard className={glassCardStyle}>
            <CardHeader title="Workspace Events" subtitle="Recent changes in employee roster" icon={Activity} />
            <div className="mt-4 space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{activity.action}</p>
                      <span className="text-xs text-slate-500 uppercase tracking-wider">{activity.target}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{activity.time}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column (Donuts & Projects) */}
        <div className="space-y-6">
          <GlassCard className={glassCardStyle}>
            <CardHeader title="Department Headcount" subtitle="Employee distribution" icon={PieChart} />
            <div className="mt-6 flex justify-center pb-4">
              <DonutChart data={departments} height={200} innerRadius={55} outerRadius={80} />
            </div>
          </GlassCard>

          <GlassCard className={glassCardStyle}>
            <CardHeader title="Project Status" subtitle="Portfolio health" icon={FolderKanban} />
            <div className="mt-6 flex justify-center pb-4">
              <DonutChart data={projectsDistribution} colors={['#f97316', '#3b82f6', '#10b981', '#64748b']} height={200} innerRadius={55} outerRadius={80} />
            </div>
          </GlassCard>

          <GlassCard 
            onClick={() => navigate('/projects')}
            className={`${glassCardStyle} ${glassHoverStyle} cursor-pointer p-6 group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-orange-50 text-orange-600"><FolderKanban size={18} /></span>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Projects Hub</span>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="text-lg font-bold mb-1">Projects & Allocations</h4>
            <p className="text-sm text-slate-600 mb-4">Manage client projects, allocate engineers, and track deadlines.</p>
            <div className="flex justify-between pt-4 border-t border-slate-100 text-sm">
              <span className="text-slate-600">Explore Projects</span>
              <span className="text-blue-600 font-semibold group-hover:underline">Open Portfolio &rarr;</span>
            </div>
          </GlassCard>
        </div>

      </motion.div>
    </motion.div>
  );
}