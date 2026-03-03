import { useState, useEffect } from "react";
import { MdEdit, MdDelete, MdAdd, MdClose, MdCheck } from "react-icons/md";
import { BlockTableWrap, BlockTitle } from "../../../../styles/global/default";
import { RoomTableWrap } from "./RoomManagementTable.styles";

const RoomManagementTable = () => {
  const [rooms, setRooms] = useState([]); // Start empty, fetch from real DB
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", capacity: "", availability: "Available" });
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token");

  // 1. FETCH ROOMS ON LOAD
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/rooms", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      } else {
        console.error("Failed to fetch rooms");
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  // Handle Form Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddClick = () => {
    setFormData({ id: null, name: "", capacity: "", availability: "Available" });
    setShowForm(true);
    setError("");
  };

  const handleEditClick = (room) => {
    setFormData(room);
    setShowForm(true);
    setError("");
  };

  // 2. DELETE ROOM
  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        const response = await fetch(`http://localhost:3000/api/rooms/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        if (response.ok) {
          setRooms(rooms.filter((room) => room.id !== id));
        } else {
          alert("Failed to delete room");
        }
      } catch (error) {
        console.error("Error deleting room:", error);
      }
    }
  };

  // 3. SAVE (ADD OR UPDATE) ROOM
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const isUpdate = formData.id !== null;
    const url = isUpdate 
        ? `http://localhost:3000/api/rooms/${formData.id}` 
        : "http://localhost:3000/api/rooms";
    const method = isUpdate ? "PUT" : "POST";

    const payload = {
        ...formData,
        capacity: parseInt(formData.capacity, 10)
    };
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}` 
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            fetchRooms(); // Refresh the list from the database
            setShowForm(false);
        } else {
            const data = await response.json();
            setError(data.error || "Failed to save room");
        }
    } catch (err) {
        setError("Network error. Is the backend running?");
    }
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
          {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
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
                    No rooms available in Database. Add one above.
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