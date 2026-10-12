import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { Button as MaataaButton, Card as MaataaCard, EmptyState as MaataaEmptyState, IconButton as MaataaIconButton, LoadingState as MaataaLoadingState, Section as MaataaSection, StatusBadge as MaataaStatusBadge } from "./components.js";

/**
 * NEVO's small, dependency-free UI primitive layer, built on this
 * package's brand-neutral primitives (./components.tsx).
 *
 * Moved here from apps/web/components/ui.tsx so NEVO's branded variants
 * are owned by the design-system package rather than duplicated in the
 * app. Exposed via the "@maataa/ui/nevo" subpath (not the package's main
 * barrel) so the brand-neutral top-level exports stay name-collision-free
 * with these NEVO-specific variants of the same component names.
 *
 * Public shells, authenticated workspaces and Maataa may have different
 * compositions, but they share these semantics, states and touch targets.
 */
export function PageHeader({title,subtitle,action}:{title:string;subtitle?:string;action?:ReactNode}){return <div className="top"><div><h1 className="title">{title}</h1>{subtitle&&<div className="muted">{subtitle}</div>}</div>{action}</div>}
export function Stat({label,value,detail}:{label:string;value:string|number;detail?:string}){return <div className="card"><div className="muted">{label}</div><div className="kpi">{value}</div>{detail&&<div className="tiny">{detail}</div>}</div>}
export function Pill({children}:{children:ReactNode}){return <span className="badge">{children}</span>}
export function Card({children,className="",...props}:{children:ReactNode;className?:string}&HTMLAttributes<HTMLElement>){return <MaataaCard {...props} className={`card ${className}`.trim()}>{children}</MaataaCard>}
export function Button({children,variant="secondary",...props}:{children:ReactNode;variant?:"primary"|"secondary"}&ButtonHTMLAttributes<HTMLButtonElement>){return <MaataaButton {...props} variant={variant} className={`nevoButton nevoButton--${variant} ${props.className??""}`.trim()}>{children}</MaataaButton>}
export function IconButton({label,children,...props}:{label:string;children:ReactNode}&ButtonHTMLAttributes<HTMLButtonElement>){return <MaataaIconButton {...props} label={label} className={`nevoIconButton ${props.className??""}`.trim()}>{children}</MaataaIconButton>}
export function StatusBadge({status}:{status:string}){return <MaataaStatusBadge state={status} className="badge"/>}
export function Section({title,description,children,className=""}:{title?:string;description?:string;children:ReactNode;className?:string}){return <MaataaSection title={title} description={description} className={`section ${className}`.trim()}>{children}</MaataaSection>}
export function ActionGroup({children,label="Actions",className=""}:{children:ReactNode;label?:string;className?:string}){return <div className={`toolbar nevoActionGroup ${className}`.trim()} role="group" aria-label={label}>{children}</div>}
export function EmptyState({title,description,action}:{title:string;description:string;action?:ReactNode}){return <MaataaEmptyState title={title} description={description} action={action}/>}
export function LoadingState({label="Loading"}:{label?:string}){return <MaataaLoadingState label={label}/>}
