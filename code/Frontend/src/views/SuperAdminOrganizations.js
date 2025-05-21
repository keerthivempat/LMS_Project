import React, { useState, useEffect } from 'react';
import { 
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  UserPlus
} from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import HeadingWithEffect from '../components/HeadingWithEffects';
import OrganizationModal from '../components/OrganizationModal';

const SuperAdminOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
    contactDetails: {
      email: '',
      phone: '',
      address: ''
    }
  });
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch all organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND}/api/v1/superadmin/organizations`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setOrganizations(response.data.data);
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError('Failed to load organizations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Organization name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.contactDetails.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactDetails.email)) {
      errors.email = 'Invalid email format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e, formDataWithLogo) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Use the FormData object that includes the logo file if provided
      const data = formDataWithLogo || formData;
      
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/v1/superadmin/organization`,
        data,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            ...(formDataWithLogo ? {} : { 'Content-Type': 'application/json' })
          }
        }
      );
      
      // Add the new organization to the state
      setOrganizations([...organizations, response.data.data]);
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        logoUrl: '',
        contactDetails: {
          email: '',
          phone: '',
          address: ''
        }
      });
      setShowAddModal(false);
      
      // Show success message
      setSuccess('Organization added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding organization:', err);
      setError(err.response?.data?.message || 'Failed to add organization');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle organization deletion
  const handleDelete = async () => {
    if (!selectedOrganization) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      await axios.delete(
        `${process.env.REACT_APP_BACKEND}/api/v1/superadmin/organization/${selectedOrganization._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Remove organization from state
      setOrganizations(organizations.filter(org => org._id !== selectedOrganization._id));
      
      // Close modal and reset selected organization
      setShowDeleteModal(false);
      setSelectedOrganization(null);
      
      // Show success message
      setSuccess('Organization deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting organization:', err);
      setError(err.response?.data?.message || 'Failed to delete organization');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Filter organizations based on search term
  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.description && org.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-cream">
      {loading && !showAddModal && !showDeleteModal ? (
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
      ) : (
        <main className="ml-0 md:ml-[100px] p-6">
          <HeadingWithEffect>Organizations</HeadingWithEffect>
          <div className="">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <button
                onClick={() => navigate('/superadmin/organizations/add')}
                className="mt-4 md:mt-4 flex items-center gap-2 bg-brown text-white px-4 py-2 rounded"
              >
                <Plus size={18} />
                <span>Add Organization</span>
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
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Organizations Table */}
            <div className="bg-white rounded-md shadow-sm border border-brown/20 overflow-hidden">
              <table className="min-w-full divide-y divide-brown/10">
                <thead className="bg-brown/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-brown uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-brown/10">
                  {filteredOrganizations.map((org) => (
                    <tr key={org._id} className="hover:bg-brown/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {org.logo ? (
                            <img
                              src={org.logo}
                              alt={org.name}
                              className="h-10 w-10 rounded-full mr-3"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-brown/10 flex items-center justify-center mr-3">
                              <Building2 size={20} className="text-brown/60" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-brown">{org.name}</div>
                            <div className="text-sm text-brown/70">{org.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {org.contactDetails && (
                          <div>
                            <div className="text-sm text-brown/70">
                              {org.contactDetails.email}
                            </div>
                            <div className="text-sm text-brown/70">
                              {org.contactDetails.phone}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => {
                              setSelectedOrganization(org);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOrganizations.length === 0 && (
                <div className="text-center py-4 text-brown/60">No organizations found</div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Organization Modals */}
      <OrganizationModal
        type="add"
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Organization"
        loading={loading}
        formData={formData}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />

      <OrganizationModal
        type="delete"
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedOrganization(null);
        }}
        title="Delete Organization"
        loading={loading}
        organization={selectedOrganization}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default SuperAdminOrganizations;