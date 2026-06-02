import { Image as ImageIcon } from "lucide-react";

export default function Gallery() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Event Gallery</h1>
        <p className="text-white/60 max-w-2xl mx-auto">
          Highlights from our latest events, competitions, and community workouts.
        </p>
      </div>

      <div className="glass-card p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
        <ImageIcon className="w-16 h-16 text-white/20 mb-6" />
        <h2 className="text-2xl font-bold mb-2">Gallery Syncing</h2>
        <p className="text-white/60 max-w-md">
          Images will automatically populate here from the Google Drive integration via our Supabase backend.
        </p>
        <p className="text-white/40 text-sm mt-4">
          Awaiting Admin Uploads to Event Folders
        </p>
      </div>
    </div>
  );
}
