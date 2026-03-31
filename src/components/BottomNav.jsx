import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Activity, BookOpen, ShoppingBag, Plus } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Floating Action Button (Central Add) */}
      <div className="fab-container">
        <button className="fab" onClick={() => navigate('/app/protocol-wizard')}>
          <Plus size={32} strokeWidth={2.5} />
        </button>
      </div>

      {/* Main Nav Bar */}
      <nav 
        className="flex justify-between items-center px-lg py-sm w-full" 
        style={{ 
          position: 'absolute', 
          bottom: 0, 
          maxWidth: '500px', 
          zIndex: 50,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingBottom: '24px' // iOS home indicator whitespace
        }}
      >
        <div className="flex justify-between w-full pr-[80px]">
          <NavItem to="/app/today" icon={<Home size={24} />} label="Today" />
          <NavItem to="/app/protocols" icon={<Activity size={24} />} label="Cycles" />
        </div>
        
        <div className="flex justify-between w-full pl-[20px]">
          <NavItem to="/app/library" icon={<BookOpen size={24} />} label="Library" />
          <NavItem to="/app/shop" icon={<ShoppingBag size={24} />} label="Shop" />
        </div>
      </nav>
    </>
  );
};

const NavItem = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `flex-col items-center gap-xs ${isActive ? 'text-primary' : 'text-secondary'}`}
      style={({ isActive }) => ({ 
        textDecoration: 'none', 
        transition: 'color 0.2s',
        opacity: isActive ? 1 : 0.5 
      })}
    >
      {icon}
      <span className="text-[10px] font-medium tracking-wide mt-[2px]">{label}</span>
    </NavLink>
  );
};

export default BottomNav;
