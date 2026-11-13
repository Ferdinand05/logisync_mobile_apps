import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner';
import { Capacitor } from '@capacitor/core';

export interface ScanOutcome {
  value: string;
  format?: string;
}

export function isScannerAvailable(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Opens the native barcode scanner (Capacitor plugin). Returns null when the
 * user cancels or the scan yields an empty value.
 */
export async function scanBarcode(): Promise<ScanOutcome | null> {
  const result = await CapacitorBarcodeScanner.scanBarcode({
    hint: CapacitorBarcodeScannerTypeHint.ALL,
    cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
    scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
    scanInstructions: 'Arahkan kamera ke barcode barang',
    scanButton: false,
  });

  const value = result.ScanResult?.trim();
  if (!value) {
    return null;
  }
  return { value, format: String(result.format) };
}
