import React, { useState, useEffect } from 'react';

export const AVATAR_URL_KEY = 'serenity_avatar_url';
export const PROFILE_KEY = 'serenity_profile';

export const defaultProfile = {
  name: 'Allison Muniz',
  title: 'Licensed Massage Therapist',
  license: 'LMT #00000',
  email: '',
  phone: '',
  address: '',
};

// Global event so all avatar instances sync instantly
export const profileUpdateEvent = new EventTarget();

interface ProfileAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showEditOnHover?: boolean;
  onClick?: () => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  size = 'md',
  showEditOnHover = false,
  onClick,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    () => localStorage.getItem(AVATAR_URL_KEY)
  );
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null') || defaultProfile;
    } catch { return defaultProfile; }
  });

  // Sync when profile updates anywhere in the app
  useEffect(() => {
    const handler = () => {
      setAvatarUrl(localStorage.getItem(AVATAR_URL_KEY));
      try {
        setProfile(JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null') || defaultProfile);
      } catch {}
    };
    profileUpdateEvent.addEventListener('updated', handler);
    return () => profileUpdateEvent.removeEventListener('updated', handler);
  }, []);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-20 h-20 text-2xl',
  };

  const initials = profile.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full flex-shrink-0 overflow-hidden ${onClick ? 'cursor-pointer' : ''} relative group`}
    >
      {avatarUrl ? (
        <>
          <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
          {showEditOnHover && onClick && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
              <span className="text-white text-xs font-medium">Edit</span>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-300 flex items-center justify-center font-semibold text-[#1a3028]">
          {initials}
          {showEditOnHover && onClick && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
              <span className="text-white text-xs font-medium">Edit</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;