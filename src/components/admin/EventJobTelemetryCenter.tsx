import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Layers,
  Search,
  Server,
  Terminal,
  RefreshCw,
  Cpu,
  Mail,
  ShieldCheck,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

interface DomainEventItem {
  id: string;
  eventName: string;
  aggregateType: string;
  aggregateId: string;
  payload: any;
  metadata?: any;
  idempotencyKey: string;
  status: string;
  createdAt: string;
}

interface BackgroundJobItem {
  id: string;
  queueName: string;
  jobType: string;
  payload: any;
  idempotencyKey: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'dead_letter';
  priority: number;
  attempts: number;
  maxAttempts: number;
  backoffMs: number;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  errorMessage?: string;
  stackTrace?: string;
  createdAt: string;
}

interface QueueStats {
  queued: number;
  running: number;
  completed: number;
  failed: number;
  deadLetter: number;
  totalEventsPublished: number;
  avgDurationMs: number;
  activeWorkersCount: number;
  queues: Record<string, {
    queued: number;
    running: number;
    completed: number;
    deadLetter: number;
  }>;
}

export const EventJobTelemetryCenter: React.FC = () => {
  const { authToken, showToast } = useMarketplace();
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [events, setEvents] = useState<DomainEventItem[]>([]);
  const [jobs, setJobs] = useState<BackgroundJobItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'queues' | 'events' | 'jobs' | 'trigger'>('queues');
  
  // Filters
  const [eventFilter, setEventFilter] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<DomainEventItem | null>(null);
  const [selectedJob, setSelectedJob] = useState<BackgroundJobItem | null>(null);

  // Test Event Form State
  const [testEventName, setTestEventName] = useState('order.created');
  const [testAggregateId, setTestAggregateId] = useState('ord-test-999');
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchTelemetry = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const [statsRes, eventsRes, jobsRes] = await Promise.all([
        fetch('/api/jobs/stats', { headers }),
        fetch('/api/events?limit=40', { headers }),
        fetch('/api/jobs?limit=50', { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (jobsRes.ok) setJobs(await jobsRes.json());
    } catch (err) {
      console.error('Failed to load event telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3500);
    return () => clearInterval(interval);
  }, [authToken]);

  const handleRetryJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        showToast('تمت جدولة المهمة لإعادة التشغيل بنجاح', 'success');
        fetchTelemetry();
      } else {
        const data = await res.json();
        showToast(data.error || 'فشلت إعادة الجدولة', 'error');
      }
    } catch (e) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const handleRetryAllDeadLetters = async () => {
    try {
      const res = await fetch('/api/jobs/retry-all-dead-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'تمت إعادة تشغيل كافة مهام الطابور الميت', 'success');
        fetchTelemetry();
      } else {
        showToast(data.error || 'فشلت إعادة الجدولة الجماعية', 'error');
      }
    } catch (e) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const handlePublishTestEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    try {
      const res = await fetch('/api/events/test-publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          eventName: testEventName,
          aggregateType: testEventName.split('.')[0] || 'custom',
          aggregateId: testAggregateId || `agg-${Date.now()}`,
          payload: {
            orderId: testAggregateId,
            customerName: 'تجربة التحقق من الأحداث',
            customerPhone: '01099887766',
            totalAmountEGP: 1250,
            subOrders: [
              { id: `sub-${Date.now()}`, sellerId: 'seller-01', commissionEGP: 125 }
            ],
            testMode: true,
            dispatchedAt: new Date().toISOString()
          }
        })
      });

      if (res.ok) {
        showToast('تم نشر الحدث وإرساله لطوابير المهام الخلفية بنجاح!', 'success');
        fetchTelemetry();
        setActiveSubTab('events');
      } else {
        const err = await res.json();
        showToast(err.error || 'فشل نشر الحدث', 'error');
      }
    } catch (e) {
      showToast('خطأ في نشر الحدث', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const filteredEvents = events.filter(e => 
    e.eventName.toLowerCase().includes(eventFilter.toLowerCase()) ||
    e.aggregateId.toLowerCase().includes(eventFilter.toLowerCase())
  );

  const filteredJobs = jobs.filter(j => 
    jobStatusFilter ? j.status === jobStatusFilter : true
  );

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#D9D2C7] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#800020]">
            <Zap className="w-5 h-5 animate-pulse" />
            <span className="font-bold text-sm tracking-wide">TIER 08: EVENT-DRIVEN & BACKGROUND WORKERS</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mt-1 font-amiri">
            مركز القيادة: ناقل الأحداث ومحرك المهام الخلفية
          </h2>
          <p className="text-[#666] text-sm mt-0.5">
            فصل العمليات الجانبية (الإشعارات، رسائل SMS المصرية، فهرسة البحث، وتجميع الإحصائيات) في مهام غير متزامنة موثوقة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTelemetry}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D9D2C7] hover:border-[#800020] text-[#1A1A1A] rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#800020]' : ''}`} />
            تحديث فوري
          </button>
          
          {stats && stats.deadLetter > 0 && (
            <button
              onClick={handleRetryAllDeadLetters}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
            >
              <RotateCw className="w-4 h-4" />
              إعادة تشغيل المهام الميتة ({stats.deadLetter})
            </button>
          )}
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#666] mb-1 font-medium">
            <span>إجمالي الأحداث</span>
            <Activity className="w-4 h-4 text-[#800020]" />
          </div>
          <div className="text-2xl font-bold text-[#1A1A1A]">
            {stats?.totalEventsPublished ?? 0}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Outbox Event Log
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#666] mb-1 font-medium">
            <span>المهام المكتملة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {stats?.completed ?? 0}
          </div>
          <div className="text-[11px] text-[#666] mt-1">
            متوسط المعالجة: {stats?.avgDurationMs ?? 0}ms
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#666] mb-1 font-medium">
            <span>المهام قيد الانتظار</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">
            {stats?.queued ?? 0}
          </div>
          <div className="text-[11px] text-[#666] mt-1">
            قيد التشغيل: {stats?.running ?? 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#666] mb-1 font-medium">
            <span>الطابور الميت (DLQ)</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700">
            {stats?.deadLetter ?? 0}
          </div>
          <div className="text-[11px] text-[#666] mt-1">
            Max Retries Exceeded
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#666] mb-1 font-medium">
            <span>العمال النشطون</span>
            <Cpu className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {stats?.activeWorkersCount ?? 0} / 4
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            Async Worker Pool
          </div>
        </div>

      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex gap-2 border-b border-[#E5E0D8] pb-2">
        <button
          onClick={() => setActiveSubTab('queues')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeSubTab === 'queues'
              ? 'bg-[#800020] text-white shadow-sm'
              : 'text-[#666] hover:text-[#1A1A1A] hover:bg-[#FAF7F2]'
          }`}
        >
          <Layers className="w-4 h-4" />
          طوابير المعالجة (Queues)
        </button>

        <button
          onClick={() => setActiveSubTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeSubTab === 'events'
              ? 'bg-[#800020] text-white shadow-sm'
              : 'text-[#666] hover:text-[#1A1A1A] hover:bg-[#FAF7F2]'
          }`}
        >
          <Activity className="w-4 h-4" />
          سجل أحداث النظام ({events.length})
        </button>

        <button
          onClick={() => setActiveSubTab('jobs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeSubTab === 'jobs'
              ? 'bg-[#800020] text-white shadow-sm'
              : 'text-[#666] hover:text-[#1A1A1A] hover:bg-[#FAF7F2]'
          }`}
        >
          <Server className="w-4 h-4" />
          المهام الخلفية والمحاولات ({jobs.length})
        </button>

        <button
          onClick={() => setActiveSubTab('trigger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeSubTab === 'trigger'
              ? 'bg-[#800020] text-white shadow-sm'
              : 'text-[#666] hover:text-[#1A1A1A] hover:bg-[#FAF7F2]'
          }`}
        >
          <Send className="w-4 h-4" />
          اختبار إطلاق حدث تجريبي
        </button>
      </div>

      {/* 1. QUEUES OVERVIEW */}
      {activeSubTab === 'queues' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(stats.queues).map(([queueName, stat]) => {
            const qStat = stat as { queued: number; running: number; completed: number; deadLetter: number };
            const getIcon = () => {
              switch (queueName) {
                case 'notifications': return <Mail className="w-5 h-5 text-blue-600" />;
                case 'communication': return <Send className="w-5 h-5 text-emerald-600" />;
                case 'search_indexing': return <Search className="w-5 h-5 text-amber-600" />;
                case 'analytics': return <TrendingUp className="w-5 h-5 text-purple-600" />;
                default: return <ShieldCheck className="w-5 h-5 text-gray-600" />;
              }
            };

            const getQueueTitleAr = (name: string) => {
              switch (name) {
                case 'notifications': return 'طابور الإشعارات (SMS / Push)';
                case 'communication': return 'طابور المدفوعات والرسائل الفورية';
                case 'search_indexing': return 'طابور الفهرسة ومحرك البحث';
                case 'analytics': return 'طابور الإحصائيات وحسابات GMV';
                case 'integrations': return 'طابور الربط الخارجي وشركات الشحن';
                default: return name;
              }
            };

            return (
              <div key={queueName} className="bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#D9D2C7]">
                      {getIcon()}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1A1A1A] text-sm">{getQueueTitleAr(queueName)}</h4>
                      <span className="text-xs text-[#888] font-mono">{queueName}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F0ECE6] text-center">
                  <div className="bg-[#FAF7F2] p-2 rounded-xl">
                    <div className="text-xs text-[#888]">بالانتظار</div>
                    <div className="font-bold text-sm text-[#1A1A1A]">{qStat.queued}</div>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-xl">
                    <div className="text-xs text-emerald-700">مكتملة</div>
                    <div className="font-bold text-sm text-emerald-700">{qStat.completed}</div>
                  </div>
                  <div className="bg-red-50 p-2 rounded-xl">
                    <div className="text-xs text-red-700">ميتة (DLQ)</div>
                    <div className="font-bold text-sm text-red-700">{qStat.deadLetter}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. DOMAIN EVENTS LOG */}
      {activeSubTab === 'events' && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E5E0D8] flex items-center justify-between gap-4 bg-[#FAF7F2]">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute right-3 top-3 text-[#888]" />
              <input
                type="text"
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                placeholder="تصفية حسب نوع الحدث أو المعرف..."
                className="w-full pl-3 pr-9 py-1.5 text-sm bg-white border border-[#D9D2C7] rounded-xl focus:outline-none focus:border-[#800020]"
              />
            </div>
            <span className="text-xs text-[#888]">
              يعرض أحدث {filteredEvents.length} حدث مسجل في قاعدة البيانات
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#F6F3EE] text-[#666] font-semibold border-b border-[#E5E0D8]">
                <tr>
                  <th className="p-3">معرف الحدث</th>
                  <th className="p-3">اسم الحدث (Event)</th>
                  <th className="p-3">الكيان (Aggregate)</th>
                  <th className="p-3">مفتاح المطابقة (Idempotency)</th>
                  <th className="p-3">التوقيت</th>
                  <th className="p-3 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8]">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-[#FAF7F2] transition-colors font-mono">
                    <td className="p-3 text-purple-700 font-medium">{evt.id}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold">
                        {evt.eventName}
                      </span>
                    </td>
                    <td className="p-3 text-[#1A1A1A]">{evt.aggregateType} #{evt.aggregateId}</td>
                    <td className="p-3 text-[#888] truncate max-w-[150px]">{evt.idempotencyKey}</td>
                    <td className="p-3 text-[#666] font-sans">
                      {new Date(evt.createdAt).toLocaleTimeString('ar-EG')}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="px-3 py-1 bg-white border border-[#D9D2C7] hover:border-[#800020] text-[#1A1A1A] rounded-lg text-xs transition-colors font-sans"
                      >
                        عرض الحمولة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. BACKGROUND JOBS LOG */}
      {activeSubTab === 'jobs' && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E5E0D8] flex items-center justify-between gap-4 bg-[#FAF7F2]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#666] font-medium">الحالة:</span>
              {['', 'completed', 'queued', 'running', 'dead_letter'].map((st) => (
                <button
                  key={st}
                  onClick={() => setJobStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    jobStatusFilter === st
                      ? 'bg-[#800020] text-white'
                      : 'bg-white border border-[#D9D2C7] text-[#666] hover:bg-gray-50'
                  }`}
                >
                  {st === '' ? 'الكل' : st}
                </button>
              ))}
            </div>
            <span className="text-xs text-[#888]">
              {filteredJobs.length} مهمة خلفية
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#F6F3EE] text-[#666] font-semibold border-b border-[#E5E0D8]">
                <tr>
                  <th className="p-3">معرف المهمة</th>
                  <th className="p-3">الطابور / نوع المهمة</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">المحاولات</th>
                  <th className="p-3">الأولوية</th>
                  <th className="p-3">تاريخ الجدولة</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8]">
                {filteredJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="p-3 font-mono text-purple-700">{j.id}</td>
                    <td className="p-3">
                      <div className="font-bold text-[#1A1A1A]">{j.jobType}</div>
                      <div className="text-[11px] text-[#888] font-mono">{j.queueName}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        j.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : j.status === 'running'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                          : j.status === 'dead_letter'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      {j.attempts} / {j.maxAttempts}
                    </td>
                    <td className="p-3">{j.priority}</td>
                    <td className="p-3 text-[#666]">
                      {new Date(j.scheduledAt).toLocaleTimeString('ar-EG')}
                    </td>
                    <td className="p-3 text-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => setSelectedJob(j)}
                        className="px-2.5 py-1 bg-white border border-[#D9D2C7] hover:border-[#800020] text-[#1A1A1A] rounded-lg text-xs transition-colors"
                      >
                        التفاصيل
                      </button>
                      {(j.status === 'failed' || j.status === 'dead_letter') && (
                        <button
                          onClick={() => handleRetryJob(j.id)}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs transition-colors"
                        >
                          إعادة تشغيل
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TEST EVENT PUBLISHER */}
      {activeSubTab === 'trigger' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-sm max-w-xl mx-auto space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <Send className="w-5 h-5 text-[#800020]" />
              إطلاق حدث نظام تجريبي (Simulate Domain Event)
            </h3>
            <p className="text-xs text-[#666] mt-1">
              اختبر رد فعل ناقل الأحداث (EventBus) والمحرك الخلفي في معالجة الإشعارات وتحديث الإحصائيات بصورة غير متزامنة
            </p>
          </div>

          <form onSubmit={handlePublishTestEvent} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-[#666] mb-1">نوع الحدث (Domain Event Name)</label>
              <select
                value={testEventName}
                onChange={(e) => setTestEventName(e.target.value)}
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#D9D2C7] rounded-xl focus:outline-none focus:border-[#800020]"
              >
                <option value="order.created">order.created (إنشاء طلب جديد)</option>
                <option value="payment.confirmed">payment.confirmed (تأكيد سداد فوري/بطاقة)</option>
                <option value="shipment.updated">shipment.updated (تحديث شحنة دسوق إكسبريس)</option>
                <option value="kyc.reviewed">kyc.reviewed (قرار اعتماد وثيقة تاجر)</option>
                <option value="dispute.resolved">dispute.resolved (تسوية نزاع حماية المستهلك)</option>
                <option value="product.created">product.created (إضافة منتج محلي)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#666] mb-1">معرف الكيان (Aggregate ID)</label>
              <input
                type="text"
                value={testAggregateId}
                onChange={(e) => setTestAggregateId(e.target.value)}
                placeholder="ord-1002 أو kyc-999"
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#D9D2C7] rounded-xl focus:outline-none focus:border-[#800020] font-mono text-sm"
              />
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-xl text-xs text-[#666] space-y-1">
              <span className="font-semibold block text-[#1A1A1A]">ماذا سيحدث عند الضغط؟</span>
              <p>1. كتابة الحدث فوراً في جدول <code className="text-[#800020]">domain_events</code> بضمانة المعاملة.</p>
              <p>2. إشعار المشتركين وجدولة مهام الإشعارات وإحصائيات GMV في طابور <code className="text-[#800020]">background_jobs</code>.</p>
              <p>3. تنفيذ العمال (Workers) للعمليات بصورة غير متزامنة مع تسجيل المدة والأخطاء وسجل التنفيذ.</p>
            </div>

            <button
              type="submit"
              disabled={isPublishing}
              className="w-full py-3 bg-[#800020] hover:bg-[#660019] text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  جاري نشر الحدث...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  نشر الحدث وتشغيل العمال
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Event Payload Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 border border-[#D9D2C7] shadow-xl text-right">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <div>
                <h3 className="font-bold text-lg text-[#1A1A1A]">{selectedEvent.eventName}</h3>
                <span className="text-xs text-[#888] font-mono">{selectedEvent.id}</span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-[#888] hover:text-[#1A1A1A] font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-[#666] font-semibold">حمولة الحدث (Payload JSON):</div>
              <pre className="bg-[#1A1A1A] text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto font-mono max-h-72">
                {JSON.stringify(selectedEvent.payload, null, 2)}
              </pre>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-[#666] font-semibold">البيانات الوصفية (Metadata):</div>
              <pre className="bg-[#FAF7F2] text-[#1A1A1A] p-3 rounded-xl text-xs overflow-x-auto font-mono">
                {JSON.stringify(selectedEvent.metadata || {}, null, 2)}
              </pre>
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full py-2.5 bg-[#800020] text-white rounded-xl font-bold text-sm"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 border border-[#D9D2C7] shadow-xl text-right">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <div>
                <h3 className="font-bold text-lg text-[#1A1A1A]">{selectedJob.jobType}</h3>
                <span className="text-xs text-[#888] font-mono">{selectedJob.id}</span>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-[#888] hover:text-[#1A1A1A] font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            {selectedJob.errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-mono">
                <span className="font-bold block mb-1">خطأ التنفيذ:</span>
                {selectedJob.errorMessage}
              </div>
            )}

            <div className="space-y-2">
              <div className="text-xs text-[#666] font-semibold">حمولة المهمة (Job Payload):</div>
              <pre className="bg-[#1A1A1A] text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto font-mono max-h-72">
                {JSON.stringify(selectedJob.payload, null, 2)}
              </pre>
            </div>

            <div className="flex gap-3">
              {(selectedJob.status === 'failed' || selectedJob.status === 'dead_letter') && (
                <button
                  onClick={() => {
                    handleRetryJob(selectedJob.id);
                    setSelectedJob(null);
                  }}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm"
                >
                  إعادة تشغيل المهمة الآن
                </button>
              )}
              <button
                onClick={() => setSelectedJob(null)}
                className="flex-1 py-2.5 bg-gray-200 text-[#1A1A1A] rounded-xl font-bold text-sm"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
