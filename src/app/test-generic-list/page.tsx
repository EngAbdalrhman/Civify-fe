'use client';

import { GenericList } from '@/components/generic-list/GenericList';
import { ColumnDef, ActionDef, FilterOperation } from '@/components/generic-list/types';
import { useState } from 'react';
import { Eye, Edit, Trash } from 'lucide-react';

interface User {
  id: number;
  name: string;
  nameAr?: string; // For localization test
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  age: number;
}

const MOCK_DATA: User[] = [
  {
    id: 1,
    name: 'John Doe',
    nameAr: 'جون دو',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2023-10-01',
    age: 30,
  },
  {
    id: 2,
    name: 'Jane Smith',
    nameAr: 'جين سميث',
    email: 'jane@example.com',
    role: 'User',
    status: 'Inactive',
    lastLogin: '2023-09-25',
    age: 25,
  },
  {
    id: 3,
    name: 'Bob Johnson',
    nameAr: 'بوب جونسون',
    email: 'bob@example.com',
    role: 'User',
    status: 'Active',
    lastLogin: '2023-10-05',
    age: 35,
  },
  {
    id: 4,
    name: 'Alice Brown',
    nameAr: 'أليس براون',
    email: 'alice@example.com',
    role: 'Editor',
    status: 'Pending',
    lastLogin: '2023-10-02',
    age: 28,
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    nameAr: 'تشارلي ويلسون',
    email: 'charlie@example.com',
    role: 'User',
    status: 'Banned',
    lastLogin: '2023-08-15',
    age: 40,
  },
];

export default function TestGenericListPage() {
  const [data, setData] = useState<User[]>(MOCK_DATA);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [locale, setLocale] = useState('en');

  const columns: ColumnDef<User>[] = [
    { 
      key: 'id', 
      label: 'ID', 
      type: 'number', 
      sortable: true,
      filterType: 'number',
      filterOperation: FilterOperation.EQUAL 
    },
    { 
      key: 'name', 
      label: 'Name', 
      type: 'text', 
      sortable: true, 
      filterable: true,
      filterType: 'text',
      filterOperation: FilterOperation.MATCH
    },
    { 
      key: 'email', 
      label: 'Email', 
      type: 'text', 
      sortable: true, 
      filterable: true,
      filterType: 'text',
      filterOperation: FilterOperation.MATCH
    },
    { 
      key: 'role', 
      label: 'Role', 
      type: 'text', 
      filterable: true,
      filterType: 'dropdown',
      filterOperation: FilterOperation.EQUAL,
      filterOptions: [
        { label: 'Admin', value: 'Admin' },
        { label: 'User', value: 'User' },
        { label: 'Editor', value: 'Editor' },
      ]
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'status',
      filterable: true,
      filterType: 'dropdown',
      filterOperation: FilterOperation.EQUAL,
      filterOptions: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Banned', value: 'Banned' },
      ]
    },
    { 
      key: 'lastLogin', 
      label: 'Last Login', 
      type: 'date', 
      sortable: true,
      filterable: true,
      filterType: 'date',
      filterOperation: FilterOperation.DAY_EQUAL
    },
  ];

  const actions: ActionDef<User>[] = [
    {
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: (item) => alert(`View details for ${item.name}`),
    },
    {
      label: 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: (item) => alert(`Edit ${item.name}`),
      showInMenu: true,
      condition: (item) => item.status === 'Active',
    },
    {
      label: 'Delete',
      icon: <Trash className="w-4 h-4 text-red-500" />,
      onClick: (item) => alert(`Delete ${item.name}`),
      showInMenu: true,
      variant: 'destructive',
      condition: (item) => item.status === 'Banned',
    },
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setData([...MOCK_DATA].sort(() => Math.random() - 0.5));
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Generic List Component Test</h1>
          <button 
            onClick={() => setLocale(l => l === 'en' ? 'ar' : 'en')}
            className="px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-50"
          >
            Switch Locale ({locale.toUpperCase()})
          </button>
        </div>
        
        <GenericList
          data={data}
          columns={columns}
          actions={actions}
          isLoading={loading}
          locale={locale}
          meta={{
            page: page,
            size: 5,
            totalElements: 25,
            totalPages: 5,
          }}
          onPageChange={(newPage) => setPage(newPage)}
          onFilterChange={(filters) => console.log('Filters:', filters)}
          onSortChange={(sort) => console.log('Sort:', sort)}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}
