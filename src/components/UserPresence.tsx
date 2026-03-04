import React from 'react';

interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy';
  lastSeen?: Date;
}

interface UserPresenceProps {
  currentUser: any;
  workspace: any;
}

export const UserPresence: React.FC<UserPresenceProps> = ({ currentUser, workspace }) => {
  const users: User[] = [
    { id: '1', name: 'Sarah Chen', avatar: 'SC', status: 'online' },
    { id: '2', name: 'Mike Johnson', avatar: 'MJ', status: 'away' },
    { id: '3', name: 'Alex Rodriguez', avatar: 'AR', status: 'online' },
    { id: '4', name: 'Emma Wilson', avatar: 'EW', status: 'busy' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'away': return 'bg-yellow-400';
      case 'busy': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      default: return 'Offline';
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm text-gray-600">
        <span className="font-medium">{users.filter(u => u.status === 'online').length}</span> online
      </div>
      <div className="flex -space-x-2">
        {users.map((user) => (
          <div key={user.id} className="relative group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white">{user.avatar}</div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {user.name} - {getStatusText(user.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
