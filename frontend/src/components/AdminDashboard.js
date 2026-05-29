import React, { useState, useEffect } from 'react';
import { API_BASE_URL, apiUrl } from '../config';
import './AdminDashboard.css';

const AdminDashboard = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointmentSubTab, setAppointmentSubTab] = useState('pending');
  const [doctorSubTab, setDoctorSubTab] = useState('approved'); // Default to approved since we have approved profiles
  const [patientSubTab, setPatientSubTab] = useState('approved'); // Default to approved since we have approved profiles
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [approvedAppointments, setApprovedAppointments] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [pendingPatients, setPendingPatients] = useState([]);
  const [approvedDoctors, setApprovedDoctors] = useState([]);
  const [approvedPatients, setApprovedPatients] = useState([]);
  const [pendingHospitals, setPendingHospitals] = useState([]);
  const [approvedHospitals, setApprovedHospitals] = useState([]);
  const [hospitalSubTab, setHospitalSubTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [processingApproval, setProcessingApproval] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch statistics
      const statsResponse = await fetch(apiUrl('/api/admin/stats'), { headers });
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch recent activities
      const activitiesResponse = await fetch(apiUrl('/api/admin/recent-activities'), { headers });
      const activitiesData = await activitiesResponse.json();
      setRecentActivities(activitiesData);

      // Fetch pending appointments
      const pendingAppointmentsResponse = await fetch(apiUrl('/api/admin/pending-appointments'), { headers });
      const pendingAppointmentsData = await pendingAppointmentsResponse.json();
      setPendingAppointments(pendingAppointmentsData);

      // Fetch approved appointments
      const approvedAppointmentsResponse = await fetch(apiUrl('/api/admin/approved-appointments'), { headers });
      const approvedAppointmentsData = await approvedAppointmentsResponse.json();
      setApprovedAppointments(approvedAppointmentsData);

      // Fetch pending doctors
      const doctorsResponse = await fetch(apiUrl('/api/admin/pending-doctors'), { headers });
      const doctorsData = await doctorsResponse.json();
      setPendingDoctors(doctorsData);

      // Fetch pending patients
      const patientsResponse = await fetch(apiUrl('/api/admin/pending-patients'), { headers });
      const patientsData = await patientsResponse.json();
      setPendingPatients(patientsData);

      // Fetch approved doctors
      const approvedDoctorsResponse = await fetch(apiUrl('/api/admin/approved-doctors'), { headers });
      const approvedDoctorsData = await approvedDoctorsResponse.json();
      setApprovedDoctors(approvedDoctorsData);

      // Fetch approved patients
      const approvedPatientsResponse = await fetch(apiUrl('/api/admin/approved-patients'), { headers });
      const approvedPatientsData = await approvedPatientsResponse.json();
      setApprovedPatients(approvedPatientsData);

      // Fetch pending hospitals
      const pendingHospitalsResponse = await fetch(apiUrl('/api/admin/pending-hospitals'), { headers });
      const pendingHospitalsData = await pendingHospitalsResponse.json();
      setPendingHospitals(Array.isArray(pendingHospitalsData) ? pendingHospitalsData : []);

      // Fetch approved hospitals
      const approvedHospitalsResponse = await fetch(apiUrl('/api/admin/approved-hospitals'), { headers });
      const approvedHospitalsData = await approvedHospitalsResponse.json();
      setApprovedHospitals(Array.isArray(approvedHospitalsData) ? approvedHospitalsData : []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproval = async (type, id, approved) => {
    try {
      console.log(`Attempting to ${approved ? 'approve' : 'reject'} ${type} with ID: ${id}`);
      
      // Set processing state
      setProcessingApproval(`${type}-${id}-${approved ? 'approve' : 'reject'}`);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('No admin token found. Please log in again.');
        setProcessingApproval(null);
        return;
      }
      
      const endpoint = type === 'appointment' 
        ? apiUrl(`/api/admin/appointment/${id}/status`)
        : type === 'hospital'
        ? apiUrl(`/api/admin/hospital/${id}/approval`)
        : apiUrl(`/api/admin/${type}/${id}/approval`);
      
      const body = type === 'appointment' 
        ? { status: approved ? 'approved' : 'rejected' }
        : { approved };

      console.log('Making request to:', endpoint);
      console.log('Request body:', body);

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Success:', result);
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} ${approved ? 'approved' : 'rejected'} successfully!`);
        // Refresh data
        fetchData();
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        alert(`Error: ${error.message || 'Failed to update approval'}`);
      }
    } catch (error) {
      console.error('Error updating approval:', error);
      alert(`Network error: ${error.message}`);
    } finally {
      setProcessingApproval(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="admin-info">
            <span>Welcome, {admin?.name || admin?.email}</span>
            <button onClick={onLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <div className="nav-content">
          <button 
            className={`nav-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`nav-button ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Appointments ({pendingAppointments.length})
          </button>
          <button 
            className={`nav-button ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctors')}
          >
            Doctor Approvals ({approvedDoctors.length} approved)
          </button>
          <button 
            className={`nav-button ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            Patient Approvals ({approvedPatients.length} approved)
          </button>
          <button 
            className={`nav-button ${activeTab === 'hospitals' ? 'active' : ''}`}
            onClick={() => setActiveTab('hospitals')}
          >
            Hospital Partnerships ({pendingHospitals.length} pending)
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        {activeTab === 'overview' && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Total Patients</h3>
                <p className="card-number">{stats.patientCount || 0}</p>
                <p className="card-description">Registered patients</p>
              </div>

              <div className="dashboard-card">
                <h3>Total Doctors</h3>
                <p className="card-number">{stats.doctorCount || 0}</p>
                <p className="card-description">Registered doctors</p>
              </div>

              <div className="dashboard-card">
                <h3>Pending Appointments</h3>
                <p className="card-number">{stats.pendingAppointments || 0}</p>
                <p className="card-description">Awaiting approval</p>
              </div>

              <div className="dashboard-card">
                <h3>Pending Approvals</h3>
                <p className="card-number">{(stats.pendingDoctorApprovals || 0) + (stats.pendingPatientApprovals || 0)}</p>
                <p className="card-description">Doctor & Patient approvals</p>
              </div>
            </div>

            <div className="dashboard-section">
              <h2>Recent Activities</h2>
              <div className="activities-list">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-content">
                        <p className="activity-message">{activity.message}</p>
                        <p className="activity-time">{formatDate(activity.timestamp)}</p>
                      </div>
                      <span className={`activity-status ${activity.status}`}>
                        {activity.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No recent activities</p>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'appointments' && (
          <div className="dashboard-section">
            <div className="sub-nav">
              <button 
                className={`sub-nav-button ${appointmentSubTab === 'pending' ? 'active' : ''}`}
                onClick={() => setAppointmentSubTab('pending')}
              >
                Pending ({pendingAppointments.length})
              </button>
              <button 
                className={`sub-nav-button ${appointmentSubTab === 'approved' ? 'active' : ''}`}
                onClick={() => setAppointmentSubTab('approved')}
              >
                Approved ({approvedAppointments.length})
              </button>
            </div>

            {appointmentSubTab === 'pending' && (
              <>
                <h2>Pending Appointment Approvals</h2>
                <div className="approval-list">
                  {pendingAppointments.length > 0 ? (
                    pendingAppointments.map((appointment) => (
                      <div key={appointment._id} className="approval-item">
                        <div className="approval-content">
                          <h4>Appointment Request</h4>
                          <p><strong>Date:</strong> {formatDate(appointment.appointmentDate)}</p>
                          <p><strong>Time:</strong> {appointment.appointmentTime || 'N/A'}</p>
                          <p><strong>Patient:</strong> {appointment.patientName || 'N/A'}</p>
                          <p><strong>Doctor:</strong> {appointment.doctorName || 'N/A'}</p>
                          <p><strong>Reason:</strong> {appointment.reasonForVisit || appointment.reason || 'N/A'}</p>
                          <p><strong>Requested:</strong> {formatDate(appointment.createdAt)}</p>
                        </div>
                        <div className="approval-actions">
                          <button 
                            className="approve-button"
                            onClick={() => handleApproval('appointment', appointment._id, true)}
                          >
                            Approve
                          </button>
                          <button 
                            className="reject-button"
                            onClick={() => handleApproval('appointment', appointment._id, false)}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No pending appointments</p>
                  )}
                </div>
              </>
            )}

            {appointmentSubTab === 'approved' && (
              <>
                <h2>Approved Appointments</h2>
                <div className="approval-list">
                  {approvedAppointments.length > 0 ? (
                    approvedAppointments.map((appointment) => (
                      <div key={appointment._id} className="approval-item approved">
                        <div className="approval-content">
                          <h4>Approved Appointment</h4>
                          <p><strong>Date:</strong> {formatDate(appointment.appointmentDate)}</p>
                          <p><strong>Time:</strong> {appointment.appointmentTime || 'N/A'}</p>
                          <p><strong>Patient:</strong> {appointment.patientName || 'N/A'}</p>
                          <p><strong>Doctor:</strong> {appointment.doctorName || 'N/A'}</p>
                          <p><strong>Reason:</strong> {appointment.reasonForVisit || appointment.reason || 'N/A'}</p>
                          <p><strong>Requested:</strong> {formatDate(appointment.createdAt)}</p>
                          <p><strong>Approved:</strong> {formatDate(appointment.updatedAt)}</p>
                        </div>
                        <div className="approval-status">
                          <span className="status-badge approved">Approved</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No approved appointments</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="dashboard-section">
            <div className="sub-nav">
              <button 
                className={`sub-nav-button ${doctorSubTab === 'pending' ? 'active' : ''}`}
                onClick={() => setDoctorSubTab('pending')}
              >
                Pending ({pendingDoctors.length})
              </button>
              <button 
                className={`sub-nav-button ${doctorSubTab === 'approved' ? 'active' : ''}`}
                onClick={() => setDoctorSubTab('approved')}
              >
                Approved ({approvedDoctors.length})
              </button>
            </div>

            {doctorSubTab === 'pending' && (
              <>
                <h2>Pending Doctor Approvals</h2>
            <div className="approval-list">
              {pendingDoctors.length > 0 ? (
                pendingDoctors.map((doctor) => (
                  <div key={doctor._id} className="approval-item">
                    <div className="approval-content">
                      <h4>Dr. {doctor.firstName || 'N/A'} {doctor.lastName || 'N/A'}</h4>
                      
                      <div className="doctor-details-grid">
                        <div className="detail-section">
                          <h5>Contact Information</h5>
                          <p><strong>Email:</strong> {doctor.email || 'N/A'}</p>
                          <p><strong>Phone:</strong> {doctor.phoneNumber || doctor.phone || 'N/A'}</p>
                          <p><strong>Address:</strong> {
                            doctor.address && typeof doctor.address === 'object' 
                              ? `${doctor.address.street || ''}, ${doctor.address.city || ''}, ${doctor.address.district || ''}, ${doctor.address.province || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',') || 'N/A'
                              : doctor.address || 'N/A'
                          }</p>
                          <p><strong>Date of Birth:</strong> {doctor.dateOfBirth ? formatDate(doctor.dateOfBirth) : 'N/A'}</p>
                          <p><strong>Gender:</strong> {doctor.gender || 'N/A'}</p>
                        </div>

                        <div className="detail-section">
                          <h5>Professional Information</h5>
                          <p><strong>Specialization:</strong> {doctor.specialization || doctor.specialty || 'N/A'}</p>
                          <p><strong>Experience:</strong> {doctor.experienceYears || doctor.experience || 'N/A'} years</p>
                          <p><strong>NMC Number:</strong> {doctor.nmcNumber || doctor.licenseNumber || doctor.medicalLicense || 'N/A'}</p>
                          <p><strong>Qualification:</strong> {doctor.qualification || doctor.medicalDegree || doctor.degree || 'N/A'}</p>
                          <p><strong>Current Hospital:</strong> {doctor.currentHospital || doctor.university || doctor.medicalSchool || 'N/A'}</p>
                          <p><strong>NID Number:</strong> {doctor.nidNumber || 'N/A'}</p>
                        </div>

                        <div className="detail-section">
                          <h5>Additional Details</h5>
                          <p><strong>Hospital/Clinic:</strong> {doctor.currentHospital || doctor.hospital || doctor.clinic || doctor.workPlace || 'N/A'}</p>
                          <p><strong>Consultation Fee:</strong> {doctor.consultationFee ? `$${doctor.consultationFee}` : 'N/A'}</p>
                          <p><strong>Available Days:</strong> {
                            doctor.availableDays && Array.isArray(doctor.availableDays) 
                              ? doctor.availableDays.join(', ')
                              : doctor.availableDays || 'N/A'
                          }</p>
                          <p><strong>Available Time:</strong> {
                            doctor.availableTimeStart && doctor.availableTimeEnd 
                              ? `${doctor.availableTimeStart} - ${doctor.availableTimeEnd}`
                              : doctor.availableTime || 'N/A'
                          }</p>
                          <p><strong>Bio:</strong> {doctor.bio || doctor.description || 'N/A'}</p>
                          <p><strong>Status:</strong> <span className="status-pending">{doctor.status || 'Pending'}</span></p>
                        </div>

                        <div className="detail-section">
                          <h5>Documents & Certificates</h5>
                          <div className="documents-grid">
                            {doctor.profilePhoto && (
                              <div className="document-item">
                                <p><strong>Profile Photo:</strong></p>
                                <img 
                                  src={`${API_BASE_URL}/proxy-image/${doctor.profilePhoto}`} 
                                  alt="Profile" 
                                  className="document-image profile-image"
                                  onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${doctor.profilePhoto}`)}
                                  onError={(e) => {e.target.style.display = 'none'}}
                                />
                              </div>
                            )}
                            
                            {doctor.nmcCertificateImage && (
                              <div className="document-item">
                                <p><strong>NMC Certificate:</strong></p>
                                <img 
                                  src={`${API_BASE_URL}/proxy-image/${doctor.nmcCertificateImage}`} 
                                  alt="NMC Certificate" 
                                  className="document-image"
                                  onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${doctor.nmcCertificateImage}`)}
                                  onError={(e) => {e.target.style.display = 'none'}}
                                />
                              </div>
                            )}
                            
                            {doctor.degreeCertificateImage && (
                              <div className="document-item">
                                <p><strong>Degree Certificate:</strong></p>
                                <img 
                                  src={`${API_BASE_URL}/proxy-image/${doctor.degreeCertificateImage}`} 
                                  alt="Degree Certificate" 
                                  className="document-image"
                                  onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${doctor.degreeCertificateImage}`)}
                                  onError={(e) => {e.target.style.display = 'none'}}
                                />
                              </div>
                            )}
                            
                            {doctor.nidFrontImage && (
                              <div className="document-item">
                                <p><strong>NID Front:</strong></p>
                                <img 
                                  src={`${API_BASE_URL}/proxy-image/${doctor.nidFrontImage}`} 
                                  alt="NID Front" 
                                  className="document-image"
                                  onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${doctor.nidFrontImage}`)}
                                  onError={(e) => {e.target.style.display = 'none'}}
                                />
                              </div>
                            )}
                            
                            {doctor.nidBackImage && (
                              <div className="document-item">
                                <p><strong>NID Back:</strong></p>
                                <img 
                                  src={`${API_BASE_URL}/proxy-image/${doctor.nidBackImage}`} 
                                  alt="NID Back" 
                                  className="document-image"
                                  onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${doctor.nidBackImage}`)}
                                  onError={(e) => {e.target.style.display = 'none'}}
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="document-status">
                            <p><strong>Upload Status:</strong></p>
                            <ul>
                              <li>Profile Photo: {doctor.profilePhoto ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                              <li>NMC Certificate: {doctor.nmcCertificateImage ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                              <li>Degree Certificate: {doctor.degreeCertificateImage ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                              <li>NID Front: {doctor.nidFrontImage ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                              <li>NID Back: {doctor.nidBackImage ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                            </ul>
                          </div>
                        </div>

                        <div className="detail-section">
                          <h5>Registration Details</h5>
                          <p><strong>Registered:</strong> {formatDate(doctor.createdAt || doctor.registrationDate)}</p>
                          <p><strong>Last Updated:</strong> {formatDate(doctor.updatedAt)}</p>
                          <p><strong>Status:</strong> <span className="status-pending">Pending Approval</span></p>
                          <p><strong>Application ID:</strong> {doctor._id}</p>
                        </div>
                      </div>
                    </div>
                    <div className="approval-actions">
                      <button 
                        className="approve-button"
                        onClick={() => {
                          console.log('Approve button clicked for doctor:', doctor._id);
                          handleApproval('doctor', doctor._id, true);
                        }}
                        disabled={processingApproval === `doctor-${doctor._id}-approve`}
                      >
                        {processingApproval === `doctor-${doctor._id}-approve` ? 'Processing...' : 'Approve Doctor'}
                      </button>
                      <button 
                        className="reject-button"
                        onClick={() => {
                          console.log('Reject button clicked for doctor:', doctor._id);
                          handleApproval('doctor', doctor._id, false);
                        }}
                        disabled={processingApproval === `doctor-${doctor._id}-reject`}
                      >
                        {processingApproval === `doctor-${doctor._id}-reject` ? 'Processing...' : 'Reject Application'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No pending doctor approvals</p>
              )}
            </div>
              </>
            )}

            {doctorSubTab === 'approved' && (
              <>
                <h2>Approved Doctors</h2>
                <div className="approval-list">
                  {approvedDoctors.length > 0 ? (
                    approvedDoctors.map((doctor) => (
                      <div key={doctor._id} className="approval-item approved">
                        <div className="approval-content">
                          <h4>Dr. {doctor.firstName || 'N/A'} {doctor.lastName || 'N/A'}</h4>
                          
                          <div className="doctor-details-grid">
                            <div className="detail-section">
                              <h5>Contact Information</h5>
                              <p><strong>Email:</strong> {doctor.email || 'N/A'}</p>
                              <p><strong>Phone:</strong> {doctor.phoneNumber || doctor.phone || 'N/A'}</p>
                              <p><strong>Address:</strong> {
                                doctor.address && typeof doctor.address === 'object' 
                                  ? `${doctor.address.street || ''}, ${doctor.address.city || ''}, ${doctor.address.district || ''}, ${doctor.address.province || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',') || 'N/A'
                                  : doctor.address || 'N/A'
                              }</p>
                              <p><strong>Date of Birth:</strong> {doctor.dateOfBirth ? formatDate(doctor.dateOfBirth) : 'N/A'}</p>
                              <p><strong>Gender:</strong> {doctor.gender || 'N/A'}</p>
                            </div>

                            <div className="detail-section">
                              <h5>Professional Information</h5>
                              <p><strong>Specialization:</strong> {doctor.specialization || doctor.specialty || 'N/A'}</p>
                              <p><strong>Experience:</strong> {doctor.experienceYears || doctor.experience || 'N/A'} years</p>
                              <p><strong>NMC Number:</strong> {doctor.nmcNumber || doctor.licenseNumber || doctor.medicalLicense || 'N/A'}</p>
                              <p><strong>Qualification:</strong> {doctor.qualification || doctor.medicalDegree || doctor.degree || 'N/A'}</p>
                              <p><strong>Current Hospital:</strong> {doctor.currentHospital || doctor.university || doctor.medicalSchool || 'N/A'}</p>
                              <p><strong>NID Number:</strong> {doctor.nidNumber || 'N/A'}</p>
                            </div>

                            <div className="detail-section">
                              <h5>Additional Details</h5>
                              <p><strong>Hospital/Clinic:</strong> {doctor.currentHospital || doctor.hospital || doctor.clinic || doctor.workPlace || 'N/A'}</p>
                              <p><strong>Consultation Fee:</strong> {doctor.consultationFee ? `${doctor.consultationFee}` : 'N/A'}</p>
                              <p><strong>Available Days:</strong> {
                                doctor.availableDays && Array.isArray(doctor.availableDays) 
                                  ? doctor.availableDays.join(', ')
                                  : doctor.availableDays || 'N/A'
                              }</p>
                              <p><strong>Available Time:</strong> {
                                doctor.availableTimeStart && doctor.availableTimeEnd 
                                  ? `${doctor.availableTimeStart} - ${doctor.availableTimeEnd}`
                                  : doctor.availableTime || 'N/A'
                              }</p>
                              <p><strong>Bio:</strong> {doctor.bio || doctor.description || 'N/A'}</p>
                              <p><strong>Status:</strong> <span className="status-approved">Approved</span></p>
                            </div>

                            <div className="detail-section">
                              <h5>Documents & Certificates</h5>
                              <div className="documents-grid">
                                {doctor.profilePhoto && (
                                  <div className="document-item">
                                    <p><strong>Profile Photo:</strong></p>
                                    <img 
                                      src={`${API_BASE_URL}/proxy-image/${doctor.profilePhoto}`} 
                                      alt="Profile" 
                                      className="document-image profile-image"
                                      onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${doctor.profilePhoto}`)}
                                      onError={(e) => {e.target.style.display = 'none'}}
                                    />
                                  </div>
                                )}
                                
                                {doctor.nmcCertificateImage && (
                                  <div className="document-item">
                                    <p><strong>NMC Certificate:</strong></p>
                                    <img 
                                      src={`${API_BASE_URL}/proxy-image/${doctor.nmcCertificateImage}`} 
                                      alt="NMC Certificate" 
                                      className="document-image"
                                      onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${doctor.nmcCertificateImage}`)}
                                      onError={(e) => {e.target.style.display = 'none'}}
                                    />
                                  </div>
                                )}
                                
                                {doctor.degreeCertificateImage && (
                                  <div className="document-item">
                                    <p><strong>Degree Certificate:</strong></p>
                                    <img 
                                      src={`${API_BASE_URL}/proxy-image/${doctor.degreeCertificateImage}`} 
                                      alt="Degree Certificate" 
                                      className="document-image"
                                      onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${doctor.degreeCertificateImage}`)}
                                      onError={(e) => {e.target.style.display = 'none'}}
                                    />
                                  </div>
                                )}
                                
                                {doctor.nidFrontImage && (
                                  <div className="document-item">
                                    <p><strong>NID Front:</strong></p>
                                    <img 
                                      src={`${API_BASE_URL}/proxy-image/${doctor.nidFrontImage}`} 
                                      alt="NID Front" 
                                      className="document-image"
                                      onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${doctor.nidFrontImage}`)}
                                      onError={(e) => {e.target.style.display = 'none'}}
                                    />
                                  </div>
                                )}
                                
                                {doctor.nidBackImage && (
                                  <div className="document-item">
                                    <p><strong>NID Back:</strong></p>
                                    <img 
                                      src={`${API_BASE_URL}/proxy-image/${doctor.nidBackImage}`} 
                                      alt="NID Back" 
                                      className="document-image"
                                      onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${doctor.nidBackImage}`)}
                                      onError={(e) => {e.target.style.display = 'none'}}
                                    />
                                  </div>
                                )}
                              </div>
                              
                              <div className="document-status">
                                <p><strong>Upload Status:</strong></p>
                                <ul>
                                  <li>Profile Photo: {doctor.profilePhoto ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                                  <li>NMC Certificate: {doctor.nmcCertificateImage ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                                  <li>Degree Certificate: {doctor.degreeCertificateImage ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                                  <li>NID Front: {doctor.nidFrontImage ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                                  <li>NID Back: {doctor.nidBackImage ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                                </ul>
                              </div>
                            </div>

                            <div className="detail-section">
                              <h5>Approval Details</h5>
                              <p><strong>Registered:</strong> {formatDate(doctor.createdAt || doctor.registrationDate)}</p>
                              <p><strong>Approved:</strong> {formatDate(doctor.updatedAt)}</p>
                              <p><strong>Status:</strong> <span className="status-approved">Approved</span></p>
                              <p><strong>Approved By:</strong> {doctor.approvedBy || 'Admin'}</p>
                              <p><strong>Application ID:</strong> {doctor._id}</p>
                            </div>
                          </div>
                        </div>
                        <div className="approval-status">
                          <span className="status-badge approved">✅ Approved</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No approved doctors</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="dashboard-section">
            <div className="sub-nav">
              <button 
                className={`sub-nav-button ${patientSubTab === 'pending' ? 'active' : ''}`}
                onClick={() => setPatientSubTab('pending')}
              >
                Pending ({pendingPatients.length})
              </button>
              <button 
                className={`sub-nav-button ${patientSubTab === 'approved' ? 'active' : ''}`}
                onClick={() => setPatientSubTab('approved')}
              >
                Approved ({approvedPatients.length})
              </button>
            </div>

            {patientSubTab === 'pending' && (
              <>
                <h2>Pending Patient Approvals</h2>
            <div className="approval-list">
              {pendingPatients.length > 0 ? (
                pendingPatients.map((patient) => (
                  <div key={patient._id} className="approval-item">
                    <div className="approval-content">
                      <h4>{patient.firstName} {patient.lastName}</h4>
                      
                      <div className="doctor-details-grid">
                        <div className="detail-section">
                          <h5>Contact Information</h5>
                          <p><strong>Email:</strong> {patient.email || 'N/A'}</p>
                          <p><strong>Phone:</strong> {patient.phone || patient.phoneNumber || 'N/A'}</p>
                          <p><strong>Address:</strong> {
                            patient.address && typeof patient.address === 'object' 
                              ? `${patient.address.street || ''}, ${patient.address.city || ''}, ${patient.address.district || ''}, ${patient.address.province || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',') || 'N/A'
                              : patient.address || 'N/A'
                          }</p>
                          <p><strong>Date of Birth:</strong> {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'N/A'}</p>
                          <p><strong>Gender:</strong> {patient.gender || 'N/A'}</p>
                          <p><strong>Blood Group:</strong> {patient.bloodGroup || 'N/A'}</p>
                        </div>

                        <div className="detail-section">
                          <h5>Medical Information</h5>
                          <p><strong>Medical Conditions:</strong> {patient.medicalConditions || 'None'}</p>
                          <p><strong>Allergies:</strong> {patient.allergies || 'None'}</p>
                          <p><strong>NID Number:</strong> {patient.nidNumber || 'N/A'}</p>
                          <p><strong>Emergency Contact:</strong> {
                            patient.emergencyContact && typeof patient.emergencyContact === 'object'
                              ? `${patient.emergencyContact.name || 'N/A'} (${patient.emergencyContact.relation || 'N/A'}) - ${patient.emergencyContact.phone || 'N/A'}`
                              : patient.emergencyContact || 'N/A'
                          }</p>
                        </div>

                        <div className="detail-section">
                          <h5>Documents & Photos</h5>
                          <div className="documents-grid">
                            {patient.profilePhoto && (
                              <div className="document-item">
                                <p><strong>Profile Photo:</strong></p>
                                <img 
                                  src={`${API_BASE_URL}/proxy-image/${patient.profilePhoto}`} 
                                  alt="Profile" 
                                  className="document-image profile-image"
                                  onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${patient.profilePhoto}`)}
                                  onError={(e) => {e.target.style.display = 'none'}}
                                />
                              </div>
                            )}
                            
                            {patient.nidFrontImage && (
                              <div className="document-item">
                                <p><strong>NID Front:</strong></p>
                                <img 
                                  src={`${API_BASE_URL}/proxy-image/${patient.nidFrontImage}`} 
                                  alt="NID Front" 
                                  className="document-image"
                                  onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${patient.nidFrontImage}`)}
                                  onError={(e) => {e.target.style.display = 'none'}}
                                />
                              </div>
                            )}
                            
                            {patient.nidBackImage && (
                              <div className="document-item">
                                <p><strong>NID Back:</strong></p>
                                <img 
                                  src={`${API_BASE_URL}/proxy-image/${patient.nidBackImage}`} 
                                  alt="NID Back" 
                                  className="document-image"
                                  onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${patient.nidBackImage}`)}
                                  onError={(e) => {e.target.style.display = 'none'}}
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="document-status">
                            <p><strong>Upload Status:</strong></p>
                            <ul>
                              <li>Profile Photo: {patient.profilePhoto ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                              <li>NID Front: {patient.nidFrontImage ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                              <li>NID Back: {patient.nidBackImage ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                            </ul>
                          </div>
                        </div>

                        <div className="detail-section">
                          <h5>Registration Details</h5>
                          <p><strong>Registered:</strong> {formatDate(patient.createdAt || patient.registrationDate)}</p>
                          <p><strong>Last Updated:</strong> {formatDate(patient.updatedAt)}</p>
                          <p><strong>Status:</strong> <span className="status-pending">Pending Approval</span></p>
                          <p><strong>Application ID:</strong> {patient._id}</p>
                        </div>
                      </div>
                    </div>
                    <div className="approval-actions">
                      <button 
                        className="approve-button"
                        onClick={() => {
                          console.log('Approve button clicked for patient:', patient._id);
                          handleApproval('patient', patient._id, true);
                        }}
                        disabled={processingApproval === `patient-${patient._id}-approve`}
                      >
                        {processingApproval === `patient-${patient._id}-approve` ? 'Processing...' : 'Approve Patient'}
                      </button>
                      <button 
                        className="reject-button"
                        onClick={() => {
                          console.log('Reject button clicked for patient:', patient._id);
                          handleApproval('patient', patient._id, false);
                        }}
                        disabled={processingApproval === `patient-${patient._id}-reject`}
                      >
                        {processingApproval === `patient-${patient._id}-reject` ? 'Processing...' : 'Reject Application'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No pending patient approvals</p>
              )}
            </div>
              </>
            )}

            {patientSubTab === 'approved' && (
              <>
                <h2>Approved Patients</h2>
                <div className="approval-list">
                  {approvedPatients.length > 0 ? (
                    approvedPatients.map((patient) => (
                      <div key={patient._id} className="approval-item approved">
                        <div className="approval-content">
                          <h4>{patient.firstName} {patient.lastName}</h4>
                          
                          <div className="doctor-details-grid">
                            <div className="detail-section">
                              <h5>Contact Information</h5>
                              <p><strong>Email:</strong> {patient.email || 'N/A'}</p>
                              <p><strong>Phone:</strong> {patient.phone || patient.phoneNumber || 'N/A'}</p>
                              <p><strong>Address:</strong> {
                                patient.address && typeof patient.address === 'object' 
                                  ? `${patient.address.street || ''}, ${patient.address.city || ''}, ${patient.address.district || ''}, ${patient.address.province || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',') || 'N/A'
                                  : patient.address || 'N/A'
                              }</p>
                              <p><strong>Date of Birth:</strong> {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'N/A'}</p>
                              <p><strong>Gender:</strong> {patient.gender || 'N/A'}</p>
                              <p><strong>Blood Group:</strong> {patient.bloodGroup || 'N/A'}</p>
                            </div>

                            <div className="detail-section">
                              <h5>Medical Information</h5>
                              <p><strong>Medical Conditions:</strong> {patient.medicalConditions || 'None'}</p>
                              <p><strong>Allergies:</strong> {patient.allergies || 'None'}</p>
                              <p><strong>NID Number:</strong> {patient.nidNumber || 'N/A'}</p>
                              <p><strong>Emergency Contact:</strong> {
                                patient.emergencyContact && typeof patient.emergencyContact === 'object'
                                  ? `${patient.emergencyContact.name || 'N/A'} (${patient.emergencyContact.relation || 'N/A'}) - ${patient.emergencyContact.phone || 'N/A'}`
                                  : patient.emergencyContact || 'N/A'
                              }</p>
                            </div>

                            <div className="detail-section">
                              <h5>Documents & Photos</h5>
                              <div className="documents-grid">
                                {patient.profilePhoto && (
                                  <div className="document-item">
                                    <p><strong>Profile Photo:</strong></p>
                                    <img 
                                      src={`${API_BASE_URL}/proxy-image/${patient.profilePhoto}`} 
                                      alt="Profile" 
                                      className="document-image profile-image"
                                      onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${patient.profilePhoto}`)}
                                      onError={(e) => {e.target.style.display = 'none'}}
                                    />
                                  </div>
                                )}
                                
                                {patient.nidFrontImage && (
                                  <div className="document-item">
                                    <p><strong>NID Front:</strong></p>
                                    <img 
                                      src={`${API_BASE_URL}/proxy-image/${patient.nidFrontImage}`} 
                                      alt="NID Front" 
                                      className="document-image"
                                      onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${patient.nidFrontImage}`)}
                                      onError={(e) => {e.target.style.display = 'none'}}
                                    />
                                  </div>
                                )}
                                
                                {patient.nidBackImage && (
                                  <div className="document-item">
                                    <p><strong>NID Back:</strong></p>
                                    <img 
                                      src={`${API_BASE_URL}/proxy-image/${patient.nidBackImage}`} 
                                      alt="NID Back" 
                                      className="document-image"
                                      onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${patient.nidBackImage}`)}
                                      onError={(e) => {e.target.style.display = 'none'}}
                                    />
                                  </div>
                                )}
                              </div>
                              
                              <div className="document-status">
                                <p><strong>Upload Status:</strong></p>
                                <ul>
                                  <li>Profile Photo: {patient.profilePhoto ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                                  <li>NID Front: {patient.nidFrontImage ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                                  <li>NID Back: {patient.nidBackImage ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                                </ul>
                              </div>
                            </div>

                            <div className="detail-section">
                              <h5>Approval Details</h5>
                              <p><strong>Registered:</strong> {formatDate(patient.createdAt || patient.registrationDate)}</p>
                              <p><strong>Approved:</strong> {formatDate(patient.updatedAt)}</p>
                              <p><strong>Status:</strong> <span className="status-approved">Approved</span></p>
                              <p><strong>Approved By:</strong> {patient.approvedBy || 'Admin'}</p>
                              <p><strong>Application ID:</strong> {patient._id}</p>
                            </div>
                          </div>
                        </div>
                        <div className="approval-status">
                          <span className="status-badge approved">✅ Approved</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No approved patients</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        {activeTab === 'hospitals' && (
          <div className="dashboard-section">
          <div className="sub-nav">
            <button
              className={`sub-nav-button ${hospitalSubTab === 'pending' ? 'active' : ''}`}
              onClick={() => setHospitalSubTab('pending')}
            >
              Pending ({pendingHospitals.length})
            </button>
            <button
              className={`sub-nav-button ${hospitalSubTab === 'approved' ? 'active' : ''}`}
              onClick={() => setHospitalSubTab('approved')}
            >
              Approved ({approvedHospitals.length})
            </button>
          </div>

          {hospitalSubTab === 'pending' && (
            <>
              <h2>Pending Hospital Partnership Requests</h2>
              <div className="approval-list">
                {pendingHospitals.length > 0 ? (
                  pendingHospitals.map((hospital) => (
                    <div key={hospital._id} className="approval-item">
                      <div className="approval-content">
                        <h4>{hospital.hospitalName || 'N/A'}</h4>
                        <div className="doctor-details-grid">
                          <div className="detail-section">
                            <h5>Hospital Information</h5>
                            <p><strong>Facility Category:</strong> {hospital.facilityCategory || 'N/A'}</p>
                            <p><strong>DOH/VAT License No:</strong> {hospital.dohsLicenseNumber || 'N/A'}</p>
                            <p><strong>PAN/VAT Number:</strong> {hospital.panVatNumber || 'N/A'}</p>
                            <p><strong>Estimated Doctors:</strong> {hospital.estimatedDoctors || 'N/A'}</p>
                            <p><strong>Province:</strong> {hospital.province || 'N/A'}</p>
                            <p><strong>District:</strong> {hospital.district || 'N/A'}</p>
                          </div>
                          <div className="detail-section">
                            <h5>Contact Information</h5>
                            <p><strong>Hospital Phone:</strong> {hospital.hospitalPhone || 'N/A'}</p>
                            <p><strong>Official Email:</strong> {hospital.officialEmail || 'N/A'}</p>
                            <p><strong>Admin Name:</strong> {hospital.adminName || 'N/A'}</p>
                            <p><strong>Admin Phone:</strong> {hospital.adminPhone || 'N/A'}</p>
                          </div>
                          <div className="detail-section">
                            <h5>Documents</h5>
                            <div className="documents-grid">
                              {hospital.operatingLicensePath && (
                                <div className="document-item">
                                  <p><strong>Operating License:</strong></p>
                                  <img
                                    src={`${API_BASE_URL}/proxy-image/${hospital.operatingLicensePath}`}
                                    alt="Operating License"
                                    className="document-image"
                                    onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${hospital.operatingLicensePath}`)}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                </div>
                              )}
                              {hospital.companyRegCertPath && (
                                <div className="document-item">
                                  <p><strong>Company Reg. Certificate:</strong></p>
                                  <img
                                    src={`${API_BASE_URL}/proxy-image/${hospital.companyRegCertPath}`}
                                    alt="Company Reg Certificate"
                                    className="document-image"
                                    onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${hospital.companyRegCertPath}`)}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                </div>
                              )}
                              {hospital.taxClearancePath && (
                                <div className="document-item">
                                  <p><strong>Tax Clearance:</strong></p>
                                  <img
                                    src={`${API_BASE_URL}/proxy-image/${hospital.taxClearancePath}`}
                                    alt="Tax Clearance"
                                    className="document-image"
                                    onClick={() => setSelectedImage(`${API_BASE_URL}/proxy-image/${hospital.taxClearancePath}`)}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="document-status">
                              <p><strong>Upload Status:</strong></p>
                              <ul>
                                <li>Operating License: {hospital.operatingLicensePath ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                                <li>Company Reg. Certificate: {hospital.companyRegCertPath ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                                <li>Tax Clearance: {hospital.taxClearancePath ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                              </ul>
                            </div>
                          </div>
                          <div className="detail-section">
                            <h5>Application Details</h5>
                            <p><strong>Submitted:</strong> {formatDate(hospital.createdAt)}</p>
                            <p><strong>Status:</strong> <span className="status-pending">{hospital.status || 'Under Review'}</span></p>
                            <p><strong>Application ID:</strong> {hospital._id}</p>
                          </div>
                        </div>
                      </div>
                      <div className="approval-actions">
                        <button
                          className="approve-button"
                          onClick={() => handleApproval('hospital', hospital._id, true)}
                          disabled={processingApproval === `hospital-${hospital._id}-approve`}
                        >
                          {processingApproval === `hospital-${hospital._id}-approve` ? 'Processing...' : 'Approve Hospital'}
                        </button>
                        <button
                          className="reject-button"
                          onClick={() => handleApproval('hospital', hospital._id, false)}
                          disabled={processingApproval === `hospital-${hospital._id}-reject`}
                        >
                          {processingApproval === `hospital-${hospital._id}-reject` ? 'Processing...' : 'Reject Application'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No pending hospital partnership requests</p>
                )}
              </div>
            </>
          )}

          {hospitalSubTab === 'approved' && (
            <>
              <h2>Approved Hospital Partners</h2>
              <div className="approval-list">
                {approvedHospitals.length > 0 ? (
                  approvedHospitals.map((hospital) => (
                    <div key={hospital._id} className="approval-item approved">
                      <div className="approval-content">
                        <h4>{hospital.hospitalName || 'N/A'}</h4>
                        <div className="doctor-details-grid">
                          <div className="detail-section">
                            <h5>Hospital Information</h5>
                            <p><strong>Facility Category:</strong> {hospital.facilityCategory || 'N/A'}</p>
                            <p><strong>DOH/VAT License No:</strong> {hospital.dohsLicenseNumber || 'N/A'}</p>
                            <p><strong>PAN/VAT Number:</strong> {hospital.panVatNumber || 'N/A'}</p>
                            <p><strong>Estimated Doctors:</strong> {hospital.estimatedDoctors || 'N/A'}</p>
                            <p><strong>Province:</strong> {hospital.province || 'N/A'}</p>
                            <p><strong>District:</strong> {hospital.district || 'N/A'}</p>
                          </div>
                          <div className="detail-section">
                            <h5>Contact Information</h5>
                            <p><strong>Hospital Phone:</strong> {hospital.hospitalPhone || 'N/A'}</p>
                            <p><strong>Official Email:</strong> {hospital.officialEmail || 'N/A'}</p>
                            <p><strong>Admin Name:</strong> {hospital.adminName || 'N/A'}</p>
                            <p><strong>Admin Phone:</strong> {hospital.adminPhone || 'N/A'}</p>
                          </div>
                          <div className="detail-section">
                            <h5>Approval Details</h5>
                            <p><strong>Submitted:</strong> {formatDate(hospital.createdAt)}</p>
                            <p><strong>Approved:</strong> {formatDate(hospital.updatedAt)}</p>
                            <p><strong>Status:</strong> <span className="status-approved">Approved</span></p>
                            <p><strong>Application ID:</strong> {hospital._id}</p>
                          </div>
                        </div>
                      </div>
                      <div className="approval-status">
                        <span className="status-badge approved">✅ Approved</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No approved hospital partners</p>
                )}
              </div>
            </>
          )}
        </div>
        )}
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Document Preview" />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
