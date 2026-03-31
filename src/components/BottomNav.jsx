import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Activity, BookOpen, ShoppingBag, Plus, Calculator } from 'lucide-react';

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
        style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0,
          right: 0,
          maxWidth: '500px',
          margin: '0 auto',
          zIndex: 50,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px 28px 20px'
        }}
      >
        <NavItem to="/app/today" icon={<Home size={22} />} label="Today" />
        <NavItem to="/app/protocols" icon={<Activity size={22} />} label="Cycles" />
        
        {/* Spacer for FAB */}
        <div style={{ width: '64px' }}></div>
        
        <NavItem to="/app/calculator" icon={<Calculator size={22} />} label="Calc" />
        <NavItem to="/app/library" icon={<BookOpen size={22} />} label="Library" />
      </nav>
    </>
  );
};

const NavItem = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to} 
      style={({ isActive }) => ({ 
        textDecoration: 'none', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        color: isActive ? '#ffffff' : 'rgba(255,255,255,0.35)',
        transition: 'color 0.2s',
        minWidth: '48px'
      })}
    >
      {icon}
      <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.5px' }}>{label}</span>
    </NavLink>
  );
};

export default BottomNav;
