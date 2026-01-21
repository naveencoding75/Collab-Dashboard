import { MousePointer2 } from 'lucide-react';

const LiveCursors = ({ cursors }) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Object.entries(cursors).map(([socketId, data]) => (
        <div
          key={socketId}
          className="absolute transition-all duration-100 ease-linear flex flex-col items-start"
          style={{
            left: `${data.x}px`,
            top: `${data.y}px`,
          }}
        >
          <MousePointer2 
            className="h-5 w-5" 
            style={{ fill: data.color, color: data.color }} 
          />
          <span 
            className="ml-2 px-2 py-1 rounded-full text-xs text-white shadow-sm whitespace-nowrap"
            style={{ backgroundColor: data.color }}
          >
            {data.username}
          </span>
        </div>
      ))}
    </div>
  );
};

export default LiveCursors;