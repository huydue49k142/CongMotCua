import React from 'react';
import Sidebar from '@/components/student/Sidebar';
import Header from '@/components/student/Header';
import ChatWidget from '@/components/student/ChatWidget';
import { ProcedureProvider } from '@/contexts/ProcedureContext';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-screen w-full overflow-hidden" style={{
      gridTemplateAreas: `
        'header header'
        'sidebar main'
      `,
      gridTemplateColumns: '280px 1fr',
      gridTemplateRows: '64px 1fr',
    }}>
      <Header />
      <Sidebar />
      <main className="bg-white border-t border-gray-200 overflow-y-auto" style={{ gridArea: 'main' }}>
        <ProcedureProvider>
          {children}
        </ProcedureProvider>
      </main>
      <ChatWidget />
    </div>
  );
}