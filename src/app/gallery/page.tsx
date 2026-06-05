'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Play, Image as ImageIcon, Video, Calendar, Eye } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface GalleryItem {
  id: string;
  event_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeMedia, setActiveMedia] = useState<GalleryItem | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchGallery = async (showSyncSpinner = false) => {
    if (showSyncSpinner) setIsSyncing(true);
    else if (items.length === 0) setIsLoading(true);
    
    try {
      const url = showSyncSpinner ? '/api/gallery?sync=true' : '/api/gallery';
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.items) {
        setItems(data.items);
        // Save to client cache
        try {
          localStorage.setItem('s_fitness_gallery_cache', JSON.stringify(data.items));
        } catch (e) {
          console.warn('Failed to save gallery cache:', e);
        }
      }
    } catch (err) {
      console.error('Error fetching gallery items:', err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // 1. Load from cache first for instant page load
    try {
      const cached = localStorage.getItem('s_fitness_gallery_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          setIsLoading(false);
        }
      }
    } catch (e) {
      console.warn('Failed to load gallery cache:', e);
    }

    // 2. Fetch fresh data in background
    fetchGallery();

    const checkAdminStatus = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          if (profile && profile.role === 'admin') {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      }
    };

    checkAdminStatus();
  }, []);

  // Extract unique events for filters
  const eventFilters = useMemo(() => {
    const events = new Set<string>();
    items.forEach(item => {
      if (item.event_name) {
        events.add(item.event_name);
      }
    });
    return ['ALL', ...Array.from(events)];
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (selectedEvent === 'ALL') return items;
    return items.filter(item => item.event_name === selectedEvent);
  }, [items, selectedEvent]);

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 bg-deep-obsidian min-h-screen">
      {/* Title */}
      <div className="text-center mb-12 md:mb-16 max-w-2xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tighter font-sora text-white leading-tight mb-4"
        >
          TELEMETRY <span className="text-electric-lime text-glow">MEDIA STREAM</span>
        </motion.h1>
        <p className="text-white/60 text-sm font-mono uppercase tracking-widest">
          Secure Live Synced Gym & Event Archive Pipeline
        </p>
      </div>

      {/* Sync Status dashboard */}
      {isAdmin && (
        <div className="max-w-5xl mx-auto glass-card p-5 sm:p-6 mb-10 border-l-4 border-l-electric-lime shadow-[0_0_20px_rgba(223,255,17,0.02)]">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-lime opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-electric-lime"></span>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Status: Active</p>
                <h3 className="text-sm sm:text-base font-bold font-sora text-white">Google Drive Stream Online</h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => fetchGallery(true)}
                disabled={isSyncing}
                className="flex items-center gap-2 border border-glass-stroke hover:border-electric-lime/30 text-white/80 hover:text-white px-5 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-electric-lime' : ''}`} /> 
                {isSyncing ? 'Syncing...' : 'Re-sync Stream'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Event Filter Pills */}
      {eventFilters.length > 1 && (
        <div className="max-w-5xl mx-auto mb-10 flex flex-wrap gap-2.5 justify-center font-mono text-[10px] uppercase tracking-wider">
          {eventFilters.map(event => (
            <button
              key={event}
              onClick={() => setSelectedEvent(event)}
              className={`px-4 py-2 border rounded-full transition-all duration-300 ${
                selectedEvent === event
                  ? 'bg-electric-lime text-deep-obsidian border-electric-lime font-bold shadow-[0_0_12px_rgba(223,255,17,0.2)]'
                  : 'text-white/60 border-glass-stroke hover:text-white hover:border-white/20'
              }`}
            >
              {event === 'ALL' ? 'Show All Events' : event}
            </button>
          ))}
        </div>
      )}

      {/* Media Grid */}
      <div className="max-w-5xl mx-auto">
        {isLoading ? (
          /* Grid Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card overflow-hidden border border-glass-stroke aspect-video relative flex flex-col justify-between p-6 animate-pulse">
                <div className="w-16 h-4 bg-white/5 rounded font-mono" />
                <div className="space-y-2">
                  <div className="w-24 h-3 bg-white/10 rounded" />
                  <div className="w-36 h-4 bg-white/5 rounded" />
                  <div className="w-20 h-2 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => {
                const dateFormatted = new Date(item.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                // Optimization: use Google Drive image resizing parameter =w500 for grid thumbnails
                const optimizedThumbnail = item.file_type === 'image' 
                  ? `${item.file_url}=w500` 
                  : '/images/gym_2.jpg';

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    key={item.id} 
                    onClick={() => setActiveMedia(item)}
                    className="glass-card overflow-hidden group border border-glass-stroke aspect-video relative flex flex-col justify-between p-5 hover:border-electric-lime/30 transition-all duration-300 cursor-pointer"
                  >
                    {/* Media File Content */}
                    {item.file_type === 'image' ? (
                      <>
                        <img 
                          src={optimizedThumbnail} 
                          alt={item.event_name} 
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 z-0" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-deep-obsidian via-deep-obsidian/40 to-transparent z-10" />
                      </>
                    ) : (
                      <>
                        {/* Video Thumbnail (using local Gym_2) */}
                        <img 
                          src={optimizedThumbnail} 
                          alt="Video thumbnail" 
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-700 z-0" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-deep-obsidian via-deep-obsidian/40 to-transparent z-10" />
                        <div className="absolute inset-0 flex items-center justify-center z-20 group-hover:scale-110 transition-transform duration-300">
                          <div className="w-12 h-12 rounded-full bg-electric-lime/10 border border-electric-lime/30 flex items-center justify-center text-electric-lime">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </>
                    )}
                    
                    {/* HUD Header */}
                    <div className="flex justify-between items-start z-20">
                      <span className="font-mono text-[8px] uppercase tracking-widest bg-white/5 border border-glass-stroke px-2 py-0.5 rounded text-white/50">
                        {item.file_type === 'video' ? 'VIDEO.MP4' : 'IMAGE.JPG'}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[8px] text-white/40">{dateFormatted}</span>
                        <div className="w-2 h-2 rounded-full bg-electric-lime shadow-[0_0_8px_rgba(223,255,17,0.6)] animate-pulse" />
                      </div>
                    </div>
                    
                    {/* HUD Footer */}
                    <div className="space-y-1 z-20">
                      <p className="font-mono text-[9px] text-electric-lime uppercase tracking-widest font-bold flex items-center gap-1.5">
                        {item.file_type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                        {item.event_name || 'General Stream'}
                      </p>
                      <h4 className="text-xs font-mono font-bold text-white tracking-wide uppercase truncate max-w-full">
                        CH-{index + 1} // {item.file_type === 'video' ? 'STREAM_LIVE' : 'FRAME_SYNC'}
                      </h4>
                      <p className="font-mono text-[8px] text-white/40 uppercase tracking-widest truncate">
                        URL ID: {item.id.slice(0, 12)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="glass-card p-12 text-center text-white/40 border border-glass-stroke font-mono text-xs uppercase max-w-lg mx-auto">
            <p className="mb-2">No media found in the database or drive sync.</p>
            <p className="text-[10px] text-white/20">Upload event items via the Admin Panel to populate the telemetry screen.</p>
          </div>
        )}
      </div>

      {/* Lightbox / Video Player Modal */}
      {activeMedia && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-obsidian/95 backdrop-blur-md transition-all duration-300"
          onClick={() => setActiveMedia(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-zinc-950 border border-glass-stroke rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            {activeMedia.file_type === 'image' ? (
              <img 
                src={`${activeMedia.file_url}=w1200`} 
                alt={activeMedia.event_name} 
                referrerPolicy="no-referrer"
                className="w-full max-h-[70vh] object-contain mx-auto"
              />
            ) : (
              <video 
                src={activeMedia.file_url} 
                controls 
                autoPlay 
                className="w-full max-h-[70vh] object-contain mx-auto"
              />
            )}
            <div className="p-6 bg-zinc-950 border-t border-glass-stroke flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="font-mono text-[10px] text-electric-lime uppercase tracking-widest font-bold mb-1">
                  Event: {activeMedia.event_name}
                </p>
                <h4 className="text-base font-bold font-sora text-white">
                  {activeMedia.file_type === 'video' ? 'Video Stream Active' : 'Captured Image Frame'}
                </h4>
              </div>
              <button 
                onClick={() => setActiveMedia(null)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-mono uppercase tracking-widest transition-all border border-glass-stroke"
              >
                Close Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
