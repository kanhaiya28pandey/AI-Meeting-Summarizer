import React from "react";
import { Search, Calendar, Filter, X } from "lucide-react";

export type DateFilterPreset = "all" | "today" | "week" | "month" | "this_month";

export interface MeetingFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateFilter: DateFilterPreset;
  onDateFilterChange: (preset: DateFilterPreset) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onClearFilters: () => void;
  totalMeetingsCount: number;
  filteredMeetingsCount: number;
}

export const MeetingFilters: React.FC<MeetingFiltersProps> = ({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
  totalMeetingsCount,
  filteredMeetingsCount,
}) => {
  const hasActiveFilters = searchQuery.trim() !== "" || dateFilter !== "all" || statusFilter !== "all";

  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", alignItems: "center" }}>
        {/* Search input */}
        <div style={{ flex: "1 1 240px", position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by title, summary, or transcript..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: "100%",
              padding: "0.55rem 0.75rem 0.55rem 2.25rem",
              fontSize: "0.875rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-canvas)",
              color: "var(--text-primary)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              style={{
                position: "absolute",
                right: "0.6rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "0.2rem",
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Date preset dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Calendar size={15} style={{ color: "var(--text-muted)" }} />
          <select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value as DateFilterPreset)}
            style={{
              padding: "0.55rem 0.75rem",
              fontSize: "0.85rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-canvas)",
              color: "var(--text-primary)",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
            <option value="this_month">This Month</option>
          </select>
        </div>

        {/* Status filter dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Filter size={15} style={{ color: "var(--text-muted)" }} />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            style={{
              padding: "0.55rem 0.75rem",
              fontSize: "0.85rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-canvas)",
              color: "var(--text-primary)",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.45rem 0.75rem",
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "var(--primary)",
              backgroundColor: "var(--primary-light)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
            }}
          >
            <X size={14} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter result summary badge */}
      {hasActiveFilters && (
        <div
          style={{
            marginTop: "0.75rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--border)",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            Showing <strong>{filteredMeetingsCount}</strong> of <strong>{totalMeetingsCount}</strong> meetings
          </span>
          {filteredMeetingsCount === 0 && (
            <span style={{ color: "var(--status-error)", fontSize: "0.8rem" }}>
              No meetings match the selected criteria.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
