import React, { useState, useEffect } from 'react';
import { 
  Users,
  UserPlus,
  Search,
  Trash2,
  X,
  Building2,
  AlertTriangle,
  Mail
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import HeadingWithEffect from '../components/HeadingWithEffects';

// Importing the ConfirmDialog class
class ConfirmDialog {
  constructor() {
    // Create the dialog elements but don't append to DOM yet
    this.dialog = document.createElement("div");
    this.dialog.innerHTML = this.#template();
    
    // Get references to the elements
    this.dialogElement = this.dialog.querySelector("#confirm-dialog");
    this.titleElem = this.dialog.querySelector("#confirm-title");
    this.messageElem = this.dialog.querySelector("#confirm-message");
    this.okBtn = this.dialog.querySelector("#confirm-ok");
    this.cancelBtn = this.dialog.querySelector("#confirm-cancel");
    
    // Initialize handlers
    this.okHandler = null;
    this.cancelHandler = null;
    
    // Set up event listeners
    this.okBtn.addEventListener("click", () => {
      this.hide();
      if (this.okHandler) this.okHandler();
    });
    
    this.cancelBtn.addEventListener("click", () => {
      this.hide();
      if (this.cancelHandler) this.cancelHandler();
    });
    
    // Apply styles to buttons
    this.#applyStyles();
  }
  
  #template() {
    return `
      <div id="confirm-dialog" style="
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      ">
        <div id="confirm-box" style="
          background-color: #FFFCF4;
          border: 1px solid #57321A;
          padding: 24px;
          border-radius: 16px;
          max-width: 400px;
          width: 100%;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        ">
          <h2 id="confirm-title" style="
            font-size: 20px;
            font-weight: bold;
            color: #57321A;
            margin-bottom: 16px;
          ">Confirm</h2>
          <p id="confirm-message" style="
            font-size: 16px;
            color: #57321A;
            margin-bottom: 24px;
          ">Are you sure you want to proceed?</p>
          <div style="display: flex; justify-content: center; gap: 16px;">
            <button id="confirm-cancel">Cancel</button>
            <button id="confirm-ok">Confirm</button>
          </div>
        </div>
      </div>
    `;
  }
  
  #applyStyles() {
    const btnStyle = {
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      fontWeight: "600",
      cursor: "pointer",
      fontSize: "14px",
    };
    
    Object.assign(this.cancelBtn.style, {
      ...btnStyle,
      backgroundColor: "#FDF6E3",
      color: "#57321A",
      border: "1px solid #57321A",
    });
    
    Object.assign(this.okBtn.style, {
      ...btnStyle,
      backgroundColor: "#EFC815",
      color: "#57321A",
    });
    
    this.cancelBtn.addEventListener("mouseenter", () => {
      this.cancelBtn.style.backgroundColor = "#FAE9C5";
    });
    
    this.cancelBtn.addEventListener("mouseleave", () => {
      this.cancelBtn.style.backgroundColor = "#FDF6E3";
    });
    
    this.okBtn.addEventListener("mouseenter", () => {
      this.okBtn.style.backgroundColor = "#d8b415";
    });
    
    this.okBtn.addEventListener("mouseleave", () => {
      this.okBtn.style.backgroundColor = "#EFC815";
    });
  }
  
  show({ title = "Confirm", message = "Are you sure?", onConfirm, onCancel }) {
    // Set the dialog content
    this.titleElem.textContent = title;
    this.messageElem.textContent = message;
    this.okHandler = onConfirm;
    this.cancelHandler = onCancel;
    
    // Append to the document body
    document.body.appendChild(this.dialog);
  }
  
  hide() {
    // Completely remove the dialog from the DOM when hiding
    if (document.body.contains(this.dialog)) {
      document.body.removeChild(this.dialog);
    }
  }
  
  // This method is now the same as hide() but kept for semantic clarity
  destroy() {
    this.hide();
  }
}

const SuperAdminAdmins = () => {
  const [organizations, setOrganizations] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    organizationId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [confirmDialog] = useState(new ConfirmDialog());

  // Fetch all organizations and admins
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        
        // Fetch organizations
        const orgsResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND}/api/v1/superadmin/organizations`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setOrganizations(orgsResponse.data.data);
        
        // Prepare to collect all admins
        const allAdmins = [];
        
        // For each organization, fetch its admins
        for (const org of orgsResponse.data.data) {
          try {
            const adminsResponse = await axios.get(
              `${process.env.REACT_APP_BACKEND}/api/v1/superadmin/organization/${org._id.toString()}/admins`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            
            // Add organization info to each admin
            const adminsWithOrgInfo = adminsResponse.data.data.map(admin => ({
              ...admin,
              organizationName: org.name,
              organizationId: org._id
            }));
            
            allAdmins.push(...adminsWithOrgInfo);
          } catch (err) {
            console.error(`Error fetching admins for organization ${org.name}:`, err);
          }
        }
        
        setAdmins(allAdmins);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.organizationId) {
      errors.organizationId = 'Organization is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission to add an admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/v1/admin/create`,
        {
          email: formData.email,
          organizationId: formData.organizationId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Find the organization name for the newly added admin
      const organization = organizations.find(org => org._id === formData.organizationId);
      
      // Add the new admin to the state with organization info
      const newAdmin = {
        ...response.data.data,
        organizationName: organization ? organization.name : 'Unknown',
        organizationId: formData.organizationId
      };
      
      setAdmins([...admins, newAdmin]);
      
      // Reset form and close modal
      setFormData({
        email: '',
        organizationId: ''
      });
      setShowAddModal(false);
      
      // Show success message
      setSuccess('Admin added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding admin:', err);
      setError(err.response?.data?.message || 'Failed to add admin');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Show confirm dialog for admin removal
  const showRemoveAdminConfirm = (admin) => {
    setSelectedAdmin(admin);
    confirmDialog.show({
      title: "Remove Admin",
      message: `Are you sure you want to remove admin privileges from ${admin.user?.email} for ${admin.organizationName}?`,
      onConfirm: handleRemoveAdmin,
      onCancel: () => setSelectedAdmin(null)
    });
  };

  // Handle admin removal
  const handleRemoveAdmin = async () => {
    if (!selectedAdmin) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      await axios.delete(
        `${process.env.REACT_APP_BACKEND}/api/v1/admin/${selectedAdmin._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Remove admin from state
      setAdmins(admins.filter(admin => admin._id !== selectedAdmin._id));
      
      // Reset selected admin
      setSelectedAdmin(null);
      
      // Show success message
      setSuccess('Admin removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error removing admin:', err);
      setError(err.response?.data?.message || 'Failed to remove admin');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Filter admins based on search term
  const filteredAdmins = admins.filter(admin => 
    (admin.user?.name && admin.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (admin.user?.email && admin.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (admin.organizationName && admin.organizationName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-cream">
      {loading && !showAddModal ? (
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
      ) : (
        <main className="ml-0 md:ml-[100px] p-6">
          <div className="">
          <HeadingWithEffect>Organization Admins</HeadingWithEffect>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6 mb-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 md:mt-0 flex items-center gap-2 bg-brown text-white px-4 py-2 rounded-lg transition-colors"
              >
                <UserPlus size={18} />
                <span>Add Admin</span>
              </button>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{success}</span>
                <button
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                  onClick={() => setSuccess('')}
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{error}</span>
                <button
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                  onClick={() => setError(null)}
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-brown/60" />
                </div>
                <input
                  type="text"
                  className="bg-white block w-full pl-10 pr-3 py-2 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown"
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Admins Table */}
            <div className="bg-white rounded-lg shadow-sm border border-brown/20 overflow-hidden">
              <table className="min-w-full divide-y divide-brown/10">
                <thead className="bg-brown/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-brown/10">
                  {filteredAdmins.map(admin => (
                    <tr key={admin._id} className="hover:bg-brown/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                            <Users size={20} className="text-red-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-brown">
                              {admin.user?.name || admin.user?.email?.split('@')[0] || 'Unknown'}
                            </div>
                            <div className="text-sm text-brown/70 flex items-center gap-1">
                              <Mail size={14} />
                              {admin.user?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                            <Building2 size={16} className="text-yellow-600" />
                          </div>
                          <div className="text-sm text-brown">
                            {admin.organizationName || 'Unknown Organization'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => showRemoveAdminConfirm(admin)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAdmins.length === 0 && (
                <div className="text-center py-4 text-brown/60">
                  No admins found
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-yellow-500">
              <h3 className="text-lg font-medium text-brown">Add Admin</h3>
            </div>
            
            <form onSubmit={handleAddAdmin} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brown mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-brown/20'} rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter admin's email"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-brown mb-1">
                    Organization <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="organizationId"
                    className={`w-full px-3 py-2 border ${formErrors.organizationId ? 'border-red-500' : 'border-brown/20'} rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    value={formData.organizationId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select an organization</option>
                    {organizations.map(org => (
                      <option key={org._id} value={org._id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.organizationId && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.organizationId}</p>
                  )}
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        If the user doesn't exist, they will be created with the admin role.
                        A temporary password will be sent to their email.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-brown/20 rounded-lg text-brown hover:bg-brown/5 focus:outline-none"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow hover:bg-yellow-100 text-brown rounded focus:outline-none"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminAdmins;