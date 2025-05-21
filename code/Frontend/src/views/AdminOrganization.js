import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Save, Upload, X, UserPlus, Trash2 } from 'lucide-react';
import LoadingSpinner from "../components/LoadingSpinner";
import HeadingWithEffect from '../components/HeadingWithEffects';
import InviteStudentsOrgModal from '../components/InviteStudentsOrgModal';

const AdminOrganization = () => {
  const [organization, setOrganization] = useState({
    name: '',
    description: '',
    contactDetails: { email: '', phone: '', address: '' },
    logo: '',
    about: [],
    admins: [],
    students: [],
    teachers: [],
    courses: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const colorScheme = {
    cream: "#FFFCF4",
    brown: "#57321A",
    yellow: "#EFC815",
    white: "#FFFFFF",
  };

  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/v1/admin/organization/${localStorage.getItem('organizationid')}/details?populate=admins,students,teachers`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("data is ", data.data);
          setOrganization(data.data || {});
        } else {
          console.error('Error fetching organization details');
        }
      } catch (error) {
        console.error('Error fetching organization details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizationDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested contact details fields
    if (name.startsWith('contact')) {
      const contactField = name.replace('contact', '').toLowerCase();
      setOrganization(prev => ({
        ...prev,
        contactDetails: {
          ...prev.contactDetails,
          [contactField]: value
        }
      }));
    } else {
      // Handle regular fields
      setOrganization(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAboutChange = (index, value) => {
    const updatedAbout = [...organization.about];
    updatedAbout[index] = value;
    setOrganization(prev => ({
      ...prev,
      about: updatedAbout
    }));
  };

  const addAboutItem = () => {
    setOrganization(prev => ({
      ...prev,
      about: [...(prev.about || []), '']
    }));
  };

  const removeAboutItem = (index) => {
    const updatedAbout = [...organization.about];
    updatedAbout.splice(index, 1);
    setOrganization(prev => ({
      ...prev,
      about: updatedAbout
    }));
  };
  
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions - max 800px width/height
          if (width > height && width > 800) {
            height = Math.round((height * 800) / width);
            width = 800;
          } else if (height > 800) {
            width = Math.round((width * 800) / height);
            height = 800;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with reduced quality
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            }));
          }, 'image/jpeg', 0.7); // 70% quality JPEG
        };
      };
    });
  };

  const handleLogoChange = async(e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showNotification('Logo image must be less than 2MB', 'error');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      showNotification('Please upload a valid image (JPEG, JPG, or PNG)', 'error');
      return;
    }
    // File size validation (limit to 2MB)

    // File type validation
    const compressedFile = await compressImage(file);
    setLogoFile(compressedFile);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(compressedFile);
  };

  const clearLogoSelection = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-3 rounded shadow-md z-50 ${
      type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'
    }`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const organizationId = localStorage.getItem("organizationid");
      
      // Create FormData if we have a file to upload
      if (logoFile) {
        const formData = new FormData();
        formData.append('name', organization.name || '');
        formData.append('description', organization.description || '');
        
        // Add contact details
        formData.append('contactDetails[email]', organization.contactDetails?.email || '');
        formData.append('contactDetails[phone]', organization.contactDetails?.phone || '');
        formData.append('contactDetails[address]', organization.contactDetails?.address || '');
        
        // Add about items if they exist
        // if (organization.about && organization.about.length > 0) {
        //   organization.about.forEach((item, index) => {
        //     formData.append(`about[${index}]`, item);
        //   });
        // }
        
        // Append the logo file
        formData.append('logo', logoFile);
        
        const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/v1/admin/organization/${organizationId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          // Update logo URL in state if returned from API
          if (result.data && result.data.logo) {
            setOrganization(prev => ({
              ...prev,
              logo: result.data.logo.url || result.data.logo
            }));
          }
          showNotification('Organization details updated successfully');
          setIsEditing(false);
          clearLogoSelection();
        } else {
          showNotification('Failed to update organization details', 'error');
        }
      } else {
        // Regular JSON update without file upload
        const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/v1/admin/organization/${organizationId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(organization)
        });

        if (response.ok) {
          showNotification('Organization details updated successfully');
          setIsEditing(false);
        } else {
          showNotification('Failed to update organization details', 'error');
        }
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      showNotification('Error updating organization details', 'error');
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center" style={{ backgroundColor: colorScheme.cream }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colorScheme.cream }}>
      <main className="ml-0 md:ml-[200px] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col mb-6">
            <div className="mb-4">
              <HeadingWithEffect>Organisation Details</HeadingWithEffect>
            </div>
            
            <div className="flex justify-end items-center gap-3">
              {isEditing && (
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  style={{ 
                    backgroundColor: colorScheme.brown,
                    opacity: isSaving ? 0.7 : 1
                  }}
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save</span>
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => {
                  if (isEditing) {
                    clearLogoSelection();
                  }
                  setIsEditing(!isEditing);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded transition-all duration-200 shadow-sm hover:shadow-md"
                style={{ 
                  backgroundColor: isEditing ? colorScheme.yellow : 'white',
                  color: colorScheme.brown,
                  border: `1px solid ${colorScheme.brown}`
                }}
              >
                <Edit2 size={18} />
                <span className="font-medium">{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>
          </div>

          <form className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border" style={{ borderColor: `${colorScheme.brown}20` }}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colorScheme.brown }}>Organization Name</label>
                  <input
                    type="text"
                    name="name"
                    value={organization.name || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:outline-none transition-colors text-brown"
                    style={{ 
                      borderColor: colorScheme.brown,
                      backgroundColor: isEditing ? colorScheme.white : colorScheme.cream,
                      opacity: isEditing ? 1 : 0.9
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colorScheme.brown }}>Description</label>
                  <textarea
                    name="description"
                    value={organization.description || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:outline-none transition-colors text-brown"
                    style={{ 
                      borderColor: colorScheme.brown,
                      backgroundColor: isEditing ? colorScheme.white : colorScheme.cream,
                      opacity: isEditing ? 1 : 0.9
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colorScheme.brown }}>Contact Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={organization.contactDetails?.email || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-3 border rounded-md focus:ring-2 focus:outline-none transition-colors text-brown"
                      style={{ 
                        borderColor: colorScheme.brown,
                        backgroundColor: isEditing ? colorScheme.white : colorScheme.cream,
                        opacity: isEditing ? 1 : 0.9
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colorScheme.brown }}>Contact Phone</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={organization.contactDetails?.phone || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-3 border rounded-md focus:ring-2 focus:outline-none transition-colors text-brown"
                      style={{ 
                        borderColor: colorScheme.brown,
                        backgroundColor: isEditing ? colorScheme.white : colorScheme.cream,
                        opacity: isEditing ? 1 : 0.9
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colorScheme.brown }}>Address</label>
                  <textarea
                    name="contactAddress"
                    value={organization.contactDetails?.address || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:outline-none transition-colors text-brown"
                    style={{ 
                      borderColor: colorScheme.brown,
                      backgroundColor: isEditing ? colorScheme.white : colorScheme.cream,
                      opacity: isEditing ? 1 : 0.9
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colorScheme.brown }}>Logo</label>
                  
                  {isEditing ? (
                    <div className="space-y-4">
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
                          style={{ borderColor: colorScheme.brown }}
                        >
                          <Upload size={18} style={{ color: colorScheme.brown }} />
                          <span style={{ color: colorScheme.brown }}>Choose Image</span>
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
                      
                      <div className="flex gap-4 items-center">
                        {logoPreview ? (
                          <div className="h-24 w-24 border rounded-md overflow-hidden" style={{ borderColor: colorScheme.brown }}>
                            <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                          </div>
                        ) : organization.logo ? (
                          <div className="h-24 w-24 border rounded-md overflow-hidden" style={{ borderColor: colorScheme.brown }}>
                            <img 
                              src={organization.logo.url || organization.logo} 
                              alt="Current logo" 
                              className="h-full w-full object-cover" 
                            />
                            <div className="text-xs text-gray-500 mt-1">Current logo</div>
                          </div>
                        ) : (
                          <div className="h-24 w-24 border rounded-md flex items-center justify-center bg-gray-50 text-brown">
                            <span className="text-gray-400 text-xs text-center px-2">No logo</span>
                          </div>
                        )}
                        
                        <div className="text-sm text-gray-600">
                          <p>Recommended: Square image (1:1 ratio)</p>
                          <p>Max size: 2MB</p>
                          <p>Formats: JPEG, PNG</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 items-center">
                      {organization.logo ? (
                        <div className="h-24 w-24 border rounded-md overflow-hidden" style={{ borderColor: colorScheme.brown }}>
                          <img 
                            src={organization.logo.url || organization.logo} 
                            alt="Organization logo" 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                      ) : (
                        <div className="h-24 w-24 border rounded-md flex items-center justify-center bg-gray-50">
                          <span className="text-gray-400 text-xs text-center px-2">No logo</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  {/* <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium" style={{ color: colorScheme.brown }}>About (Bullet Points)</label>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={addAboutItem}
                        className="flex items-center gap-1 text-sm font-medium px-3 py-1 rounded transition-colors"
                        style={{ 
                          backgroundColor: `${colorScheme.yellow}30`,
                          color: colorScheme.brown
                        }}
                      >
                        <span>+</span> Add Item
                      </button>
                    )}
                  </div> */}
                  
                  <div className="space-y-2 mt-2">
                    {organization.about && organization.about.length > 0 ? (
                      organization.about.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleAboutChange(index, e.target.value)}
                            disabled={!isEditing}
                            className="w-full p-3 border rounded-md focus:ring-2 focus:outline-none transition-colors text-brown"
                            style={{ 
                              borderColor: colorScheme.brown,
                              backgroundColor: isEditing ? colorScheme.white : colorScheme.cream,
                              opacity: isEditing ? 1 : 0.9
                            }}
                          />
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeAboutItem(index)}
                              className="h-10 w-10 flex items-center justify-center rounded-md bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors self-center"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="">
                        {/* {isEditing ? "Add information about your organization" : "No information available"} */}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colorScheme.brown }}>Admins</label>
                  {organization.admins && organization.admins.length > 0 ? (
                    <div className="bg-white shadow-sm rounded-md border overflow-hidden" style={{ borderColor: `${colorScheme.brown}20` }}>
                      <ul className="divide-y" style={{ divideColor: `${colorScheme.brown}10` }}>
                        {organization.admins.map(admin => (
                          <li key={admin._id} className="p-3 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colorScheme.brown}20` }}>
                              {admin.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div>
                              <div className="font-medium" style={{ color: colorScheme.brown }}>{admin.name}</div>
                              <div className="text-sm text-gray-600">{admin.email}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-md text-gray-500 text-center">
                      No admins available
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {isEditing && (
              <div className="sticky bottom-6 mt-6 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-md text-white font-medium transition-all shadow-md hover:shadow-lg"
                  style={{ 
                    backgroundColor: colorScheme.brown,
                    opacity: isSaving ? 0.7 : 1
                  }}
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>

        </div>
      </main>

      {showInviteModal && (
        <InviteStudentsOrgModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          organizationId={localStorage.getItem('organizationid')}
          organizationName={organization.name}
        />
      )}
    </div>
  );
};

export default AdminOrganization;