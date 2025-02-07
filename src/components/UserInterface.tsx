import React, { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Camera, User } from 'lucide-react';

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
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      setImage(imageData);
      
      // Stop camera after capture
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
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
      setMessage('Successfully registered face');
      setImage(null);
      setLabel('');
    } catch (error) {
      setMessage('Error: ' + (error as Error).message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center gap-3 mb-8">
        <Camera className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-800">Face Registration</h1>
      </div>
      
      <div className="space-y-6">
        {!isCapturing && !image && (
          <button
            onClick={startCamera}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Camera className="w-5 h-5" />
            Start Camera
          </button>
        )}

        {isCapturing && (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
              <video
                ref={videoRef}
                autoPlay
                className="w-full max-w-2xl mx-auto"
              />
            </div>
            <button
              onClick={captureImage}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Capture Photo
            </button>
          </div>
        )}

        {image && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg overflow-hidden border-2 border-gray-200">
              <img src={image} alt="Captured" className="w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
                <div className="mt-1 relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your name"
                  />
                </div>
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Register Face
            </button>
          </form>
        )}

        {message && (
          <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInterface;