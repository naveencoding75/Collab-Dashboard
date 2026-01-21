import { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import { io } from 'socket.io-client';
import LiveCursors from '../components/LiveCursors';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

// --- DEPLOYMENT FIX: Dynamic Socket URL ---
// 1. Check if we are in production (Vercel)
// 2. If yes, use the Render Backend URL
// 3. If no, use localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL); 

const Analytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Data States
  const [data, setData] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [xAxisKey, setXAxisKey] = useState('');
  const [dataKey, setDataKey] = useState('');

  // Collaboration States
  const [cursors, setCursors] = useState({});
  const containerRef = useRef(null);

  useEffect(() => {
    // 1. Fetch Data
    const fetchData = async () => {
      try {
        const res = await API.get(`/datasets/${id}`);
        setData(res.data.data);
        setMetadata(res.data.metadata);
        
        if (res.data.data.length > 0) {
          const keys = Object.keys(res.data.data[0]);
          setXAxisKey(keys[0]);
          setDataKey(keys[1] || keys[0]);
        }
      } catch (error) {
        console.error("Error loading data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // 2. Setup Real-Time Collaboration
    if (user) {
      socket.emit('join_room', id);

      socket.on('cursor_update', (cursorData) => {
        setCursors((prev) => ({
          ...prev,
          [cursorData.socketId]: cursorData
        }));
      });

      // --- GLOBAL MOUSE TRACKING ---
      const handleWindowMouseMove = (e) => {
        // Throttle updates slightly (every 50ms)
        const now = Date.now();
        if (window.lastSent && now - window.lastSent < 50) return;
        window.lastSent = now;

        socket.emit('cursor_move', {
          roomId: id,
          socketId: socket.id,
          username: user.username,
          color: user.color || '#3b82f6',
          // Use clientX/Y for viewport-relative coordinates
          x: e.clientX, 
          y: e.clientY
        });
      };

      // Attach to window to track mouse everywhere
      window.addEventListener('mousemove', handleWindowMouseMove);
      
      return () => {
        socket.off('cursor_update');
        socket.emit('leave_room', id);
        window.removeEventListener('mousemove', handleWindowMouseMove);
      };
    }
  }, [id, user]);

  if (loading) return <div className="text-center mt-20">Loading Data...</div>;

  if (data.length === 0) return <div className="text-center mt-20">No data found in this file.</div>;

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div 
      className="h-screen flex flex-col bg-gray-50 overflow-hidden"
      ref={containerRef}
    >
      <LiveCursors cursors={cursors} />

      <header className="bg-white shadow p-4 flex justify-between items-center z-10 relative">
        <div>
            <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:underline mb-1">
                &larr; Back to Dashboard
            </button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              {metadata?.originalName}
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-normal">
                 Live Mode
              </span>
            </h1>
        </div>
        <div className="flex -space-x-2">
           {Object.keys(cursors).length > 0 && (
             <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-xs border-2 border-white">
               +{Object.keys(cursors).length}
             </span>
           )}
        </div>
      </header>

      <div className="flex-1 p-6 flex flex-col gap-6 relative z-0">
        
        {/* Controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">X-Axis</label>
            <select 
              className="border rounded px-3 py-2 cursor-pointer"
              value={xAxisKey}
              onChange={(e) => setXAxisKey(e.target.value)}
            >
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Y-Axis</label>
            <select 
              className="border rounded px-3 py-2 cursor-pointer"
              value={dataKey}
              onChange={(e) => setDataKey(e.target.value)}
            >
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
          </div>
        </div>

        {/* Chart Area */}
        {/* Uses inline style to ensure chart size is calculated before render */}
        <div className="bg-white p-6 rounded-lg shadow-sm w-full block" style={{ height: 500, minHeight: 500, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={dataKey} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;