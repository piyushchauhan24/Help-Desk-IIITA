const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
import React, { useEffect, useState } from "react";
import {ExclamationMark, AddUser, Person, Document, Chat, Microphone, Group, Success} from "../../assets/Icons";
import useNotify from "../../hooks/useNotify";
// import { useChat } from "../../hooks/useChat";
import Button from "../ui/Button";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [assignedName, setAssignedName] = useState("");
  const [assignedContact, setAssignedContact] = useState("");
  const [availablePersonnel, setAvailablePersonnel] = useState([]);
  const [addPersonnelModal, setAddPersonnelModal] = useState(false);
  const [newPersonnel, setNewPersonnel] = useState({
    name: "", contact: "", role: "",
  });
  // const [selectedUser, setSelectedUser] = useState(null);
  // const [chatInput, setChatInput] = useState("");

  // // Use the chat hook for admin
  // const { messages, sendMessage, userList } = useChat({
  //   userId: selectedUser,
  //   isAdmin: true,
  // });
  const [filterStatus, setFilterStatus] = useState("Active");
  const { notify } = useNotify();

  const resolve = async (id) => {
    try {
      
      const res = await fetch(`${apiUrl}/api/complaints/${id}`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        notify(data.message || "Complaint resolved and email sent to user");
        setComplaints(prev => prev.filter(c => c.id !== id));
      } else {
        notify(data.message || "Failed to resolve", "error");
      }
    } catch (error) {
      console.error("Error resolving complaint:", error);
      notify("Error resolving complaint", "error");
    }
  };
  
  useEffect(() => {
    fetchComplaints();
  }, []);
  
  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/complaints`);
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data);
      } else {
        notify("Failed to fetch complaints", "error");
      }
    } catch (error) {
      console.error("Error fetching complaints", error);
      notify("Failed to fetch complaints", "error");
    }
  };

  const openAssignModal = async (id, complaintType) => {
    setSelectedComplaintId(id);
    setAssignedName("");
    setAssignedContact("");
    setModalOpen(true);

    try {
      const res = await fetch(`${apiUrl}/api/personnel`);
      const data = await res.json();
      if (data.success) {
        const filtered = data.data.filter(
          (p) => p.available && p.role.toLowerCase() === complaintType.toLowerCase()
        );
        setAvailablePersonnel(filtered);
      } else {
        notify("Failed to fetch personnel", "error");
      }
    } catch (error) {
      console.error("Error fetching personnel", error);
      notify("Error fetching personnel", "error");
    }
  };

  const handleAssign = async () => {
    if (!assignedName || !assignedContact) {
      notify("Please fill in all fields", "error");
      return;
    }
    try {
      const res = await fetch(
        `${apiUrl}/api/complaints/${selectedComplaintId}/assign`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignedName, assignedContact }),
        }
      );

      const data = await res.json();
      if (data.success) {
        notify("Personnel assigned!");
        fetchComplaints();
        setModalOpen(false);
      } else {
        notify("Failed to assign", "error");
      }
    } catch (error) {
      console.error("Error assigning personnel", error);
      notify("Error assigning personnel", "error");
    }
  };

  const handleAddPersonnel = async () => {
    const { name, contact, role } = newPersonnel;
    if (!name || !contact || !role) {
      notify("All fields are required", "error");
      return;
    }
  
    try {
      const res = await fetch(`${apiUrl}/api/personnel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, role }),
      });
  
      const data = await res.json();
      if (data.success) {
        notify("Personnel added successfully");
        setAddPersonnelModal(false);
        setNewPersonnel({ name: "", contact: "", role: "" });
      } else {
        notify(data.message || "Failed to add personnel", "error");
      }
    } catch (error) {
      console.error("Error adding personnel", error);
      notify("Something went wrong while adding personnel", "error");
    }
  };

  // Filter complaints based on status filter
  const filteredComplaints = complaints.filter(c => 
    filterStatus === "Active" ? c.status !== "Resolved" : c.status === "Resolved"
  );

  return (
    <main className="bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-indigo-800 to-purple-800 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
            <Button
              onClick={() => setAddPersonnelModal(true)}
            >
              <AddUser className="mr-2" />
              Add Personnel
            </Button>
            </div>
          </div>
          
          {/* Status filter tabs */}
          <div className="mt-6 border-b border-indigo-700">
            <div className="flex">
              <button
                onClick={() => setFilterStatus("Active")}
                className={`px-4 py-2 font-medium transition-colors ${
                  filterStatus === "Active" 
                    ? "border-b-2 border-white text-white" 
                    : "text-indigo-200 hover:text-white"
                }`}
              >
                Active Complaints
              </button>
              <button
                onClick={() => setFilterStatus("Resolved")}
                className={`px-4 py-2 font-medium transition-colors ${
                  filterStatus === "Resolved" 
                    ? "border-b-2 border-white text-white" 
                    : "text-indigo-200 hover:text-white"
                }`}
              >
                Resolved
              </button>
            </div>
          </div>
        </div>

        {/* Complaints list */}
        {filteredComplaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-800 rounded-xl">
            <Document />
            <p className="text-lg text-gray-400">No {filterStatus.toLowerCase()} complaints found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className={`bg-gray-800 rounded-xl overflow-hidden shadow-lg transition hover:shadow-indigo-500/10 hover:translate-y-[-2px] ${
                  complaint.assigned_personnel_id 
                    ? "border-l-4 border-green-500" 
                    : "border-l-4 border-yellow-500"
                }`}
              >
                {/* Card header */}
                <div className="bg-gray-750 px-4 py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="font-medium text-lg text-white">{complaint.complaint_type}</span>
                    <span
                      className={`ml-2 text-xs font-medium px-2 py-1 rounded-full ${
                        complaint.priority === "High"
                          ? "bg-red-500/20 text-red-400"
                          : complaint.priority === "Medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {complaint.priority}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      complaint.status === "Assigned"
                        ? "bg-green-600/20 text-green-400"
                        : filterStatus === "Resolved"
                        ? "bg-blue-600/20 text-blue-400"
                        : "bg-yellow-600/20 text-yellow-400"
                    }`}
                  >
                    {complaint.status}
                  </span>
                </div>
                
                {/* Card body */}
                <div className="p-4 space-y-3">
                  {/* User info section */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <Person />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-indigo-400">User Details</h3>
                      <p className="text-sm text-gray-300 mt-1">{complaint.name}</p>
                      <p className="text-sm text-gray-400">{complaint.email}</p>
                      <p className="text-sm text-gray-400">{complaint.location}</p>
                    </div>
                  </div>
                  
                  {/* Message section */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <Chat />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-indigo-400">Message</h3>
                      <p className="text-sm text-gray-300 mt-1">{complaint.message}</p>
                      {complaint.attachments && (
                        <a
                          href={`${apiUrl}/uploads/${complaint.attachments}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs flex items-center text-indigo-400 hover:text-indigo-300 mt-1"
                        >
                          <Microphone />
                          View Attachment
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Personnel section */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <Group />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-indigo-400">Assigned Personnel</h3>
                      {complaint.assigned_name ? (
                        <>
                          <p className="text-sm text-gray-300 mt-1">{complaint.assigned_name}</p>
                          <p className="text-sm text-gray-400">{complaint.assigned_contact}</p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 mt-1">Not assigned yet</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Date section condensed */}
                  <div className="text-xs text-gray-400 pt-2 border-t border-gray-700">
                    Created: {new Date(complaint.createdAt).toLocaleString()}
                  </div>
                </div>
                
                {/* Card footer */}
                <div className="px-4 py-3 bg-gray-750">
                  {filterStatus !== "Resolved" && (
                    complaint.assigned_personnel_id ? (
                      <button
                        onClick={() => resolve(complaint.id)}
                        className="w-full flex justify-center items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
                      >
                        <Success />
                        Mark as Resolved
                      </button>
                    ) : (
                      <button
                        onClick={() => openAssignModal(complaint.id, complaint.complaint_type)}
                        className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition"
                      >
                        <AddUser />
                        Assign Personnel
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Personnel Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all">
            <div className="px-6 py-4 bg-indigo-600">
              <h3 className="text-lg font-medium text-white">Assign Personnel</h3>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Personnel
              </label>
              <select
                value={assignedName ? availablePersonnel.find(p => p.name === assignedName)?.id || "" : ""}
                onChange={(e) => {
                  const selected = availablePersonnel.find(p => p.id === parseInt(e.target.value));
                  if (selected) {
                    setAssignedName(selected.name);
                    setAssignedContact(selected.contact);
                  }
                }}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">-- Select Personnel --</option>
                {availablePersonnel.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.contact}) - {p.role}
                  </option>
                ))}
              </select>
              
              {availablePersonnel.length === 0 && (
                <div className="mt-2 p-3 bg-red-900/20 text-red-400 text-sm rounded-lg flex items-center">
                  <ExclamationMark />
                  No available personnel match this complaint type
                </div>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition"
                  disabled={!assignedName}
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Personnel Modal */}
      {addPersonnelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-indigo-600">
              <h3 className="text-lg font-medium text-white">Add New Personnel</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newPersonnel.name}
                  onChange={(e) => setNewPersonnel({ ...newPersonnel, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contact</label>
                <input
                  type="text"
                  placeholder="Phone or Email"
                  value={newPersonnel.contact}
                  onChange={(e) => setNewPersonnel({ ...newPersonnel, contact: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={newPersonnel.role}
                  onChange={(e) => setNewPersonnel({ ...newPersonnel, role: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Role</option>
                  <option value="Network">Network</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="PC Maintenance">PC Maintenance</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electricity">Electricity</option>
                </select>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setAddPersonnelModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPersonnel}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  Add Personnel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {/* <div className="fixed bottom-6 right-6 w-96 bg-gray-900 rounded-xl shadow-lg border border-gray-700 p-4 z-50">
        <h3 className="text-lg font-bold text-white mb-2">User Chats</h3>
        <div className="flex">

          <div className="w-1/3 border-r border-gray-700 pr-2 overflow-y-auto max-h-64">
            {userList && userList.length > 0 ? (
              userList.map((user) => (
                <div
                  key={user}
                  className={`p-2 cursor-pointer rounded ${selectedUser === user ? "bg-indigo-700 text-white" : "text-gray-300 hover:bg-gray-800"}`}
                  onClick={() => setSelectedUser(user)}
                >
                  {user}
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm">No active users</div>
            )}
          </div>

          <div className="w-2/3 pl-3 flex flex-col">
            <div className="h-48 overflow-y-auto bg-gray-800 rounded-lg p-2 mb-2 flex-1">
              {messages && messages.length > 0 ? (
                messages.map((msg, idx) => (
                  <div key={idx} className={`mb-1 text-sm ${msg.from === "admin" ? "text-right" : "text-left"}`}>
                    <span className={`inline-block px-2 py-1 rounded ${msg.from === "admin" ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-200"}`}>
                      {msg.message}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">No messages</div>
              )}
            </div>
            
            <form
              onSubmit={e => {
                e.preventDefault();
                if (chatInput.trim() && selectedUser) {
                  sendMessage({ userId: selectedUser, message: chatInput });
                  setChatInput("");
                }
              }}
              className="flex gap-2"
            >
              <input
                className="flex-1 px-3 py-2 rounded bg-gray-700 text-white"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder={selectedUser ? "Type a message..." : "Select a user to chat"}
                disabled={!selectedUser}
              />
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded" disabled={!selectedUser}>
                Send
              </button>
            </form>
          </div>
        </div>
      </div> */}
    </main>
  );
};

export default AdminDashboard;