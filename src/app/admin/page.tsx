'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/FormComponents';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/TabsComponents';

// Admin Panel Events Tab
const PendingEventsTab = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const fetchPendingEvents = async () => {
      try {
        const response = await axios.get(`/api/admin/pending-events?page=${pagination.page}&limit=${pagination.limit}`);
        setPendingEvents(response.data.events);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error('Error fetching pending events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEvents();
  }, [pagination.page, pagination.limit]);

  const handleApproveReject = async (eventId, action, reason = '') => {
    try {
      await axios.post(`/api/admin/events/${eventId}/review`, {
        action,
        reason,
      });

      // Remove the event from the list
      setPendingEvents((prev) => prev.filter((event) => event.id !== eventId));
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
    } catch (error) {
      console.error(`Error ${action}ing event:`, error);
      alert(`Failed to ${action} event. Please try again.`);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return <div className="text-center py-8">Loading pending events...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pending Events</h2>
      {pendingEvents.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p>No pending events found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingEvents.map((event) => (
            <div key={event.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                  <p className="text-gray-500">
                    by {event.user.name} • {new Date(event.startDate).toLocaleString()}
                  </p>
                  <p className="mt-2">{event.description.substring(0, 100)}...</p>
                </div>
                <div className="flex gap-2 self-end md:self-center">
                  <Button
                    onClick={() => handleApproveReject(event.id, 'approve')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => {
                      const reason = prompt('Reason for rejection (optional):');
                      handleApproveReject(event.id, 'reject', reason);
                    }}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span className="py-2 px-4">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Admin Panel Users Tab
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/users?page=${pagination.page}&limit=${pagination.limit}&search=${search}`);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit]);

  const handleUserAction = async (userId, action) => {
    try {
      await axios.patch(`/api/admin/users/${userId}`, { action });
      // Update user in the list without fetching all users again
      setUsers((prev) =>
        prev.map((user) => {
          if (user.id === userId) {
            return {
              ...user,
              isVerifiedOrganizer: action === 'verify_organizer' ? true :
                                   action === 'unverify_organizer' ? false :
                                   user.isVerifiedOrganizer,
              isBanned: action === 'ban' ? true :
                        action === 'unban' ? false :
                        user.isBanned,
            };
          }
          return user;
        })
      );
    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
      alert(`Failed to perform action. Please try again.`);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
    fetchUsers();
  };

  if (loading && users.length === 0) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="flex-grow px-4 py-2 border rounded-md"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>

      {users.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p>No users found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white divide-y divide-gray-200 rounded-lg shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user._count.events}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isBanned && <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs mr-1">Banned</span>}
                    {user.isVerifiedOrganizer && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs mr-1">Verified Organizer</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      {user.isVerifiedOrganizer ? (
                        <Button
                          onClick={() => handleUserAction(user.id, 'unverify_organizer')}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          Remove Verification
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleUserAction(user.id, 'verify_organizer')}
                          size="sm"
                          className="text-xs bg-green-600 hover:bg-green-700"
                        >
                          Verify Organizer
                        </Button>
                      )}
                      {user.isBanned ? (
                        <Button
                          onClick={() => handleUserAction(user.id, 'unban')}
                          size="sm"
                          className="text-xs bg-blue-600 hover:bg-blue-700"
                        >
                          Unban
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleUserAction(user.id, 'ban')}
                          size="sm"
                          variant="outline"
                          className="text-xs border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          Ban
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span className="py-2 px-4">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && !session.user.isAdmin) {
      router.push('/');
    }
  }, [session, status, router]);

  if (status === 'loading' || status === 'unauthenticated' || !session?.user?.isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Pending Events</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="events">
            <PendingEventsTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
