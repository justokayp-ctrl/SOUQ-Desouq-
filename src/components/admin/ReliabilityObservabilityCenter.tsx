import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Server, 
  Database, 
  Zap, 
  Cpu, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Search, 
  Filter, 
  Lock, 
  Eye, 
  Sliders, 
  Play, 
  Radio, 
  BarChart2, 
  Terminal, 
  Gauge, 
  Layers, 
  FileText, 
  ShieldCheck,
  CreditCard,
  Truck,
  MessageSquare,
  HardDrive
} from 'lucide-react';
import { 
  DeepReadinessReport, 
  ReliabilityMetrics, 
  StructuredLog, 
  SecurityAuditLog, 
  CircuitBreakerInfo,
  LogLevel,
  AuditSeverity
} from '../../../server/observability/types';
import { getAuthToken } from '../../services/api';

export const ReliabilityObservabilityCenter: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'health' | 'metrics' | 'breakers' | 'logs' | 'audit' | 'chaos'>('health');
  const [readiness, setReadiness] = useState<DeepReadinessReport | null>(null);
  const [metrics, setMetrics] = useState<ReliabilityMetrics | null>(null);
  const [logs, setLogs] = useState<StructuredLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreakerInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filters for Logs
  const [logLevelFilter, setLogLevelFilter] = useState<string>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<StructuredLog | null>(null);

  // Filters for Audit Logs
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<string>('all');
  const [selectedAuditLog, setSelectedAuditLog] = useState<SecurityAuditLog | null>(null);

  // Chaos Lab State
  const [chaosMessage, setChaosMessage] = useState<string | null>(null);
  const [chaosLoading, setChaosLoading] = useState(false);

  const fetchTelemetry = async () => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [readyRes, metricsRes, breakersRes, logsRes, auditRes] = await Promise.all([
        fetch('/api/health/readiness', { headers }),
        fetch('/api/observability/metrics', { headers }),
        fetch('/api/observability/circuit-breakers', { headers }),
        fetch(`/api/observability/logs?limit=50${logLevelFilter !== 'all' ? `&level=${logLevelFilter}` : ''}${logSearchQuery ? `&search=${encodeURIComponent(logSearchQuery)}` : ''}`, { headers }),
        fetch(`/api/observability/audit?limit=50${auditSeverityFilter !== 'all' ? `&severity=${auditSeverityFilter}` : ''}`, { headers })
      ]);

      if (readyRes.ok) setReadiness(await readyRes.json());
      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (breakersRes.ok) setCircuitBreakers(await breakersRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
      if (auditRes.ok) setAuditLogs(await auditRes.json());
    } catch (err) {
      console.error('Failed to load observability telemetry:', err);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    if (!autoRefresh) return;
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, logLevelFilter, logSearchQuery, auditSeverityFilter]);

  const handleTripCircuit = async (name: string) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/observability/circuit-breakers/${name}/trip`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTelemetry();
      }
    } catch (err) {
      console.error('Failed to trip circuit breaker:', err);
    }
  };

  const handleResetCircuit = async (name: string) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/observability/circuit-breakers/${name}/reset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTelemetry();
      }
    } catch (err) {
      console.error('Failed to reset circuit breaker:', err);
    }
  };

  const handleSimulateChaos = async (faultType: string, targetService?: string) => {
    setChaosLoading(true);
    setChaosMessage(null);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/observability/simulate-fault', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ faultType, targetService })
      });
      const data = await res.json();
      if (res.ok) {
        setChaosMessage(`✅ ${data.message || 'تمت محاكاة العطل واستجابة النظام بنجاح'}`);
      } else {
        setChaosMessage(`⚠️ تم التقاط الخطأ المتوقع بأمان: ${data.error?.message || 'خطأ'}`);
      }
      fetchTelemetry();
    } catch (err: any) {
      setChaosMessage(`⚠️ تم حظر العطل أو التقاطه بواسطة طبقة الصمود: ${err.message}`);
    } finally {
      setChaosLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'CLOSED':
      case 'success':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>سليم ومستقر</span>
          </span>
        );
      case 'degraded':
      case 'HALF_OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>متحفظ / تحت الاختبار</span>
          </span>
        );
      case 'unhealthy':
      case 'OPEN':
      case 'failure':
      case 'denied':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>معطل / دائرة مفتوحة</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const getLogLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'error':
      case 'fatal':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 uppercase">ERROR</span>;
      case 'warn':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 uppercase">WARN</span>;
      case 'info':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 uppercase">INFO</span>;
      case 'debug':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-700 uppercase">DEBUG</span>;
    }
  };

  const getSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-600 text-white">حرج (Critical)</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">عالي (High)</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">متوسط (Medium)</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">منخفض (Low)</span>;
    }
  };

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-[#800020]">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">مركز المراقبة الشاملة والصمود (Observability & Reliability)</h2>
              <p className="text-sm text-gray-500">
                مراقبة حية لصحة الخدمات، القياسات الآنية (P50/P95/P99)، قواطع الدوائر، وسجلات التدقيق المشفرة
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 border ${
              autoRefresh 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : 'bg-gray-50 text-gray-600 border-gray-300'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-emerald-600' : ''}`} />
            <span>التحديث الحي (Live 3s): {autoRefresh ? 'مفعل' : 'متوقف'}</span>
          </button>

          <button
            onClick={fetchTelemetry}
            className="px-3.5 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2 border border-gray-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تحديث فوري</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('health')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'health' ? 'bg-[#800020] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>الجاهزية والخدمات (Readiness)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('metrics')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'metrics' ? 'bg-[#800020] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>مقاييس الأداء والسرعة (Metrics)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('breakers')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'breakers' ? 'bg-[#800020] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>قواطع الدوائر (Circuit Breakers)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'logs' ? 'bg-[#800020] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>سجل النظام المنظم ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'audit' ? 'bg-[#800020] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>سجل التدقيق الأمني (Security Audit)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('chaos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'chaos' ? 'bg-[#800020] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>معمل محاكاة الأعطال (Chaos Lab)</span>
        </button>
      </div>

      {/* 1. HEALTH & DEEP READINESS TAB */}
      {activeSubTab === 'health' && readiness && (
        <div className="space-y-6">
          {/* Top Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            readiness.ready ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-3">
              {readiness.ready ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              )}
              <div>
                <h3 className="font-bold text-base">
                  {readiness.ready ? 'كافة الخدمات الحيوية تعمل بكفاءة تامة وتمر من اختبارات الجاهزية (Deep Readiness PASS)' : 'توجد بعض الخدمات في حالة تراجع أو غير جاهزة'}
                </h3>
                <p className="text-xs opacity-80">
                  وقت التشغيل: {Math.floor(readiness.uptimeSeconds / 60)} دقيقة | إصدار الخادم: {readiness.version} | استجابة حلقة الأحداث: {readiness.system.eventLoopLagMs}ms
                </p>
              </div>
            </div>
            <div>
              {getStatusBadge(readiness.status)}
            </div>
          </div>

          {/* Service Dependency Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Database Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Database className="w-5 h-5 text-indigo-600" />
                  <span>قاعدة بيانات SQLite</span>
                </div>
                {getStatusBadge(readiness.services.database.status)}
              </div>
              <p className="text-xs text-gray-500">{readiness.services.database.message}</p>
              <div className="pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-600">
                <span>زمن الاستجابة:</span>
                <span className="font-bold text-gray-900">{readiness.services.database.latencyMs} ms</span>
              </div>
              {readiness.services.database.details && (
                <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded">
                  المستخدمين: {readiness.services.database.details.users} | المنتجات: {readiness.services.database.details.products}
                </div>
              )}
            </div>

            {/* Event Bus Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>ناقل الأحداث (Event Bus)</span>
                </div>
                {getStatusBadge(readiness.services.eventBus.status)}
              </div>
              <p className="text-xs text-gray-500">{readiness.services.eventBus.message}</p>
              <div className="pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-600">
                <span>زمن الاستجابة:</span>
                <span className="font-bold text-gray-900">{readiness.services.eventBus.latencyMs} ms</span>
              </div>
              <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded">
                الأحداث المسترجعة: {readiness.services.eventBus.details?.recentEventsCount || 0}
              </div>
            </div>

            {/* Worker Engine Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Cpu className="w-5 h-5 text-emerald-600" />
                  <span>محرك المهام الخلفية</span>
                </div>
                {getStatusBadge(readiness.services.workers.status)}
              </div>
              <p className="text-xs text-gray-500">{readiness.services.workers.message}</p>
              <div className="pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-600">
                <span>المهام قيد التنفيذ:</span>
                <span className="font-bold text-gray-900">{readiness.services.workers.details?.running || 0}</span>
              </div>
              <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded">
                في الانتظار: {readiness.services.workers.details?.queued || 0} | الميتة (DLQ): {readiness.services.workers.details?.deadLetter || 0}
              </div>
            </div>

            {/* Object Storage Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                  <span>خزينة التخزين والـ KYC</span>
                </div>
                {getStatusBadge(readiness.services.storage.status)}
              </div>
              <p className="text-xs text-gray-500">{readiness.services.storage.message}</p>
              <div className="pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-600">
                <span>زمن الوصول:</span>
                <span className="font-bold text-gray-900">{readiness.services.storage.latencyMs} ms</span>
              </div>
              <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded">
                سلامة المجلدات المشفرة: مؤكدة
              </div>
            </div>

            {/* Fawry Gateway Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  <span>بوابة فوري والمدفوعات</span>
                </div>
                {getStatusBadge(readiness.services.fawryGateway.status)}
              </div>
              <p className="text-xs text-gray-500">{readiness.services.fawryGateway.message}</p>
              <div className="pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-600">
                <span>إجمالي المحاولات:</span>
                <span className="font-bold text-gray-900">{readiness.services.fawryGateway.details?.totalCalls || 0}</span>
              </div>
              <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded">
                الناجحة: {readiness.services.fawryGateway.details?.successfulCalls || 0} | البدائل الآمنة: {readiness.services.fawryGateway.details?.fallbackCalls || 0}
              </div>
            </div>

            {/* Shipping Carrier Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Truck className="w-5 h-5 text-purple-600" />
                  <span>شركات الشحن والبريد</span>
                </div>
                {getStatusBadge(readiness.services.shippingGateway.status)}
              </div>
              <p className="text-xs text-gray-500">{readiness.services.shippingGateway.message}</p>
              <div className="pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-600">
                <span>إجمالي الطلبات:</span>
                <span className="font-bold text-gray-900">{readiness.services.shippingGateway.details?.totalCalls || 0}</span>
              </div>
              <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded">
                الناجحة: {readiness.services.shippingGateway.details?.successfulCalls || 0}
              </div>
            </div>

            {/* SMS Gateway Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <MessageSquare className="w-5 h-5 text-teal-600" />
                  <span>بوابة الرسائل النصية (SMS)</span>
                </div>
                {getStatusBadge(readiness.services.smsGateway.status)}
              </div>
              <p className="text-xs text-gray-500">{readiness.services.smsGateway.message}</p>
              <div className="pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-600">
                <span>إجمالي الرسائل:</span>
                <span className="font-bold text-gray-900">{readiness.services.smsGateway.details?.totalCalls || 0}</span>
              </div>
              <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded">
                الناجحة: {readiness.services.smsGateway.details?.successfulCalls || 0}
              </div>
            </div>

            {/* Server Resources Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Gauge className="w-5 h-5 text-gray-700" />
                  <span>موارد الخادم والذاكرة</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">طبيعي</span>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>استهلاك Heap:</span>
                  <span className="font-bold text-gray-900">{readiness.system.memoryHeapUsedMB} MB / {readiness.system.memoryHeapTotalMB} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>ذاكرة RSS الكلية:</span>
                  <span className="font-bold text-gray-900">{readiness.system.memoryRssMB} MB</span>
                </div>
              </div>
              <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded">
                Node.js: {readiness.system.nodeVersion}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. METRICS & LATENCY TAB */}
      {activeSubTab === 'metrics' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-xs text-gray-500 font-medium">معدل الطلبات في الدقيقة (RPM)</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{metrics.http.requestsPerMinute}</div>
              <div className="text-xs text-gray-400 mt-1">إجمالي الطلبات: {metrics.http.totalRequests}</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-xs text-gray-500 font-medium">متوسط زمن الاستجابة (Latency P50)</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{metrics.http.latencyP50Ms} ms</div>
              <div className="text-xs text-gray-400 mt-1">المتوسط العام: {metrics.http.avgLatencyMs} ms</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-xs text-gray-500 font-medium">ذروة التأخير (P95 / P99)</div>
              <div className="text-2xl font-bold text-indigo-600 mt-1">{metrics.http.latencyP95Ms} / {metrics.http.latencyP99Ms} ms</div>
              <div className="text-xs text-gray-400 mt-1">مقاس على آخر 1000 طلب</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-xs text-gray-500 font-medium">نسبة الأخطاء الكلية (Error Rate)</div>
              <div className={`text-2xl font-bold mt-1 ${metrics.http.errorRatePercent > 5 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {metrics.http.errorRatePercent}%
              </div>
              <div className="text-xs text-gray-400 mt-1">2xx: {metrics.http.status2xx} | 4xx: {metrics.http.status4xx} | 5xx: {metrics.http.status5xx}</div>
            </div>
          </div>

          {/* Database & Queues Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                <span>أداء قاعدة البيانات (SQLite)</span>
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>سلامة ملف القاعدة (Integrity Check):</span>
                  <span className="font-bold text-emerald-600 uppercase">{metrics.database.integrity}</span>
                </div>
                <div className="flex justify-between">
                  <span>متوسط استغراق الاستعلام:</span>
                  <span className="font-bold text-gray-900">{metrics.database.avgQueryDurationMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span>الاستعلامات البطيئة (&gt;50ms):</span>
                  <span className={`font-bold ${metrics.database.slowQueriesCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                    {metrics.database.slowQueriesCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>عدد الجداول المعتمدة:</span>
                  <span className="font-bold text-gray-900">{metrics.database.tablesCount} جداول</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>طوابير المهام الخلفية (Queues)</span>
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>المهام المكتملة بنجاح:</span>
                  <span className="font-bold text-emerald-600">{metrics.queues.totalCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span>المهام قيد المعالجة الآن:</span>
                  <span className="font-bold text-blue-600">{metrics.queues.totalRunning}</span>
                </div>
                <div className="flex justify-between">
                  <span>المهام المنتظرة في الطابور:</span>
                  <span className="font-bold text-gray-900">{metrics.queues.totalQueued}</span>
                </div>
                <div className="flex justify-between">
                  <span>الرسائل الميتة (Dead Letters):</span>
                  <span className={`font-bold ${metrics.queues.deadLetterCount > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                    {metrics.queues.deadLetterCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>موثوقية المدفوعات (Payment Gateway)</span>
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>نسبة نجاح الدفع الإلكتروني:</span>
                  <span className="font-bold text-emerald-600">{metrics.payments.successRatePercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span>العمليات الناجحة:</span>
                  <span className="font-bold text-gray-900">{metrics.payments.successfulPayments}</span>
                </div>
                <div className="flex justify-between">
                  <span>العمليات الفاشلة:</span>
                  <span className={`font-bold ${metrics.payments.failedPayments > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                    {metrics.payments.failedPayments}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>إجمالي المحاولات:</span>
                  <span className="font-bold text-gray-900">{metrics.payments.totalAttempts}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CIRCUIT BREAKERS TAB */}
      {activeSubTab === 'breakers' && (
        <div className="space-y-6">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <p className="font-bold text-sm">آلية قواطع الدوائر الذكية (Circuit Breaker Resilience Architecture)</p>
              <p className="opacity-90">
                تقوم هذه القواطع بعزل الخدمات الخارجية المنهارة (مثل بوابات الدفع أو شركات الشحن أو الـ SMS) فور تكرار الفشل، وتحويل الطلبات لمسارات بديلة (Fallbacks) دون تعليق أو إسقاط المنصة.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {circuitBreakers.map((breaker) => (
              <div key={breaker.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-base text-gray-900">{breaker.name}</h4>
                    <p className="text-xs text-gray-500">حد الفشل: {breaker.failureThreshold} محاولات | فترة التعافي: {breaker.recoveryTimeoutMs / 1000} ثانية</p>
                  </div>
                  {getStatusBadge(breaker.state)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-600">إجمالي الاستدعاءات: <span className="font-bold text-gray-900">{breaker.stats.totalCalls}</span></div>
                  <div className="text-gray-600">الناجحة: <span className="font-bold text-emerald-600">{breaker.stats.successfulCalls}</span></div>
                  <div className="text-gray-600">الفاشلة: <span className="font-bold text-rose-600">{breaker.stats.failedCalls}</span></div>
                  <div className="text-gray-600">البديلة (Fallbacks): <span className="font-bold text-amber-600">{breaker.stats.fallbackCalls}</span></div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <span className="text-gray-500">آخر تغيير للحالة: {new Date(breaker.lastStateChange).toLocaleTimeString('ar-EG')}</span>
                  <div className="flex items-center gap-2">
                    {breaker.state === 'OPEN' ? (
                      <button
                        onClick={() => handleResetCircuit(breaker.name)}
                        className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
                      >
                        إعادة تشغيل وتصفير (Reset)
                      </button>
                    ) : (
                      <button
                        onClick={() => handleTripCircuit(breaker.name)}
                        className="px-3 py-1.5 rounded bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 font-medium transition-colors"
                      >
                        محاكاة فصل القاطع (Trip Drill)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. STRUCTURED APPLICATION LOGS TAB */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث في الرسائل وسياق JSON..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-lg border border-gray-300 text-xs focus:ring-1 focus:ring-[#800020] outline-hidden"
                />
              </div>

              <select
                value={logLevelFilter}
                onChange={(e) => setLogLevelFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white text-gray-700 outline-hidden"
              >
                <option value="all">كافة المستويات (All Levels)</option>
                <option value="error">الأخطاء فقط (Error / Fatal)</option>
                <option value="warn">التحذيرات (Warn)</option>
                <option value="info">المعلومات (Info)</option>
                <option value="debug">التشخيص (Debug)</option>
              </select>
            </div>

            <div className="text-xs text-gray-500">
              عرض آخر {logs.length} سجل منظم مع حجب البيانات الحساسة تلقائياً (Auto Redaction)
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                  <tr>
                    <th className="p-3">المستوى</th>
                    <th className="p-3">الخدمة</th>
                    <th className="p-3">الرسالة</th>
                    <th className="p-3">Trace ID</th>
                    <th className="p-3">المدة</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3">التوقيت</th>
                    <th className="p-3">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400 font-sans">
                        لا توجد سجلات تطابق الفلتر المحدد
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3">{getLogLevelBadge(log.level)}</td>
                        <td className="p-3 text-gray-700 font-bold">{log.service}</td>
                        <td className="p-3 font-sans text-gray-900 max-w-md truncate">{log.message}</td>
                        <td className="p-3 text-gray-500 text-[11px]">{log.traceId}</td>
                        <td className="p-3 text-gray-600">{log.durationMs ? `${log.durationMs}ms` : '-'}</td>
                        <td className="p-3">{log.statusCode ? <span className={`font-bold ${log.statusCode >= 400 ? 'text-red-600' : 'text-emerald-600'}`}>{log.statusCode}</span> : '-'}</td>
                        <td className="p-3 text-gray-400 text-[11px] whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString('ar-EG')}</td>
                        <td className="p-3">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                            title="عرض تفاصيل السجل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. SECURITY AUDIT TRAIL TAB */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select
                value={auditSeverityFilter}
                onChange={(e) => setAuditSeverityFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white text-gray-700 outline-hidden"
              >
                <option value="all">كافة درجات الخطورة (All Severities)</option>
                <option value="critical">حرج (Critical)</option>
                <option value="high">عالي (High)</option>
                <option value="medium">متوسط (Medium)</option>
                <option value="low">منخفض (Low)</option>
              </select>
            </div>
            <div className="text-xs text-gray-500">
              سجل تدقيق غير قابل للتعديل لكافة العمليات الحساسة (تسجيل الدخول، التحكيم، صرف الأرباح، فحص الـ KYC)
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                  <tr>
                    <th className="p-3">الإجراء (Action)</th>
                    <th className="p-3">المنفّذ (Actor)</th>
                    <th className="p-3">الدور</th>
                    <th className="p-3">المورد (Resource)</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3">الخطورة</th>
                    <th className="p-3">عنوان IP</th>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-gray-400">
                        لا توجد سجلات تدقيق أمني حالياً
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((audit) => (
                      <tr key={audit.id} className="hover:bg-gray-50 transition-colors font-mono">
                        <td className="p-3 font-bold text-gray-900 font-sans">{audit.action}</td>
                        <td className="p-3 text-gray-600">{audit.actorId}</td>
                        <td className="p-3 font-sans">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-gray-100 text-gray-800 font-medium">
                            {audit.actorRole}
                          </span>
                        </td>
                        <td className="p-3 text-gray-700">{audit.resourceType}:{audit.resourceId}</td>
                        <td className="p-3 font-sans">{getStatusBadge(audit.status)}</td>
                        <td className="p-3 font-sans">{getSeverityBadge(audit.severity)}</td>
                        <td className="p-3 text-gray-500 text-[11px]">{audit.ipAddress || '127.0.0.1'}</td>
                        <td className="p-3 text-gray-400 text-[11px] whitespace-nowrap">{audit.createdAt ? new Date(audit.createdAt).toLocaleString('ar-EG') : ''}</td>
                        <td className="p-3">
                          <button
                            onClick={() => setSelectedAuditLog(audit)}
                            className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. CHAOS & FAULT SIMULATION LAB */}
      {activeSubTab === 'chaos' && (
        <div className="space-y-6">
          <div className="bg-purple-50 p-5 rounded-xl border border-purple-200 text-purple-900 space-y-2">
            <h4 className="font-bold text-base flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-700" />
              <span>معمل الصمود ومحاكاة أعطال الإنتاج (Chaos Engineering & Resilience Drill Lab)</span>
            </h4>
            <p className="text-xs leading-relaxed opacity-90">
              يتيح هذا المعمل للمشرفين تجربة سيناريوهات الأعطال الشائعة على الهواء مباشرة لاختبار استجابة معالج الأخطاء المركزي، تفعيل قواطع الدوائر، ومراقبة استقرار تجربة المستخدم دون تعطل المنصة.
            </p>
          </div>

          {chaosMessage && (
            <div className="p-4 rounded-xl bg-gray-900 text-emerald-400 font-mono text-xs border border-gray-800 shadow-md">
              {chaosMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fault Card 1: Circuit Trip */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-gray-900">عزل بوابة فوري (Trip Fawry Breaker)</h5>
                <p className="text-xs text-gray-500 mt-1">
                  يحاكي انقطاع بوابة الدفع الخارجية ويختبر تحويل العميل تلقائياً إلى خيارات الدفع البديلة بأمان.
                </p>
              </div>
              <button
                disabled={chaosLoading}
                onClick={() => handleSimulateChaos('circuit_trip', 'FawryPaymentGateway')}
                className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>تنفيذ عزل فوري</span>
              </button>
            </div>

            {/* Fault Card 2: Unhandled 500 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-700 mb-3">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-gray-900">محاكاة استثناء خادم غير متوقع (500 Error)</h5>
                <p className="text-xs text-gray-500 mt-1">
                  يختبر معالج الأخطاء المركزي (Centralized Error Handler) للتأكد من حجب stack traces والبيانات السرية عن العميل.
                </p>
              </div>
              <button
                disabled={chaosLoading}
                onClick={() => handleSimulateChaos('unhandled_error')}
                className="w-full py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>إطلاق استثناء 500</span>
              </button>
            </div>

            {/* Fault Card 3: Slow DB Query */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700 mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-gray-900">تسجيل استعلام قاعدة بيانات بطيء</h5>
                <p className="text-xs text-gray-500 mt-1">
                  يسجل استعلاماً يتجاوز 100ms في مقاييس الأداء لاختبار جرس إنذار الاستعلامات البطيئة في لوحة المراقبة.
                </p>
              </div>
              <button
                disabled={chaosLoading}
                onClick={() => handleSimulateChaos('database_slow_query')}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>محاكاة استعلام بطيء</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Modal Inspector */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-xl text-right">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                {getLogLevelBadge(selectedLog.level)}
                <h3 className="font-bold text-gray-900 text-base">{selectedLog.service}</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              <p className="font-medium text-gray-900">{selectedLog.message}</p>
              <div className="bg-gray-900 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto text-left" dir="ltr">
                <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal Inspector */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-xl text-right">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                {getSeverityBadge(selectedAuditLog.severity)}
                <h3 className="font-bold text-gray-900 text-base">{selectedAuditLog.action}</h3>
              </div>
              <button onClick={() => setSelectedAuditLog(null)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg text-gray-700">
                <div>المنفّذ: <span className="font-bold font-mono">{selectedAuditLog.actorId}</span> ({selectedAuditLog.actorRole})</div>
                <div>المورد: <span className="font-bold font-mono">{selectedAuditLog.resourceType}:{selectedAuditLog.resourceId}</span></div>
                <div>عنوان IP: <span className="font-bold font-mono">{selectedAuditLog.ipAddress || '127.0.0.1'}</span></div>
                <div>التاريخ: <span className="font-bold">{selectedAuditLog.createdAt ? new Date(selectedAuditLog.createdAt).toLocaleString('ar-EG') : ''}</span></div>
              </div>
              <div className="bg-gray-900 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto text-left" dir="ltr">
                <pre>{JSON.stringify(selectedAuditLog.details, null, 2)}</pre>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setSelectedAuditLog(null)} className="px-4 py-2 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
