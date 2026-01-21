import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import { FileSpreadsheet, BarChart2 } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [datasets, setDatasets] = useState([]);
  const navigate = useNavigate();

  // Fetch datasets on load
  const fetchDatasets = async () => {
    try {
      const { data } = await API.get('/datasets');
      setDatasets(data);
    } catch (error) {
      console.error("Failed to fetch datasets", error);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">DataLab</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Hello, {user?.username}</span>
          <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium">Logout</button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Upload Section */}
        <FileUpload onUploadSuccess={fetchDatasets} />

        {/* Dataset List */}
        <h2 className="text-xl font-bold mb-4 text-gray-700">Your Datasets</h2>
        
        {datasets.length === 0 ? (
          <p className="text-gray-500 italic">No datasets uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets.map((ds) => (
              <div key={ds._id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    <FileSpreadsheet size={24} />
                  </div>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {new Date(ds.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg text-gray-800 mb-1 truncate" title={ds.originalName}>
                  {ds.originalName}
                </h3>
                <p className="text-sm text-gray-500 mb-6">{ds.rowCount} rows processed</p>
                
                <button 
                  onClick={() => navigate(`/analytics/${ds._id}`)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <BarChart2 size={18} /> Analyze Data
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;