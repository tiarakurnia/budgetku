import './globals.css';
import Sidebar from './components/Sidebar';

export const metadata = {
  title: 'BudgetKu - Smart Personal Budgeting',
  description: 'Aplikasi budgeting bulanan personal yang cerdas dan modern.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
