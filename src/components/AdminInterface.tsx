import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Upload } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const AdminInterface = () => {
  const [image, setImage] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [message, setMessage] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !label) {
      setMessage('Please provide both image and label');
      return;
    }

    try {
      const { error } = await supabase
        .from('face_recognition')
        .insert([
          {
            label: label,
            image_data: image,
            timestamp: new Date().toISOString(),
          }
        ]);

      if (error) throw error;
      setMessage('Successfully added to database');
      setImage(null);
      setLabel('');
    } catch (error) {
      setMessage('Error: ' + (error as Error).message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center gap-3 mb-8">
        <Upload className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-800">Face Recognition Admin Panel</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Label
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter person's name"
            />
          </label>
        </div>

        {image && (
          <div className="mt-4">
            <img src={image} alt="Preview" className="max-w-xs rounded-lg border border-gray-200" />
          </div>
        )}

        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add to Database
        </button>

        {message && (
          <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminInterface;