import React, { useState, useRef } from 'react';
import { AlertTriangle, X, Upload } from 'lucide-react';

const OrganizationModal = ({
  type,
  isOpen,
  onClose,
  title,
  loading,
  organization,
  formData,
  formErrors,
  handleInputChange,
  handleSubmit,
  handleDelete
}) => {
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  if (!isOpen) return null;

  const isAddModal = type === 'add';
  const isDeleteModal = type === 'delete';
  
  const headerBgColor = isAddModal ? 'bg-brown' : 'bg-red-600';
  
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
  
  // Wrap the original submit handler to include the file
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Create a FormData object to handle file upload
    const formDataWithLogo = new FormData();
    
    // Add all form fields to FormData
    formDataWithLogo.append('name', formData.name);
    formDataWithLogo.append('description', formData.description);
    
    // Add contact details as JSON string
    formDataWithLogo.append('contactDetails', JSON.stringify({
      email: formData.contactDetails.email,
      phone: formData.contactDetails.phone,
      address: formData.contactDetails.address
    }));
    
    // Add logo file if selected
    if (logoFile) {
      formDataWithLogo.append('logo', logoFile);
    }
    
    // Call the original submit handler with the new FormData
    handleSubmit(e, formDataWithLogo);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
        <div className={`px-6 py-4 ${headerBgColor}`}>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">{title}</h3>
            <button 
              onClick={onClose}
              className="text-white hover:text-white/80"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        {isAddModal && (
          <form onSubmit={handleFormSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown mb-1">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-brown/20'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brown`}
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-brown mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows="3"
                  className={`w-full px-3 py-2 border ${formErrors.description ? 'border-red-500' : 'border-brown/20'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brown`}
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-brown mb-1">
                  Logo
                </label>
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
              
              <div>
                <label className="block text-sm font-medium text-brown mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="contactDetails.email"
                  className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-brown/20'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brown`}
                  value={formData.contactDetails.email}
                  onChange={handleInputChange}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-brown mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  name="contactDetails.phone"
                  className="w-full px-3 py-2 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown"
                  value={formData.contactDetails.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-brown mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="contactDetails.address"
                  className="w-full px-3 py-2 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown"
                  value={formData.contactDetails.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-brown/20 rounded-lg text-brown hover:bg-brown/5 focus:outline-none"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brown hover:bg-brown/90 text-white rounded-lg focus:outline-none"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Organization'}
              </button>
            </div>
          </form>
        )}

        {isDeleteModal && organization && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-2">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <p className="text-brown font-medium">Are you sure you want to delete this organization?</p>
            </div>
            
            <p className="text-brown/70 mb-4">
              This will permanently delete <span className="font-medium">{organization.name}</span> and all associated data. This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-brown/20 rounded-lg text-brown hover:bg-brown/5 focus:outline-none"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg focus:outline-none"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Organization'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationModal;