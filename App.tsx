
import React, { useState, useEffect, useCallback } from 'react';
import { Service, ServiceStatus, HeartbeatData } from './types';
import ServiceCard from './components/ServiceCard';
import ServiceDetail from './components/ServiceDetail';
import { 
  Activity, 
  Search, 
  LayoutDashboard, 
  Settings, 
  Bell, 
  Plus,
  Globe,
  Database,
  Cloud,
  Box,
  Heart
} from 'lucide-react';

const INITIAL_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Production API Gateway',
    url: 'https://api.pulsar-core.com/v1',
    status: ServiceStatus.HEALTHY,
    lastCheck: Date.now(),
    type: 'api',
    history: Array.from({ length: 20 }, (_, i) => ({
      timestamp: Date.now() - (20 - i) * 10000,
      latency: Math.floor(Math.random() * 50) + 20,
      status: ServiceStatus.HEALTHY
    }))
  },
  {
    id: 's2',
    name: 'Main Database Cluster',
    url: 'db-cluster-node-01.internal',
    status: ServiceStatus.DEGRADED,
    lastCheck: Date.now(),
    type: 'database',
    history: Array.from({ length: 20 }, (_, i) => ({
      timestamp: Date.now() - (20 - i) * 10000,
      latency: Math.floor(Math.random() * 300) + 150,
      status: i > 15 ? ServiceStatus.DEGRADED : ServiceStatus.HEALTHY
    }))
  },
  {
    id: 's3',
    name: 'User Assets CDN',
    url: 'https://assets.pulsar-static.net',
    status: ServiceStatus.HEALTHY,
    lastCheck: Date.now(),
    type: 'cdn',
    history: Array.from({ length: 20 }, (_, i) => ({
      timestamp: Date.now() - (20 - i) * 10000,
      latency: Math.floor(Math.random() * 30) + 10,
      status: ServiceStatus.HEALTHY
    }))
  },
  {
    id: 's4',
    name: 'Auth Microservice',
    url: 'https://auth.internal.service',
    status: ServiceStatus.DOWN,
    lastCheck: Date.now(),
    type: 'microservice',
    history: Array.from({ length: 20 }, (_, i) => ({
      timestamp: Date.now() - (20 - i) * 10000,
      latency: i > 15 ? 0 : Math.floor(Math.random() * 80) + 40,
      status: i > 15 ? ServiceStatus.DOWN : ServiceStatus.HEALTHY
    }))
  }
];

const App: React.FC = () => {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unhealthy'>('all');

  const selectedService = services.find(s => s.id === selectedServiceId);

  // Simulation: Update services with "heartbeats" every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prev => prev.map(service => {
        // Only update if not looking at details for stability, or just random
        const newLatency = service.status === ServiceStatus.DOWN 
          ? 0 
          : Math.floor(Math.random() * (service.type === 'database' ? 200 : 50)) + (service.type === 'database' ? 50 : 10);
        
        const newBeat: HeartbeatData = {
          timestamp: Date.now(),
          latency: newLatency,
          status: service.status
        };

        return {
          ...service,
          history: [...service.history.slice(-29), newBeat],
          lastCheck: Date.now()
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const triggerManualCheck = useCallback((id: string) => {
    setServices(prev => prev.map(s => {
      if (s.id !== id) return s;
      const latency = Math.floor(Math.random() * 100) + 20;
      const newStatus = latency > 90 ? ServiceStatus.DEGRADED : ServiceStatus.HEALTHY;
      return {
        ...s,
        status: newStatus,
        history: [...s.history, { timestamp: Date.now(), latency, status: newStatus }]
      };
    }));
  }, []);

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || s.status !== ServiceStatus.HEALTHY;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 border-r border-gray-800 p-6 space-y-8 h-screen sticky top-0">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Heart className="w-6 h-6 text-white animate-pulse" fill="currentColor" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">PULSAR</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 text-emerald-400 rounded-xl font-medium transition-all">
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl font-medium transition-all">
            <Activity className="w-5 h-5" />
            Global Status
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl font-medium transition-all">
            <Bell className="w-5 h-5" />
            Alerts
            <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl font-medium transition-all">
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>

        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-4 rounded-xl border border-emerald-500/20">
          <p className="text-xs text-gray-400 mb-2">PRO PLAN</p>
          <p className="text-sm font-bold text-emerald-100">AI Diagnostics Active</p>
          <div className="mt-3 w-full bg-gray-800 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-2/3" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Monitor</h1>
            <p className="text-gray-500">Real-time heartbeat analysis for critical infrastructure.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Filter services..." 
                  className="bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 md:px-4 md:py-2 rounded-lg font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline">Add Service</span>
             </button>
          </div>
        </header>

        {/* Global Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Uptime', value: '99.98%', color: 'text-emerald-400', icon: ShieldCheckIcon },
            { label: 'Latency Avg', value: '42ms', color: 'text-sky-400', icon: ZapIcon },
            { label: 'Incidents', value: '1', color: 'text-rose-400', icon: AlertIcon },
            { label: 'Nodes', value: '42', color: 'text-gray-400', icon: BoxIcon }
          ].map((stat, i) => (
            <div key={i} className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-gray-500 font-bold uppercase">{stat.label}</span>
              </div>
              <p className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-800 mb-6">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-3 text-sm font-medium transition-all relative ${activeTab === 'all' ? 'text-emerald-400' : 'text-gray-500 hover:text-white'}`}
          >
            All Services
            {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />}
          </button>
          <button 
            onClick={() => setActiveTab('unhealthy')}
            className={`px-4 py-3 text-sm font-medium transition-all relative ${activeTab === 'unhealthy' ? 'text-rose-400' : 'text-gray-500 hover:text-white'}`}
          >
            Unhealthy
            <span className="ml-2 bg-rose-500/20 text-rose-500 px-1.5 py-0.5 rounded text-[10px]">
              {services.filter(s => s.status !== ServiceStatus.HEALTHY).length}
            </span>
            {activeTab === 'unhealthy' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-400" />}
          </button>
        </div>

        {/* Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                onClick={(s) => setSelectedServiceId(s.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500 space-y-4">
            <Search className="w-12 h-12 opacity-20" />
            <p>No services found matching your criteria.</p>
          </div>
        )}

        {/* Detailed Modal */}
        {selectedService && (
          <ServiceDetail 
            service={selectedService} 
            onClose={() => setSelectedServiceId(null)}
            onRefresh={triggerManualCheck}
          />
        )}
      </main>

      {/* Floating Status Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-gray-950 border-t border-gray-800 z-40 flex justify-around">
         <LayoutDashboard className="w-6 h-6 text-emerald-400" />
         <Bell className="w-6 h-6 text-gray-500" />
         <Settings className="w-6 h-6 text-gray-500" />
      </div>
    </div>
  );
};

// Internal minimal icon components for the dashboard bar
const ShieldCheckIcon = (props: any) => <Globe {...props} />;
const ZapIcon = (props: any) => <Zap {...props} />;
const AlertIcon = (props: any) => <AlertTriangle {...props} />;
const BoxIcon = (props: any) => <Box {...props} />;

const Zap = (props: any) => <Activity {...props} />;
const AlertTriangle = (props: any) => <Activity {...props} />;

export default App;
