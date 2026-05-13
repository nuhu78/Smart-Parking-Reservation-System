'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Trash2, Plus } from 'lucide-react';

export default function ManageSlots() {
  const [slots, setSlots] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Form State
  const [newSlotNumber, setNewSlotNumber] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slotsRes, locationsRes] = await Promise.all([
        api.get('/slots'),
        api.get('/parking')
      ]);
      setSlots(slotsRes.data.sort((a, b) => a.id - b.id)); // Sort by ID
      setLocations(locationsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSlotNumber.trim() || !selectedLocationId) return;
    
    try {
      // Send slot details and the parent location ID
      await api.post('/slots', { 
        slotNumber: newSlotNumber, 
        parkingAreaId: parseInt(selectedLocationId) 
      });
      setNewSlotNumber('');
      fetchData(); // Refresh the table
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create slot');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this slot? Any active reservation will also be cancelled.")) return;
    
    try {
      await api.delete(`/slots/${id}`);
      setSlots(slots.filter(slot => slot.id !== id));
    } catch (error) {
      alert('Failed to delete slot');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Manage Parking Slots</h1>

      {/* Add New Slot Form */}
      <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex-grow min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Assign to Location</label>
          <select 
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-800 bg-white"
            required
          >
            <option value="" disabled>Select a parking area...</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-grow min-w-[150px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Slot Identifier</label>
          <input 
            type="text" 
            value={newSlotNumber}
            onChange={(e) => setNewSlotNumber(e.target.value)}
            placeholder="e.g., A-01, B-22"
            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-800 focus:outline-none"
            required
          />
        </div>

        <button type="submit" className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-700 transition flex items-center font-medium h-[42px]">
          <Plus size={20} className="mr-2" /> Create Slot
        </button>
      </form>

      {/* Slots Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Slot Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {slots.map((slot) => (
              <tr key={slot.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{slot.slotNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{slot.parkingArea?.name || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    slot.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {slot.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(slot.id)} className="text-red-600 hover:text-red-900 ml-4">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {slots.length === 0 && (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-slate-500">No slots found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}