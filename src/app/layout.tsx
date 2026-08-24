import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavBar } from "@/components/NavBar/NavBar";
import { Footer } from "@/components/Footer/Footer";
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
  metadataBase: new URL("https://cpu-scheduling-algorithms-visualizer.onrender.com"),
  title: {
    default: "CPU Scheduling Algorithms Visualizer",
    template: "%s · CPU Scheduling Algorithms Visualizer",
  },
  description:
    "Interactive visualizer for CPU scheduling algorithms: FCFS, Round Robin, SPN, SRT, HRRN and Feedback — with step-by-step Gantt tables and turnaround metrics.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CPU Scheduling Algorithms Visualizer",
    description:
      "Step through FCFS, Round Robin, SPN, SRT, HRRN and Feedback scheduling tick by tick, with lecture-style Gantt tables and turnaround metrics.",
    type: "website",
    url: "https://cpu-scheduling-algorithms-visualizer.onrender.com",
    siteName: "CPU Scheduling Algorithms Visualizer",
  },
  twitter: {
    card: "summary",
    title: "CPU Scheduling Algorithms Visualizer",
    description:
      "Step through six classic CPU scheduling policies tick by tick, with Gantt tables and turnaround metrics.",
  },
};

const themeInit = `(function(){try{var t=localStorage.getItem('csv-theme');if(t!=='dark'&&t!=='light'){t='light';}document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <a href="#main" className="skipLink">
          Skip to content
        </a>
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
