/// <reference lib="webworker" />

import { Zip, ZipPassThrough } from 'fflate';
import { yieldToBrowser } from '../../lib/browser';
import { EncryptedPdfError, InvalidPdfError, readPdfPageCount, writeSplitPdfParts, type SplitProgress } from './logic';

type WorkerRequest = { action: 'count'; file: File } | { action: 'split'; file: File; groups: number[][] };

interface SplitFileInfo {
  name: string;
  size: number;
}

type WorkerResponse =
  | { action: 'count'; pageCount: number }
  | { action: 'progress'; progress: SplitProgress }
  | { action: 'complete'; blob: Blob; files: SplitFileInfo[]; downloadName: string }
  | { action: 'error'; error: 'encrypted' | 'invalid' | 'failed' };

function reportError(caught: unknown): void {
  const error =
    caught instanceof EncryptedPdfError ? 'encrypted' : caught instanceof InvalidPdfError ? 'invalid' : 'failed';
  self.postMessage({ action: 'error', error } satisfies WorkerResponse);
}

function zipParts(bytes: Uint8Array, fileName: string, groups: number[][], files: SplitFileInfo[]): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const chunks: BlobPart[] = [];
    const zip = new Zip((error, chunk, final) => {
      if (error) {
        reject(error);
        return;
      }
      chunks.push(chunk as BlobPart);
      if (final) resolve(new Blob(chunks, { type: 'application/zip' }));
    });

    void writeSplitPdfParts(bytes, fileName, groups, async (file, progress) => {
      files.push({ name: file.name, size: file.bytes.length });
      const entry = new ZipPassThrough(file.name);
      zip.add(entry);
      entry.push(file.bytes, true);
      self.postMessage({ action: 'progress', progress } satisfies WorkerResponse);
      // A MessageChannel hop keeps progress and termination responsive even when
      // Chromium throttles timers because another tab is in front.
      await yieldToBrowser();
    })
      .then(() => zip.end())
      .catch((error) => {
        zip.terminate();
        reject(error);
      });
  });
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  try {
    const bytes = new Uint8Array(await request.file.arrayBuffer());
    if (request.action === 'count') {
      self.postMessage({
        action: 'count',
        pageCount: await readPdfPageCount(bytes, request.file.name),
      } satisfies WorkerResponse);
      return;
    }

    const groups = request.groups.filter((group) => group.length > 0);
    if (groups.length === 0) throw new Error('At least one non-empty page group is required.');
    const files: SplitFileInfo[] = [];
    let blob: Blob;
    let downloadName: string;

    if (groups.length === 1) {
      let part: Uint8Array | null = null;
      await writeSplitPdfParts(bytes, request.file.name, groups, async (file, progress) => {
        files.push({ name: file.name, size: file.bytes.length });
        part = file.bytes;
        self.postMessage({ action: 'progress', progress } satisfies WorkerResponse);
        await yieldToBrowser();
      });
      if (!part) throw new Error('PDF splitting produced no output.');
      blob = new Blob([part as BlobPart], { type: 'application/pdf' });
      downloadName = files[0].name;
    } else {
      blob = await zipParts(bytes, request.file.name, groups, files);
      downloadName = `${request.file.name.replace(/\.pdf$/i, '')}_split.zip`;
    }

    self.postMessage({ action: 'complete', blob, files, downloadName } satisfies WorkerResponse);
  } catch (caught) {
    reportError(caught);
  }
};
