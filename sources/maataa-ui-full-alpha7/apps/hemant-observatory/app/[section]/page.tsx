import type { ComponentType } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { capabilityLabel, sections } from "@/lib/sections";
import ClockModule from "@/components/modules/clock";
import ObservatoryModule from "@/components/modules/observatory";
import PanchangaModule from "@/components/modules/panchanga";
import SankrantiModule from "@/components/modules/sankranti";
import CosmologyModule from "@/components/modules/cosmology";
import DeveloperModule from "@/components/modules/developer";
import LearnModule from "@/components/modules/learn";
import TimelineModule from "@/components/modules/timeline";
import ServicesModule from "@/components/modules/services";
import ResearchModule from "@/components/modules/research";
import MobileModule from "@/components/modules/mobile";
import WidgetsModule from "@/components/modules/widgets";
import ModesModule from "@/components/modules/modes";
import PlanetaryModule from "@/components/modules/planetary";
import RatiosModule from "@/components/modules/ratios";

const modules: Record<string, ComponentType> = {
  clock: ClockModule,
  observatory: ObservatoryModule,
  panchanga: PanchangaModule,
  sankranti: SankrantiModule,
  cosmology: CosmologyModule,
  developer: DeveloperModule,
  learn: LearnModule,
  timeline: TimelineModule,
  services: ServicesModule,
  research: ResearchModule,
  mobile: MobileModule,
  widgets: WidgetsModule,
  modes: ModesModule,
  planetary: PlanetaryModule,
  ratios: RatiosModule,
};

export function generateStaticParams() {
  return sections.map(({ slug }) => ({ section: slug }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: slug } = await params;
  const section = sections.find((item) => item.slug === slug);
  const Module = modules[slug];
  if (!section || !Module) notFound();

  return (
    <div className="m-page">
      <a className="skip-link" href="#module-content">Skip to module content</a>
      <header className="m-header">
        <Link className="back-link" href="/">← Observatory overview</Link>
        <nav aria-label="Modules" className="m-nav">
          {sections.map((s) => <Link key={s.slug} href={`/${s.slug}`} aria-current={s.slug === slug ? "page" : undefined}>{s.title}</Link>)}
        </nav>
      </header>
      <main id="module-content" className="m-main">
        <div className="m-hero">
          <span className={`state-pill cap-${section.capability}`}>{capabilityLabel[section.capability]}</span>
          <p className="eyebrow">HEMANT SAMWAT OBSERVATORY RUNTIME</p>
          <h1>{section.devanagari && <span lang="sa" className="m-dev">{section.devanagari} · </span>}{section.title}</h1>
          <p className="module-subtitle">{section.subtitle}</p>
          <p className="module-description">{section.description}</p>
          <dl className="m-status" aria-label="Capability status">
            <div><dt>Works now</dt><dd>{section.works}</dd></div>
            <div><dt>Pending</dt><dd>{section.pending}</dd></div>
          </dl>
        </div>
        <Module />
      </main>
    </div>
  );
}
