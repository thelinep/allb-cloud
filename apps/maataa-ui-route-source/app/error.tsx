'use client';
import {startTransition} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
export default function ErrorBoundary({reset}:{error:Error & {digest?:string};reset:()=>void}){
 const router=useRouter();
 function retry(){startTransition(()=>{router.refresh();reset();});}
 return <main><h1>This view could not be loaded</h1><p role='alert'>Try loading the view again. If the problem continues, return to the application home.</p><button type='button' onClick={retry}>Try again</button><p><Link href='/'>Return to ALLB home</Link></p></main>;
}
