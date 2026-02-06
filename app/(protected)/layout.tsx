import { QueryProvider } from "@/providers/query-provider";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
