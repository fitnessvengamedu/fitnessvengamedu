'use client';

import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Video, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successLink, setSuccessLink] = useState('');
  const [eventName, setEventName] = useState('');
  const [currentUploadingIndex, setCurrentUploadingIndex] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      setUploadStatus('idle');
      setErrorMessage('');
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');
    setSuccessLink('');

    let successCount = 0;
    const failedFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      setCurrentUploadingIndex(i);
      const file = files[i];

      const formData = new FormData();
      formData.append('file', file);
      if (eventName) {
        formData.append('event_name', eventName);
      }

      try {
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          successCount++;
          if (i === files.length - 1) {
            setSuccessLink(data.webViewLink);
          }
        } else {
          failedFiles.push(`${file.name}: ${data.error || 'Failed to upload'}`);
        }
      } catch (err) {
        failedFiles.push(`${file.name}: Network error`);
      }
    }

    setCurrentUploadingIndex(null);
    setIsUploading(false);

    if (successCount === files.length) {
      setUploadStatus('success');
      setFiles([]); // clear files after successful upload
      setEventName(''); // clear event name
    } else if (successCount > 0) {
      setUploadStatus('error');
      setErrorMessage(`Successfully uploaded ${successCount} of ${files.length} files. Failed uploads:\n${failedFiles.join('\n')}`);
    } else {
      setUploadStatus('error');
      setErrorMessage(`Failed to upload files:\n${failedFiles.join('\n')}`);
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
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              accept="image/*,video/*"
              disabled={isUploading}
            />
            
            <UploadCloud className="w-12 h-12 text-zinc-500 mb-4" />
            <p className="text-lg font-medium mb-1">
              {files.length > 0 ? `${files.length} file(s) selected` : 'Click or drag files to upload'}
            </p>
            <p className="text-sm text-zinc-500">
              Supports multiple Images (.jpg, .png) and Videos (.mp4)
            </p>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-2 max-h-60 overflow-y-auto border border-zinc-800 rounded-lg p-4 bg-zinc-950/50">
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Selected Files ({files.length})</p>
              {files.map((file, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm">
                  <div className="flex items-center space-x-2 truncate">
                    {file.type.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-emerald-500" /> : <Video className="w-4 h-4 text-sky-500" />}
                    <span className="truncate max-w-[250px] font-mono text-xs">{file.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    disabled={isUploading}
                    className="text-xs text-zinc-500 hover:text-red-400 font-mono px-2 py-1 rounded hover:bg-zinc-800/50 transition-all"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action Button and Inputs */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-end space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-1/2">
              <label htmlFor="eventName" className="block text-sm font-medium text-zinc-400 mb-1">
                Event Name (Optional)
              </label>
              <input
                type="text"
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Summer Bootcamp 2026"
                disabled={isUploading}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                files.length === 0 || isUploading
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
              }`}
            >
              {isUploading 
                ? `Uploading (${currentUploadingIndex !== null ? currentUploadingIndex + 1 : 0}/${files.length})...` 
                : 'Upload Files'}
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
