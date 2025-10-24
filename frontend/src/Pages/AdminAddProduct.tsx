import React, { useEffect, useState } from 'react';

const baseUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

export default function AdminAddProduct() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [category_name, setCategory_name] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`${baseUrl}/api/categories`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setError('Failed to load categories'));
  }, []);

  async function uploadImage() {
    if (!imageFile) return null;
    const fd = new FormData();
    fd.append('image', imageFile);

    const res = await fetch(`${baseUrl}/api/products/upload`, {
      method: 'POST',
      credentials: 'include',
      body: fd
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(body.error || 'Upload failed');
    }
    const data = await res.json();
    return data.url;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name || !description || price === '' || stock === '' || !category_name) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const res = await fetch(`${baseUrl}/api/products`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          stock: Number(stock),
          category_name: Number(category_name),
          image_url: imageUrl
        })
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Create product failed');

      setSuccess(true);
      setName(''); setDescription(''); setPrice(''); setStock(''); setCategory_name(''); setImageFile(null);
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Product</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">Product created</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Name</label>
          <input className="w-full" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="block">Category</label>
          <select className="w-full" value={category_name as any} onChange={e => setCategory_name((e.target.value))}>
            <option value="">Select category</option>
            {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block">Description</label>
          <textarea className="w-full" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="block">Price</label>
          <input type="number" step="0.01" className="w-full" value={price as any} onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div>
          <label className="block">Stock</label>
          <input type="number" className="w-full" value={stock as any} onChange={e => setStock(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div>
          <label className="block">Image</label>
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
        </div>
        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Saving...' : 'Create product'}</button>
        </div>
      </form>
    </div>
  );
}
