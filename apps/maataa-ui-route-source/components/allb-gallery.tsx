"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import {useDesign} from "./design-provider";
import {themeVariables} from "../../../packages/design-config/config";
import { allbCategories, allbLandings } from "../lib/allb-landings";

export default function AllbGallery() {
  const design=useDesign();
  const [category, setCategory] = useState("All concepts");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return allbLandings.filter((item) => {
      const matchesCategory = category === "All concepts" || item.category === category;
      const matchesQuery = !needle || `${item.title} ${item.category} ${item.description}`.toLocaleLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return <main className={"allb-page"+(design.configured?" allb-configured":"")} style={design.configured?{...themeVariables(design.theme),"--brass":design.theme.accent,"--ivory":design.theme.text} as CSSProperties:undefined}>
    <header className="allb-topbar"><Link href="/" className="allb-brand"><span aria-hidden="true">{design.configured&&design.branding.logo?<img src={design.branding.logo} alt="" width="36" height="36"/>:"✧"}</span><span><b>{design.configured?design.branding.name:"ALLB Cloud"}</b><small>LANDING CONCEPT COLLECTION</small></span></Link><nav aria-label="Page links"><Link href="/">Home</Link><Link href="/allb" aria-current="page">36 concepts</Link></nav></header>
    <section className="allb-hero">
      <p className="eyebrow">A VISUAL FIELD GUIDE · 36 LANDINGS</p>
      <h1>One ecosystem,<br /><em>many possibilities.</em></h1>
      <p className="allb-lede">{design.configured&&design.branding.tagline?design.branding.tagline:"Explore 36 responsive landing experiences rebuilt from the supplied ALLB artwork. Each concept keeps its own composition and offers clearly labeled local previews."}</p>{design.configured&&design.branding.hero&&<img className="allb-configured-hero" src={design.branding.hero} alt={design.branding.heroAlt||"Brand hero"}/>}
      <div className="allb-hero-meta"><span><b>36</b> supplied concepts</span><span><b>8</b> product families</span><span><b>Illustrative</b> artwork status</span></div>
    </section>
    <section className="allb-controls" aria-label="Filter concept artwork">
      <label className="allb-search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search concepts, products, or themes" aria-label="Search concept artwork" /></label>
      <div className="allb-filters" aria-label="Filter by family">{["All concepts", ...allbCategories].map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <p className="allb-result-count" aria-live="polite">Showing {visible.length} of {allbLandings.length} concepts</p>
    </section>
    <section className="allb-grid" aria-label="ALLB concept landing pages">
      {visible.map((item) => <article className="allb-card" key={item.slug}>
        <Link className="allb-art-link" href={`/allb/${item.slug}`} aria-label={`Open ${item.title} artwork`}>
          {/* These are supplied full-page concepts, intentionally presented as artwork references. */}
          <img src={item.image} alt={`${item.title} concept landing page artwork`} loading="lazy" width={item.width} height={item.height} />
          <span className="allb-open-art">Explore landing ↗</span>
        </Link>
        <div className="allb-card-copy"><div className="allb-card-kicker"><span>{String(item.number).padStart(2, "0")}</span><span>{item.category}</span></div><h2><Link href={`/allb/${item.slug}`}>{item.title}</Link></h2><p>{item.description}</p><Link className="allb-card-link" href={`/allb/${item.slug}`}>Explore landing <span aria-hidden="true">→</span></Link></div>
      </article>)}
      {visible.length === 0 && <div className="allb-empty"><span>⌕</span><h2>No matching concepts</h2><p>Try another name or choose a different family.</p><button type="button" onClick={() => { setQuery(""); setCategory("All concepts"); }}>Clear filters</button></div>}
    </section>
    <footer className="allb-footer"><span>ALLB CONCEPT ARCHIVE</span><p>Artwork reproduces supplied screenshots. It is a visual reference; screens do not prove that the illustrated product capabilities exist or are connected.</p><Link href="/">Return to ALLB Cloud →</Link></footer>
  </main>;
}
