import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Device, Zone } from '../../types';
import { useTelemetry } from '../../context/TelemetryContext';
import { useTheme } from '../../context/ThemeContext';
import { Eye, Battery, ShieldAlert, Cpu, Layers, Radio, Sun, Satellite } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MapProps {
  devices: Device[];
  zones?: Zone[];
  heightClass?: string;
}

type MapLayerType = 'TACTICAL' | 'DAYLIGHT' | 'SATELLITE';

// Custom Leaflet DivIcons with pulsing animations for status
const createStatusIcon = (status: string, isSelected: boolean) => {
  let colorClass = 'bg-emerald-500 border-emerald-300 shadow-emerald-500/50';
  let pulseClass = '';

  if (status === 'CRITICAL') {
    colorClass = 'bg-rose-500 border-rose-300 shadow-rose-500/80';
    pulseClass = 'animate-ping';
  } else if (status === 'WARNING') {
    colorClass = 'bg-amber-500 border-amber-300 shadow-amber-500/80';
    pulseClass = 'animate-pulse';
  } else if (status === 'OFFLINE') {
    colorClass = 'bg-slate-500 border-slate-400 shadow-slate-500/20';
  }

  const selectedRing = isSelected ? 'ring-4 ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-[#070C18]' : '';

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="relative flex items-center justify-center">
        ${status === 'CRITICAL' ? `<span class="absolute w-6 h-6 rounded-full bg-rose-500/40 ${pulseClass}"></span>` : ''}
        <span class="w-4 h-4 rounded-full border-2 ${colorClass} shadow-md ${selectedRing}"></span>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
};

// Map Recenter Helper
const RecenterOnSelect: React.FC<{ coords: [number, number] | null }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, map.getZoom(), { animate: true });
    }
  }, [coords, map]);
  return null;
};

export const CampusMap: React.FC<MapProps> = ({ devices, heightClass = 'h-[380px]' }) => {
  const { selectedDevice, setSelectedDevice } = useTelemetry();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('ALL');
  const [layerType, setLayerType] = useState<MapLayerType>('TACTICAL');

  // Campus Center coordinates (Chennai College Campus Ground Anchor)
  const centerCoords: [number, number] = [13.0827, 80.2707];

  const filteredDevices = devices.filter((d) => {
    if (filter === 'ALL') return true;
    return d.status === filter;
  });

  // Effective layer based on selection and theme
  const getTileConfig = () => {
    if (layerType === 'SATELLITE') {
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri &mdash; Earthstar Geographics',
        className: '',
      };
    }
    if (layerType === 'DAYLIGHT' || (!isDark && layerType === 'TACTICAL')) {
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        className: 'sentrix-daylight-tiles',
      };
    }
    // Default Tactical Dark Radar Map (OSM + Tactical Dark Filter with zero watermarks!)
    return {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: 'sentrix-tactical-tiles',
    };
  };

  const tileCfg = getTileConfig();

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl overflow-hidden shadow-xl flex flex-col relative isolate z-0 transition-colors duration-200">
      {/* Map Header & Legend */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-[#1E2D48] flex flex-wrap items-center justify-between gap-3 bg-slate-50/90 dark:bg-[#0B1325]/80">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
            Device Locations
          </h2>
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
            {filteredDevices.length} Nodes
          </span>
        </div>

        {/* Map Layer Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-[#070C18] p-1 rounded-xl border border-slate-300 dark:border-[#1E2D48] text-xs">
          <button
            onClick={() => setLayerType('TACTICAL')}
            title="Tactical Dark Radar Basemap"
            className={`px-2 py-0.5 rounded-lg flex items-center gap-1 font-medium text-[11px] transition-colors ${
              layerType === 'TACTICAL'
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3 h-3 text-cyan-300" />
            <span className="hidden sm:inline">Tactical</span>
          </button>
          <button
            onClick={() => setLayerType('DAYLIGHT')}
            title="Daylight Street Map"
            className={`px-2 py-0.5 rounded-lg flex items-center gap-1 font-medium text-[11px] transition-colors ${
              layerType === 'DAYLIGHT'
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3 h-3 text-amber-300" />
            <span className="hidden sm:inline">Street</span>
          </button>
          <button
            onClick={() => setLayerType('SATELLITE')}
            title="Satellite Imagery"
            className={`px-2 py-0.5 rounded-lg flex items-center gap-1 font-medium text-[11px] transition-colors ${
              layerType === 'SATELLITE'
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Satellite className="w-3 h-3 text-emerald-300" />
            <span className="hidden sm:inline">Satellite</span>
          </button>
        </div>

        {/* Status Filters / Legend */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2 py-0.5 rounded transition-colors ${
              filter === 'ALL'
                ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/40 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('ONLINE')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors ${
              filter === 'ONLINE'
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Online
          </button>
          <button
            onClick={() => setFilter('WARNING')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors ${
              filter === 'WARNING'
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Warning
          </button>
          <button
            onClick={() => setFilter('CRITICAL')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors ${
              filter === 'CRITICAL'
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Critical
          </button>
          <button
            onClick={() => setFilter('OFFLINE')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors ${
              filter === 'OFFLINE'
                ? 'bg-slate-400/20 dark:bg-slate-700/30 text-slate-700 dark:text-slate-400 border border-slate-400/40 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            Offline
          </button>
        </div>
      </div>

      {/* Map Container with strict isolation */}
      <div className={`relative w-full ${heightClass} bg-slate-100 dark:bg-[#070C18] isolate`}>
        <MapContainer
          center={centerCoords}
          zoom={16}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: isDark ? '#070C18' : '#F8FAFC' }}
        >
          {/* Watermark-Free TileLayer (OpenStreetMap with Tactical Dark filter or Clean Street/Satellite) */}
          <TileLayer
            key={`${tileCfg.url}-${tileCfg.className}`}
            attribution={tileCfg.attribution}
            url={tileCfg.url}
            className={tileCfg.className}
          />

          {selectedDevice && (
            <RecenterOnSelect coords={[selectedDevice.latitude, selectedDevice.longitude]} />
          )}

          {filteredDevices.map((dev) => {
            const isSelected = selectedDevice?.id === dev.id;
            return (
              <Marker
                key={dev.id}
                position={[dev.latitude, dev.longitude]}
                icon={createStatusIcon(dev.status, isSelected)}
                eventHandlers={{
                  click: () => setSelectedDevice(dev),
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-3 bg-white dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-[#1E2D48] shadow-2xl min-w-[210px]">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#1E2D48]">
                      <span className="font-bold text-sm font-mono text-slate-900 dark:text-white">{dev.device_id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          dev.status === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : dev.status === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : dev.status === 'OFFLINE'
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {dev.status}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1.5 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Location:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{dev.zone_name || 'Campus'}</span>
                      </div>

                      {dev.status !== 'ONLINE' && (
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Active Condition:</span>
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            {dev.device_id === 'SN-014'
                              ? 'High vibration detected'
                              : dev.device_id === 'SN-007'
                              ? 'Gas concentration surge'
                              : dev.device_id === 'SN-021'
                              ? 'Motion in restricted area'
                              : dev.status === 'OFFLINE'
                              ? 'Telemetry heartbeat timeout'
                              : 'Sensor threshold exceeded'}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-mono">
                          <Battery className="w-3 h-3 text-emerald-500" />
                          {dev.battery}%
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-mono">
                          <Cpu className="w-3 h-3 text-blue-500" />
                          Health: {dev.sensor_health_score}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-[#1E2D48] flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedDevice(dev);
                          navigate(`/devices/${dev.id}`);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Node Telemetry
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
