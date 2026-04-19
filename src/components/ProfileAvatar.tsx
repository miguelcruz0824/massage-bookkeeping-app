import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, X, Upload, User } from 'lucide-react';

interface ProfileAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showEditOnHover?: boolean;
}

const PROFILE_KEY = 'serenity_avatar_url';

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ size = 'md', showEditOnHover = false }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => localStorage.getItem(PROFILE_KEY));
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-allison.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const url = data.publicUrl + '?t=' + Date.now();
      setAvatarUrl(url);
      localStorage.setItem(PROFILE_KEY, url);
    } catch (err: any) {
      setError('Failed to upload image. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await supabase.storage.from('avatars').remove(['avatar-allison.jpg', 'avatar-allison.png', 'avatar-allison.jpeg', 'avatar-allison.webp']);
    } catch {}
    setAvatarUrl(null);
    localStorage.removeItem(PROFILE_KEY);
  };

  const Avatar = ({ onClick }: { onClick?: () => void }) => (
    <div
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full flex-shrink-0 overflow-hidden cursor-pointer relative group`}>
      {avatarUrl ? (
        <>
          <img src={avatarUrl} alt="Allison Muniz" className="w-full h-full object-cover" />
          {showEditOnHover && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
          )}
        </>
      ) : (
        <div className={`w-full h-full bg-gradient-to-br from-emerald-400 to-teal-300 flex items-center justify-center font-semibold text-[#1a3028] relative group`}>
          AM
          {showEditOnHover && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
              <Camera className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Avatar onClick={() => setShowModal(true)} />

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Profile</h2>
              <button onClick={() => { setShowModal(false); setError(null); }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Avatar preview */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-emerald-100">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Allison Muniz" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-300 flex items-center justify-center text-3xl font-bold text-[#1a3028]">
                    AM
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 text-lg">Allison Muniz</p>
                <p className="text-sm text-emerald-600">Licensed Massage Therapist</p>
                <p className="text-xs text-gray-400 mt-0.5">LMT #00000</p>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Upload section */}
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50">
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                  </>
                )}
              </button>

              {avatarUrl && (
                <button
                  onClick={handleRemove}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
                  <User className="w-4 h-4" />
                  Remove Photo
                </button>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              Supports JPG, PNG, WebP · Max 2MB
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileAvatar;