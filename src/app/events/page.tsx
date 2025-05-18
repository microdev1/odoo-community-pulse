'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { FormField, Input, Select, Button } from '@/components/ui/FormComponents';
import EventCard from '@/components/EventCard';
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { categoryLabels } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl: string | null;
  user: {
    name: string;
    isVerifiedOrganizer: boolean;
  };
  _count: {
    attendances: number;
  };
}

interface EventsResponse {
  events: Event[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function EventsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  // Form filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [upcoming, setUpcoming] = useState(searchParams.get('upcoming') !== 'false');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      if (search) {
        params.append('search', search);
      }

      if (category) {
        params.append('category', category);
      }

      params.append('upcoming', upcoming.toString());

      const response = await axios.get<EventsResponse>(`/api/events?${params.toString()}`);
      setEvents(response.data.events);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // On mount or when URL params change, update filters and fetch
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setUpcoming(searchParams.get('upcoming') !== 'false');
    setPagination(prev => ({ ...prev, page: parseInt(searchParams.get('page') || '1') }));

    fetchEvents();
  }, [searchParams]);

  // Handle filter submission
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (search) {
      params.append('search', search);
    }

    if (category) {
      params.append('category', category);
    }

    params.append('upcoming', upcoming.toString());
    params.append('page', '1'); // Reset to first page on new search

    router.push(`/events?${params.toString()}`);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/events?${params.toString()}`);
  };

  // Prepare category options for select
  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...Object.entries(categoryLabels).map(([value, label]) => ({
      label,
      value,
    })),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
          Community Events
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-8">
        <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <FormField id="search" label="Search Events" className="m-0">
              <div className="relative">
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by title, description or location"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </FormField>
          </div>

          <div className="w-full md:w-64">
            <FormField id="category" label="Category" className="m-0">
              <Select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={categoryOptions}
              />
            </FormField>
          </div>

          <div className="w-full md:w-auto flex items-end">
            <label className="flex items-center cursor-pointer mt-6">
              <input
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                checked={upcoming}
                onChange={() => setUpcoming(!upcoming)}
              />
              <span className="ml-2 text-sm text-gray-700">Upcoming events only</span>
            </label>
          </div>

          <div className="w-full md:w-auto flex items-end">
            <Button type="submit" className="w-full md:w-auto mt-6">
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No events found</h3>
          <p className="mt-2 text-sm text-gray-600">
            Try adjusting your filters or check back later for new events.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="h-full">
              <EventCard
                id={event.id}
                title={event.title}
                description={event.description}
                category={event.category}
                location={event.location}
                startDate={new Date(event.startDate)}
                endDate={new Date(event.endDate)}
                imageUrl={event.imageUrl || undefined}
                organizerName={event.user.name}
                isVerifiedOrganizer={event.user.isVerifiedOrganizer}
                attendeesCount={event._count.attendances}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="mr-2"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>

            <div className="flex items-center">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current
                  return (
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - pagination.page) <= 1
                  );
                })
                .reduce((items, page) => {
                  // Add ellipsis between non-adjacent pages
                  if (items.length > 0) {
                    const lastPage = items[items.length - 1];
                    if (typeof lastPage === 'number' && page - lastPage > 1) {
                      items.push('...');
                    }
                  }

                  items.push(page);
                  return items;
                }, [] as (number | string)[])
                .map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-3 py-1">
                        ...
                      </span>
                    );
                  }

                  const isCurrentPage = page === pagination.page;
                  return (
                    <button
                      key={`page-${page}`}
                      className={`px-3 py-1 mx-1 rounded ${
                        isCurrentPage
                          ? 'bg-green-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handlePageChange(page as number)}
                      disabled={isCurrentPage}
                    >
                      {page}
                    </button>
                  );
                })}
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="ml-2"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}
