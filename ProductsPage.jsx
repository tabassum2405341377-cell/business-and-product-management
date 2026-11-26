import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { businessService } from '../services/businessService';
import { Modal } from '../components/common/Modal';
import {
  Boxes,
  Plus,
  Trash2,
  Tag,
  Building2,
  DollarSign,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const ProductsPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    price: '',
    currency: 'BDT',
    features: '',
  });

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await businessService.getAll();
        const list = res.data || [];
        setBusinesses(list);
        if (list.length > 0) {
          setSelectedBusinessId(list[0]._id || list[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBusinesses();
  }, []);

  const fetchProducts = async (businessId) => {
    if (!businessId) return;
    setLoading(true);
    try {
      const response = await productService.getByBusiness(businessId);
      setProducts(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBusinessId) {
      fetchProducts(selectedBusinessId);
    }
  }, [selectedBusinessId]);

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    try {
      const features = formData.features
        ? formData.features.split(',').map((feature) => feature.trim()).filter(Boolean)
        : [];

      await productService.create({
        businessId: selectedBusinessId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: Number.parseFloat(formData.price),
        currency: formData.currency,
        features,
      });

      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'General',
        price: '',
        currency: 'BDT',
        features: '',
      });
      await fetchProducts(selectedBusinessId);
    } catch (error) {
      alert(error.message || 'Failed to add product');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productService.delete(productId);
      await fetchProducts(selectedBusinessId);
    } catch (error) {
      alert(error.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Product Catalog Foundation
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real products with verified prices and features — AI Content Generator uses these exact specs to eliminate hallucinations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!selectedBusinessId}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-100 disabled:opacity-50 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Business Selector Tab */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600" /> Active Business:
        </label>
        <select
          value={selectedBusinessId}
          onChange={(e) => setSelectedBusinessId(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-indigo-500"
        >
          {businesses.map((b) => (
            <option key={b._id || b.id} value={b._id || b.id}>
              {b.businessName} ({b.category})
            </option>
          ))}
        </select>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Boxes className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No Products in Catalog</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Add products for this business so the Gemini AI can generate targeted posts with authentic pricing.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" /> Add First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p._id || p.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {p.category}
                  </span>
                  <button
                    onClick={() => handleDelete(p._id || p.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">{p.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                  {p.description}
                </p>

                {/* Features */}
                {p.features && p.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {p.features.map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                      >
                        • {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Price</span>
                  <span className="text-base font-black text-slate-900">
                    {p.price} {p.currency}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Ready for AI
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Product to Catalog">
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Heritage Khadi Cotton Panjabi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Traditional Menswear"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verified Price (BDT) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="2450"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of craftsmanship, materials, and styling..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Key Features (comma separated)
            </label>
            <input
              type="text"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="100% Breathable Cotton, Handloom Woven, Mandarin Collar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-100"
            >
              Add Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
