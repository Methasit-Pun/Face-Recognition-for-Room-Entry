import React, { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const UserInterface = () => {
  const [image, setImage] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [message, setMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      setMessage('Error accessing camera: ' + (err as Error).message);
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    setImage(imageData);
    
    // Stop camera after capture
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    setIsCapturing(false);
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
      setMessage('Successfully registered face');
      setImage(null);
      setLabel('');
    } catch (error) {
      setMessage('Error: ' + (error as Error).message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Face Registration</h1>
      
      <div className="space-y-4">
        {!isCapturing && !image && (
          <button
            onClick={startCamera}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Start Camera
          </button>
        )}

        {isCapturing && (
          <div>
            <video
              ref={videoRef}
              autoPlay
              className="w-full max-w-md border rounded"
            />
            <button
              onClick={captureImage}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Capture
            </button>
          </div>
        )}

        {image && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <img src={image} alt="Captured" className="max-w-md border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your Name
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Enter your name"
                />
              </label>
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Register Face
            </button>
          </form>
        )}

        {message && (
          <div className="mt-4 p-2 bg-gray-100 rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInterface;