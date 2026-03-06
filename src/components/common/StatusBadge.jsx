import React from 'react';

export function StatusBadge({ status }) {
  const statusConfig = {
    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
    draft: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Draft' },
    published: { bg: 'bg-green-100', text: 'text-green-800', label: 'Published' },
    ongoing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Ongoing' },
    completed: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Completed' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
