'use client';
export default function ErrorView({reset}:{reset:()=>void}){return <main><h1>Unable to render this view</h1><button onClick={reset}>Try again</button></main>}
