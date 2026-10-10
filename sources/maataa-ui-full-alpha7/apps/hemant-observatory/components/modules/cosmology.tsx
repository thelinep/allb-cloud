import { Facts, Panel, Pending } from "./shared";

const layers = [
  ["Textual lineage", "Which text, edition, translator and verse a statement comes from.", "No textual sources are recorded in this app yet."],
  ["Interpretive model", "How a school or commentator reads that text.", "No interpretation is asserted here."],
  ["Script & notation", "Devanagari, Brahmi and Latin transliteration as separate, reversible layers.", "Unicode ranges recorded; no transliteration engine."],
  ["Testable quantity", "A defined, measurable quantity (for example, a time interval) that can be compared with observation.", "Only the hemant-traditional-units-v1 arithmetic is implemented."],
] as const;

export default function CosmologyModule() {
  return (
    <div className="m-grid">
      <Panel eyebrow="EVIDENCE LAYERS" title="Keep each kind of claim separate">
        <div className="m-cards">
          {layers.map(([name, meaning, status]) => <article key={name} className="m-card"><h3>{name}</h3><p>{meaning}</p><small>{status}</small></article>)}
        </div>
        <p className="m-note">A comparison across layers is possible only for a defined quantity. It does not imply equivalence or proof.</p>
      </Panel>
      <Panel eyebrow="SCRIPT LAYERS" title="Scripts in the Unicode Standard">
        <Facts label="Unicode script blocks" rows={[["Devanagari", "U+0900–U+097F"], ["Brahmi", "U+11000–U+1107F"], ["Latin transliteration", "IAST or ISO 15919 (choice open)"]]} />
        <Pending>A Brahmi transliteration engine needs a sourced mapping table and reversible, tested known cases. Until then this app shows no Brahmi glyph output and uses no decorative pseudo-script.</Pending>
      </Panel>
    </div>
  );
}
