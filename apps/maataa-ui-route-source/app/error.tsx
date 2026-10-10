'use client';
import Link from 'next/link';
export default function ErrorBoundary({reset}:{error:Error & {digest?:string};reset:()=>void}){return <main><h1>This view could not be loaded</h1><p role="alert">Try loading the view again. If the problem continues, return to the application home.</p><button onClick={reset}>Try again</button><p><Link href="/">Return to ALLB home</Link></p></main>;}
