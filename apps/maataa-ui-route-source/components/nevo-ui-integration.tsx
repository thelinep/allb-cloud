'use client';
import { useState } from 'react';
import { Button, Card, FormBuilder, StatusBadge, UiProvider } from '../../../packages/maataa-ui-nevo/src/components';

/** Real upstream primitives; local reversible interaction, no authenticated API. */
export function NevoUiIntegration() {
  const [values, setValues] = useState<Record<string, string>>({ name: '', description: '' });
  const [preview, setPreview] = useState<Record<string, string> | null>(null);
  return <main style={{ maxWidth: 960, margin: 'auto', padding: 'clamp(16px, 4vw, 48px)', overflowWrap: 'anywhere' }}>
    <a href='/'>← ALLB home</a>
    <h1>MAATAA UI: actual package integration</h1>
    <p>NEVO EOS source at commit f50af9d. This page renders its actual UiProvider, Card, Button, FormBuilder and StatusBadge components.</p>
    <p>Local preview only. No project is created and no server or authentication service is called.</p>
    <UiProvider><Card><h2>Project brief preview</h2><FormBuilder
      fields={[{ id: 'name', label: 'Project name', required: true }, { id: 'description', label: 'Description', type: 'textarea' }]}
      values={values} onChange={(id, value) => setValues(previous => ({ ...previous, [id]: value }))}
      onSubmit={() => setPreview({ ...values })} submitLabel='Preview brief' />
      <div style={{ marginTop: 16 }}><Button type='button' onClick={() => { setValues({ name: '', description: '' }); setPreview(null); }}>Reset preview</Button></div>
    </Card>
    {preview && <Card aria-live='polite'><h2>Local result</h2><StatusBadge state='local preview' tone='neutral' /><h3>{preview.name}</h3><p>{preview.description || 'No description provided.'}</p></Card>}
    </UiProvider>
  </main>;
}
