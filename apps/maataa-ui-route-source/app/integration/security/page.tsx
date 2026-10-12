import Link from 'next/link';
import {AuthSecurity} from '../../../components/auth-security';
import {UiProvider} from '../../../../../packages/maataa-ui-nevo/src/components';
import '../../../../../packages/maataa-ui-nevo/src/styles.css';
export default function SecurityPage(){return <UiProvider><main style={{background:'var(--maataa-surface)',color:'var(--maataa-ink)',minHeight:'100vh',padding:'clamp(20px,5vw,64px)',maxWidth:1000,margin:'auto'}}><Link style={{color:'var(--maataa-accent-strong)'}} href="/integration/workflow">Back to workflow</Link><h1>Account security</h1><p>Real server-validated account controls. Requires the configured durable database and encryption key. Mail delivery and WebAuthn enrollment are not connected.</p><AuthSecurity/></main></UiProvider>;}
