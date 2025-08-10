"use client";

import "./globals.css";
import Link from "next/link";
import {GithubLogo} from "@/components/logos";
import UnicornScene from "unicornstudio-react";

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={"h-full w-full"}>
        <body className={`antialiased w-full h-full lex flex-col`} style={{ margin: 0, padding: 0, overflow: 'hidden', backgroundColor: 'transparent' }}>
            <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1
        }}>
          <UnicornScene jsonFilePath="/hlaser.json" width={'100%'} height={'100%'} />
        </div>
        <div className="flex flex-col flex-grow w-full items-center justify-center sm:px-4">
            <nav
                className={
                    "sm:fixed w-full top-0 left-0 grid grid-cols-2 py-4 px-8"
                }
            >
                <div className={"flex text-white"}>
                    <Link href={"/"} prefetch={true}>
                        Deutsch AI:<br/>A Quantum Physics Explainer
                    </Link>
                </div>

                <div className={"flex gap-4 justify-end"}>
                    <Link
                        href="https://github.com/jackieeth/deutsch-ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={"py-0.5"}
                        aria-label="View source on GitHub"
                    >
                        <GithubLogo
                            className={"w-5 h-5 hover:text-gray-100 text-[#ffffff] transition-colors duration-200"}
                        />
                    </Link>
                </div>
            </nav>
            {children}
      
        </div>
        </body>
        </html>
    );
}
