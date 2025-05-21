import { useState, useEffect, useRef } from "react"
import SuccessAlert from "../components/SuccessAlert"
import ErrorMessage from "../components/ErrorMessage"
import HeadingWithEffect from "../components/HeadingWithEffects"
import { Search, UserPlus, Loader2, Upload, Download, FileSpreadsheet } from "lucide-react"
import ConfirmDialog from "../components/ConfirmDialog"
import TeachersList from "../components/TeachersList"
import Papa from "papaparse"
import * as XLSX from "xlsx"

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([])
  const [newTeacherEmail, setNewTeacherEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [alert, setAlert] = useState({ show: false, type: "", message: "" })
  const [currentTeacherId, setCurrentTeacherId] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStats, setUploadStats] = useState(null)
  
  const fileInputRef = useRef(null)
  const confirmDialogRef = useRef(null)

  useEffect(() => {
    // Initialize the confirm dialog once on component mount
    confirmDialogRef.current = new ConfirmDialog()

    // Clean up the dialog when component unmounts
    return () => {
      if (confirmDialogRef.current) {
        confirmDialogRef.current.dialog.remove()
      }
    }
  }, [])

  const fetchTeachers = async () => {
    setIsPageLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const organizationId = localStorage.getItem("organizationid")
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/org/${organizationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // console.log("Fetched teachers data: ", data.data.teachers)
        setTeachers(data.data.teachers || [])
      } else {
        console.error("Error fetching teachers")
        showAlert("error", "Failed to load teachers")
      }
    } catch (error) {
      console.error("Error fetching teachers:", error)
      showAlert("error", "Failed to load teachers")
    } finally {
      setIsPageLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message })
    setTimeout(() => {
      setAlert({ show: false, type: "", message: "" })
    }, 5000)
  }

  const handleAddTeacher = async () => {
    if (!newTeacherEmail) {
      setErrorMessage("Please enter an email address")

      // Hide the error after 3 seconds
      setTimeout(() => {
        setErrorMessage("")
      }, 3000)

      return
    }

    // Check if teacher email already exists
    const teacherExists = teachers.some((teacher) => teacher.email.toLowerCase() === newTeacherEmail.toLowerCase())

    if (teacherExists) {
      setErrorMessage("A teacher with this email already exists")
      setTimeout(() => {
        setErrorMessage("")
      }, 3000)
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const organizationId = localStorage.getItem("organizationid")
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/v1/admin/teacher`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newTeacherEmail, organizationId }),
      })

      if (response.ok) {
        showAlert("success", "Teacher added successfully")
        setNewTeacherEmail("")
        fetchTeachers()
      } else {
        showAlert("error", "Failed to add teacher")
      }
    } catch (error) {
      console.error("Error adding teacher:", error)
      showAlert("error", "Error adding teacher")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveTeacher = (teacherId) => {
    // Store teacherId directly in the confirmation handler
    if (confirmDialogRef.current) {
      confirmDialogRef.current.show({
        title: "Confirm Deletion",
        message: "Are you sure you want to remove this teacher?",
        onConfirm: () => confirmRemoval(teacherId), // Pass teacherId directly
        onCancel: () => setCurrentTeacherId(null),
      })
    }
  }

  const confirmRemoval = async (teacherId) => {
    const token = localStorage.getItem("accessToken")
    // console.log("Removing teacher with ID:", teacherId) // This will show the correct ID

    try {
      const organizationId = localStorage.getItem("organizationid")
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/api/v1/admin/teacher/${teacherId}/organization/${organizationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.ok) {
        showAlert("success", "Teacher removed successfully")
        fetchTeachers()
      } else {
        showAlert("error", "Failed to remove teacher")
      }
    } catch (error) {
      console.error("Error removing teacher:", error)
      showAlert("error", "Error removing teacher")
    }
  }

  // Generate CSV template for download
  const generateTemplate = () => {
    const template = [
      ['email'], // Header row
      ['teacher1@example.com'], // Example row
      ['teacher2@example.com'] // Example row
    ]
    
    const csv = Papa.unparse(template)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', 'teacher_invite_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Generate Excel template for download
  const generateExcelTemplate = () => {
    const template = [
      ['email'], // Header row
      ['teacher1@example.com'], // Example row
      ['teacher2@example.com'] // Example row
    ]
    
    const worksheet = XLSX.utils.aoa_to_sheet(template)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers")
    
    // Generate file and trigger download
    XLSX.writeFile(workbook, "teacher_invite_template.xlsx")
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const fileType = file.name.split('.').pop().toLowerCase()
    
    if (fileType !== 'csv' && fileType !== 'xlsx') {
      showAlert("error", "Please upload a .csv or .xlsx file")
      e.target.value = null
      return
    }
    
    processFile(file, fileType)
  }

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
  }

  const processFile = async (file, fileType) => {
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      let emails = []
      
      if (fileType === 'csv') {
        // Process CSV with explicit delimiter
        const text = await file.text()
        const result = Papa.parse(text, { 
          header: true, 
          skipEmptyLines: true,
          delimiter: ',' // Explicitly set comma as the delimiter 
        })
        
        if (result.errors.length > 0) {
          throw new Error("Error parsing CSV: " + result.errors[0].message)
        }
        
        emails = result.data.map(row => row.email || '').filter(email => email.trim() !== '')
      } else {
        // Process Excel
        const data = await file.arrayBuffer()
        const workbook = XLSX.read(data)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        emails = jsonData.map(row => row.email || '').filter(email => email.trim() !== '')
      }
      
      // Validate emails
      const validEmails = []
      const invalidEmails = []
      
      emails.forEach(email => {
        if (validateEmail(email)) {
          validEmails.push(email)
        } else {
          invalidEmails.push(email)
        }
      })
      
      if (validEmails.length === 0) {
        throw new Error("No valid emails found in the file")
      }
      
      // Process in batches to avoid overwhelming the server
      const batchSize = 10
      const batches = []
      
      for (let i = 0; i < validEmails.length; i += batchSize) {
        batches.push(validEmails.slice(i, i + batchSize))
      }
      
      const stats = {
        total: validEmails.length,
        processed: 0,
        succeeded: 0,
        failed: 0,
        skipped: 0,
        invalidCount: invalidEmails.length
      }
      
      const token = localStorage.getItem("accessToken")
      const organizationId = localStorage.getItem("organizationid")
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        const batchResults = await processBatch(batch, token, organizationId)
        
        stats.processed += batch.length
        stats.succeeded += batchResults.succeeded
        stats.failed += batchResults.failed
        stats.skipped += batchResults.skipped
        
        // Update progress
        setUploadProgress(Math.round((stats.processed / stats.total) * 100))
      }
      
      setUploadStats(stats)
      showAlert("success", `Processed ${stats.total} emails: ${stats.succeeded} added, ${stats.skipped} skipped, ${stats.failed} failed, ${stats.invalidCount} invalid`)
      fetchTeachers()
      
    } catch (error) {
      console.error("Error processing file:", error)
      showAlert("error", error.message || "Error processing file")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const processBatch = async (emails, token, organizationId) => {
    const results = {
      succeeded: 0,
      failed: 0,
      skipped: 0
    }
    
    for (const email of emails) {
      // Check if teacher already exists
      const teacherExists = teachers.some(teacher => teacher.email.toLowerCase() === email.toLowerCase())
      
      if (teacherExists) {
        results.skipped++
        continue
      }
      
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/v1/admin/teacher`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, organizationId }),
        })
        
        if (response.ok) {
          results.succeeded++
        } else {
          results.failed++
        }
      } catch (error) {
        console.error(`Error adding teacher ${email}:`, error)
        results.failed++
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    return results
  }

  return (
    <div className="min-h-screen bg-cream">
      <main className="ml-0 md:ml-[200px] p-6">
        <div className="max-w-4xl mx-auto">
          <HeadingWithEffect>Manage Teachers</HeadingWithEffect>
          {alert.show && alert.type === "success" && <SuccessAlert message={alert.message} />}

          {alert.show && alert.type === "error" && <ErrorMessage message={alert.message} />}
          {errorMessage && <ErrorMessage message={errorMessage} />}
          
          <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-brown/20">
            <h2 className="text-xl font-semibold text-brown mb-4">Add New Teacher</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search size={20} className="text-brown" />
                </div>
                <input
                  type="email"
                  placeholder="Enter teacher's email"
                  value={newTeacherEmail}
                  onChange={(e) => setNewTeacherEmail(e.target.value)}
                  className="w-full p-3 pl-10 border rounded-md bg-white text-brown focus:ring-2 focus:ring-brown focus:outline-none"
                  style={{ borderColor: "#57321A" }}
                />
              </div>
              <button
                onClick={handleAddTeacher}
                disabled={isLoading}
                className="px-6 py-3 bg-brown text-white rounded-md hover:bg-brown/90 transition-colors flex items-center justify-center whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} className="mr-2" />
                    Add Teacher
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bulk Upload Section */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-brown/20">
            <h2 className="text-xl font-semibold text-brown mb-4">Bulk Upload Teachers</h2>
            
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row gap-4 mb-2">
                <button
                  onClick={generateTemplate}
                  className="px-4 py-2 bg-brown text-white rounded transition-colors flex items-center justify-center"
                >
                  <Download size={18} className="mr-2" />
                  Download CSV Template
                </button>
                
                <button
                  onClick={generateExcelTemplate}
                  className="px-4 py-2 bg-brown text-white rounded transition-colors flex items-center justify-center"
                >
                  <FileSpreadsheet size={18} className="mr-2" />
                  Download Excel Template
                </button>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".csv,.xlsx"
                  className="hidden"
                  id="file-upload"
                />
                
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload size={36} className="text-brown mb-2" />
                  <p className="text-lg font-medium text-brown">Click to upload CSV or Excel file</p>
                  <p className="text-sm text-gray-500 mt-1">Only .csv and .xlsx files are accepted</p>
                </label>
              </div>
              
              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-brown h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-center mt-2">Processing... {uploadProgress}%</p>
                </div>
              )}
              
              {uploadStats && !isUploading && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="font-medium text-brown">Upload Summary</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>Total emails processed: {uploadStats.total}</li>
                    <li className="text-green-600">Successfully added: {uploadStats.succeeded}</li>
                    <li className="text-yellow-600">Skipped (already exist): {uploadStats.skipped}</li>
                    <li className="text-red-600">Failed to add: {uploadStats.failed}</li>
                    <li className="text-red-600">Invalid emails: {uploadStats.invalidCount}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <TeachersList teachers={teachers} isLoading={isPageLoading} onRemoveTeacher={handleRemoveTeacher} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminTeachers