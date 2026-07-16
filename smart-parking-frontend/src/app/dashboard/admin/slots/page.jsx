'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Trash2, Plus, Edit } from 'lucide-react';

export default function ManageSlots() {
  const [slots, setSlots] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Create Form State
  const [newSlotNumber, setNewSlotNumber] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');

  // NEW: Edit Modal State
  const [editingSlot, setEditingSlot] = useState(null);
  const [editSlotNumber, setEditSlotNumber] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [filterLocationId, setFilterLocationId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slotsRes, locationsRes] = await Promise.all([
        api.get('/slots'),
        api.get('/parking') // Note: using your updated /parking endpoint
      ]);
      setSlots(slotsRes.data.sort((a, b) => a.id - b.id)); 
      setLocations(locationsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSlotNumber.trim() || !selectedLocationId) return;
    
    try {
      await api.post('/slots', { 
        slotNumber: newSlotNumber, 
        parkingAreaId: parseInt(selectedLocationId) 
      });
      setNewSlotNumber('');
      fetchData();
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

  // NEW: Handle the Update submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editSlotNumber.trim()) return;
    
    try {
      await api.patch(`/slots/${editingSlot.id}`, { 
        slotNumber: editSlotNumber,
        status: editStatus 
      });
      setEditingSlot(null); // Close modal
      fetchData(); // Refresh table
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update slot');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Manage Parking Slots</h1>

      {/* Add New Slot Form */}
      <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex-grow min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Assign to Location</label>
          <select 
            value={selectedLocationId}
            onChange={(e) => {
              setSelectedLocationId(e.target.value);
              setFilterLocationId(e.target.value); // Also use Assign dropdown as the filter
            }}
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
            placeholder="e.g., A-01"
            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-800 focus:outline-none"
            required
          />
        </div>

        <button type="submit" className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-700 transition flex items-center font-medium h-[42px]">
          <Plus size={20} className="mr-2" /> Create Slot
        </button>
      </form>
      {/* Note: Removed separate "Filter by Location" control. The "Assign to Location" select above now also filters the list. */}

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
            {filterLocationId && slots.map ? (
              filterLocationId 
                ? slots.filter(slot => slot.parkingArea?.id === parseInt(filterLocationId))
                : slots
            ).map((slot) => (
              <tr key={slot.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{slot.slotNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{slot.parkingArea?.name || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase ${
                    slot.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {slot.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  
                  {/* NEW: Edit Button */}
                  <button 
                    onClick={() => {
                      setEditingSlot(slot);
                      setEditSlotNumber(slot.slotNumber);
                      setEditStatus(slot.status);
                    }} 
                    className="text-blue-600 hover:text-blue-900 transition mr-4"
                    title="Edit Slot"
                  >
                    <Edit size={18} />
                  </button>

                  <button 
                    onClick={() => handleDelete(slot.id)} 
                    className="text-red-600 hover:text-red-900 transition"
                    title="Delete Slot"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            )) : ((slots || []).map((slot) => (
              <tr key={slot.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{slot.slotNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{slot.parkingArea?.name || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase ${
                    slot.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {slot.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  
                  {/* NEW: Edit Button */}
                  <button 
                    onClick={() => {
                      setEditingSlot(slot);
                      setEditSlotNumber(slot.slotNumber);
                      setEditStatus(slot.status);
                    }} 
                    className="text-blue-600 hover:text-blue-900 transition mr-4"
                    title="Edit Slot"
                  >
                    <Edit size={18} />
                  </button>

                  <button 
                    onClick={() => handleDelete(slot.id)} 
                    className="text-red-600 hover:text-red-900 transition"
                    title="Delete Slot"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))) }
            {((filterLocationId 
              ? slots.filter(slot => slot.parkingArea?.id === parseInt(filterLocationId))
              : slots
            ).length === 0) && (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-slate-500">No slots found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* NEW: The Edit Modal (with background blur fix!) */}
      {editingSlot && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Edit Slot</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Slot Number</label>
                <input 
                  type="text" 
                  value={editSlotNumber}
                  onChange={(e) => setEditSlotNumber(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-800 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Manual Status Override</label>
                <select 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-800 bg-white"
                >
                  <option value="available">AVAILABLE</option>
                  <option value="occupied">OCCUPIED</option>
                </select>
                <p className="text-xs text-amber-600 mt-1">⚠️ Setting to AVAILABLE will cancel any active reservation on this slot.</p>
              </div>
              <div className="flex space-x-4">
                <button 
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="flex-1 bg-slate-200 text-slate-800 py-2 rounded hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}