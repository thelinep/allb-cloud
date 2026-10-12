import type {Metadata} from 'next';
import './globals.css';
import './allb.css';
import './allb-landings.css';
import './unified.css';
import './enterprise-kanban.css';
import {DesignProvider} from '../components/design-provider';
import {AppShell} from '../components/app-shell';
export const metadata:Metadata={title:{default:'ALLB Cloud',template:'%s · ALLB Cloud'},description:'ALLB landing experiences, MAATAA UI and design studios in one application. Browser-local previews; no production backend connected.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><DesignProvider><AppShell>{children}</AppShell></DesignProvider></body></html>;}
