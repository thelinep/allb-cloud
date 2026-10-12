import AllbLandingPage from "../../../components/allb-landing";
import { notFound } from "next/navigation";
import { allbLandings, getAllbLanding } from "../../../lib/allb-landings";

// Render from the bundled manifest on request. The installed adapter cannot
// retrieve Next 16.3 prerendered dynamic-route fallback records reliably.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const landing = getAllbLanding(slug);
  return landing ? { title: `${landing.title} · ALLB Concepts`, description: landing.description } : {};
}

export default async function AllbArtworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = allbLandings.findIndex((item) => item.slug === slug);
  const landing = allbLandings[index];
  if (!landing) notFound();
  return <AllbLandingPage key={landing.slug} landing={landing} />;
}
