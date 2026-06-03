'use client';

import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Video, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successLink, setSuccessLink] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadStatus('idle');
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('idle');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus('success');
        setSuccessLink(data.webViewLink);
        setFile(null); // clear after success
      } else {
        setUploadStatus('error');
        setErrorMessage(data.error || 'Failed to upload file');
      }
    } catch (err: any) {
      setUploadStatus('error');
      setErrorMessage('Network error occurred while uploading');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Admin Media Upload</h1>
        <p className="text-zinc-400 mb-8">
          Upload photos or videos. The system will automatically detect the file type and save it to the correct Google Drive folder (Photo or Video).
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          
          {/* Upload Area */}
          <div className="border-2 border-dashed border-zinc-700 rounded-lg p-10 flex flex-col items-center justify-center bg-zinc-900 hover:bg-zinc-800/50 transition-colors relative cursor-pointer">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              accept="image/*,video/*"
              disabled={isUploading}
            />
            
            <UploadCloud className="w-12 h-12 text-zinc-500 mb-4" />
            <p className="text-lg font-medium mb-1">
              {file ? file.name : 'Click or drag file to upload'}
            </p>
            <p className="text-sm text-zinc-500">
              {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Supports Images (.jpg, .png) and Videos (.mp4)'}
            </p>
            
            {file && (
              <div className="mt-4 flex items-center space-x-2 text-zinc-300 bg-zinc-800 px-3 py-1.5 rounded-full text-sm">
                {file.type.startsWith('image/') ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                <span>Identified as {file.type.startsWith('image/') ? 'Photo' : 'Video'}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                !file || isUploading
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
              }`}
            >
              {isUploading ? 'Uploading to Drive...' : 'Upload File'}
            </button>
          </div>

          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <div className="mt-6 p-4 bg-emerald-900/30 border border-emerald-800/50 rounded-lg flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-400 font-medium">Upload Successful!</p>
                <p className="text-emerald-500/80 text-sm mt-1">
                  The file has been automatically sorted and saved to your Google Drive.
                </p>
                {successLink && (
                  <a href={successLink} target="_blank" rel="noreferrer" className="text-emerald-400 text-sm hover:underline mt-2 inline-block">
                    View in Google Drive &rarr;
                  </a>
                )}
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="mt-6 p-4 bg-red-900/30 border border-red-800/50 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Upload Failed</p>
                <p className="text-red-500/80 text-sm mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
