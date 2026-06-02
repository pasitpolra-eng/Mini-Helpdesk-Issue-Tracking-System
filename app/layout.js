// ============================================================
// layout.js — Core Root Layout for Next.js App Router
// ============================================================

import React from 'react';
import '@/app/globals.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Mini Helpdesk | Issue Tracking System',
  description: 'ระบบแจ้งปัญหาและติดตามสถานะการดำเนินงานแบบง่ายสำหรับองค์กร',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <AppProvider>
          <div className="app-container">
            {/* Sidebar drawer and Mobile Navigation */}
            <Navbar />
            
            {/* Main Page Area */}
            <main className="main-content" id="main-content">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
