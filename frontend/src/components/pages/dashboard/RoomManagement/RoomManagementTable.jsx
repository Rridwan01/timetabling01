import { useState } from "react";
import { MdEdit, MdDelete, MdAdd, MdClose, MdCheck } from "react-icons/md";
import { BlockTableWrap, BlockTitle } from "../../../../styles/global/default";
import { RoomTableWrap } from "./RoomManagementTable.styles";

// Initial mock data tailored for rooms/halls
const INITIAL_DATA = [
  { id: 1, name: "Hall A", capacity: 250, availability: "Available" },
  { id: 2, name: "Hall B", capacity: 150, availability: "Available" },
  { id: 3, name: "LT 1", capacity: 500, availability: "Maintenance" },
];

const RoomManagementTable = () => {
  const [rooms, setRooms] = useState(INITIAL_DATA);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", capacity: "", availability: "Available" });

  // Handle Form Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Open form for a NEW room
  const handleAddClick = () => {
    setFormData({ id: null, name: "", capacity: "", availability: "Available" });
    setShowForm(true);
  };

  // Open form to EDIT an existing room
  const handleEditClick = (room) => {
    setFormData(room);
    setShowForm(true);
  };

  // Delete a room
  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      setRooms(rooms.filter((room) => room.id !== id));
    }
  };

  // Save (Add or Update)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (formData.id) {
      // Update existing room
      setRooms(rooms.map((room) => (room.id === formData.id ? formData : room)));
    } else {
      // Add new room
      const newRoom = { ...formData, id: Date.now() };
      setRooms([...rooms, newRoom]);
    }
    
    setShowForm(false); // Close form after saving
  };

  return (
    <RoomTableWrap>
      <BlockTitle className="room-table-head">
        <h3 className="head-ttl">Room List</h3>
        <button className="add-btn" onClick={handleAddClick}>
          <MdAdd size={20} />
          <span>Add Room</span>
        </button>
      </BlockTitle>

      {/* --- ADD / EDIT FORM --- */}
      {showForm && (
        <form className="room-form" onSubmit={handleFormSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Room Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Hall A" required />
            </div>
            <div className="form-group">
              <label>Capacity</label>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} placeholder="e.g. 250" required />
            </div>
            <div className="form-group availability-group">
              <label>Availability</label>
              <select name="availability" value={formData.availability} onChange={handleInputChange} required>
                <option value="Available">Available</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">
              <MdCheck size={20} /> Save
            </button>
            <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
              <MdClose size={20} /> Cancel
            </button>
          </div>
        </form>
      )}

      {/* --- TABLE --- */}
      <div className="room-table-content">
        <div className="table-block scrollbar">
          <BlockTableWrap>
            <thead>
              <tr>
                <th>Room Name</th>
                <th>Capacity</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#A3AED0" }}>
                    No rooms available. Add one above.
                  </td>
                </tr>
              ) : (
                rooms.map((dataItem) => (
                  <tr key={dataItem.id}>
                    <td>{dataItem.name}</td>
                    <td>{dataItem.capacity}</td>
                    <td>
                      <span className={`status-badge ${dataItem.availability === 'Available' ? 'status-available' : 'status-maintenance'}`}>
                        {dataItem.availability}
                      </span>
                    </td>
                    <td>
                      <div className="data-cell-actions">
                        <button type="button" className="edit-btn" aria-label="Edit room" onClick={() => handleEditClick(dataItem)}>
                          <MdEdit size={22} />
                        </button>
                        <button type="button" className="delete-btn" aria-label="Delete room" onClick={() => handleDeleteClick(dataItem.id)}>
                          <MdDelete size={22} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </BlockTableWrap>
        </div>
      </div>
    </RoomTableWrap>
  );
};

export default RoomManagementTable;