import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Face Recognition Admin Panel</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Label
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Enter person's name"
            />
          </label>
        </div>

        {image && (
          <div className="mt-4">
            <img src={image} alt="Preview" className="max-w-xs" />
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add to Database
        </button>

        {message && (
          <div className="mt-4 p-2 bg-gray-100 rounded">
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminInterface;