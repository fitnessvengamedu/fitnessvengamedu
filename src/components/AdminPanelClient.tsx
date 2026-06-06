'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UploadCloud, 
  Search, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  Video, 
  User,
  Phone,
  Info,
  ExternalLink,
  Database
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: string;
  blood_group: string;
  street: string;
  area: string;
  district: string;
  age: number | null;
  gender: string | null;
  member_id: string | null;
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  razorpay_subscription_id: string | null;
  plan_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
}

interface AdminPanelClientProps {
  initialProfiles: Profile[];
  initialSubscriptions: Subscription[];
}

export default function AdminPanelClient({ initialProfiles, initialSubscriptions }: AdminPanelClientProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'upload'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  
  // File upload state
  const [files, setFiles] = useState<File[]>([]);
  const [eventName, setEventName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [currentUploadingIndex, setCurrentUploadingIndex] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successLink, setSuccessLink] = useState('');
  const [dbStatusInfo, setDbStatusInfo] = useState('');

  // SQL Copy state
  const [copied, setCopied] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  const sqlMigrationCode = `CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to gallery items" ON public.gallery_items;
CREATE POLICY "Allow public read access to gallery items" 
ON public.gallery_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin write access to gallery items" ON public.gallery_items;
CREATE POLICY "Allow admin write access to gallery items" 
ON public.gallery_items FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlMigrationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      setUploadStatus('idle');
      setErrorMessage('');
      setDbStatusInfo('');
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0 || !eventName.trim()) {
      setUploadStatus('error');
      setErrorMessage('Please provide both an event name and at least one file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');
    setDbStatusInfo('');
    setSuccessLink('');

    let successCount = 0;
    let dbSuccessCount = 0;
    const failedFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      setCurrentUploadingIndex(i);
      const file = files[i];

      const formData = new FormData();
      formData.append('file', file);
      formData.append('event_name', eventName.trim());

      try {
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          successCount++;
          if (data.savedToDb) {
            dbSuccessCount++;
          }
          if (i === files.length - 1) {
            setSuccessLink(data.webViewLink || data.directUrl);
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
      if (dbSuccessCount === files.length) {
        setDbStatusInfo(`Successfully uploaded all ${files.length} files to Google Drive & saved to database!`);
      } else {
        setDbStatusInfo(`Uploaded all ${files.length} files to Google Drive. Saved ${dbSuccessCount} of ${files.length} to database.`);
      }
      setFiles([]);
      setEventName('');
    } else if (successCount > 0) {
      setUploadStatus('error');
      setErrorMessage(`Uploaded ${successCount} of ${files.length} files. Failed uploads:\n${failedFiles.join('\n')}`);
    } else {
      setUploadStatus('error');
      setErrorMessage(`Failed to upload files:\n${failedFiles.join('\n')}`);
    }
  };

  // Map of plan IDs to friendly names
  const getFriendlyPlanName = (planId: string | undefined) => {
    if (!planId) return 'No Plan';
    if (planId === 'plan_Swj162e2tGBqGT') return 'Monthly Plan';
    if (planId === 'plan_Swj2v7bdRjShBX') return 'Quarterly Plan';
    if (planId === 'plan_Swj3IkXcuRazsD') return 'Half-Yearly Plan';
    if (planId === 'plan_Swj3nt9CvioNy2') return 'Yearly Plan';
    return 'QR / Custom Plan';
  };

  // Combine profiles and subscriptions data
  const combinedMembers = useMemo(() => {
    return initialProfiles.map(profile => {
      // Find active subscription first, fall back to any subscription
      const sub = initialSubscriptions.find(s => s.user_id === profile.id && s.status === 'active') ||
                  initialSubscriptions.find(s => s.user_id === profile.id);
      
      return {
        ...profile,
        subscription: sub || null,
        planName: sub ? getFriendlyPlanName(sub.plan_id) : 'No Plan',
        expiryDate: sub?.current_period_end ? new Date(sub.current_period_end) : null,
        status: sub?.status || 'inactive'
      };
    });
  }, [initialProfiles, initialSubscriptions]);

  // Filter members based on search
  const filteredMembers = useMemo(() => {
    return combinedMembers.filter(member => {
      const nameMatch = member.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const phoneMatch = member.phone?.toLowerCase().includes(searchQuery.toLowerCase());
      const planMatch = member.planName?.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || phoneMatch || planMatch;
    });
  }, [combinedMembers, searchQuery]);

  // Telemetry Metrics
  const activeSubsCount = useMemo(() => {
    return combinedMembers.filter(m => m.status === 'active').length;
  }, [combinedMembers]);

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 bg-deep-obsidian">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-glass-stroke pb-6 mb-12">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter font-sora text-white leading-tight mb-2">
            ADMIN <span className="text-electric-lime text-glow">COMMAND CENTER</span>
          </h1>
          <p className="text-white/60 text-sm font-mono uppercase tracking-widest">
            Secure Biometric & Stream Operations Console
          </p>
        </div>
        
        <form action="/auth/signout" method="post">
          <button type="submit" className="px-6 py-3 border border-apex-crimson/50 text-apex-crimson hover:bg-apex-crimson/10 transition-colors font-mono uppercase tracking-widest text-xs rounded-lg cursor-pointer">
            Sign Out
          </button>
        </form>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
        <div className="glass-card p-6 border-l-4 border-l-electric-lime flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-white/40 mb-1">Total Registered</p>
            <h3 className="text-2xl font-bold font-sora text-white">{initialProfiles.length} Members</h3>
          </div>
          <Users className="w-8 h-8 text-white/20" />
        </div>
        <div className="glass-card p-6 border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-white/40 mb-1">Active Subscriptions</p>
            <h3 className="text-2xl font-bold font-sora text-emerald-400">{activeSubsCount} Active</h3>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/20" />
        </div>
        <div className="glass-card p-6 border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-white/40 mb-1">Database Sync</p>
            <h3 className="text-2xl font-bold font-sora text-white">Online</h3>
          </div>
          <Database className="w-8 h-8 text-amber-500/20" />
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex justify-center gap-4 max-w-5xl mx-auto mb-8 font-mono text-xs uppercase tracking-widest">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-6 py-3 border rounded-lg transition-all duration-300 ${
            activeTab === 'members'
              ? 'bg-electric-lime text-deep-obsidian border-electric-lime font-bold shadow-[0_0_15px_rgba(223,255,17,0.3)]'
              : 'text-white/60 border-glass-stroke hover:text-white hover:border-white/20'
          }`}
        >
          <Users className="w-4 h-4" /> Member Subscriptions
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-6 py-3 border rounded-lg transition-all duration-300 ${
            activeTab === 'upload'
              ? 'bg-electric-lime text-deep-obsidian border-electric-lime font-bold shadow-[0_0_15px_rgba(223,255,17,0.3)]'
              : 'text-white/60 border-glass-stroke hover:text-white hover:border-white/20'
          }`}
        >
          <UploadCloud className="w-4 h-4" /> Gallery Event Upload
        </button>
      </div>

      {/* Tab Contents */}
      <div className="max-w-5xl mx-auto">
        {activeTab === 'members' ? (
          <div className="glass-card overflow-hidden border border-glass-stroke">
            {/* Table Search Header */}
            <div className="p-5 border-b border-glass-stroke bg-white/[0.02] flex flex-col md:flex-row gap-4 justify-between items-center">
              <h3 className="font-sora text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-electric-lime" /> Member Registry
              </h3>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by name, phone, plan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-deep-obsidian border border-glass-stroke focus:border-electric-lime/40 outline-none text-white pl-10 pr-4 py-2.5 rounded-lg text-xs font-mono transition-all"
                />
              </div>
            </div>

            {/* Table Layout */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-glass-stroke bg-white/[0.01] font-mono text-[10px] uppercase tracking-widest text-white/40">
                    <th className="py-4 px-6">Athlete Name</th>
                    <th className="py-4 px-6">Phone Number</th>
                    <th className="py-4 px-6">Chosen Plan</th>
                    <th className="py-4 px-6">Subscription Status</th>
                    <th className="py-4 px-6">Next Payment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-stroke/50 font-sans text-sm">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => {
                      const isUpcomingRenewal = member.expiryDate && 
                        (member.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 7 &&
                        (member.expiryDate.getTime() - new Date().getTime()) > 0;

                      return (
                        <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-electric-lime/10 border border-electric-lime/20 flex items-center justify-center font-bold text-electric-lime font-mono text-xs uppercase">
                                {member.full_name ? member.full_name.slice(0, 2) : 'A'}
                              </div>
                              <div>
                                <h4 className="font-bold text-white leading-none mb-1">{member.full_name || 'Classified'}</h4>
                                <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">
                                  ID: {member.member_id || member.id.slice(0, 6)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-mono text-xs text-white/80">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-white/30" />
                              {member.phone || 'Not provided'}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-mono text-xs text-electric-lime bg-electric-lime/5 border border-electric-lime/10 px-2.5 py-1 rounded">
                              {member.planName}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono capitalize ${
                              member.status === 'active' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-white/5 text-white/40 border border-white/10'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-400' : 'bg-white/20'}`} />
                              {member.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-mono text-xs">
                            {member.expiryDate ? (
                              <div className="flex items-center gap-2">
                                <Calendar className={`w-3.5 h-3.5 ${isUpcomingRenewal ? 'text-amber-400' : 'text-white/40'}`} />
                                <span className={isUpcomingRenewal ? 'text-amber-400 font-bold' : 'text-white/80'}>
                                  {member.expiryDate.toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                                {isUpcomingRenewal && (
                                  <span className="bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[9px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider animate-pulse">
                                    Alert (≤7d)
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-white/30">N/A</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-white/30 font-mono text-xs uppercase">
                        No members found matching query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-card border border-glass-stroke p-6 sm:p-8">
            <h3 className="font-sora text-lg font-bold text-white mb-2 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-electric-lime" /> Gallery Event Photo Upload
            </h3>
            <p className="text-white/60 text-xs font-mono uppercase tracking-wider mb-8">
              Sort media live to public events stream
            </p>

            <div className="space-y-6">
              {/* Event Name Input */}
              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50">Event Name</label>
                <input
                  type="text"
                  placeholder="e.g. Annual Power Meet 2026, Cardio Blast Session"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-deep-obsidian border border-glass-stroke focus:border-electric-lime/40 outline-none text-white px-4 py-3 rounded-lg text-sm transition-all"
                />
              </div>

              {/* Upload Drop Zone */}
              <div className="border-2 border-dashed border-glass-stroke hover:border-electric-lime/30 rounded-lg p-10 flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.02] transition-colors relative cursor-pointer">
                <input 
                  type="file" 
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  disabled={isUploading}
                />
                
                <UploadCloud className="w-12 h-12 text-white/20 mb-4" />
                <p className="text-sm font-bold text-white mb-1">
                  {files.length > 0 ? `${files.length} file(s) selected` : 'Click or drag files to select'}
                </p>
                <p className="text-xs text-white/40 font-mono">
                  Supports multiple Images (.jpg, .png) and Videos (.mp4)
                </p>
              </div>

              {/* Selected Files List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto border border-glass-stroke rounded-lg p-3 bg-deep-obsidian/30">
                  <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Selected Files ({files.length})</p>
                  {files.map((f, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-deep-obsidian/50 border border-glass-stroke text-xs">
                      <div className="flex items-center space-x-2 truncate">
                        {f.type.startsWith('image/') ? <ImageIcon className="w-3.5 h-3.5 text-electric-lime" /> : <Video className="w-3.5 h-3.5 text-sky-400" />}
                        <span className="truncate max-w-[200px] font-mono text-white/80">{f.name}</span>
                        <span className="text-[9px] text-white/40 font-mono">({(f.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        disabled={isUploading}
                        className="text-[10px] text-white/40 hover:text-red-400 font-mono px-2 py-0.5 rounded hover:bg-white/5 transition-all cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Trigger */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleUpload}
                  disabled={files.length === 0 || !eventName.trim() || isUploading}
                  className={`px-8 py-3 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${
                    files.length === 0 || !eventName.trim() || isUploading
                      ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                      : 'bg-electric-lime hover:bg-electric-lime/90 text-deep-obsidian font-bold shadow-[0_0_20px_rgba(223,255,17,0.25)] active:scale-95 cursor-pointer'
                  }`}
                >
                  {isUploading 
                    ? `Streaming (${currentUploadingIndex !== null ? currentUploadingIndex + 1 : 0}/${files.length})...` 
                    : 'Process Upload & Sync'}
                </button>
              </div>

              {/* Status Indicator Messages */}
              {uploadStatus === 'success' && (
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-lg flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-emerald-400 font-bold text-sm">Upload Successful!</p>
                    <p className="text-white/60 text-xs mt-1 leading-relaxed">
                      {dbStatusInfo}
                    </p>
                    {successLink && (
                      <a 
                        href={successLink} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-emerald-400 text-xs font-mono hover:underline mt-2.5 inline-flex items-center gap-1"
                      >
                        Inspect Resource <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-bold text-sm">Pipeline Error</p>
                    <p className="text-white/60 text-xs mt-1">{errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
