'use client';

import { useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { TextInput } from './form';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  /** Endpoint to upload to. Defaults to /api/admin/upload (admin-only). */
  endpoint?: string;
}

export function ImageUpload({ value, onChange, label = 'Image', endpoint = '/api/admin/upload' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(endpoint, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      onChange(data.url);
    } catch (e: any) {
      setError(e.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">{label}</span>
      <div className="flex items-start gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-[#bdc9ca] bg-[#f5f3f3]">
          {value ? (
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Icon name="image" className="text-[28px] text-[#bdc9ca]" />
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-[#bdc9ca] bg-white px-3 py-2 text-[11px] font-bold text-[#3e494a] hover:bg-[#f5f3f3]"
          >
            <Icon name="upload" className="mr-1 text-[14px]" /> Upload
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="ml-2 rounded-lg border border-[#bdc9ca] bg-white px-3 py-2 text-[11px] font-bold text-[#910816] hover:bg-[#ffdad7]"
            >
              <Icon name="delete" className="mr-1 text-[14px]" /> Remove
            </button>
          )}
          <div className="mt-2">
            <TextInput
              type="url"
              placeholder="Or paste image URL"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
          {error && <p className="mt-1 text-[10px] font-semibold text-[#910816]">{error}</p>}
        </div>
      </div>
    </div>
  );
}
