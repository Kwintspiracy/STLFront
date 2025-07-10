interface DefaultAvatarProps {
  className?: string;
  size?: number;
}

export default function DefaultAvatar({ className = "", size = 48 }: DefaultAvatarProps) {
  return (
    <div 
      className={`bg-gray-700 rounded-lg flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        width={size * 0.6} 
        height={size * 0.6} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="24" cy="18" r="6" fill="#6B7280"/>
        <path d="M12 36c0-6.627 5.373-12 12-12s12 5.373 12 12v4H12v-4z" fill="#6B7280"/>
      </svg>
    </div>
  );
}
