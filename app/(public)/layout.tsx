import { Navbar } from "@/components/ui/Navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-7xl w-full mx-auto">
      <Navbar />
      {children}
    </main>
  );
}
