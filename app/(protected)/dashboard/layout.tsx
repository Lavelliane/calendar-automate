import { DashboardNav } from "./_components/dashboard-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <DashboardNav />
      <main className="max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
