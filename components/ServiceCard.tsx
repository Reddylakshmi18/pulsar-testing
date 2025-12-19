
import React from 'react';
import { Service, ServiceStatus } from '../types';
import { Activity, ShieldCheck, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import HeartbeatWave from './HeartbeatWave';

interface ServiceCardProps {
  service: Service;
  onClick: (service: Service) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.HEALTHY: return 'text-emerald-400';
      case ServiceStatus.DEGRADED: return 'text-amber-400';
      case ServiceStatus.DOWN: return 'text-rose-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.HEALTHY: return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case ServiceStatus.DEGRADED: return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case ServiceStatus.DOWN: return <Activity className="w-5 h-5 text-rose-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const lastLatency = service.history[service.history.length - 1]?.latency || 0;

  return (
    <div 
      onClick={() => onClick(service)}
      className="group bg-gray-900/40 border border-gray-800 hover:border-emerald-500/50 rounded-xl p-4 transition-all duration-300 cursor-pointer backdrop-blur-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-100 group-hover:text-emerald-400 transition-colors">
            {service.name}
          </h3>
          <p className="text-xs text-gray-500 font-mono truncate max-w-[180px]">
            {service.url}
          </p>
        </div>
        <div className="flex flex-col items-end">
          {getStatusIcon(service.status)}
          <span className={`text-[10px] font-bold uppercase mt-1 ${getStatusColor(service.status)}`}>
            {service.status}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <HeartbeatWave 
          color={service.status === ServiceStatus.DOWN ? "#f43f5e" : "#10b981"} 
          height={60} 
          speed={service.status === ServiceStatus.DOWN ? 0.2 : 2}
        />
      </div>

      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Latency</span>
          <span className={`font-mono font-bold ${lastLatency > 200 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {lastLatency}ms
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-500 hover:text-white transition-colors">
          <span className="text-xs">Detail</span>
          <ExternalLink className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
