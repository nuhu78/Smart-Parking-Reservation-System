'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Trash2, Plus } from 'lucide-react';

export default function ManageLocations() {
  const [locations, setLocations] = useState([]);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationAddress, setNewLocationAddress] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await api.get('/parking');
      setLocations(response.data);
    } catch (error) {
      console.error('Failed to fetch locations', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newLocationName.trim() || !newLocationAddress.trim()) return;
    
    try {
      await api.post('/parking', {
        name: newLocationName,
        location: newLocationAddress,
      });
      setNewLocationName('');
      setNewLocationAddress('');
      fetchLocations(); // Refresh the table
    } catch (error) {
      const message = error?.response?.data?.message;
      alert(Array.isArray(message) ? message.join(', ') : message || 'Failed to create location');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Warning: Deleting this location will also delete ALL slots and reservations inside it. Continue?")) return;
    
    try {
      await api.delete(`/parking/${id}`);
      setLocations(locations.filter(loc => loc.id !== id));
    } catch (error) {
      alert('Failed to delete location');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Manage Parking Locations</h1>

      {/* Add New Location Form */}
      <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex-grow min-w-[220px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">New Location Name</label>
          <input 
            type="text" 
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
            placeholder="e.g., Faculty Garage"
            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-800 focus:outline-none"
            required
          />
        </div>
        <div className="flex-grow min-w-[220px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Address / Area</label>
          <input
            type="text"
            value={newLocationAddress}
            onChange={(e) => setNewLocationAddress(e.target.value)}
            placeholder="e.g., Suburban Campus"
            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-800 focus:outline-none"
            required
          />
        </div>
        <button type="submit" className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-700 transition flex items-center font-medium">
          <Plus size={20} className="mr-2" /> Add Location
        </button>
      </form>

      {/* Locations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Location Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Address / Area</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {locations.map((loc) => (
              <tr key={loc.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{loc.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{loc.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{loc.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(loc.id)} className="text-red-600 hover:text-red-900 ml-4">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {locations.length === 0 && (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-slate-500">No locations found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}