import type { IconType } from "react-icons";
import {
  FiHome,
  FiCalendar,
  FiFilm,
  FiRadio,
  FiShoppingBag,
  FiShoppingCart,
  FiFileText,
  FiTag,
  FiUsers,
  FiAward,
  FiVideo,
  FiDollarSign,
  FiPenTool,
  FiCheckSquare,
  FiShield,
  FiTrendingUp,
  FiCpu,
  FiLayout,
  FiBell,
  FiSettings,
} from "react-icons/fi";
import {
  FaHouse,
  FaCalendarDays,
  FaClapperboard,
  FaTowerBroadcast,
  FaStore,
  FaCartShopping,
  FaFileInvoice,
  FaTicket,
  FaUsers as FaUsersGroup,
  FaHandshake,
  FaVideo as FaVideoCamera,
  FaSackDollar,
  FaFileContract,
  FaCircleCheck,
  FaShieldHalved,
  FaChartLine,
  FaRobot,
  FaLayerGroup,
  FaBell as FaBellSolid,
  FaGear,
} from "react-icons/fa6";
import {
  TbHome,
  TbCalendarEvent,
  TbMovie,
  TbBroadcast,
  TbBuildingStore,
  TbShoppingCart,
  TbFileInvoice,
  TbTicket,
  TbUsers,
  TbAward,
  TbVideo,
  TbCurrencyDollar,
  TbFileDescription,
  TbCircleCheck,
  TbShieldCheck,
  TbTrendingUp,
  TbRobot,
  TbLayoutGrid,
  TbBell,
  TbSettings,
} from "react-icons/tb";
import {
  IoHome,
  IoCalendar,
  IoFilm,
  IoRadio,
  IoStorefront,
  IoCart,
  IoDocumentText,
  IoTicket,
  IoPeople,
  IoRibbon,
  IoVideocam,
  IoCash,
  IoDocumentAttach,
  IoCheckmarkCircle,
  IoShieldCheckmark,
  IoTrendingUp,
  IoSparkles,
  IoLayers,
  IoNotifications,
  IoSettings,
} from "react-icons/io5";

/**
 * The 20 semantic icon keys used across NEVO navigation, the homepage
 * platform pillars, and the icon-family appearance setting. Historically
 * these mapped to PNG assets (a static fallback + three generated
 * per-family PNGs); they now map directly to react-icons components, one
 * per family, so switching the "Icon family" preference swaps the actual
 * icon component instead of swapping an <img src>.
 */
export type NevoIconKey =
  | "approvals"
  | "bookings"
  | "command-center"
  | "contracts"
  | "copilot"
  | "events"
  | "evidence"
  | "finance"
  | "guests"
  | "live-command"
  | "marketplace"
  | "media"
  | "notifications"
  | "production"
  | "quotes"
  | "roi"
  | "settings"
  | "sponsorship"
  | "templates"
  | "ticketing";

export type NevoIconFamily = "aurora" | "outline" | "solid" | "editorial";

export const nevoIconMap: Record<NevoIconKey, Record<NevoIconFamily, IconType>> = {
  "command-center": { outline: FiHome, solid: FaHouse, editorial: TbHome, aurora: IoHome },
  events: { outline: FiCalendar, solid: FaCalendarDays, editorial: TbCalendarEvent, aurora: IoCalendar },
  production: { outline: FiFilm, solid: FaClapperboard, editorial: TbMovie, aurora: IoFilm },
  "live-command": { outline: FiRadio, solid: FaTowerBroadcast, editorial: TbBroadcast, aurora: IoRadio },
  marketplace: { outline: FiShoppingBag, solid: FaStore, editorial: TbBuildingStore, aurora: IoStorefront },
  bookings: { outline: FiShoppingCart, solid: FaCartShopping, editorial: TbShoppingCart, aurora: IoCart },
  quotes: { outline: FiFileText, solid: FaFileInvoice, editorial: TbFileInvoice, aurora: IoDocumentText },
  ticketing: { outline: FiTag, solid: FaTicket, editorial: TbTicket, aurora: IoTicket },
  guests: { outline: FiUsers, solid: FaUsersGroup, editorial: TbUsers, aurora: IoPeople },
  sponsorship: { outline: FiAward, solid: FaHandshake, editorial: TbAward, aurora: IoRibbon },
  media: { outline: FiVideo, solid: FaVideoCamera, editorial: TbVideo, aurora: IoVideocam },
  finance: { outline: FiDollarSign, solid: FaSackDollar, editorial: TbCurrencyDollar, aurora: IoCash },
  contracts: { outline: FiPenTool, solid: FaFileContract, editorial: TbFileDescription, aurora: IoDocumentAttach },
  approvals: { outline: FiCheckSquare, solid: FaCircleCheck, editorial: TbCircleCheck, aurora: IoCheckmarkCircle },
  evidence: { outline: FiShield, solid: FaShieldHalved, editorial: TbShieldCheck, aurora: IoShieldCheckmark },
  roi: { outline: FiTrendingUp, solid: FaChartLine, editorial: TbTrendingUp, aurora: IoTrendingUp },
  copilot: { outline: FiCpu, solid: FaRobot, editorial: TbRobot, aurora: IoSparkles },
  templates: { outline: FiLayout, solid: FaLayerGroup, editorial: TbLayoutGrid, aurora: IoLayers },
  notifications: { outline: FiBell, solid: FaBellSolid, editorial: TbBell, aurora: IoNotifications },
  settings: { outline: FiSettings, solid: FaGear, editorial: TbSettings, aurora: IoSettings },
};

export const isNevoIconKey = (value: string): value is NevoIconKey => value in nevoIconMap;

/**
 * Renders one of NEVO's 20 semantic icons for the given `family`.
 * Stateless and family-agnostic by design: this package has no opinion on
 * where "the active icon family" is stored, so the consuming app reads it
 * from its own state (e.g. Redux `preferences.iconFamily`) and passes it
 * in as a prop, typically from a thin per-app wrapper.
 */
export function NevoIcon({
  iconKey,
  family,
  className,
  size = 22,
}: {
  iconKey: NevoIconKey;
  family: NevoIconFamily;
  className?: string;
  size?: number;
}) {
  const Icon = nevoIconMap[iconKey][family];
  return (
    <Icon
      aria-hidden="true"
      focusable="false"
      size={size}
      className={className}
      style={family === "aurora" ? { fill: "url(#nevo-aurora-gradient)" } : undefined}
    />
  );
}

/** Shared SVG gradient definitions used by the "Aurora Glass" icon family. Rendered once near the document root. */
export function NevoIconGradientDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="nevo-aurora-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7a4cff" />
          <stop offset="100%" stopColor="#ef3e91" />
        </linearGradient>
      </defs>
    </svg>
  );
}
