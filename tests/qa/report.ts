import fs from 'fs';
import path from 'path';
import { TestResult } from '../testFramework';

export interface QAReportSummary {
  timestamp: string;
  environment: string;
  totalSuites: number;
  totalTests: number;
  passed: number;
  failed: number;
  passRate: number;
  totalDurationMs: number;
  averageTestDurationMs: number;
  suites: Record<string, {
    total: number;
    passed: number;
    failed: number;
    durationMs: number;
    tests: TestResult[];
  }>;
}

export class QAReporter {
  public static generateSummary(results: TestResult[], environment = 'testing'): QAReportSummary {
    const suites: QAReportSummary['suites'] = {};

    for (const r of results) {
      if (!suites[r.suite]) {
        suites[r.suite] = {
          total: 0,
          passed: 0,
          failed: 0,
          durationMs: 0,
          tests: [],
        };
      }
      suites[r.suite].total++;
      if (r.passed) {
        suites[r.suite].passed++;
      } else {
        suites[r.suite].failed++;
      }
      suites[r.suite].durationMs += r.durationMs;
      suites[r.suite].tests.push(r);
    }

    const totalTests = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const totalDurationMs = results.reduce((sum, r) => sum + r.durationMs, 0);

    return {
      timestamp: new Date().toISOString(),
      environment,
      totalSuites: Object.keys(suites).length,
      totalTests,
      passed,
      failed,
      passRate: totalTests > 0 ? Math.round((passed / totalTests) * 10000) / 100 : 100,
      totalDurationMs,
      averageTestDurationMs: totalTests > 0 ? Math.round((totalDurationMs / totalTests) * 100) / 100 : 0,
      suites,
    };
  }

  public static generateMarkdownReport(summary: QAReportSummary): string {
    const lines: string[] = [
      '# 🧪 تقرير الجودة والفحص الشامل — منصة سوق دسوق الموحدة',
      `**تاريخ التقرير:** ${summary.timestamp}`,
      `**البيئة التشغيلية:** \`${summary.environment}\``,
      `**معدل النجاح الإجمالي:** **${summary.passRate}%** (${summary.passed}/${summary.totalTests})`,
      `**زمن التنفيذ الكلي:** ${summary.totalDurationMs}ms (متوسط: ${summary.averageTestDurationMs}ms لكل اختبار)`,
      '',
      '---',
      '',
      '## 📊 ملخص الحزم والاختبارات (Suites Breakdown)',
      '',
      '| اسم الحزمة (Suite) | الإجمالي | ناجح ✅ | فاشل ❌ | المدة (ms) | الحالة |',
      '| :--- | :---: | :---: | :---: | :---: | :---: |',
    ];

    for (const [suiteName, s] of Object.entries(summary.suites)) {
      const statusIcon = s.failed === 0 ? '🟢 ممتاز' : '🔴 خلل';
      lines.push(`| ${suiteName} | ${s.total} | ${s.passed} | ${s.failed} | ${s.durationMs}ms | ${statusIcon} |`);
    }

    lines.push('');
    lines.push('---');
    lines.push('');

    if (summary.failed > 0) {
      lines.push('## ⚠️ تفاصيل الاختبارات المتعثرة');
      for (const [suiteName, s] of Object.entries(summary.suites)) {
        const failedTests = s.tests.filter(t => !t.passed);
        if (failedTests.length > 0) {
          lines.push(`### حزمة: ${suiteName}`);
          for (const t of failedTests) {
            lines.push(`- **${t.name}**: \`${t.error || 'Unknown error'}\``);
          }
        }
      }
      lines.push('');
    } else {
      lines.push('## ✨ تأكيد التوافق والجودة (QA Certification)');
      lines.push('كافة اختبارات المنصة اجتازت الفحص الآلي بنجاح تام 100%، وتم التحقق من سلامة البنية التحتية، الأمان، وتجربة المستخدم.');
      lines.push('');
    }

    return lines.join('\n');
  }

  public static saveReport(summary: QAReportSummary, targetFilePath?: string): string {
    const reportPath = targetFilePath || path.join(process.cwd(), 'tests', 'qa', 'qa-last-run-report.json');
    try {
      const dir = path.dirname(reportPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf-8');
      return reportPath;
    } catch (err) {
      console.warn('Could not persist report to disk:', err);
      return '';
    }
  }
}
