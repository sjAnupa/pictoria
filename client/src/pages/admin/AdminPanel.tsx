import { useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AdminButton, AdminModalActions, AdminUserChip, PublicSiteButton } from './adminUi'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Tags,
  ChevronDown,
  Search,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  Eye,
  Globe,
  Lock,
  Crown,
  MoreHorizontal,
  AlertTriangle,
  EyeOff,
  ShieldCheck,
  Loader2,
  Menu,
} from "lucide-react";
import { ADMIN_FONT, adminTheme } from './adminTheme'
import { useAuthStore } from '../../store/authStore'
import { adminRoleLabel, canManageAdminRoles } from '../../utils/authPermissions'
import {
  fetchUsers,
  updateUserAdminAccess,
  userAvatarColor,
  userInitials,
  UserServiceError,
  type AccountTypeFilter,
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
import type { BookStatus } from '../../types/book.types'
import GenresAndTagsView from './views/GenresAndTagsView'
import { useAdminBookCount, useAdminBookMutations, useAdminBooks, useAdminDashboard } from '../../hooks/useAdminBooks'
import type { AdminBookRow } from '../../utils/mapAdminBook'
import BookFormView from './views/BookFormView'

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminView = "dashboard" | "books" | "book-form" | "users" | "genresTags";

interface AdminBook extends AdminBookRow {}

// ─── Constants ─────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BookStatus, { bg: string; text: string; dot: string; label: string }> = {
  Published: { bg: "#DCFCE7", text: "#15803D", dot: "#16A34A", label: "Published" },
  Draft:     { bg: "#F3F4F6", text: "#6B7280", dot: "#9CA3AF", label: "Draft"     },
  Hidden:    { bg: "#FFEDD5", text: "#C2410C", dot: "#F97316", label: "Hidden"    },
  Archived:  { bg: "#FEE2E2", text: "#B91C1C", dot: "#EF4444", label: "Archived"  },
};

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
    <div style={{ background: adminTheme.surface, border: `1px solid ${adminTheme.border}`, borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(90,40,10,0.06)" }}>
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
    <div style={{ background: adminTheme.surface, border: `1px solid ${adminTheme.border}`, borderRadius: 10, padding: "18px 20px", boxShadow: "0 1px 3px rgba(90,40,10,0.06)", display: "flex", alignItems: "center", gap: 14 }}>
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

type TopReaderRow = {
  name: string
  initials: string
  books: number
  status: 'Active' | 'Inactive'
}

const TOP_READER_AVATAR_COLORS = ['#8B2635', '#C4776A', '#C9952A', '#6B4226', '#9B6B4A']

function TopReadersPanel({ readers }: { readers: TopReaderRow[] }) {
  return (
    <SectionCard title="Top readers">
      <div className="divide-y divide-[#F3F4F6] p-1 sm:p-2">
        {readers.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm" style={{ color: adminTheme.textSoft }}>
            No reading activity yet.
          </p>
        ) : (
          readers.map((user, i) => (
            <div
              key={`${user.name}-${i}`}
              className="flex items-center gap-3 px-3 py-3 sm:gap-3.5 sm:px-4"
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold sm:h-8 sm:w-8"
                style={{
                  background: i < 3 ? `${adminTheme.primary}18` : '#FDF0D5',
                  color: i < 3 ? adminTheme.primary : adminTheme.textSoft,
                }}
              >
                {i + 1}
              </div>
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white sm:h-10 sm:w-10"
                style={{ background: TOP_READER_AVATAR_COLORS[i % TOP_READER_AVATAR_COLORS.length] }}
              >
                {user.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-semibold"
                  style={{ color: adminTheme.text }}
                  title={user.name}
                >
                  {user.name}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: adminTheme.textSoft }}>
                  {user.books} {user.books === 1 ? 'book' : 'books'} in progress
                </p>
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-[11px]"
                style={{
                  background: user.status === 'Active' ? '#DCFCE7' : '#F3F4F6',
                  color: user.status === 'Active' ? '#15803D' : '#6B7280',
                }}
              >
                {user.status}
              </span>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  )
}

// ─── Dashboard View ────────────────────────────────────────────────────────────

function DashboardView() {
  const { data, isLoading, isError } = useAdminDashboard()

  const DAILY_READS = data?.dailyReads ?? []
  const GENRE_DATA = data?.genreDistribution ?? []
  const MOST_READ_BOOKS = data?.mostReadBooks ?? []
  const TOP_READERS = data?.topReaders ?? []
  const totals = data?.totals

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
    <div className="admin-page">
      {isLoading ? (
        <p style={{ fontSize: 13, color: adminTheme.textSoft }}>Loading dashboard…</p>
      ) : isError ? (
        <p style={{ fontSize: 13, color: "#B91C1C" }}>Could not load dashboard data.</p>
      ) : (
      <>
      <div className="admin-stat-grid">
        <StatCard icon={<BookOpen size={20} />}    label="Total Books"     value={String(totals?.books ?? 0)}     sub="In catalog"    color={adminTheme.primary} />
        <StatCard icon={<Users size={20} />}        label="Registered readers" value={(totals?.users ?? 0).toLocaleString()} sub="Reader accounts"  color="#059669" />
        <StatCard icon={<TrendingUp size={20} />}  label="Total Reads"     value={(totals?.totalReads ?? 0).toLocaleString()} sub="Start events" color={adminTheme.accent} />
        <StatCard icon={<Eye size={20} />}         label="Active Today"    value={String(totals?.activeToday ?? 0)}    sub="Readers today"  color="#C4776A" />
      </div>

      <div className="admin-chart-grid mb-3.5">
        <SectionCard title="Reading Activity — Last 14 Days">
          <div style={{ padding: "16px 4px 8px" }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={DAILY_READS} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="readGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={adminTheme.primary} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={adminTheme.primary} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="reads" stroke={adminTheme.primary} strokeWidth={2} fill="url(#readGrad)" dot={false} activeDot={{ r: 4, fill: adminTheme.primary }} />
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

      <div className="admin-dashboard-bottom">
        <SectionCard title="Most Read Books">
          <div style={{ padding: "16px 4px 8px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MOST_READ_BOOKS} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
                <YAxis type="category" dataKey="title" tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} width={100} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="reads" fill={adminTheme.primary} radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <TopReadersPanel readers={TOP_READERS} />
      </div>
      </>
      )}
    </div>
  );
}

// ─── Books View ────────────────────────────────────────────────────────────────

function BooksView({ onAdd, onEdit }: { onAdd: () => void; onEdit: (book: AdminBook) => void }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: books = [], isLoading, isError } = useAdminBooks();
  const { toggleStatus, remove } = useAdminBookMutations();

  const filtered = books.filter((b) => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id: string) => {
    remove.mutate(id, {
      onSuccess: () => {
        setDeleteConfirm(null);
        setMenuOpen(null);
      },
    });
  };

  const handleToggleStatus = (id: string, currentStatus: BookStatus) => {
    toggleStatus.mutate(
      { bookId: id, currentStatus },
      { onSuccess: () => setMenuOpen(null) },
    );
  };

  if (isLoading) {
    return (
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        <p style={{ fontSize: 13, color: "#6B7280" }}>Loading books…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        <p style={{ fontSize: 13, color: "#B91C1C" }}>Could not load books.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#E8C98A] bg-[#FEF8EE] px-3 sm:max-w-xs" style={{ height: 36 }}>
          <Search size={13} color="#9CA3AF" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or author..." className="min-w-0 flex-1 border-none bg-transparent text-sm outline-none" style={{ color: adminTheme.text, fontFamily: ADMIN_FONT }} />
        </div>
        <div className="relative w-full sm:w-auto">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-[#E8C98A] bg-[#FEF8EE] pl-3 pr-8 text-sm outline-none sm:w-auto" style={{ color: adminTheme.textMuted, fontFamily: ADMIN_FONT }}>
            <option value="all">All Status</option>
            {Object.keys(STATUS_CONFIG).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={13} color="#6B7280" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>
        <div className="hidden flex-1 sm:block" />
        <div className="text-xs sm:text-sm" style={{ color: adminTheme.textSoft }}>{filtered.length} books</div>
        <div className="w-full sm:w-auto">
          <AdminButton variant="primary" icon={Plus} onClick={onAdd} style={{ height: 36, padding: '0 16px', width: '100%' }}>
            Add new book
          </AdminButton>
        </div>
      </div>

      <SectionCard>
        <div className="admin-table-wrap">
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
                    <div style={{ width: 36, height: 50, borderRadius: 4, background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                      {book.coverImageUrl ? (
                        <img src={book.coverImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <BookOpen size={14} color="#9CA3AF" />
                      )}
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
                          <button onClick={() => { handleToggleStatus(book.id, book.status); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", border: "none", background: "transparent", cursor: "pointer", fontSize: 12, color: "#374151", fontFamily: ADMIN_FONT, textAlign: "left", transition: "background 0.1s" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#F9FAFB"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                            <EyeOff size={12} /> {book.status === "Published" ? "Hide Book" : "Publish"}
                          </button>
                          <div style={{ height: 1, background: "#F3F4F6" }} />
                          <button onClick={() => { setDeleteConfirm(book.id); setMenuOpen(null); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", border: "none", background: "transparent", cursor: "pointer", fontSize: 12, color: "#EF4444", fontFamily: ADMIN_FONT, textAlign: "left", transition: "background 0.1s" }}
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
        </div>
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
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#FFFFFF", borderRadius: 12, padding: 24, zIndex: 60, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: ADMIN_FONT }}>
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

// BookFormView lives in ./views/BookFormView.tsx

// ─── Users View ────────────────────────────────────────────────────────────────

const USER_FILTER_TABS: { id: AccountTypeFilter; label: string }[] = [
  { id: 'all', label: 'All accounts' },
  { id: 'readers', label: 'Readers' },
  { id: 'admins', label: 'Admins' },
]

function UsersView({ canManageAdmins }: { canManageAdmins: boolean }) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [accountFilter, setAccountFilter] = useState<AccountTypeFilter>('all')
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

  const showAdminToggle = canManageAdmins && (accountFilter === 'all' || accountFilter === 'readers')

  const columns = showAdminToggle
    ? ['User', 'Email', 'Joined', 'Status', 'Admin access']
    : ['User', 'Email', 'Joined', 'Status']

  const statusColors: Record<string, { bg: string; text: string }> = {
    Active: { bg: '#DCFCE7', text: '#15803D' },
    Inactive: { bg: '#F3F4F6', text: '#6B7280' },
  }

  const filterHint =
    accountFilter === 'all'
      ? 'Every account in the database — readers and staff.'
      : accountFilter === 'readers'
        ? 'Reader accounts only. Super admins can grant admin portal access below.'
        : 'Users with admin portal access (not super admins).'

  const countLabel =
    accountFilter === 'admins'
      ? totalCount === 1
        ? 'admin'
        : 'admins'
      : accountFilter === 'readers'
        ? totalCount === 1
          ? 'reader'
          : 'readers'
        : totalCount === 1
          ? 'account'
          : 'accounts'

  return (
    <div className="admin-page">
      <p className="mb-4 text-sm leading-relaxed" style={{ color: adminTheme.textMuted }}>
        Manage accounts, roles, and admin access. Use filters to switch between reader and staff lists.
      </p>

      <div
        className="mb-4 flex flex-wrap gap-1 rounded-lg border p-1"
        style={{ borderColor: adminTheme.border, background: '#FDF0D5' }}
        role="tablist"
        aria-label="User account filters"
      >
        {USER_FILTER_TABS.map((tab) => {
          const active = accountFilter === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setAccountFilter(tab.id)}
              className="rounded-md px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm"
              style={{
                fontFamily: ADMIN_FONT,
                background: active ? adminTheme.primary : 'transparent',
                color: active ? '#FEF8EE' : adminTheme.textMuted,
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        className="mb-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs leading-relaxed sm:text-sm"
        style={{
          borderColor: adminTheme.border,
          background: '#FEF8EE',
          color: adminTheme.textMuted,
        }}
      >
        <ShieldCheck size={16} className="mt-0.5 shrink-0" style={{ color: adminTheme.primary }} />
        <span>{filterHint}</span>
      </div>

      <div className="admin-toolbar">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#E8C98A] bg-[#FEF8EE] px-3 sm:max-w-sm" style={{ height: 36 }}>
          <Search size={13} color="#9CA3AF" aria-hidden />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="min-w-0 flex-1 border-none bg-transparent text-sm outline-none"
            style={{ color: adminTheme.text, fontFamily: ADMIN_FONT }}
          />
        </div>
        {usersQuery.isFetching ? (
          <Loader2 size={14} color={adminTheme.textSoft} className="animate-spin" aria-hidden />
        ) : null}
        <div className="text-xs sm:text-sm" style={{ color: adminTheme.textSoft }}>
          {totalCount} {countLabel}
        </div>
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
        <div className="admin-table-wrap">
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
                {showAdminToggle ? (
                  <td style={{ padding: "12px 14px" }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: toggleDisabled ? "not-allowed" : "pointer", opacity: toggleDisabled ? 0.55 : 1 }}>
                      <input
                        type="checkbox"
                        checked={user.is_admin}
                        disabled={toggleDisabled}
                        onChange={(e) => adminToggleMutation.mutate({ userId: user._id, isAdmin: e.target.checked })}
                        style={{ width: 16, height: 16, accentColor: adminTheme.primary }}
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
        </div>
      </SectionCard>
      )}
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { id: "books",     label: "Books",      icon: BookOpen },
  { id: "users",     label: "Users",      icon: Users },
  { id: "genresTags", label: "Genres & tags", icon: Tags },
] as const;

type NavId = typeof NAV_ITEMS[number]["id"];

function Sidebar({
  active,
  onNav,
  userName,
  userRole,
  bookCount,
  mobileOpen,
  onClose,
}: {
  active: NavId
  onNav: (id: NavId) => void
  userName: string
  userRole: string
  bookCount: number
  mobileOpen: boolean
  onClose: () => void
}) {
  const initial = userName.charAt(0).toUpperCase()
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-[#3D2314]/55 lg:hidden"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100%,260px)] flex-col border-r border-[#E8C98A]/20 bg-[#3D2314] transition-transform duration-200 lg:static lg:z-auto lg:w-56 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ fontFamily: ADMIN_FONT }}
      >
        <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-4">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: adminTheme.primary }}
          >
            <BookOpen size={16} color="#fff" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="font-pictoria truncate text-base font-semibold text-[#F5D9A0]">Pictoria</div>
            <div className="text-[10px] text-[#9B6B4A]">Admin</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#9B6B4A]">Menu</div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNav(item.id)}
                className={`mb-1 flex w-full items-center gap-2.5 rounded-lg border-none px-3 py-2.5 text-left text-[13px] transition ${
                  isActive
                    ? 'bg-[#8B2635] font-semibold text-[#FEF8EE]'
                    : 'bg-transparent font-medium text-[#C4A875] hover:bg-white/5 hover:text-[#F5D9A0]'
                }`}
              >
                <Icon size={15} aria-hidden />
                {item.label}
                {item.id === 'books' && bookCount > 0 ? (
                  <span
                    className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#8B2635]/30 text-[#F5D9A0]'
                    }`}
                  >
                    {bookCount}
                  </span>
                ) : null}
              </button>
            )
          })}
          <div className="mt-4 px-1">
            <PublicSiteButton variant="sidebar" fullWidth />
          </div>
        </nav>

        <div className="flex items-center gap-2.5 border-t border-white/10 p-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${adminTheme.primary}, ${adminTheme.accent})` }}
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-[#F5D9A0]">{userName}</div>
            <div className="truncate text-[10px] text-[#9B6B4A]">{userRole}</div>
          </div>
        </div>
      </aside>
    </>
  )
}

// ─── Page Header ───────────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  books:     "Books",
  "book-form": "Book Editor",
  users:     "Users",
  genresTags: "Genres & tags",
};

function PageHeader({
  view,
  userName,
  userRole,
  onOpenMenu,
}: {
  view: AdminView
  userName: string
  userRole: string
  onOpenMenu: () => void
}) {
  return (
    <header
      className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#E8C98A] bg-[#FEF8EE] px-4 py-3 sm:px-6"
      style={{ fontFamily: ADMIN_FONT }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E8C98A] bg-[#FDF0D5] text-[#6B4226] lg:hidden"
          onClick={onOpenMenu}
          aria-label="Open menu"
        >
          <Menu size={18} aria-hidden />
        </button>
        <div className="min-w-0">
        <h1 className="font-pictoria m-0 truncate text-base font-semibold text-[#3D2314] sm:text-lg">
          {PAGE_TITLES[view] ?? "Admin"}
        </h1>
        <div className="mt-0.5 truncate text-[11px] text-[#9B6B4A] sm:text-xs">
          {view === "dashboard" && "Overview & analytics"}
          {view === "books" && "Manage your library"}
          {view === "book-form" && "Create or edit a book"}
          {view === "users" && "Browse and manage all accounts"}
          {view === "genresTags" && "Genres for shelves, tags for flexible labels"}
        </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bookCount = useAdminBookCount();

  const handleNav = (id: NavId) => {
    setActiveNav(id);
    setView(id as AdminView);
    setEditingBook(null);
    setSidebarOpen(false);
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
    <div
      className="flex h-[100dvh] overflow-hidden bg-[#FDF0D5] font-sans text-[#3D2314]"
    >
      <Sidebar
        active={activeNav}
        onNav={handleNav}
        userName={displayName}
        userRole={roleLabel}
        bookCount={bookCount}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {view !== "book-form" && (
          <PageHeader
            view={view}
            userName={displayName}
            userRole={roleLabel}
            onOpenMenu={() => setSidebarOpen(true)}
          />
        )}

        {view === "dashboard"  && <DashboardView />}
        {view === "books"      && <BooksView onAdd={handleAddBook} onEdit={handleEditBook} />}
        {view === "book-form"  && <BookFormView editingBook={editingBook} onBack={handleBackFromForm} />}
        {view === "users"      && <UsersView canManageAdmins={canManageAdmins} />}
        {view === "genresTags" && <GenresAndTagsView />}
      </div>
    </div>
  );
}
