"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type UserRow = {
  id: string;
  username: string;
  name?: string;
  role: string;
  createdAt?: string;
};

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", name: "", role: "CASHIER" });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', { cache: 'no-store', next: { revalidate: 0 } });
      if (!res.ok) throw new Error('Unauthorized');
      const json = await res.json();
      setUsers(json);
    } catch (error) {
      console.error(error);
      setMessage('Failed to load users or unauthorized.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Create failed');
      const created = await res.json();
      setUsers((prev) => [created, ...prev]);
      setForm({ username: '', password: '', name: '', role: 'CASHIER' });
      setMessage('User created');
    } catch (error) {
      console.error(error);
      setMessage('Failed to create user');
    }
  };

  if (status === 'loading') return <p>Loading...</p>;

  if (!session || (session as any).user?.role !== 'ADMIN') {
    return <p className="text-rose-600">Unauthorized — Admins only.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded bg-white p-6">
        <h2 className="text-lg font-semibold">Create User</h2>
        <form onSubmit={handleCreate} className="mt-4 grid gap-3 md:grid-cols-2">
          <input required placeholder="username" value={form.username} onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))} className="rounded border px-3 py-2" />
          <input required type="password" placeholder="password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} className="rounded border px-3 py-2" />
          <input placeholder="name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} className="rounded border px-3 py-2" />
          <select value={form.role} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))} className="rounded border px-3 py-2">
            <option value="CASHIER">CASHIER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <div className="md:col-span-2">
            <button className="rounded bg-indigo-600 px-4 py-2 text-white">Create</button>
            {message && <span className="ml-3 text-sm text-slate-600">{message}</span>}
          </div>
        </form>
      </div>

      <div className="rounded bg-white p-6">
        <h2 className="text-lg font-semibold">Existing Users</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="w-full mt-4 table-auto text-left text-sm">
            <thead>
              <tr className="text-slate-600">
                <th className="pb-2">Username</th>
                <th className="pb-2">Name</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="py-2">{u.username}</td>
                  <td className="py-2">{u.name}</td>
                  <td className="py-2">{u.role}</td>
                  <td className="py-2">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                  <td className="py-2">
                    <button
                      onClick={async () => {
                        const newPass = window.prompt('Enter new password for ' + u.username + ' (leave empty to cancel)');
                        if (!newPass) return;
                        try {
                          const res = await fetch('/api/users', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: u.id, newPassword: newPass }),
                            cache: 'no-store',
                          });
                          if (!res.ok) throw new Error('Reset failed');
                          setMessage('Password updated for ' + u.username + '.');
                        } catch (err) {
                          console.error(err);
                          setMessage('Failed to update password.');
                        }
                      }}
                      className="rounded bg-amber-500 px-3 py-1 text-white text-sm"
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
