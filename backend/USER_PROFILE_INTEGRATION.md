# User Profile Status Integration Guide

## Problem Solved
Your user-side application was showing "Not Registered" even though profiles exist in the database with approved status. This integration guide provides the solution.

## Available Endpoints

### 1. Check Profile Status by Email
```
GET /api/user/profile-status/{email}
```

**Example:**
```
GET /api/user/profile-status/sthapitshreya@gmail.com
```

**Response:**
```json
{
  "registered": true,
  "type": "doctor",
  "status": "approved",
  "isApproved": true,
  "profile": {
    "id": "6979d954150b5c25123dd392",
    "firstName": "Shreya",
    "lastName": "Sthapit",
    "email": "sthapitshreya@gmail.com",
    "specialization": "Cardiologist",
    "profilePhoto": "uploads/profiles/photo.jpg",
    "createdAt": "2026-01-28T09:54:32.112Z",
    "updatedAt": "2026-02-01T10:23:11.000Z"
  }
}
```

### 2. Check Registration Status by User ID
```
GET /api/user/registration-status/{userId}
```

**Example:**
```
GET /api/user/registration-status/6979d90c150b5c25123dd390
```

**Response:**
```json
{
  "registered": true,
  "type": "patient",
  "status": "approved",
  "isApproved": true,
  "registrationComplete": true,
  "message": "Your profile has been approved!",
  "profile": {
    "id": "6979ea5c491ea8828c71e42e",
    "firstName": "Shreya",
    "lastName": "Sthapit",
    "email": "shreyasthapit224@gmail.com",
    "profilePhoto": "uploads/profiles/photo.jpg"
  }
}
```

## Status Values

| Status | Description | User Experience |
|--------|-------------|-----------------|
| `approved` | Profile approved by admin | Show verified badge, full access |
| `pending` | Profile under review | Show "under review" message |
| `not_registered` | No profile found | Show registration prompt |

## Frontend Integration

### React Example

```javascript
import React, { useState, useEffect } from 'react';

const UserProfile = ({ userEmail }) => {
  const [profileStatus, setProfileStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProfileStatus();
  }, [userEmail]);

  const checkProfileStatus = async () => {
    try {
      const response = await fetch(`http://localhost:9000/api/user/profile-status/${userEmail}`);
      const data = await response.json();
      setProfileStatus(data);
    } catch (error) {
      console.error('Error checking profile status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profileStatus.registered) {
    return (
      <div className="registration-prompt">
        <h3>Complete Your Registration</h3>
        <p>You haven't completed your registration yet. Please complete your registration to view your profile.</p>
        <button onClick={() => window.location.href = '/register'}>
          Complete Registration
        </button>
      </div>
    );
  }

  if (profileStatus.status === 'pending') {
    return (
      <div className="profile-pending">
        <h3>Profile Under Review</h3>
        <p>Your profile is currently being reviewed by our admin team. You'll be notified once it's approved.</p>
        <div className="profile-info">
          <h4>{profileStatus.profile.firstName} {profileStatus.profile.lastName}</h4>
          <p>Type: {profileStatus.type}</p>
          <p>Status: <span className="status-pending">Under Review</span></p>
        </div>
      </div>
    );
  }

  if (profileStatus.status === 'approved') {
    return (
      <div className="profile-approved">
        <h3>My Profile</h3>
        <div className="profile-header">
          <div className="profile-avatar">
            {profileStatus.profile.profilePhoto ? (
              <img src={`http://localhost:9000/proxy-image/${profileStatus.profile.profilePhoto}`} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {profileStatus.profile.firstName?.[0]}{profileStatus.profile.lastName?.[0]}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h4>{profileStatus.profile.firstName} {profileStatus.profile.lastName}</h4>
            <p>{profileStatus.profile.email}</p>
            {profileStatus.type === 'doctor' && (
              <p>Specialization: {profileStatus.profile.specialization}</p>
            )}
            <span className="status-badge approved">✅ Verified</span>
          </div>
        </div>
        {/* Rest of your profile content */}
      </div>
    );
  }

  return <div>Unknown status</div>;
};

export default UserProfile;
```

### CSS Styles

```css
.registration-prompt {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin: 20px 0;
}

.profile-pending {
  background: #e2e3e5;
  border: 1px solid #d6d8db;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.profile-approved {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.status-badge.approved {
  background: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  color: #856404;
  font-weight: 500;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.profile-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #6c757d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}
```

## Testing Your Integration

### Test with Known Approved Profiles

1. **Doctor Profile:**
   - Email: `sthapitshreya@gmail.com`
   - Expected: `registered: true, status: "approved", type: "doctor"`

2. **Patient Profile:**
   - Email: `shreyasthapit224@gmail.com`
   - Expected: `registered: true, status: "approved", type: "patient"`

3. **Non-existent Profile:**
   - Email: `test@example.com`
   - Expected: `registered: false, status: "not_registered"`

### Test Commands

```bash
# Test approved doctor
curl http://localhost:9000/api/user/profile-status/sthapitshreya@gmail.com

# Test approved patient
curl http://localhost:9000/api/user/profile-status/shreyasthapit224@gmail.com

# Test non-existent user
curl http://localhost:9000/api/user/profile-status/nonexistent@example.com
```

## Implementation Steps

1. **Replace your current profile check** with calls to these endpoints
2. **Update your frontend logic** to handle the three states: approved, pending, not_registered
3. **Test with the known approved profiles** listed above
4. **Update your UI** to show appropriate messages for each status

## Current Database Status

- ✅ **2 Approved Doctors** (including Dr. Shreya Sthapit)
- ✅ **4 Approved Patients** (including Shreya Sthapit)
- ✅ All profiles have `status: "approved"` and `isApproved: true`

Your profiles are definitely registered and approved! The issue was just that your user-side application wasn't checking the right place for the status information.