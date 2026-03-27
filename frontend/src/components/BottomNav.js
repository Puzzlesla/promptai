import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/BottomNav.css";
import homeIcon from '../assets/Vector.svg';
import addIcon from '../assets/add-project.svg';
import fireIcon from '../assets/whatshot.svg';

const navItems = [
  { icon: homeIcon, alt: "Home", route: "/dashboard", label: "Home" },
  { icon: addIcon, alt: "Add", route: "/dashboard/plant-your-next-adventure", label: "Add a Project" },
  { icon: fireIcon, alt: "Completed", route: "/dashboard/completed", label: "Completed" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  return (
    <nav className="bottom-nav">
      {navItems.map((item, idx) => {
        const isActive = pathname === item.route;
        const isCenter = idx === 1;

        return (
          <div
            key={item.route}
            className={`nav-item${isCenter ? " nav-item--center" : ""}${isActive ? " nav-item--active" : ""}`}
            onClick={() => navigate(item.route)}
            role="button"
            tabIndex={0}
            aria-label={item.label}
            onKeyDown={e => e.key === 'Enter' && navigate(item.route)}
          >
            {isActive && (
              <span className="nav-label">{item.label}</span>
            )}
            <img src={item.icon} alt={item.alt} className="nav-icon" />
          </div>
        );
      })}
    </nav>
  );
}