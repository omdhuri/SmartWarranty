import React, { useState, useRef, useCallback } from 'react';
// import Webcam from 'react-webcam'; // Removed
import { Camera, Upload, X, Loader2, Save, Check, FileText, Smartphone, ShieldCheck, RefreshCw } from 'lucide-react';
import { Product, OcrResult } from '../types';
import { analyzeProductImage } from '../services/geminiService';
import { createProduct, uploadProductImage } from '../services/productService';
import { CATEGORIES } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSave }) => {
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [showCamera, setShowCamera] = useState(false); // Camera toggle state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    setShowCamera(true);
    // Request permission immediately
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        alert("Camera access was denied. Please check your browser permissions (click the lock icon in the URL bar) and try again.");
      } else {
        alert("Could not access camera. Please upload an image instead.");
      }
      setShowCamera(false);
    }
  };

  // Attach stream to video element when stream or videoRef changes
  React.useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, showCamera]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const ioCapture = () => {
    console.log("Attempting capture...");
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState === 4) { // HAVE_ENOUGH_DATA
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageSrc = canvas.toDataURL('image/jpeg');
          console.log("Capture successful, length:", imageSrc.length);
          setImagePreview(imageSrc);

          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
              setImageFile(file);
            }
          }, 'image/jpeg');

          stopCamera();
          setMode('manual');
        }
      } else {
        console.warn("Video not ready for capture. ReadyState:", video.readyState);
      }
    } else {
      console.error("Refs missing. Video:", videoRef.current, "Canvas:", canvasRef.current);
    }
  };

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: '',
    modelNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyDurationMonths: 12,
    category: 'electronics',
    price: 0,
    notes: ''
  });

  const processImage = async (imageSrc: string) => {
    setImagePreview(imageSrc); // Show preview immediately

    if (mode === 'scan') {
      setIsAnalyzing(true);
      try {
        console.log("Starting AI Analysis...");
        const result = await analyzeProductImage(imageSrc);
        console.log("AI Result:", result);

        setFormData(prev => ({
          ...prev,
          name: result.productName || prev.name,
          brand: result.brand || prev.brand,
          modelNumber: result.modelNumber || prev.modelNumber,
          purchaseDate: result.purchaseDate || prev.purchaseDate,
          warrantyDurationMonths: result.warrantyDuration || prev.warrantyDurationMonths
        }));

      } catch (err) {
        console.error("Analysis failed:", err);
        // Optional: Show a toast error
      } finally {
        setIsAnalyzing(false);
        setMode('manual');
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await processImage(base64String);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  const handleSave = async () => {
    if (!formData.name || !formData.purchaseDate) {
      alert("Please fill in required fields (Name, Purchase Date)");
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = imagePreview;
      if (imageFile) {
        const uploadedUrl = await uploadProductImage(imageFile);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const productToSave: Partial<Product> = {
        ...formData,
        imageUrl: imageUrl || undefined,
        warrantyDurationMonths: Number(formData.warrantyDurationMonths),
        price: Number(formData.price)
      };

      const savedProduct = await createProduct(productToSave);

      if (savedProduct) {
        setShowSuccess(true); // Trigger Success Animation

        // Wait for animation before closing
        setTimeout(() => {
          onSave(savedProduct);
          resetForm();
          onClose();
          setShowSuccess(false);
        }, 2500);
      } else {
        alert("Failed to save product. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      modelNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      warrantyDurationMonths: 12,
      category: 'electronics',
      price: 0,
      notes: ''
    });
    setImagePreview(null);
    setImageFile(null);
    setMode('scan');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md" // Glassmorphism Overlay
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative"
          >

            {/* Success Overlay */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center text-center p-8"
                >
                  {/* 3D Checkmark Effect */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                    className="w-24 h-24 bg-gradient-to-tr from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg mb-6"
                  >
                    <Check className="text-white w-12 h-12" strokeWidth={4} />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-slate-900 mb-2"
                  >
                    You're all set!
                  </motion.h2>

                  {/* Staggered Checklist */}
                  <div className="space-y-3 mt-8 w-full max-w-sm">
                    {[
                      { icon: Smartphone, text: "Product secured in digital locker" },
                      { icon: ShieldCheck, text: "Warranty coverage activated" },
                      { icon: FileText, text: "Receipt analysis complete" }
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (idx * 0.15) }}
                        className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100"
                      >
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                          <item.icon size={16} className="text-green-600" />
                        </div>
                        <span className="font-semibold text-slate-700">{item.text}</span>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.8 + (idx * 0.15) }}
                          className="ml-auto"
                        >
                          <Check className="text-green-500 w-5 h-5" />
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-heading font-bold text-primary">Add New Product</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Mode Switcher */}
              <div className="flex space-x-2 mb-8 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setMode('scan')}
                  className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'scan' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Scan Receipt / Label
                </button>
                <button
                  onClick={() => setMode('manual')}
                  className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'manual' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Manual Entry
                </button>
              </div>

              {mode === 'scan' ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors relative overflow-hidden">

                  {showCamera ? (
                    <div className="w-full h-full flex flex-col items-center relative bg-black">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />

                      {/* Camera Controls */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-4">
                        <button
                          onClick={stopCamera}
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors"
                        >
                          <X size={24} />
                        </button>
                        <button
                          onClick={ioCapture}
                          className="p-1 border-4 border-white rounded-full bg-transparent hover:bg-white/20 transition-all"
                        >
                          <div className="w-12 h-12 bg-white rounded-full"></div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />

                      {/* Click area for file upload */}
                      <div
                        className="absolute inset-0 z-0 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      />

                      {isAnalyzing ? (
                        <div className="text-center z-10 relative pointer-events-none">
                          <Loader2 size={48} className="text-cta animate-spin mb-4 mx-auto" />
                          <p className="text-slate-600 font-medium">Analyzing with AI...</p>
                        </div>
                      ) : (
                        <div className="text-center z-10 relative pointer-events-none">
                          <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
                            <Camera size={32} className="text-cta" />
                          </div>
                          <p className="text-slate-900 font-semibold mb-1">Upload an image</p>
                          <p className="text-sm text-slate-500 mb-4">Supports JPG, PNG (Max 5MB)</p>

                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">OR</span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent file input trigger
                              startCamera();
                            }}
                            className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-cta transition-colors shadow-sm flex items-center pointer-events-auto mx-auto"
                          >
                            <Camera size={16} className="mr-2" />
                            Open Camera
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image Preview Side */}
                    <div className="order-2 md:order-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Product Image</label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="h-40 w-full rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer relative group"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center text-slate-400 group-hover:text-cta transition-colors">
                            <Upload size={24} className="mx-auto mb-2" />
                            <span className="text-xs">Upload Image</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="order-1 md:order-2 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Product Name *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cta focus:border-cta outline-none transition-all"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Samsung Galaxy S24"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Brand</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cta outline-none"
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Model No.</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cta outline-none"
                            value={formData.modelNumber}
                            onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates & Warranty */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Purchase Date *</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cta outline-none"
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Warranty (Months)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cta outline-none"
                        value={formData.warrantyDurationMonths}
                        onChange={(e) => setFormData({ ...formData, warrantyDurationMonths: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                      <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cta outline-none bg-white"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={(mode === 'scan' && !imagePreview) || isSaving}
                onClick={handleSave}
                className="px-6 py-2 bg-cta text-white font-semibold rounded-lg shadow-lg hover:bg-sky-600 hover:shadow-glow transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save to Locker
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddProductModal;