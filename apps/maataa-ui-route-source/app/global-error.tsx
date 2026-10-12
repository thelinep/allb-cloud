'use client';
export default function GlobalError({reset}:{error:Error & {digest?:string};reset:()=>void}){
 return <html lang='en'><body style={{margin:0,background:'#10151c',color:'#f3efe6',fontFamily:'system-ui,sans-serif'}}><main style={{maxWidth:640,margin:'12vh auto',padding:24}}><h1>The application could not load</h1><p role='alert'>Your saved server records have not been changed by this loading failure.</p><p>Retry the view or return home. Unsaved form input may need to be entered again.</p><button type='button' onClick={()=>window.location.reload()} style={{padding:'12px 18px',font:'inherit',background:'#f3efe6',color:'#10151c',border:'2px solid #bca36f'}}>Try again</button><p><a href='/' style={{color:'#e8c985'}}>Return to ALLB home</a></p></main></body></html>;
}
