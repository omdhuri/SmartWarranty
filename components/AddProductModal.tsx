import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Save, FileText } from 'lucide-react';
import { Product, OcrResult } from '../types';
import { analyzeProductImage } from '../services/geminiService'; // Ensure this service exists or handle if missing
import { createProduct, uploadProductImage } from '../services/productService'; // Import Supabase service
import { CATEGORIES } from '../constants';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSave }) => {
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // Track file for upload
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Track saving state
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: '',
    modelNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0], // Default to today
    warrantyDurationMonths: 12,
    category: 'electronics',
    price: 0,
    notes: ''
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file); // Store file for upload

    // Create preview
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);

      // Trigger OCR (Optional: Only if in scan mode)
      if (mode === 'scan') {
        setIsAnalyzing(true);
        try {
          // Check if Gemini service is implemented, otherwise skip or mock
          // const result = await analyzeProductImage(base64String);
          // populateFormFromOCR(result);
          console.log("OCR Placeholder: Image selected");
        } catch (err) {
          console.error("Analysis failed", err);
          alert("Failed to analyze image. Please fill details manually.");
        } finally {
          setIsAnalyzing(false);
          setMode('manual'); // Switch to form view to review data
        }
      }
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const populateFormFromOCR = (data: OcrResult) => {
    setFormData(prev => ({
      ...prev,
      name: data.productName || prev.name,
      brand: data.brand || prev.brand,
      modelNumber: data.modelNumber || prev.modelNumber,
      purchaseDate: data.purchaseDate || prev.purchaseDate,
      warrantyDurationMonths: data.warrantyDuration || prev.warrantyDurationMonths
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.purchaseDate) {
      alert("Please fill in required fields (Name, Purchase Date)");
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = imagePreview;

      // 1. Upload image if a new file is selected
      if (imageFile) {
        const uploadedUrl = await uploadProductImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          console.warn("Image upload failed, proceeding without image URL update");
        }
      }

      // 2. Prepare product data for Supabase
      const productToSave: Partial<Product> = {
        ...formData,
        imageUrl: imageUrl || undefined,
        // Ensure numbers are numbers
        warrantyDurationMonths: Number(formData.warrantyDurationMonths),
        price: Number(formData.price)
      };

      // 3. Save to Supabase
      const savedProduct = await createProduct(productToSave);

      if (savedProduct) {
        onSave(savedProduct); // Notify parent to refresh
        resetForm();
        onClose();
      } else {
        console.error("Failed to save product");
        // Maintain alert only for specific failure if needed, or rely on UI to show nothing
        alert("Failed to save product. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      alert("An unexpected error occurred. Please try again.");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
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
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              {isAnalyzing ? (
                <div className="text-center">
                  <Loader2 size={48} className="text-cta animate-spin mb-4 mx-auto" />
                  <p className="text-slate-600 font-medium">Analyzing image...</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
                    <Camera size={32} className="text-cta" />
                  </div>
                  <p className="text-slate-900 font-semibold mb-1">Click to upload or take photo</p>
                  <p className="text-sm text-slate-500">Supports JPG, PNG (Max 5MB)</p>
                </div>
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
          <button
            disabled={(mode === 'scan' && !imagePreview) || isSaving}
            onClick={handleSave}
            className="px-6 py-2 bg-cta text-white font-semibold rounded-lg shadow-lg hover:bg-sky-600 hover:shadow-glow hover:-translate-y-0.5 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
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
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;