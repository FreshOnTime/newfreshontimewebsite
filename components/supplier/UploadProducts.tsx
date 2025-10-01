"use client";

import { useState } from 'react';

export default function UploadProducts() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setMessage(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return setError('Please select a file to upload');
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      // Build a base64 Data URL from the file and send JSON fallback which the server supports.
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });

      const payload = {
        fileName: file.name,
        fileData: dataUrl,
        mimeType: file.type || undefined,
      };

      const res = await fetch('/api/suppliers/upload', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json && json.success) {
        setMessage('File uploaded — admin will review it shortly.');
        setFile(null);
      } else {
        setError(json?.error || 'Upload failed');
      }
    } catch (err) {
      console.error('UploadProducts upload error:', err);
      setError('Upload error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Upload Product List</h3>
          <p className="text-sm text-gray-600 mt-1">Upload an Excel (.xlsx) or CSV (.csv) file containing your product catalog. Admin will review and import.</p>
        </div>
        <div className="text-right">
          <a href="/templates/product-upload-template.csv" download className="text-sm text-green-600 hover:underline">Download Template</a>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <label className="col-span-2 flex items-center gap-3 p-3 border border-dashed rounded-md cursor-pointer hover:bg-gray-50">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-green-500">
            <path d="M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 12l7-7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <div className="text-sm font-medium">Choose file</div>
            <div className="text-xs text-gray-500">.xlsx or .csv — up to 5 MB</div>
          </div>
          <input className="sr-only" type="file" accept=".csv,.xlsx" onChange={onChange} />
        </label>

        <div className="md:col-span-1">
          <div className="p-3 border rounded-md bg-gray-50 h-full flex flex-col justify-between">
            <div>
              <div className="text-xs text-gray-500">Selected file</div>
              <div className="text-sm font-medium mt-1">{file ? file.name : <span className="text-gray-400">No file chosen</span>}</div>
              {file && <div className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</div>}
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={handleUpload} disabled={loading || !file} className="w-full inline-flex justify-center items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60">
                {loading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : null}
                <span>{loading ? 'Uploading...' : 'Send to Admin'}</span>
              </button>
              <a href="/templates/product-upload-template.csv" download className="w-full inline-flex justify-center items-center gap-2 px-3 py-2 border rounded-md text-sm">
                Download Template
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {message && <div className="text-sm text-green-700 bg-green-50 p-2 rounded">{message}</div>}
        {error && <div className="text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}
      </div>
    </div>
  );
}
