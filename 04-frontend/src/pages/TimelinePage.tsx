import { useState, useEffect } from 'react';
import {
  fetchTimelineEvents,
  fetchEventCategories,
  fetchImportanceLevels,
  fetchPopulationData,
  fetchLandValuationData,
  fetchTradeData,
} from '../services/api';
import type { TimelineEvent, CategoryCount, ImportanceLevelCount, PopulationRecord, LandValuationRecord, TradeRecord } from '../types';

// Category colors (Airbnb Rausch palette)
const CATEGORY_COLORS: Record<string, string> = {
  '外交': 'bg-purple-500',
  '租界区域': 'bg-pink-500',
  '文化': 'bg-indigo-500',
  '市政': 'bg-blue-500',
  '行政': 'bg-cyan-500',
  '海关': 'bg-teal-500',
  '宗教': 'bg-green-500',
  '交通': 'bg-emerald-500',
  '金融业': 'bg-yellow-500',
  '教育': 'bg-amber-500',
  '娱乐': 'bg-orange-500',
  '战争': 'bg-red-500',
  '工商业': 'bg-rose-500',
  '建筑': 'bg-fuchsia-500',
  '政治': 'bg-violet-500',
  '其他': 'bg-gray-500',
};

const CATEGORY_TEXT_COLORS: Record<string, string> = {
  '外交': 'text-purple-500',
  '租界区域': 'text-pink-500',
  '文化': 'text-indigo-500',
  '市政': 'text-blue-500',
  '行政': 'text-cyan-500',
  '海关': 'text-teal-500',
  '宗教': 'text-green-500',
  '交通': 'text-emerald-500',
  '金融业': 'text-yellow-600',
  '教育': 'text-amber-600',
  '娱乐': 'text-orange-500',
  '战争': 'text-red-500',
  '工商业': 'text-rose-500',
  '建筑': 'text-fuchsia-500',
  '政治': 'text-violet-500',
  '其他': 'text-gray-500',
};

// Importance level colors
const IMPORTANCE_COLORS: Record<string, { bg: string; text: string }> = {
  '1': { bg: 'bg-red-100', text: 'text-red-700' },
  '2': { bg: 'bg-orange-100', text: 'text-orange-700' },
  '3': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  '4': { bg: 'bg-green-100', text: 'text-green-700' },
};

// Trend Chart Component
function TrendChart({ data, title, dataKey, color }: { data: any[]; title: string; dataKey: string; color: string }) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d[dataKey]));
  const minYear = Math.min(...data.map(d => parseInt(d.year)));
  const maxYear = Math.max(...data.map(d => parseInt(d.year)));
  const yearRange = maxYear - minYear || 1;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="relative h-24">
        <svg className="w-full h-full" viewBox={`0 0 ${yearRange * 10} 100`} preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={data.map((d) => {
              const x = ((parseInt(d.year) - minYear) / yearRange) * yearRange * 10;
              const y = 100 - (d[dataKey] / maxValue) * 90;
              return `${x},${y}`;
            }).join(' ')}
          />
        </svg>
        <div className="absolute bottom-0 left-0 text-xs text-gray-400">{minYear}</div>
        <div className="absolute bottom-0 right-0 text-xs text-gray-400">{maxYear}</div>
      </div>
    </div>
  );
}

// Event Detail Modal
function EventDetailModal({ event, onClose }: { event: TimelineEvent; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const colorClass = CATEGORY_COLORS[event.eventCategory] || 'bg-gray-500';
  const importanceStyle = IMPORTANCE_COLORS[event.eventImportance] || IMPORTANCE_COLORS['4'];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <span className={`${colorClass} text-white text-xs px-3 py-1 rounded-full font-medium`}>
              {event.eventCategory}
            </span>
            <span className={`${importanceStyle.bg} ${importanceStyle.text} text-xs px-3 py-1 rounded-full font-medium`}>
              {event.eventImportance === '1' ? '一级' : event.eventImportance === '2' ? '二级' : event.eventImportance === '3' ? '三级' : '四级'}
            </span>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 pr-12">
            {event.eventName || '未命名事件'}
          </h2>
          <p className="text-2xl font-bold text-pink-500 mt-2">
            {event.eventYear}年{event.eventDate && ` · ${event.eventDate}`}
          </p>
        </div>
        
        <div className="p-6 pt-4">
          {event.reignTitle && (
            <div className="mb-4">
              <span className="text-sm text-gray-500">朝代/时期</span>
              <p className="text-gray-900">{event.reignTitle}</p>
            </div>
          )}
          
          {event.eventDescription && (
            <div className="mb-4">
              <span className="text-sm text-gray-500">事件描述</span>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.eventDescription}</p>
            </div>
          )}
          
          {event.eventSubCategory && (
            <div className="mb-4">
              <span className="text-sm text-gray-500">子类别</span>
              <p className="text-gray-900">{event.eventSubCategory}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Timeline Event Item
function TimelineEventItem({ event, onClick }: { event: TimelineEvent; onClick: () => void }) {
  const colorClass = CATEGORY_COLORS[event.eventCategory] || 'bg-gray-500';
  const textColorClass = CATEGORY_TEXT_COLORS[event.eventCategory] || 'text-gray-500';

  return (
    <div
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      {/* Timeline dot */}
      <div className={`absolute left-0 top-3 w-4 h-4 rounded-full ${colorClass} shadow-md group-hover:scale-125 transition-transform`} />
      
      {/* Event content */}
      <div className="ml-8 pb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-gray-900">{event.eventYear}</span>
          {event.eventDate && (
            <span className="text-xs text-gray-500">{event.eventDate}</span>
          )}
        </div>
        <p className={`text-sm font-medium ${textColorClass} group-hover:underline truncate max-w-[200px]`}>
          {event.eventName || event.eventDescription?.substring(0, 30) + '...'}
        </p>
      </div>
    </div>
  );
}

// Main Timeline Page
export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [importanceLevels, setImportanceLevels] = useState<ImportanceLevelCount[]>([]);
  const [populationData, setPopulationData] = useState<PopulationRecord[]>([]);
  const [landValuationData, setLandValuationData] = useState<LandValuationRecord[]>([]);
  const [tradeData, setTradeData] = useState<TradeRecord[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedImportance, setSelectedImportance] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [yearRange, setYearRange] = useState({ min: '1842', max: '1949' });
  const [activeTab, setActiveTab] = useState<'population' | 'land' | 'trade'>('population');

  // Load initial data
  useEffect(() => {
    Promise.all([
      fetchEventCategories(),
      fetchImportanceLevels(),
      fetchPopulationData(),
      fetchLandValuationData(),
      fetchTradeData(),
    ]).then(([cats, levels, pop, land, trade]) => {
      setCategories(cats);
      setImportanceLevels(levels);
      setPopulationData(pop);
      setLandValuationData(land);
      setTradeData(trade);
    });
  }, []);

  // Load events when filters change
  useEffect(() => {
    setLoading(true);
    const filters: { categories?: string; importanceLevels?: string } = {};
    if (selectedCategories.length > 0) {
      filters.categories = selectedCategories.join(',');
    }
    if (selectedImportance.length > 0) {
      filters.importanceLevels = selectedImportance.join(',');
    }
    
    fetchTimelineEvents(filters).then((data) => {
      setEvents(data.events);
      setYearRange(data.yearRange);
      setLoading(false);
    });
  }, [selectedCategories, selectedImportance]);

  // Group events by year
  const eventsByYear = events.reduce((acc, event) => {
    const year = event.eventYear;
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  const years = Object.keys(eventsByYear).sort();

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Toggle importance selection
  const toggleImportance = (level: string) => {
    setSelectedImportance(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">📜 历史事件时间轴</h1>
        <p className="text-sm text-gray-500 mt-1">
          共 {events.length} 个事件 · {yearRange.min}年 - {yearRange.max}年
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Trend Charts Section */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-800">📊 趋势图表</h2>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setActiveTab('population')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'population'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                人口数据
              </button>
              <button
                onClick={() => setActiveTab('land')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'land'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                土地估值
              </button>
              <button
                onClick={() => setActiveTab('trade')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'trade'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                贸易数据
              </button>
            </div>
          </div>

          {activeTab === 'population' && (
            <div className="grid grid-cols-3 gap-4">
              {['公共租界', '华界', '法租界'].map((loc) => {
                const locData = populationData.filter(d => d.locationName === loc);
                return locData.length > 0 ? (
                  <TrendChart
                    key={loc}
                    data={locData}
                    title={loc}
                    dataKey="value"
                    color="#FF385C"
                  />
                ) : null;
              })}
              {populationData.length === 0 && (
                <p className="text-gray-400 text-sm col-span-3 text-center py-4">暂无数据</p>
              )}
            </div>
          )}

          {activeTab === 'land' && (
            <div className="grid grid-cols-3 gap-4">
              {['公共租界', '英租界', '法租界'].map((loc) => {
                const locData = landValuationData.filter(d => d.locationName === loc);
                return locData.length > 0 ? (
                  <TrendChart
                    key={loc}
                    data={locData}
                    title={loc}
                    dataKey="value"
                    color="#00A699"
                  />
                ) : null;
              })}
              {landValuationData.length === 0 && (
                <p className="text-gray-400 text-sm col-span-3 text-center py-4">暂无数据</p>
              )}
            </div>
          )}

          {activeTab === 'trade' && (
            <div className="grid grid-cols-3 gap-4">
              <TrendChart
                data={tradeData}
                title="进口占比"
                dataKey="importsRatio"
                color="#FF385C"
              />
              <TrendChart
                data={tradeData}
                title="出口占比"
                dataKey="exportsRatio"
                color="#00A699"
              />
              <TrendChart
                data={tradeData}
                title="贸易总额占比"
                dataKey="tradeRatio"
                color="#FC642D"
              />
              {tradeData.length === 0 && (
                <p className="text-gray-400 text-sm col-span-3 text-center py-4">暂无数据</p>
              )}
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-start gap-8">
            {/* Category Filter */}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-700 mb-2">类别筛选</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => toggleCategory(cat.category)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedCategories.includes(cat.category)
                        ? `${CATEGORY_COLORS[cat.category] || 'bg-gray-500'} text-white shadow-md`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.category} ({cat.count})
                  </button>
                ))}
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-900 text-white hover:bg-gray-800"
                  >
                    清除
                  </button>
                )}
              </div>
            </div>

            {/* Importance Filter */}
            <div className="w-64">
              <h3 className="text-sm font-medium text-gray-700 mb-2">重要级别</h3>
              <div className="flex flex-wrap gap-2">
                {importanceLevels.map((level) => (
                  <button
                    key={level.level}
                    onClick={() => toggleImportance(level.level)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedImportance.includes(level.level)
                        ? level.level === '1' ? 'bg-red-500 text-white'
                          : level.level === '2' ? 'bg-orange-500 text-white'
                          : level.level === '3' ? 'bg-yellow-500 text-white'
                          : 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {level.label} ({level.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">暂无匹配的事件</p>
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedImportance([]);
                }}
                className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-full text-sm hover:bg-pink-600 transition-colors"
              >
                清除筛选
              </button>
            </div>
          ) : (
            <div className="relative pl-6">
              {/* Vertical timeline line */}
              <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-gray-200" />
              
              {/* Events by year */}
              {years.map((year) => (
                <div key={year} className="mb-8">
                  {/* Year header */}
                  <div className="relative mb-4">
                    <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-pink-500 shadow-md" />
                    <h3 className="text-xl font-bold text-gray-900 ml-2">{year}年</h3>
                    <span className="ml-2 text-sm text-gray-400">
                      ({eventsByYear[year].length} 个事件)
                    </span>
                  </div>
                  
                  {/* Events for this year */}
                  <div className="pl-4 border-l-2 border-gray-100 ml-1.5">
                    {eventsByYear[year].map((event) => (
                      <TimelineEventItem
                        key={event.eventId}
                        event={event}
                        onClick={() => setSelectedEvent(event)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}