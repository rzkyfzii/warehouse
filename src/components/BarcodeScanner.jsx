import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { getBarcodeInfo } from '@/data/barcodeMap';
import { BrowserMultiFormatReader } from '@zxing/browser';

const BarcodeScanner = ({ onDetected, onClose }) => {
  const videoRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const { toast } = useToast();
  const codeReaderRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    if (isScanning || codeReaderRef.current) return;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      setStream(mediaStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();

        setIsScanning(true);
        startRealScanner();
      }
    } catch (err) {
      console.error("❌ Kamera gagal:", err);
      setHasPermission(false);

      if (err.name === 'NotAllowedError') {
        setError('Akses kamera ditolak.');
      } else if (err.name === 'NotFoundError') {
        setError('Kamera tidak ditemukan.');
      } else {
        setError('Gagal mengakses kamera.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }

    setIsScanning(false);
  };

  const startRealScanner = () => {
    if (codeReaderRef.current) return;

    const reader = new BrowserMultiFormatReader();
    codeReaderRef.current = reader;

    reader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
      if (result) {
        const barcode = result.getText();
        const info = getBarcodeInfo(barcode);

        toast({
          title: 'Barcode Terdeteksi 🎯',
          description: info ? `${info.variant} - ${info.category}` : `Kode: ${barcode}`,
        });

        reader.reset();
        onDetected(barcode);
      }
    });
  };

  const handleManualInput = () => {
    const barcode = prompt('Masukkan barcode:');
    if (barcode?.trim()) {
      const info = getBarcodeInfo(barcode.trim());
      if (info) {
        toast({ title: 'Barcode Manual 📦', description: `${info.variant} - ${info.category}` });
      }
      onDetected(barcode.trim());
    }
  };

  const simulateBarcodeScan = () => {
    const samples = ['1234567890123', '2345678901234', '3456789012345'];
    const random = samples[Math.floor(Math.random() * samples.length)];
    const info = getBarcodeInfo(random);
    toast({
      title: 'Simulasi Scan 🎯',
      description: info ? `${info.variant} - ${info.category}` : `Kode: ${random}`,
    });
    onDetected(random);
  };

  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      startCamera();
    } catch {
      setHasPermission(false);
      setError('Gagal meminta izin kamera. Cek pengaturan browser.');
    }
  };

  return (
    <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500">
      <DialogHeader>
        <DialogTitle className="text-white flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Scanner Barcode
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {error ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-300 mb-4">{error}</p>
            <div className="space-y-2">
              {hasPermission === false && (
                <Button onClick={requestCameraPermission} className="bg-blue-500 hover:bg-blue-600">
                  <Camera className="w-4 h-4 mr-2" />
                  Izinkan Kamera
                </Button>
              )}
              <Button onClick={handleManualInput} className="bg-emerald-500 hover:bg-emerald-600">
                Input Manual
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="relative">
            <div className="bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
                preload="auto"
              />
              {isScanning && (
                <motion.div
                  className="absolute left-1/2 transform -translate-x-1/2 w-3/5 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                  animate={{ y: [0, 200, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </div>
          </div>
        )}

        <div className="text-center space-y-2">
          <p className="text-purple-200">Arahkan kamera ke barcode untuk memindai</p>
          {isScanning && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-emerald-400 font-medium flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Sedang memindai...
            </motion.div>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          <Button onClick={handleManualInput} variant="outline" className="border-purple-300 text-purple-100">
            Input Manual
          </Button>
          <Button onClick={simulateBarcodeScan} className="bg-emerald-500 hover:bg-emerald-600">
            Demo Scan
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
        </div>
      </div>
    </DialogContent>
  );
};

export default BarcodeScanner;
