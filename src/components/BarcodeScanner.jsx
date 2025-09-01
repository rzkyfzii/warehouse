import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Zap, RefreshCcw } from 'lucide-react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { BrowserMultiFormatReader } from '@zxing/browser';

const BarcodeScanner = ({ onDetected, onClose }) => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const streamRef = useRef(null);
  const scannedSet = useRef(new Set());
  const { toast } = useToast();
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    initCameraDevices();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (selectedDeviceId) {
      startCamera(selectedDeviceId);
    }
  }, [selectedDeviceId]);

  const initCameraDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter((d) => d.kind === 'videoinput');
    setVideoDevices(videoInputs);
    if (videoInputs.length > 0) {
      setSelectedDeviceId(videoInputs[0].deviceId);
    } else {
      toast({ title: "Kamera tidak ditemukan", variant: "destructive" });
    }
  };

  const startCamera = async (deviceId) => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      streamRef.current = stream;
      setIsScanning(true);

      const reader = new BrowserMultiFormatReader();
      codeReaderRef.current = reader;

      reader.decodeFromVideoDevice(deviceId, videoRef.current, (result) => {
        if (result) {
          const barcode = result.getText();
          if (!scannedSet.current.has(barcode)) {
            scannedSet.current.add(barcode);

            toast({ title: 'Barcode Terdeteksi 🎯', description: barcode });
            onDetected(barcode);

            setTimeout(() => scannedSet.current.delete(barcode), 3000);
          }
        }
      });
    } catch (err) {
      console.error("Kamera error:", err);
      toast({ title: "Gagal membuka kamera", variant: "destructive" });
    }
  };

  const stopCamera = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    scannedSet.current.clear();
  };

  const handleManualInput = () => {
    const input = prompt("Masukkan kode barcode:");
    if (input?.trim()) {
      toast({ title: "Input Manual 📦", description: input.trim() });
      onDetected(input.trim());
    }
  };

  return (
    <DialogContent className="max-w-3xl bg-slate-900 border-purple-600">
      <DialogHeader>
        <DialogTitle className="text-white flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Scanner Barcode Profesional
        </DialogTitle>
      </DialogHeader>

      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
        <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
          <div className="border-4 border-emerald-400 rounded-lg w-2/3 h-1/3" />
        </div>
        {isScanning && (
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-emerald-500"
            animate={{ y: [0, 200, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <select
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          className="text-sm p-2 rounded bg-slate-800 text-white border border-purple-500"
        >
          {videoDevices.map((device, idx) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Kamera ${idx + 1}`}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <Button onClick={handleManualInput} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            Input Manual
          </Button>
          <Button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            variant="outline"
            className="border-red-300 text-red-100"
          >
            <X className="w-4 h-4 mr-2" />
            Tutup
          </Button>
          <Button
            onClick={() => startCamera(selectedDeviceId)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh Kamera
          </Button>
        </div>
      </div>

      <div className="mt-2 text-sm text-purple-200 text-center">
        Arahkan kamera ke barcode untuk memindai. Mode scan berulang aktif. ✅
      </div>
    </DialogContent>
  );
};

export default BarcodeScanner;
