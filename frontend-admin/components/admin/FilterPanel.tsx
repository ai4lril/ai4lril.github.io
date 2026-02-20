'use client';

import { useState } from 'react';
import { LANGUAGES } from '@/lib/languages';

export interface AdminFilterOptions {
  languageCode: string;
  status: 'all' | 'pending' | 'approved' | 'rejected';
  dateFrom: string;
  dateTo: string;
}

const defaultFilters: AdminFilterOptions = {
  languageCode: '',
  status: 'pending',
  dateFrom: '',
  dateTo: '',
};

interface FilterPanelProps {
  onFilter: (filters: AdminFilterOptions) => void;
  showStatus?: boolean;
}

export function FilterPanel({ onFilter, showStatus = true }: FilterPanelProps) {
  const [filters, setFilters] = useState<AdminFilterOptions>(defaultFilters);

  const handleApply = () => {
    onFilter(filters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    onFilter(defaultFilters);
  };

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 neu-flat rounded-xl">
      <div className="min-w-[180px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Language
        </label>
        <select
          value={filters.languageCode}
          onChange={(e) =>
            setFilters({ ...filters, languageCode: e.target.value })
          }
          className="block w-full px-3 py-2 neu-pressed rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Languages</option>
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {showStatus && (
        <div className="min-w-[140px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value as AdminFilterOptions['status'],
              })
            }
            className="block w-full px-3 py-2 neu-pressed rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      )}

      <div className="min-w-[140px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          From Date
        </label>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) =>
            setFilters({ ...filters, dateFrom: e.target.value })
          }
          className="block w-full px-3 py-2 neu-pressed rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="min-w-[140px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          To Date
        </label>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) =>
            setFilters({ ...filters, dateTo: e.target.value })
          }
          className="block w-full px-3 py-2 neu-pressed rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-linear-to-r from-indigo-600 to-indigo-700 text-white text-sm font-medium rounded-xl hover:from-indigo-700 hover:to-indigo-800 shadow-md shadow-indigo-500/20"
        >
          Apply
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 neu-btn-secondary text-sm font-medium rounded-xl"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
