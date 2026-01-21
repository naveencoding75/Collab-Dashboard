import { useState } from 'react';
import API from '../services/api';
import { Upload } from 'lucide-react'; // Icon

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await API.post('/datasets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      onUploadSuccess(); // Refresh the list parent component
      alert('Upload Successful!');
    } catch (error) {
      console.error(error);
      alert('Upload Failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Upload size={20} /> Upload New Dataset
      </h3>
      <form onSubmit={handleUpload} className="flex gap-4 items-center">
        <input 
          type="file" 
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        <button 
          type="submit" 
          disabled={uploading || !file}
          className={`px-4 py-2 rounded text-white font-bold transition
            ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {uploading ? 'Uploading...' : 'Upload CSV'}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;