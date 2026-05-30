import { useState, useRef, useCallback, type CSSProperties, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AdminBackButton, AdminButton, AdminModalActions, AdminUserChip, PublicSiteButton } from './adminUi'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Tags,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  Check,
  TrendingUp,
  Eye,
  Upload,
  Globe,
  Lock,
  Crown,
  MoreHorizontal,
  AlertTriangle,
  EyeOff,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useAuthStore } from '../../store/authStore'
import { adminRoleLabel, canManageAdminRoles } from '../../utils/authPermissions'
import {
  fetchUsers,
  updateUserAdminAccess,
  userAvatarColor,
  userInitials,
  type AccountTypeFilter,
  UserServiceError,
} from '../../services/userService'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import type { BookStatus } from '../../data/mockBooks'
import GenresAndTagsView from './views/GenresAndTagsView'

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminView = "dashboard" | "books" | "book-form" | "users" | "genresTags";

interface ChapterImage {
  id: string;
  name: string;
  url: string;
}

interface Chapter {
  id: string;
  number: number;
  title: string;
  images: ChapterImage[];
  expanded: boolean;
}

interface BookFormData {
  title: string;
  author: string;
  year: string;
  pages: string;
  genre: string;
  status: BookStatus;
  accessType: "free" | "registered" | "premium";
  tags: string;
  description: string;
  longDescription: string;
  coverPreview: string | null;
  chapters: Chapter[];
}

interface AdminBook {
  id: number;
  title: string;
  author: string;
  coverGradient: string;
  coverLabel: string;
  genre: string;
  chapters: number;
  status: BookStatus;
  accessType: string;
  dateAdded: string;
}

// ─── Constants & Mock Data ─────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BookStatus, { bg: string; text: string; dot: string; label: string }> = {
  Published: { bg: "#DCFCE7", text: "#15803D", dot: "#16A34A", label: "Published" },
  Draft:     { bg: "#F3F4F6", text: "#6B7280", dot: "#9CA3AF", label: "Draft"     },
  Hidden:    { bg: "#FFEDD5", text: "#C2410C", dot: "#F97316", label: "Hidden"    },
  Archived:  { bg: "#FEE2E2", text: "#B91C1C", dot: "#EF4444", label: "Archived"  },
};

const ALL_GENRES = [
  "Fantasy", "Mystery", "Adventure", "Romance", "Sci-Fi",
  "Horror", "Thriller", "Children's", "Humor", "Historical",
];

const TABLE_BOOKS: AdminBook[] = [
  { id: 1, title: "The Enchanted Garden",    author: "Eleanor Whitmore",  coverGradient: "linear-gradient(145deg,#7C3AED,#4F46E5)", coverLabel: "TEG", genre: "Fantasy",    chapters: 8,  status: "Published", accessType: "free",       dateAdded: "Mar 12 2026" },
  { id: 2, title: "Sailing to Tomorrow",     author: "James R. Caldwell", coverGradient: "linear-gradient(145deg,#0284C7,#0EA5E9)", coverLabel: "STT", genre: "Adventure",  chapters: 8,  status: "Published", accessType: "free",       dateAdded: "Mar 18 2026" },
  { id: 3, title: "The Whispering Woods",    author: "Clara Song",        coverGradient: "linear-gradient(145deg,#059669,#10B981)", coverLabel: "TWW", genre: "Mystery",    chapters: 8,  status: "Published", accessType: "registered", dateAdded: "Mar 22 2026" },
  { id: 4, title: "Castle of Starlight",     author: "Theo Brightman",    coverGradient: "linear-gradient(145deg,#D97706,#F59E0B)", coverLabel: "COS", genre: "Fantasy",    chapters: 8,  status: "Published", accessType: "premium",    dateAdded: "Mar 25 2026" },
  { id: 5, title: "Cherry Blossom Letters",  author: "Yuki Tanaka",       coverGradient: "linear-gradient(145deg,#DB2777,#EC4899)", coverLabel: "CBL", genre: "Romance",    chapters: 8,  status: "Published", accessType: "free",       dateAdded: "Mar 27 2026" },
  { id: 6, title: "The Little Lighthouse",   author: "Anne Marsh",        coverGradient: "linear-gradient(145deg,#2563EB,#3B82F6)", coverLabel: "TLL", genre: "Children's", chapters: 4,  status: "Draft",     accessType: "free",       dateAdded: "Mar 28 2026" },
  { id: 7, title: "A Dragon's Diary",        author: "Felix Dorn",        coverGradient: "linear-gradient(145deg,#DC2626,#EF4444)", coverLabel: "ADD", genre: "Humor",      chapters: 7,  status: "Hidden",    accessType: "registered", dateAdded: "Apr 01 2026" },
  { id: 8, title: "Midnight in the Museum",  author: "Isabelle Dumont",   coverGradient: "linear-gradient(145deg,#1E293B,#334155)", coverLabel: "MIM", genre: "Mystery",    chapters: 8,  status: "Archived",  accessType: "premium",    dateAdded: "Apr 05 2026" },
];

// Dashboard chart data
const DAILY_READS = [
  { date: "Mar 30", reads: 124 }, { date: "Mar 31", reads: 189 },
  { date: "Apr 1",  reads: 215 }, { date: "Apr 2",  reads: 178 },
  { date: "Apr 3",  reads: 267 }, { date: "Apr 4",  reads: 312 },
  { date: "Apr 5",  reads: 298 }, { date: "Apr 6",  reads: 187 },
  { date: "Apr 7",  reads: 234 }, { date: "Apr 8",  reads: 289 },
  { date: "Apr 9",  reads: 341 }, { date: "Apr 10", reads: 398 },
  { date: "Apr 11", reads: 445 }, { date: "Apr 12", reads: 372 },
];

const GENRE_DATA = [
  { name: "Fantasy",   value: 32, color: "#7C3AED" },
  { name: "Mystery",   value: 24, color: "#F59E0B" },
  { name: "Adventure", value: 18, color: "#059669" },
  { name: "Romance",   value: 14, color: "#EC4899" },
  { name: "Sci-Fi",    value:  8, color: "#0EA5E9" },
  { name: "Others",    value:  4, color: "#9CA3AF" },
];

const MOST_READ_BOOKS = [
  { title: "The Enchanted Garden",   reads: 3241 },
  { title: "Cherry Blossom Letters", reads: 2876 },
  { title: "The Whispering Woods",   reads: 2543 },
  { title: "A Dragon's Diary",       reads: 2187 },
  { title: "Sailing to Tomorrow",    reads: 1923 },
  { title: "Castle of Starlight",    reads: 1654 },
];

const TOP_READERS = [
  { name: "Sarah Chen",     initials: "SC", books: 24, hours: 87,  status: "Active" },
  { name: "Mike Rodriguez", initials: "MR", books: 19, hours: 62,  status: "Active" },
  { name: "Aisha Patel",    initials: "AP", books: 17, hours: 58,  status: "Active" },
  { name: "Tom Williams",   initials: "TW", books: 15, hours: 51,  status: "Inactive" },
  { name: "Emma Laurent",   initials: "EL", books: 14, hours: 47,  status: "Active" },
];

// ─── Shared UI Components ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BookStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: cfg.bg, color: cfg.text, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function SectionCard({ title, children, action }: { title?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      {title && (
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{title}</span>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: { icon: ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 10, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "-0.5px", lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{label}</div>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function FormField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5, letterSpacing: "0.01em" }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%", padding: "8px 11px", fontSize: 13, color: "#111827",
  background: "#FFFFFF", border: "1px solid #D1D5DB", borderRadius: 7,
  outline: "none", fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
  transition: "border-color 0.15s",
};

function StyledInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...inputStyle, borderColor: focused ? "#4F46E5" : "#D1D5DB", boxShadow: focused ? "0 0 0 3px rgba(79,70,229,0.1)" : "none" }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    />
  );
}

function StyledTextarea({ value, onChange, placeholder, rows = 4 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      rows={rows} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6, borderColor: focused ? "#4F46E5" : "#D1D5DB", boxShadow: focused ? "0 0 0 3px rgba(79,70,229,0.1)" : "none" }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    />
  );
}

function StyledSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, paddingRight: 32, appearance: "none", cursor: "pointer" }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={13} color="#6B7280" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
    </div>
  );
}

// ─── Dashboard View ────────────────────────────────────────────────────────────

function DashboardView() {
  type AreaTooltipProps = {
    active?: boolean
    payload?: Array<{ value?: number }>
    label?: string
  }

  const CustomTooltip = ({ active, payload, label }: AreaTooltipProps) => {
    if (active && payload && payload.length) {
      const v = payload[0]?.value ?? 0
      return (
        <div style={{ background: "#1F2937", borderRadius: 8, padding: "8px 12px", border: "none" }}>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#F9FAFB" }}>{v.toLocaleString()} reads</div>
        </div>
      );
    }
    return null;
  };

  type BarTooltipProps = {
    active?: boolean
    payload?: Array<{ value?: number }>
  }

  const BarTooltip = ({ active, payload }: BarTooltipProps) => {
    if (active && payload && payload.length) {
      const v = payload[0]?.value ?? 0
      return (
        <div style={{ background: "#1F2937", borderRadius: 8, padding: "8px 12px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#F9FAFB" }}>{v.toLocaleString()} reads</div>
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  type PieLabelProps = {
    cx?: number
    cy?: number
    midAngle?: number
    innerRadius?: number
    outerRadius?: number
    percent?: number
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelProps) => {
    if (
      cx === undefined ||
      cy === undefined ||
      midAngle === undefined ||
      innerRadius === undefined ||
      outerRadius === undefined ||
      percent === undefined
    ) {
      return null
    }
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.06) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700 }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard icon={<BookOpen size={20} />}    label="Total Books"     value="42"     sub="+3 this month"    color="#4F46E5" />
        <StatCard icon={<Users size={20} />}        label="Registered Users" value="1,284" sub="+127 this month"  color="#059669" />
        <StatCard icon={<TrendingUp size={20} />}  label="Total Reads"     value="18,471" sub="+2,341 this month" color="#D97706" />
        <StatCard icon={<Eye size={20} />}         label="Active Today"    value="347"    sub="vs 289 yesterday"  color="#DB2777" />
      </div>

      {/* Row 2: Area chart + Pie chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 14, marginBottom: 14 }}>
        <SectionCard title="Reading Activity — Last 14 Days">
          <div style={{ padding: "16px 4px 8px" }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={DAILY_READS} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="readGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="reads" stroke="#4F46E5" strokeWidth={2} fill="url(#readGrad)" dot={false} activeDot={{ r: 4, fill: "#4F46E5" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Genre Distribution">
          <div style={{ padding: "8px 0 12px" }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={GENRE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" labelLine={false} label={renderCustomLabel}>
                  {GENRE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => [`${value ?? 0}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", padding: "0 16px" }}>
              {GENRE_DATA.map((g) => (
                <div key={g.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6B7280" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: g.color, flexShrink: 0, display: "inline-block" }} />
                  {g.name}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Row 3: Bar chart + Top readers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 14 }}>
        <SectionCard title="Most Read Books">
          <div style={{ padding: "16px 4px 8px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MOST_READ_BOOKS} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
                <YAxis type="category" dataKey="title" tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} width={165} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="reads" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Top Readers">
          <div style={{ padding: "8px 0" }}>
            {TOP_READERS.map((user, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 18px", borderBottom: i < TOP_READERS.length - 1 ? "1px solid #F9FAFB" : "none" }}>
                <div style={{ width: 20, textAlign: "center", fontSize: 11, fontWeight: 700, color: i < 3 ? "#4F46E5" : "#9CA3AF" }}>{i + 1}</div>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: ["#7C3AED","#0284C7","#059669","#D97706","#DB2777"][i], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {user.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>{user.books} books · {user.hours}h</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: user.status === "Active" ? "#DCFCE7" : "#F3F4F6", color: user.status === "Active" ? "#15803D" : "#6B7280" }}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Books View ────────────────────────────────────────────────────────────────

function BooksView({ onAdd, onEdit }: { onAdd: () => void; onEdit: (book: AdminBook) => void }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [books, setBooks] = useState<AdminBook[]>(TABLE_BOOKS);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const filtered = books.filter((b) => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id: number) => {
    setBooks(books.filter((b) => b.id !== id));
    setDeleteConfirm(null);
    setMenuOpen(null);
  };

  const handleToggleStatus = (id: number) => {
    setBooks(books.map((b) => b.id === id ? { ...b, status: b.status === "Published" ? "Hidden" : "Published" } : b));
    setMenuOpen(null);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
      {/* Action bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, maxWidth: 300, display: "flex", alignItems: "center", gap: 8, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 7, padding: "0 11px", height: 36 }}>
          <Search size={13} color="#9CA3AF" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or author..." style={{ border: "none", outline: "none", fontSize: 13, color: "#111827", background: "transparent", fontFamily: "'Inter', sans-serif", flex: 1, minWidth: 0 }} />
        </div>
        <div style={{ position: "relative" }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ appearance: "none", background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 7, padding: "0 32px 0 11px", height: 36, fontSize: 13, color: "#374151", cursor: "pointer", fontFamily: "'Inter', sans-serif", outline: "none" }}>
            <option value="all">All Status</option>
            {Object.keys(STATUS_CONFIG).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={13} color="#6B7280" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 12, color: "#6B7280" }}>{filtered.length} books</div>
        <AdminButton variant="primary" icon={Plus} onClick={onAdd} style={{ height: 36, padding: '0 16px' }}>
          Add new book
        </AdminButton>
      </div>

      {/* Table */}
      <SectionCard>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {[
                { label: "Book", w: "auto" },
                { label: "Genre", w: 110 },
                { label: "Chapters", w: 90 },
                { label: "Access", w: 100 },
                { label: "Status", w: 105 },
                { label: "Added", w: 115 },
                { label: "", w: 50 },
              ].map((col) => (
                <th key={col.label} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap", width: col.w !== "auto" ? col.w : undefined }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((book, idx) => (
              <tr key={book.id}
                onMouseEnter={() => setHoveredRow(book.id)}
                onMouseLeave={() => { setHoveredRow(null); setMenuOpen(null); }}
                style={{ borderBottom: idx < filtered.length - 1 ? "1px solid #F3F4F6" : "none", background: hoveredRow === book.id ? "#F9FAFB" : "#FFFFFF", transition: "background 0.1s" }}>
                {/* Book */}
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{ width: 36, height: 50, borderRadius: 4, background: book.coverGradient, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.8)", fontSize: 8, fontWeight: 700, letterSpacing: "0.03em", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "rgba(0,0,0,0.2)" }} />
                      {book.coverLabel}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{book.title}</div>
                      <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{book.author}</div>
                    </div>
                  </div>
                </td>
                {/* Genre */}
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ fontSize: 12, color: "#374151" }}>{book.genre}</span>
                </td>
                {/* Chapters */}
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ fontSize: 13, color: "#374151" }}>{book.chapters} ch.</span>
                </td>
                {/* Access */}
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {book.accessType === "free"       && <><Globe size={11} color="#059669" /><span style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>Free</span></>}
                    {book.accessType === "registered" && <><Lock size={11} color="#D97706" /><span style={{ fontSize: 11, color: "#D97706", fontWeight: 600 }}>Registered</span></>}
                    {book.accessType === "premium"    && <><Crown size={11} color="#7C3AED" /><span style={{ fontSize: 11, color: "#7C3AED", fontWeight: 600 }}>Premium</span></>}
                  </div>
                </td>
                {/* Status */}
                <td style={{ padding: "12px 14px" }}>
                  <StatusBadge status={book.status} />
                </td>
                {/* Added */}
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>{book.dateAdded}</span>
                </td>
                {/* Actions */}
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <button onClick={() => onEdit(book)} title="Edit" style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid transparent", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", transition: "all 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#111827"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "#6B7280"; }}>
                      <Pencil size={13} />
                    </button>
                    <div style={{ position: "relative" }}>
                      <button onClick={() => setMenuOpen(menuOpen === book.id ? null : book.id)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid transparent", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", transition: "all 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#111827"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "#6B7280"; }}>
                        <MoreHorizontal size={13} />
                      </button>
                      {menuOpen === book.id && (
                        <div style={{ position: "absolute", right: 0, top: "100%", zIndex: 20, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 140, marginTop: 4, overflow: "hidden" }}>
                          <button onClick={() => { handleToggleStatus(book.id); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", border: "none", background: "transparent", cursor: "pointer", fontSize: 12, color: "#374151", fontFamily: "'Inter', sans-serif", textAlign: "left", transition: "background 0.1s" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#F9FAFB"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                            <EyeOff size={12} /> {book.status === "Published" ? "Hide Book" : "Publish"}
                          </button>
                          <div style={{ height: 1, background: "#F3F4F6" }} />
                          <button onClick={() => { setDeleteConfirm(book.id); setMenuOpen(null); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", border: "none", background: "transparent", cursor: "pointer", fontSize: 12, color: "#EF4444", fontFamily: "'Inter', sans-serif", textAlign: "left", transition: "background 0.1s" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#FEF2F2"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
            No books match your search.
          </div>
        )}
      </SectionCard>

      {/* Delete Confirm Modal */}
      {deleteConfirm !== null && (
        <>
          <div onClick={() => setDeleteConfirm(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#FFFFFF", borderRadius: 12, padding: 24, zIndex: 60, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: "'Inter', sans-serif" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={18} color="#EF4444" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Delete Book</div>
            </div>
            <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6, marginBottom: 20 }}>
              Are you sure you want to delete "<strong style={{ color: "#111827" }}>{books.find(b => b.id === deleteConfirm)?.title}</strong>"? This action cannot be undone.
            </p>
            <AdminModalActions
              onCancel={() => setDeleteConfirm(null)}
              onConfirm={() => handleDelete(deleteConfirm)}
              confirmLabel="Delete"
              danger
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Book Form View ────────────────────────────────────────────────────────────

let _uid = 0;
const uid = () => String(++_uid);

function makeDefaultChapter(num: number): Chapter {
  return { id: uid(), number: num, title: "", images: [], expanded: true };
}

function BookFormView({ editingBook, onBack }: { editingBook: AdminBook | null; onBack: () => void }) {
  const isEdit = editingBook !== null;

  const [form, setForm] = useState<BookFormData>({
    title:           isEdit ? editingBook!.title  : "",
    author:          isEdit ? editingBook!.author : "",
    year:            isEdit ? "2024" : "",
    pages:           "",
    genre:           isEdit ? editingBook!.genre  : "Fantasy",
    status:          isEdit ? editingBook!.status : "Draft",
    accessType:      isEdit ? (editingBook!.accessType as "free" | "registered" | "premium") : "free",
    tags:            "",
    description:     "",
    longDescription: "",
    coverPreview:    null,
    chapters:        [makeDefaultChapter(1)],
  });

  const coverInputRef = useRef<HTMLInputElement>(null);

  const setField = <K extends keyof BookFormData>(key: K, val: BookFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setField("coverPreview", url);
  };

  // Chapter management
  const addChapter = () => {
    const num = form.chapters.length + 1;
    setField("chapters", [...form.chapters, makeDefaultChapter(num)]);
  };

  const removeChapter = (id: string) => {
    const updated = form.chapters
      .filter((c) => c.id !== id)
      .map((c, i) => ({ ...c, number: i + 1 }));
    setField("chapters", updated);
  };

  const updateChapterTitle = (id: string, title: string) => {
    setField("chapters", form.chapters.map((c) => c.id === id ? { ...c, title } : c));
  };

  const toggleChapter = (id: string) => {
    setField("chapters", form.chapters.map((c) => c.id === id ? { ...c, expanded: !c.expanded } : c));
  };

  const addImages = useCallback((chapterId: string, files: FileList) => {
    const chapter = form.chapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    const existing = chapter.images.length;
    const newImages: ChapterImage[] = Array.from(files).map((file, i) => ({
      id: uid(),
      name: `ch_${chapter.number}_p_${existing + i + 1}`,
      url: URL.createObjectURL(file),
    }));
    setField("chapters", form.chapters.map((c) =>
      c.id === chapterId ? { ...c, images: [...c.images, ...newImages] } : c
    ));
  }, [form.chapters]);

  const removeImage = (chapterId: string, imageId: string) => {
    setField("chapters", form.chapters.map((c) => {
      if (c.id !== chapterId) return c;
      const remaining = c.images.filter((img) => img.id !== imageId);
      // Re-index names
      const renamed = remaining.map((img, i) => ({ ...img, name: `ch_${c.number}_p_${i + 1}` }));
      return { ...c, images: renamed };
    }));
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#F9FAFB", display: "flex", flexDirection: "column" }}>
      {/* Sticky Form Header */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E7EB", padding: "12px 24px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10, flexShrink: 0 }}>
        <AdminBackButton label="Back to books" onClick={onBack} />
        <div style={{ width: 1, height: 20, background: "#E5E7EB" }} />
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>Books</span>
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{isEdit ? "Edit Book" : "Add New Book"}</span>
        <StatusBadge status={form.status} />
        <div style={{ flex: 1 }} />
        <PublicSiteButton variant="header" />
        <AdminButton variant="secondary" onClick={onBack}>
          Cancel
        </AdminButton>
        <AdminButton variant="secondary">
          Save draft
        </AdminButton>
        <AdminButton variant="primary">
          {isEdit ? "Save changes" : "Publish"}
        </AdminButton>
      </div>

      {/* Two-column form body */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, padding: 24, alignItems: "start" }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Basic Info */}
          <SectionCard title="Basic Information">
            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
              <FormField label="Book Title" required>
                <StyledInput value={form.title} onChange={(v) => setField("title", v)} placeholder="e.g. The Enchanted Kingdom" />
              </FormField>
              <FormField label="Author" required>
                <StyledInput value={form.author} onChange={(v) => setField("author", v)} placeholder="e.g. Jane Smith" />
              </FormField>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FormField label="Publication Year">
                  <StyledInput value={form.year} onChange={(v) => setField("year", v)} placeholder="e.g. 2024" type="number" />
                </FormField>
                <FormField label="Pages">
                  <StyledInput value={form.pages} onChange={(v) => setField("pages", v)} placeholder="e.g. 280" type="number" />
                </FormField>
              </div>
            </div>
          </SectionCard>

          {/* Description */}
          <SectionCard title="Description">
            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
              <FormField label="Short Description" hint="Appears on the book card — keep it under 200 characters">
                <StyledTextarea value={form.description} onChange={(v) => setField("description", v)} placeholder="Brief synopsis of the book..." rows={3} />
              </FormField>
              <FormField label="Full Description" hint="Shown on the book detail page — be as descriptive as you like">
                <StyledTextarea value={form.longDescription} onChange={(v) => setField("longDescription", v)} placeholder="Full story description, setting the scene for readers..." rows={6} />
              </FormField>
            </div>
          </SectionCard>

          {/* Chapters */}
          <SectionCard
            title={`Chapters (${form.chapters.length})`}
            action={
              <button onClick={addChapter} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", border: "1px solid #D1D5DB", borderRadius: 6, background: "#FFFFFF", fontSize: 12, fontWeight: 500, color: "#374151", cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#F3F4F6"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; }}>
                <Plus size={12} /> Add Chapter
              </button>
            }>
            <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
              {form.chapters.map((chapter) => (
                <ChapterPanel
                  key={chapter.id}
                  chapter={chapter}
                  onToggle={() => toggleChapter(chapter.id)}
                  onTitleChange={(t) => updateChapterTitle(chapter.id, t)}
                  onRemove={() => removeChapter(chapter.id)}
                  onAddImages={(files) => addImages(chapter.id, files)}
                  onRemoveImage={(imgId) => removeImage(chapter.id, imgId)}
                  canRemove={form.chapters.length > 1}
                />
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Publication */}
          <SectionCard title="Publication">
            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
              <FormField label="Status">
                <StyledSelect
                  value={form.status}
                  onChange={(v) => setField("status", v as BookStatus)}
                  options={Object.keys(STATUS_CONFIG).map((s) => ({ value: s, label: s }))}
                />
                <div style={{ marginTop: 8 }}>
                  <StatusBadge status={form.status} />
                </div>
              </FormField>
              <FormField label="Access Type">
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 2 }}>
                  {([
                    { value: "free",       icon: <Globe size={13} />,  color: "#059669", label: "Free",       desc: "Anyone can read" },
                    { value: "registered", icon: <Lock size={13} />,   color: "#D97706", label: "Registered", desc: "Login required"   },
                    { value: "premium",    icon: <Crown size={13} />,  color: "#7C3AED", label: "Premium",    desc: "Premium members" },
                  ] as const).map((opt) => (
                    <button key={opt.value} onClick={() => setField("accessType", opt.value)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: `1.5px solid ${form.accessType === opt.value ? opt.color : "#E5E7EB"}`, borderRadius: 8, background: form.accessType === opt.value ? `${opt.color}0D` : "#FFFFFF", cursor: "pointer", fontFamily: "'Inter', sans-serif", textAlign: "left", width: "100%", transition: "all 0.15s" }}>
                      <span style={{ color: opt.color }}>{opt.icon}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: form.accessType === opt.value ? opt.color : "#374151" }}>{opt.label}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>{opt.desc}</div>
                      </div>
                      {form.accessType === opt.value && <Check size={13} style={{ marginLeft: "auto", color: opt.color, flexShrink: 0 }} />}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>
          </SectionCard>

          {/* Cover Image */}
          <SectionCard title="Cover Image">
            <div style={{ padding: "16px 18px" }}>
              {form.coverPreview ? (
                <div style={{ position: "relative" }}>
                  <img src={form.coverPreview} alt="Cover preview" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 8, display: "block" }} />
                  <button onClick={() => setField("coverPreview", null)} style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <X size={12} />
                  </button>
                  <button onClick={() => coverInputRef.current?.click()} style={{ marginTop: 10, width: "100%", padding: "7px 0", border: "1px solid #D1D5DB", borderRadius: 7, background: "#FFFFFF", fontSize: 12, fontWeight: 500, color: "#374151", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                    Replace Image
                  </button>
                </div>
              ) : (
                <div onClick={() => coverInputRef.current?.click()} style={{ border: "1.5px dashed #D1D5DB", borderRadius: 8, padding: "28px 16px", textAlign: "center", background: "#F9FAFB", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#4F46E5"; (e.currentTarget as HTMLElement).style.background = "#EEF2FF"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#D1D5DB"; (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                    <ImageIcon size={20} color="#9CA3AF" />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                    Click to upload cover
                  </div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>PNG, JPG · Recommended 400×560px</div>
                </div>
              )}
              <input ref={coverInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverUpload} />
            </div>
          </SectionCard>

          {/* Categorization */}
          <SectionCard title="Categorization">
            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
              <FormField label="Genre" required>
                <StyledSelect value={form.genre} onChange={(v) => setField("genre", v)} options={ALL_GENRES.map((g) => ({ value: g, label: g }))} />
              </FormField>
              <FormField label="Tags" hint='Separate tags with commas, e.g. "magic, dragons, epic"'>
                <StyledInput value={form.tags} onChange={(v) => setField("tags", v)} placeholder="magic, adventure, illustrated" />
              </FormField>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

// ─── Chapter Panel ─────────────────────────────────────────────────────────────

function ChapterPanel({
  chapter, onToggle, onTitleChange, onRemove, onAddImages, onRemoveImage, canRemove,
}: {
  chapter: Chapter;
  onToggle: () => void;
  onTitleChange: (t: string) => void;
  onRemove: () => void;
  onAddImages: (files: FileList) => void;
  onRemoveImage: (id: string) => void;
  canRemove: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [titleFocused, setTitleFocused] = useState(false);

  return (
    <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden", background: "#FFFFFF" }}>
      {/* Chapter Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: chapter.expanded ? "#F9FAFB" : "#FFFFFF", borderBottom: chapter.expanded ? "1px solid #E5E7EB" : "none" }}>
        <button onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, color: "#374151", flex: 1, textAlign: "left" }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: "#4F46E5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
            {chapter.number}
          </div>
          <input
            value={chapter.title}
            onChange={(e) => onTitleChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder={`Chapter ${chapter.number} title...`}
            style={{ flex: 1, border: "none", outline: titleFocused ? "1px solid #4F46E5" : "none", borderRadius: 4, padding: "3px 6px", fontSize: 13, fontWeight: 500, color: "#111827", background: "transparent", fontFamily: "'Inter', sans-serif", cursor: "text" }}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
          />
          <span style={{ fontSize: 11, color: "#9CA3AF", whiteSpace: "nowrap", flexShrink: 0 }}>{chapter.images.length} images</span>
          {chapter.expanded ? <ChevronUp size={14} color="#9CA3AF" style={{ flexShrink: 0 }} /> : <ChevronDown size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />}
        </button>
        {canRemove && (
          <button onClick={onRemove} title="Remove chapter" style={{ width: 24, height: 24, borderRadius: 5, border: "1px solid transparent", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", transition: "all 0.15s", flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.borderColor = "#FCA5A5"; e.currentTarget.style.color = "#EF4444"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}>
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Chapter Body */}
      {chapter.expanded && (
        <div style={{ padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>
            Chapter Images
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-start" }}>
            {chapter.images.map((img) => (
              <div key={img.id} style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 80, height: 105, borderRadius: 6, overflow: "hidden", border: "1px solid #E5E7EB", background: "#F9FAFB" }}>
                  <img src={img.url} alt={img.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <button onClick={() => onRemoveImage(img.id)} title="Remove image" style={{ position: "absolute", top: -7, right: -7, width: 20, height: 20, borderRadius: "50%", background: "#EF4444", border: "2px solid #FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
                  <X size={9} />
                </button>
                <div style={{ fontSize: 9, color: "#9CA3AF", marginTop: 4, textAlign: "center", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {img.name}
                </div>
              </div>
            ))}
            {/* Add images button */}
            <button onClick={() => fileRef.current?.click()} style={{ width: 80, height: 105, borderRadius: 6, border: "1.5px dashed #D1D5DB", background: "#F9FAFB", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "#9CA3AF", transition: "all 0.15s", flexShrink: 0 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#4F46E5"; (e.currentTarget as HTMLElement).style.color = "#4F46E5"; (e.currentTarget as HTMLElement).style.background = "#EEF2FF"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#D1D5DB"; (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}>
              <Upload size={16} />
              <span style={{ fontSize: 10, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>Add Images</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { if (e.target.files) onAddImages(e.target.files); e.target.value = ""; }} />
          </div>
          {chapter.images.length > 0 && (
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 10 }}>
              Images are displayed in alphabetical order by name (ch_{chapter.number}_p_1, ch_{chapter.number}_p_2…)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Users View ────────────────────────────────────────────────────────────────

const USER_FILTER_TABS: { id: AccountTypeFilter; label: string }[] = [
  { id: 'all', label: 'All accounts' },
  { id: 'readers', label: 'Readers' },
  { id: 'staff', label: 'Admins' },
]

function UsersView({ canManageAdmins }: { canManageAdmins: boolean }) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [accountFilter, setAccountFilter] = useState<AccountTypeFilter>("all")
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [toggleError, setToggleError] = useState<string | null>(null)
  const currentUser = useAuthStore((s) => s.user)

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', accountFilter, search],
    queryFn: () => fetchUsers({ accountType: accountFilter, search, limit: 100 }),
  })

  const adminToggleMutation = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      updateUserAdminAccess(userId, isAdmin),
    onSuccess: () => {
      setToggleError(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (err) => {
      setToggleError(err instanceof UserServiceError ? err.message : 'Could not update admin access.')
    },
  })

  const users = usersQuery.data?.users ?? []
  const totalCount = usersQuery.data?.totalCount ?? 0

  const columns = canManageAdmins
    ? ["User", "Email", "Joined", "Status", "Admin access"]
    : ["User", "Email", "Joined", "Status"]

  const statusColors: Record<string, { bg: string; text: string }> = {
    Active:   { bg: "#DCFCE7", text: "#15803D" },
    Inactive: { bg: "#F3F4F6", text: "#6B7280" },
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
      {canManageAdmins ? (
        <div style={{ marginBottom: 14, padding: "12px 14px", borderRadius: 8, background: "#EEF2FF", border: "1px solid #C7D2FE", fontSize: 12, color: "#3730A3", display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={16} />
          Super admin: toggle <strong style={{ marginLeft: 4, marginRight: 4 }}>is_admin</strong> to grant or revoke admin portal access. Changes apply on the user&apos;s next sign-in.
        </div>
      ) : (
        <div style={{ marginBottom: 14, padding: "12px 14px", borderRadius: 8, background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: 12, color: "#6B7280" }}>
          View registered accounts from the database. Only super admins can change admin access flags.
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {USER_FILTER_TABS.map((tab) => {
          const active = accountFilter === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAccountFilter(tab.id)}
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                border: active ? "1px solid #4F46E5" : "1px solid #E5E7EB",
                background: active ? "#EEF2FF" : "#FFFFFF",
                color: active ? "#4338CA" : "#6B7280",
                fontSize: 12,
                fontWeight: active ? 700 : 600,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, maxWidth: 320, display: "flex", alignItems: "center", gap: 8, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 7, padding: "0 11px", height: 36 }}>
          <Search size={13} color="#9CA3AF" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…" style={{ border: "none", outline: "none", fontSize: 13, color: "#111827", background: "transparent", fontFamily: "'Inter', sans-serif", flex: 1, minWidth: 0 }} />
        </div>
        <div style={{ flex: 1 }} />
        {usersQuery.isFetching ? (
          <Loader2 size={14} color="#9CA3AF" className="animate-spin" />
        ) : null}
        <div style={{ fontSize: 12, color: "#6B7280" }}>{totalCount} {totalCount === 1 ? "account" : "accounts"}</div>
      </div>

      {toggleError ? (
        <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 8, background: "#FEE2E2", color: "#B91C1C", fontSize: 12 }}>
          {toggleError}
        </div>
      ) : null}

      {usersQuery.isLoading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#6B7280", fontSize: 13 }}>Loading users…</div>
      ) : usersQuery.isError ? (
        <div style={{ padding: 16, borderRadius: 10, background: "#FEE2E2", color: "#B91C1C", fontSize: 13 }}>
          Failed to load users. Confirm you are signed in as an admin and the API is running.
        </div>
      ) : (
      <SectionCard>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {columns.map((col) => (
                <th key={col} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: 28, textAlign: "center", fontSize: 13, color: "#9CA3AF" }}>
                  No accounts match this filter.
                </td>
              </tr>
            ) : null}
            {users.map((user, idx) => {
              const isSelf = currentUser?._id === user._id
              const toggleDisabled = !canManageAdmins || user.is_super_admin || isSelf || adminToggleMutation.isPending
              const statusLabel = user.isActive ? "Active" : "Inactive"
              const joined = user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "—"
              const avatarColor = userAvatarColor(user.email)
              const initials = userInitials(user.name)

              return (
              <tr key={user._id} onMouseEnter={() => setHoveredRow(user._id)} onMouseLeave={() => setHoveredRow(null)}
                style={{ borderBottom: idx < users.length - 1 ? "1px solid #F3F4F6" : "none", background: hoveredRow === user._id ? "#F9FAFB" : "#FFFFFF", transition: "background 0.1s" }}>
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827", display: "block" }}>{user.name}</span>
                      {user.is_super_admin ? (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#4F46E5", letterSpacing: "0.04em", textTransform: "uppercase" }}>Super admin</span>
                      ) : user.is_admin ? (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#0284C7", letterSpacing: "0.04em", textTransform: "uppercase" }}>Admin</span>
                      ) : (
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.04em", textTransform: "uppercase" }}>Reader</span>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 14px" }}><span style={{ fontSize: 12, color: "#6B7280" }}>{user.email}</span></td>
                <td style={{ padding: "12px 14px" }}><span style={{ fontSize: 12, color: "#9CA3AF" }}>{joined}</span></td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: statusColors[statusLabel].bg, color: statusColors[statusLabel].text }}>{statusLabel}</span>
                </td>
                {canManageAdmins ? (
                  <td style={{ padding: "12px 14px" }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: toggleDisabled ? "not-allowed" : "pointer", opacity: toggleDisabled ? 0.55 : 1 }}>
                      <input
                        type="checkbox"
                        checked={user.is_admin}
                        disabled={toggleDisabled}
                        onChange={(e) => adminToggleMutation.mutate({ userId: user._id, isAdmin: e.target.checked })}
                        style={{ width: 16, height: 16, accentColor: "#4F46E5" }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 600, color: user.is_admin ? "#15803D" : "#6B7280" }}>
                        {user.is_super_admin ? "Always on" : user.is_admin ? "is_admin" : "Reader"}
                      </span>
                    </label>
                  </td>
                ) : null}
              </tr>
            )})}
          </tbody>
        </table>
      </SectionCard>
      )}
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",  icon: LayoutDashboard, badge: null },
  { id: "books",     label: "Books",      icon: BookOpen,        badge: "42"  },
  { id: "users",     label: "Users",      icon: Users,           badge: null },
  { id: "genresTags", label: "Genres & tags", icon: Tags, badge: null },
] as const;

type NavId = typeof NAV_ITEMS[number]["id"];

function Sidebar({ active, onNav, userName, userRole }: { active: NavId; onNav: (id: NavId) => void; userName: string; userRole: string }) {
  const initial = userName.charAt(0).toUpperCase();
  return (
    <aside style={{ width: 224, flexShrink: 0, background: "#111827", display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Logo */}
      <div style={{ padding: "18px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <BookOpen size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#F9FAFB", letterSpacing: "-0.3px" }}>Pictoria</div>
          <div style={{ fontSize: 10, color: "#6B7280", marginTop: 1 }}>Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#4B5563", letterSpacing: "0.08em", textTransform: "uppercase", padding: "8px 8px 6px", marginBottom: 2 }}>Main Menu</div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 7, border: "none", background: isActive ? "#4F46E5" : "transparent", color: isActive ? "#FFFFFF" : "#9CA3AF", fontSize: 13, fontWeight: isActive ? 600 : 400, cursor: "pointer", textAlign: "left", marginBottom: 2, fontFamily: "'Inter', sans-serif", transition: "all 0.15s" }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#D1D5DB"; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; } }}>
              <Icon size={15} />
              {item.label}
              {item.badge && (
                <span style={{ marginLeft: "auto", background: isActive ? "rgba(255,255,255,0.25)" : "rgba(79,70,229,0.2)", color: isActive ? "#fff" : "#818CF8", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin profile */}
      <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{initial}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#F3F4F6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
          <div style={{ fontSize: 10, color: "#6B7280" }}>{userRole}</div>
        </div>
      </div>
    </aside>
  );
}

// ─── Page Header ───────────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  books:     "Books",
  "book-form": "Book Editor",
  users:     "Users",
  genresTags: "Genres & tags",
};

function PageHeader({ view, userName, userRole }: { view: AdminView; userName: string; userRole: string }) {
  return (
    <header style={{ minHeight: 56, background: "#FFFFFF", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px", flexShrink: 0, gap: 16 }}>
      <div style={{ minWidth: 0 }}>
        <h1 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.2px" }}>
          {PAGE_TITLES[view] ?? "Admin"}
        </h1>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>
          {view === "dashboard" && "Overview & analytics"}
          {view === "books" && "Manage your library"}
          {view === "book-form" && "Create or edit a book"}
          {view === "users" && "Manage registered users and admin access"}
          {view === "genresTags" && "Genres for shelves, tags for flexible labels"}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <PublicSiteButton variant="header" />
        <AdminUserChip name={userName} role={userRole} />
      </div>
    </header>
  );
}

// ─── Main Admin Page ───────────────────────────────────────────────────────────

export default function AdminPanel() {
  const authUser = useAuthStore((s) => s.user);
  const canManageAdmins = canManageAdminRoles(authUser);
  const displayName = authUser?.name ?? "Admin";
  const roleLabel = adminRoleLabel(authUser);

  const [activeNav, setActiveNav] = useState<NavId>("dashboard");
  const [view, setView] = useState<AdminView>("dashboard");
  const [editingBook, setEditingBook] = useState<AdminBook | null>(null);

  const handleNav = (id: NavId) => {
    setActiveNav(id);
    setView(id as AdminView);
    setEditingBook(null);
  };

  const handleAddBook = () => {
    setEditingBook(null);
    setView("book-form");
  };

  const handleEditBook = (book: AdminBook) => {
    setEditingBook(book);
    setView("book-form");
  };

  const handleBackFromForm = () => {
    setView("books");
    setActiveNav("books");
    setEditingBook(null);
  };

  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: "/admin", requiresAdmin: true }} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Inter', sans-serif", background: "#F9FAFB" }}>
      <Sidebar active={activeNav} onNav={handleNav} userName={displayName} userRole={roleLabel} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {view !== "book-form" && <PageHeader view={view} userName={displayName} userRole={roleLabel} />}

        {view === "dashboard"  && <DashboardView />}
        {view === "books"      && <BooksView onAdd={handleAddBook} onEdit={handleEditBook} />}
        {view === "book-form"  && <BookFormView editingBook={editingBook} onBack={handleBackFromForm} />}
        {view === "users"      && <UsersView canManageAdmins={canManageAdmins} />}
        {view === "genresTags" && <GenresAndTagsView />}
      </div>
    </div>
  );
}
