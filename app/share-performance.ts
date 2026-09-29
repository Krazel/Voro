import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { compactPerformanceReport, deliverReportFile } from './performance-report.mjs';

export function sharePerformanceFile(report: Parameters<typeof compactPerformanceReport>[0]) {
  const data = JSON.stringify(compactPerformanceReport(report), null, 2);
  return shareDiagnosticData(data,'Informe de rendimiento de VORO');
}

export function shareAudioJournalFile(report: object) {
  return shareDiagnosticData(JSON.stringify(report,null,2),'VORO · Audio');
}

function shareDiagnosticData(data: string,title: string) {
  return deliverReportFile(data, {
    native: Capacitor.isNativePlatform(),
    write: (name: string, text: string) => Filesystem.writeFile({path:name,data:text,directory:Directory.Cache,encoding:Encoding.UTF8}),
    shareNative: (uri: string) => Share.share({title,files:[uri]}),
    canShare: (file: File) => !!navigator.canShare?.({files:[file]}),
    shareWeb: (file: File) => navigator.share({files:[file],title}),
    download: (file: File) => {
      const url = URL.createObjectURL(file),a=document.createElement('a');
      a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),30000);
    },
  });
}
