import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ScanLine,
  Upload,
  Camera,
  CameraOff,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  ShieldCheck,
  Globe,
  Wifi,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  RefreshCw,
  Trash2,
  SwitchCamera,
  Lock,
  Unlock,
  ShieldAlert,
} from 'lucide-react';
import {
  decodeQRFromImageFile,
  decodeQRFromVideoFrame,
  parseDecodedPayload,
  ParsedQRPayload,
} from '../../utils/qrScanner';

type ScanMode = 'upload' | 'camera';

export const QRScanner: React.FC = () => {
  const [mode, setMode] = useState<ScanMode>('upload');

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDecodingImage, setIsDecodingImage] = useState(false);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Shared result & error state
  const [parsedResult, setParsedResult] = useState<ParsedQRPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedWifiPass, setCopiedWifiPass] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  // Capability check (does NOT trigger permission prompt)
  const isBrowserCameraSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  const isSecureContext =
    typeof window !== 'undefined' ? window.isSecureContext : true;

  // Stop camera stream & animation loop cleanly
  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsStartingCamera(false);
  }, []);

  // Cleanup camera tracks on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Real-time camera frame scanning loop
  const scanLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;

    if (!scanCanvasRef.current) {
      scanCanvasRef.current = document.createElement('canvas');
    }

    const decoded = decodeQRFromVideoFrame(video, scanCanvasRef.current);
    if (decoded !== null) {
      const parsed = parseDecodedPayload(decoded);
      setParsedResult(parsed);
      setErrorMessage(null);
      stopCamera();
      return;
    }

    rafRef.current = requestAnimationFrame(scanLoop);
  }, [stopCamera]);

  // Attach stream once video element is mounted and start loop
  const startCamera = async (overrideDeviceId?: string) => {
    setErrorMessage(null);

    if (!isBrowserCameraSupported) {
      setErrorMessage(
        'Live camera scanning is not supported in this browser. Please use the "Upload QR Image" option instead.'
      );
      return;
    }

    if (!isSecureContext) {
      setErrorMessage(
        'Camera access requires a secure HTTPS connection. Please upload a QR code image instead.'
      );
      return;
    }

    // Stop any previous stream before opening a new one
    stopCamera();
    setIsStartingCamera(true);

    try {
      const targetDeviceId = overrideDeviceId ?? selectedDeviceId;
      const constraints: MediaStreamConstraints = targetDeviceId
        ? { video: { deviceId: { exact: targetDeviceId } }, audio: false }
        : { video: { facingMode: { ideal: 'environment' } }, audio: false };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err: unknown) {
        // Fallback if specific device/facingMode fails
        if (err instanceof DOMException && err.name === 'OverconstrainedError') {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } else {
          throw err;
        }
      }

      streamRef.current = stream;

      // Enumerate available cameras only after permission is granted
      if (navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const cameras = devices.filter((d) => d.kind === 'videoinput');
          setVideoDevices(cameras);
          const activeTrack = stream.getVideoTracks()[0];
          const activeId = activeTrack?.getSettings()?.deviceId;
          if (activeId) {
            setSelectedDeviceId(activeId);
          }
        } catch {
          // Ignore device enumeration errors
        }
      }

      setCameraActive(true);
      setIsStartingCamera(false);

      // Wait a tick for video element to bind if needed
      requestAnimationFrame(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current
            .play()
            .then(() => {
              rafRef.current = requestAnimationFrame(scanLoop);
            })
            .catch(() => {
              setErrorMessage('Could not start video playback. Try uploading a QR image instead.');
              stopCamera();
            });
        }
      });
    } catch (err: unknown) {
      setIsStartingCamera(false);
      setCameraActive(false);

      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
          case 'PermissionDeniedError':
            setErrorMessage(
              'Camera permission was denied. Allow camera access in your browser settings and try again, or upload a QR image below.'
            );
            break;
          case 'NotFoundError':
          case 'DevicesNotFoundError':
            setErrorMessage(
              'No camera was found on this device. Switch to "Upload QR Image" to scan a saved screenshot or photo.'
            );
            break;
          case 'NotReadableError':
          case 'TrackStartError':
            setErrorMessage(
              'Your camera is currently in use by another application. Close the other app or upload a QR image instead.'
            );
            break;
          default:
            setErrorMessage(
              `Unable to access camera (${err.message || err.name}). Please upload a QR code image instead.`
            );
        }
      } else {
        setErrorMessage(
          'Unable to start the device camera. Please use the image upload scanner instead.'
        );
      }
    }
  };

  // Switch between front/rear cameras
  const handleSwitchCamera = () => {
    if (videoDevices.length < 2) return;
    const currentIdx = videoDevices.findIndex((d) => d.deviceId === selectedDeviceId);
    const nextDevice = videoDevices[(currentIdx + 1) % videoDevices.length];
    if (nextDevice) {
      startCamera(nextDevice.deviceId);
    }
  };

  // Switch scan mode cleanly
  const handleModeChange = (nextMode: ScanMode) => {
    if (nextMode !== 'camera') {
      stopCamera();
    }
    setErrorMessage(null);
    setMode(nextMode);
  };

  // Process uploaded image file locally
  const processImageFile = async (file: File) => {
    setErrorMessage(null);
    setIsDecodingImage(true);
    try {
      const { decodedText, previewDataUrl } = await decodeQRFromImageFile(file);
      setUploadedPreviewUrl(previewDataUrl);
      setUploadedFileName(file.name);
      setParsedResult(parseDecodedPayload(decodedText));
    } catch (err: unknown) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setUploadedPreviewUrl(e.target.result);
          setUploadedFileName(file.name);
        }
      };
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      }
      setParsedResult(null);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Could not decode a QR code from this image.'
      );
    } finally {
      setIsDecodingImage(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleCopyText = async (text: string, isWifiPass = false) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isWifiPass) {
        setCopiedWifiPass(true);
        setTimeout(() => setCopiedWifiPass(false), 2000);
      } else {
        setCopiedRaw(true);
        setTimeout(() => setCopiedRaw(false), 2000);
      }
    } catch {
      setErrorMessage('Clipboard copy was blocked by your browser. You can select and copy the decoded text manually.');
    }
  };

  const handleReset = () => {
    stopCamera();
    setParsedResult(null);
    setUploadedPreviewUrl(null);
    setUploadedFileName(null);
    setErrorMessage(null);
    setCopiedRaw(false);
    setCopiedWifiPass(false);
  };

  const kindMeta: Record<
    ParsedQRPayload['kind'],
    { label: string; badgeClass: string; icon: React.ReactNode }
  > = {
    url: {
      label: 'Website URL',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <Globe className="w-3.5 h-3.5" />,
    },
    wifi: {
      label: 'Wi-Fi Network',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <Wifi className="w-3.5 h-3.5" />,
    },
    email: {
      label: 'Email Message',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: <Mail className="w-3.5 h-3.5" />,
    },
    phone: {
      label: 'Phone Number',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <Phone className="w-3.5 h-3.5" />,
    },
    sms: {
      label: 'SMS Text',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: <MessageSquare className="w-3.5 h-3.5" />,
    },
    text: {
      label: 'Plain Text',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: <FileText className="w-3.5 h-3.5" />,
    },
  };

  return (
    <section
      id="scanner"
      className="py-16 sm:py-20 bg-white border-b border-slate-100 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 mb-3">
            <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
            <span>Private In-Browser QR Reader</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Scan &amp; Inspect Any QR Code Safely
          </h2>
          <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto">
            Upload a QR image or use your device camera to decode links, Wi-Fi credentials, and text locally. Preview the exact destination URL before opening it.
          </p>
        </div>

        {/* Scanner Studio Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-7 lg:p-8">
          {/* Top Mode Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleModeChange('upload')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'upload'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Upload QR Image</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('camera')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'camera'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Use Device Camera</span>
              </button>
            </div>

            {(parsedResult || uploadedPreviewUrl || errorMessage) && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Clear Scanner</span>
              </button>
            )}
          </div>

          {/* Main 2-Column Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Image Upload or Camera Viewport (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {mode === 'upload' && (
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="qr-scanner-file-input"
                  />

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                        : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/80 bg-slate-50/40'
                    }`}
                  >
                    {uploadedPreviewUrl ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-44 h-44 rounded-2xl bg-white border border-slate-200 p-3 shadow-xs flex items-center justify-center overflow-hidden">
                          <img
                            src={uploadedPreviewUrl}
                            alt="Uploaded QR code preview"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 truncate max-w-xs mx-auto">
                            {uploadedFileName || 'Selected QR Image'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {isDecodingImage
                              ? 'Decoding QR code locally...'
                              : 'Click or drop another image to scan a different QR code'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-xs">
                          <Upload className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">
                          Drop a QR Code Image or Click to Browse
                        </h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                          Supports PNG, JPG, JPEG, WebP, GIF, and SVG up to 10 MB. Your image stays 100% on your device.
                        </p>
                        <span className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
                          Select QR Image
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {mode === 'camera' && (
                <div className="space-y-4">
                  {!isBrowserCameraSupported || !isSecureContext ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 sm:p-8 text-center space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                        <CameraOff className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        Camera Scanning Unavailable in This Browser Context
                      </h3>
                      <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                        {!isSecureContext
                          ? 'Live camera access requires a secure HTTPS page. You can still scan any QR code immediately by uploading a photo or screenshot.'
                          : 'Your current browser does not expose camera access via MediaDevices. You can upload a QR code photo or screenshot instead.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleModeChange('upload')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Switch to Image Upload</span>
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-950 overflow-hidden relative min-h-[300px] sm:min-h-[340px] flex flex-col items-center justify-center">
                      {cameraActive ? (
                        <>
                          <video
                            ref={videoRef}
                            playsInline
                            muted
                            className="w-full h-[320px] sm:h-[360px] object-cover"
                          />
                          {/* Optical Scanning Guide Reticle */}
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl border-2 border-emerald-400/90 shadow-[0_0_0_9999px_rgba(2,6,23,0.45)] relative">
                              <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-slate-900/80 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                                Align QR code inside frame
                              </span>
                            </div>
                          </div>

                          {/* Live Controls Bar */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                            {videoDevices.length > 1 ? (
                              <button
                                type="button"
                                onClick={handleSwitchCamera}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-white text-xs font-semibold backdrop-blur-xs border border-white/15 cursor-pointer"
                              >
                                <SwitchCamera className="w-3.5 h-3.5" />
                                <span>Switch Camera</span>
                              </button>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 text-[11px] font-medium text-emerald-300 border border-white/10">
                                Camera Active
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={stopCamera}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                            >
                              <CameraOff className="w-3.5 h-3.5" />
                              <span>Stop Camera</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-6 sm:p-8 text-center space-y-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-emerald-400 mx-auto flex items-center justify-center border border-slate-700">
                            <Camera className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">
                              Ready to Scan with Camera
                            </h3>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                              QuickQR only requests camera permission when you click below. All video frames are decoded locally in your browser.
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={isStartingCamera}
                            onClick={() => startCamera()}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-bold shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
                          >
                            <Camera className="w-4 h-4" />
                            <span>
                              {isStartingCamera ? 'Requesting Camera Access...' : 'Start Camera Scan'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Helpful Error Alert with Fallback */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-900">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{errorMessage}</span>
                  </div>
                  {mode === 'camera' && (
                    <button
                      type="button"
                      onClick={() => handleModeChange('upload')}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-800 hover:bg-red-100/60 font-semibold transition-colors cursor-pointer"
                    >
                      Upload Image Instead
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Decoded Output & Destination Preview (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Decoded QR Result
                  </span>
                  {parsedResult && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        kindMeta[parsedResult.kind].badgeClass
                      }`}
                    >
                      {kindMeta[parsedResult.kind].icon}
                      <span>{kindMeta[parsedResult.kind].label}</span>
                    </span>
                  )}
                </div>

                {!parsedResult ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 mx-auto flex items-center justify-center shadow-xs">
                      <ScanLine className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-semibold text-slate-700">
                      No QR Code Scanned Yet
                    </div>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Upload an image or scan with your camera to inspect decoded text, Wi-Fi details, or preview destination URLs safely before opening.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Unsafe URI Warning */}
                    {parsedResult.isPotentiallyUnsafeScheme && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-900">
                        <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Potentially Unsafe Script/Data URI</span>
                          <span>For your safety, QuickQR disabled direct opening for this payload. Inspect the raw text below carefully.</span>
                        </div>
                      </div>
                    )}

                    {/* Destination Preview Card for URLs */}
                    {parsedResult.kind === 'url' && parsedResult.urlDetails && (
                      <div className="p-4 rounded-xl bg-white border border-blue-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Destination Preview
                          </span>
                          {parsedResult.urlDetails.isHttps ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              <Lock className="w-3 h-3" />
                              <span>HTTPS</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                              <Unlock className="w-3 h-3" />
                              <span>Unencrypted HTTP</span>
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs text-slate-500">Domain</div>
                          <div className="text-sm font-extrabold text-slate-900 break-all">
                            {parsedResult.urlDetails.hostname}
                          </div>
                          {(parsedResult.urlDetails.pathname !== '/' ||
                            parsedResult.urlDetails.search) && (
                            <div className="text-xs font-mono text-slate-600 break-all pt-1">
                              Path: {parsedResult.urlDetails.pathname}
                              {parsedResult.urlDetails.search}
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 leading-snug">
                          Verify the domain above matches where you expect to go before opening.
                        </p>

                        <a
                          href={parsedResult.urlDetails.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                        >
                          <span>Open Destination Link</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Structured Preview for Wi-Fi */}
                    {parsedResult.kind === 'wifi' && parsedResult.wifiDetails && (
                      <div className="p-4 rounded-xl bg-white border border-emerald-200/80 shadow-xs space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Network (SSID)</span>
                          <span className="font-bold text-slate-900">
                            {parsedResult.wifiDetails.ssid}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Security</span>
                          <span className="font-semibold text-slate-800 uppercase">
                            {parsedResult.wifiDetails.encryption}
                          </span>
                        </div>
                        {parsedResult.wifiDetails.password && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-slate-500 block text-[11px]">Password</span>
                              <span className="font-mono font-bold text-slate-900 select-all">
                                {parsedResult.wifiDetails.password}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyText(parsedResult.wifiDetails!.password, true)
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              {copiedWifiPass ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Pass</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Structured Preview for Email / Phone / SMS */}
                    {parsedResult.kind === 'email' && parsedResult.emailDetails && (
                      <div className="p-3.5 rounded-xl bg-white border border-purple-200/80 text-xs space-y-1.5">
                        <div>
                          <span className="text-slate-500">To: </span>
                          <span className="font-bold text-slate-900">
                            {parsedResult.emailDetails.to}
                          </span>
                        </div>
                        {parsedResult.emailDetails.subject && (
                          <div>
                            <span className="text-slate-500">Subject: </span>
                            <span className="font-medium text-slate-800">
                              {parsedResult.emailDetails.subject}
                            </span>
                          </div>
                        )}
                        {parsedResult.emailDetails.body && (
                          <div className="text-slate-600 pt-1">
                            {parsedResult.emailDetails.body}
                          </div>
                        )}
                      </div>
                    )}

                    {parsedResult.kind === 'phone' && parsedResult.phoneDetails && (
                      <div className="p-3.5 rounded-xl bg-white border border-amber-200/80 text-xs flex items-center justify-between">
                        <span className="text-slate-500">Phone Number</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {parsedResult.phoneDetails.number}
                        </span>
                      </div>
                    )}

                    {parsedResult.kind === 'sms' && parsedResult.smsDetails && (
                      <div className="p-3.5 rounded-xl bg-white border border-indigo-200/80 text-xs space-y-1">
                        <div>
                          <span className="text-slate-500">Number: </span>
                          <span className="font-bold text-slate-900 font-mono">
                            {parsedResult.smsDetails.number}
                          </span>
                        </div>
                        {parsedResult.smsDetails.message && (
                          <div className="text-slate-600">
                            Message: {parsedResult.smsDetails.message}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Raw Decoded Content Box */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Raw Decoded Content
                      </label>
                      <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 break-all max-h-36 overflow-y-auto select-all">
                        {parsedResult.raw}
                      </div>
                    </div>

                    {/* Copy & Scan Another Actions */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopyText(parsedResult.raw)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        {copiedRaw ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Content</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setParsedResult(null);
                          setErrorMessage(null);
                          if (mode === 'camera') {
                            startCamera();
                          } else {
                            setUploadedPreviewUrl(null);
                            setUploadedFileName(null);
                          }
                        }}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Scan Another</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Privacy guarantee */}
                <div className="pt-3 border-t border-slate-200/70 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Decoded 100% locally in your browser. Zero uploads.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
