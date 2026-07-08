import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Files, 
  MessageSquare, 
  Clock, 
  Database, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const StatsCard = ({ label, value, icon: Icon, change, trend }) => (
  <Card className="glass-panel">
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className={cn(
          "flex items-center text-xs font-medium px-2 py-1 rounded-full",
          trend === 'up' ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
        )}>
          {trend === 'up' ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
          {change}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-zinc-400 text-sm font-medium">{label}</h3>
        <p className="text-2xl font-bold mt-1 text-white">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${user?.token || ''}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        const data = await response.json();
        
        const iconMapping = {
          Files: Files,
          MessageSquare: MessageSquare,
          Clock: Clock,
          Database: Database
        };
        
        const mappedStats = data.stats.map(s => ({
          ...s,
          icon: iconMapping[s.icon] || Files
        }));
        
        setStats(mappedStats);
        setChartData(data.chartData);
        setRecentActivity(data.recentActivity);
      } catch (err) {
        console.error('Fetch stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-zinc-400 text-sm">Loading your legal workspace dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Welcome back, {user?.name || 'User'}. Here's what's happening with your legal workspace.</p>
        </div>
        <Button onClick={() => navigate('/dashboard/upload')}>
          <Plus size={18} className="mr-2" />
          Add Documents
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (stat.label && <StatsCard key={i} {...stat} />))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>AI Query Volume</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0a84ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0a84ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#52525b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121214', border: '1px solid #1f1f23', borderRadius: '8px' }}
                  itemStyle={{ color: '#0a84ff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="queries" 
                  stroke="#0a84ff" 
                  fillOpacity={1} 
                  fill="url(#colorQueries)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Document Indexing</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#52525b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#121214', border: '1px solid #1f1f23', borderRadius: '8px' }}
                />
                <Bar dataKey="docs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/library')} className="text-xs">View Library</Button>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-6 text-zinc-500 text-sm">
              No recent activity found. Upload some documents or try searching to see events here.
            </div>
          ) : (
            <div className="space-y-6">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                      {(activity.user || "U").split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-300">
                        <span className="text-white">{activity.user}</span>
                        <span className="text-zinc-500 mx-1">{activity.action}</span>
                        <span className="text-primary font-medium">{activity.target}</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                  <ArrowUpRight size={14} className="text-zinc-500" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
