"use client";

import React, { useEffect, useState } from "react";

export default function IPhoneFrame({ children }: { children: React.ReactNode }) {
  const [time, setTime] = useState("9:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      hours = hours % 12 || 12;
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="device-wrapper">
      <div className="iphone-frame">
        {/* Physical titanium side buttons */}
        <div className="iphone-button action" aria-hidden="true" />
        <div className="iphone-button vol-up" aria-hidden="true" />
        <div className="iphone-button vol-down" aria-hidden="true" />
        <div className="iphone-button power" aria-hidden="true" />
        <div className="iphone-button camera-control" aria-hidden="true" />

        {/* Ear Speaker */}
        <div className="iphone-speaker" aria-hidden="true" />

        {/* Inner Screen */}
        <div className="iphone-screen">
          {/* iOS Status Bar */}
          <div className="ios-status-bar" aria-hidden="true">
            <span className="ios-status-time" suppressHydrationWarning>{time}</span>

            {/* Dynamic Island */}
            <div className="ios-dynamic-island">
              <div className="ios-island-sensor" />
              <div className="ios-island-camera">
                <div className="ios-lens-glare" />
              </div>
            </div>

            <div className="ios-status-icons">
              {/* Cellular Signal (4 bars) */}
              <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
                <rect x="0" y="8" width="3" height="4" rx="0.8" />
                <rect x="4.8" y="5.5" width="3" height="6.5" rx="0.8" />
                <rect x="9.6" y="3" width="3" height="9" rx="0.8" />
                <rect x="14.4" y="0.5" width="3" height="11.5" rx="0.8" />
              </svg>

              {/* Wi-Fi Icon */}
              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
                <path d="M8 9.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
                <path d="M4.2 7.7a5.5 5.5 0 0 1 7.6 0 .8.8 0 0 0 1.1-1.1 7.1 7.1 0 0 0-9.8 0 .8.8 0 1 0 1.1 1.1z" />
                <path d="M1.6 5.1a9.2 9.2 0 0 1 12.8 0 .8.8 0 0 0 1.1-1.1 10.8 10.8 0 0 0-15 0 .8.8 0 1 0 1.1 1.1z" />
              </svg>

              {/* Battery Icon */}
              <div className="ios-battery">
                <div className="ios-battery-pill">
                  <div className="ios-battery-fill" />
                </div>
                <div className="ios-battery-terminal" />
              </div>
            </div>
          </div>

          {/* App Content */}
          <div className="iphone-content">
            {children}
          </div>

          {/* Home Indicator */}
          <div className="ios-home-indicator" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
