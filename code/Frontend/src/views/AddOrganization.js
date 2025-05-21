import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import HeadingWithEffect from '../components/HeadingWithEffects';

const AddOrganization = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contactDetails: {
      email: '',
      phone: '',
      address: ''
    }
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo image must be less than 2MB');
      return;
    }
    
    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Please upload a valid image (JPEG, JPG, or PNG)');
      return;
    }
    
    // Store the file for form submission
    setLogoFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const clearLogoSelection = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Organization name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.contactDetails.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactDetails.email)) {
      errors.email = 'Invalid email format';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      
      // Add contact details as JSON string
      formDataToSend.append('contactDetails', JSON.stringify({
        email: formData.contactDetails.email,
        phone: formData.contactDetails.phone,
        address: formData.contactDetails.address
      }));
      
      // Add logo file if selected
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }
      
      await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/v1/superadmin/organization`,
        formDataToSend,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
          }
        }
      );
      navigate('/superadmin/organizations'); // Redirect to organizations list
    } catch (err) {
      console.error('Error adding organization:', err);
      setError(err.response?.data?.message || 'Failed to add organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream ml-14">
        <button
        onClick={() => navigate(-1)} // Navigate to the previous page
        className="flex items-center gap-2 text-brown font-medium mb-4"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>
      <div className="ml-0 md:ml-[50px] p-6">
        <HeadingWithEffect>Add Organization</HeadingWithEffect>
        
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mt-8">
        <div className="mb-4">
          <label className="block text-brown font-medium mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full border border-brown/20 rounded px-3 py-2"
          />
          {formErrors.name && <p className="text-red-600 text-sm">{formErrors.name}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-brown font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full border border-brown/20 rounded px-3 py-2"
          />
          {formErrors.description && <p className="text-red-600 text-sm">{formErrors.description}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-brown font-medium mb-2">Logo</label>
          <div className="space-y-3">
            {/* File upload input */}
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                ref={fileInputRef}
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer transition-all hover:bg-gray-50 text-brown"
                style={{ borderColor: "#57321A" }}
              >
                <Upload size={18} style={{ color: "#57321A" }} />
                <span style={{ color: "#57321A" }}>Choose Image</span>
              </label>
              
              {logoFile && (
                <div className="text-sm text-gray-600">
                  {logoFile.name} ({Math.round(logoFile.size / 1024)} KB)
                </div>
              )}
              
              {logoFile && (
                <button
                  type="button"
                  onClick={clearLogoSelection}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              )}
            </div>
            
            {/* Preview area */}
            {logoPreview && (
              <div className="h-24 w-24 border rounded-md overflow-hidden" style={{ borderColor: "#57321A" }}>
                <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              <p>Recommended: Square image (1:1 ratio)</p>
              <p>Max size: 2MB</p>
              <p>Formats: JPEG, PNG</p>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-brown font-medium mb-2">Email</label>
          <input
            type="email"
            name="contactDetails.email"
            value={formData.contactDetails.email}
            onChange={handleInputChange}
            className="w-full border border-brown/20 rounded px-3 py-2"
          />
          {formErrors.email && <p className="text-red-600 text-sm">{formErrors.email}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-brown font-medium mb-2">Phone</label>
          <input
            type="text"
            name="contactDetails.phone"
            value={formData.contactDetails.phone}
            onChange={handleInputChange}
            className="w-full border border-brown/20 rounded px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-brown font-medium mb-2">Address</label>
          <input
            type="text"
            name="contactDetails.address"
            value={formData.contactDetails.address}
            onChange={handleInputChange}
            className="w-full border border-brown/20 rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="bg-brown text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      </div>
    </div>
  );
};

export default AddOrganization;