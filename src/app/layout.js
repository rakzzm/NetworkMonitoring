import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'NetManager Pro - Enterprise Network Management',
  description: 'AI-Powered Network Control',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="parallax-bg">
            <div className="parallax-circle"></div>
            <div className="parallax-circle"></div>
            <div className="parallax-circle"></div>
        </div>
        <div className="app-container" id="appContainer" style={{ display: 'block' }}>
            <Sidebar />
            <div className="main-content">
                {children}
            </div>
        </div>
      </body>
    </html>
  );
}
