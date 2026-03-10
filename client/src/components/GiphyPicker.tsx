import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../lib/api';

interface GiphyGif {
  id: string;
  title: string;
  url: string;
  preview: string;
  width: number;
  height: number;
}

interface GiphyPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

export default function GiphyPicker({ onSelect, onClose }: GiphyPickerProps) {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchGifs = useCallback(async (search: string) => {
    setLoading(true);
    try {
      const endpoint = search.trim()
        ? `/giphy/search?q=${encodeURIComponent(search.trim())}`
        : '/giphy/trending';
      const { data } = await api.get<{ gifs: GiphyGif[] }>(endpoint);
      setGifs(data.gifs);
    } catch (err) {
      console.error('Failed to fetch GIFs', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load trending on mount
  useEffect(() => {
    fetchGifs('');
  }, [fetchGifs]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchGifs(query);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchGifs]);

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-md flex flex-col" style={{ maxHeight: '70vh' }}>
        <h3 className="font-bold text-lg mb-3">Choose a GIF</h3>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search GIFs..."
          className="input input-bordered w-full mb-3"
          autoFocus
        />
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="loading loading-spinner loading-md" />
            </div>
          ) : gifs.length === 0 ? (
            <p className="text-center text-neutral-500 py-8">No GIFs found</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  onClick={() => onSelect(gif.url)}
                  className="bg-transparent border-none p-0 cursor-pointer rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                >
                  <img
                    src={gif.preview}
                    alt={gif.title}
                    loading="lazy"
                    className="w-full h-auto block"
                    style={{ aspectRatio: `${gif.width}/${gif.height}` }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-neutral-400">Powered by GIPHY</span>
          <button className="btn btn-sm" onClick={onClose}>Cancel</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}
