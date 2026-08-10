import "./globals.css";
import "./routes.css";
import "./ux.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kyrcut | Consensus before catastrophe", description: "GenLayer consensus emergency circuit" };
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
