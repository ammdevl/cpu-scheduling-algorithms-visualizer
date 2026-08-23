import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavBar } from "@/components/NavBar/NavBar";
import "./globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CPU Scheduling Visualizer Algorithms",
    template: "%s · CPU Scheduling Visualizer Algorithms",
  },
  description:
    "Interactive visualizer for CPU scheduling algorithms: FCFS, Round Robin, SPN, SRT, HRRN and Feedback — with step-by-step Gantt tables and turnaround metrics.",
};

const themeInit = `(function(){try{var t=localStorage.getItem('csv-theme');if(t!=='dark'&&t!=='light'){t='light';}document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <NavBar />
        {children}
        <footer className="siteFooter">
          © {new Date().getFullYear()} CPU Scheduling Algorithms Visualizer. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
