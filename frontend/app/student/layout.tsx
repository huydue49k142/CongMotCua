import React from 'react';
import Sidebar from '@/components/student/Sidebar';
import Header from '@/components/student/Header';
import ChatWidget from '@/components/student/ChatWidget';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full" style={{
      gridTemplateAreas: `
        'header header'
        'sidebar main'
      `,
      gridTemplateColumns: '280px 1fr',
      gridTemplateRows: '64px 1fr',
    }}>
      <Header />
      <Sidebar />
      <main className="bg-white border-t border-gray-200" style={{ gridArea: 'main' }}>
        {children}
      </main>
      <ChatWidget />
    </div>
  );
}
