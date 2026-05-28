# Admin Approval System Documentation

## Overview
The admin approval system allows administrators to approve or reject doctor and patient registrations. When an admin makes a decision, both the `isApproved` and `status` fields are updated in the database.

## Database Fields Updated

### For Both Doctors and Patients:
- `isApproved`: Boolean field (true/false)
- `status`: String field ("approved"/"rejected")
- `updatedAt`: Timestamp of the approval/rejection
- `approvedBy`: Admin ID who made the decision

## API Endpoints

### Doctor Approval
```
PUT /api/admin/doctor/:id/approval
```
**Request Body:**
```json
{
  "approved": true  // or false for rejection
}
```

**Database Update:**
```javascript
{
  isApproved: approved,           // true or false
  status: approved ? 'approved' : 'rejected',
  updatedAt: new Date(),
  approvedBy: req.admin.id
}
```

### Patient Approval
```
PUT /api/admin/patient/:id/approval
```
**Request Body:**
```json
{
  "approved": true  // or false for rejection
}
```

**Database Update:**
```javascript
{
  isApproved: approved,           // true or false
  status: approved ? 'approved' : 'rejected',
  updatedAt: new Date(),
  approvedBy: req.admin.id
}
```

## Status Values

| Action | isApproved | status |
|--------|------------|--------|
| Pending | undefined | "pending" |
| Approved | true | "approved" |
| Rejected | false | "rejected" |

## User-Side Integration

### For User Applications:
The user-side application can check the profile verification status using either field:

```javascript
// Check if profile is approved
if (user.isApproved === true && user.status === 'approved') {
  // Profile is verified and approved
  showVerifiedBadge();
}

// Check if profile is rejected
if (user.isApproved === false && user.status === 'rejected') {
  // Profile was rejected
  showRejectionMessage();
}

// Check if profile is pending
if (user.isApproved === undefined || user.status === 'pending') {
  // Profile is still pending approval
  showPendingMessage();
}
```

### Recommended User Experience:
1. **Pending**: Show "Profile under review" message
2. **Approved**: Show verification badge/checkmark
3. **Rejected**: Show rejection message with option to resubmit

## Admin Dashboard Features

### Doctor Approval Section:
- Complete doctor information display
- Professional credentials verification
- Document image viewing (NMC Certificate, Degree, NID)
- Approve/Reject buttons

### Patient Approval Section:
- Complete patient information display
- Medical information review
- Document image viewing (Profile Photo, NID)
- Approve/Reject buttons

## Testing

### Test Scripts Available:
- `test-approval-system.js` - Tests approval functionality
- `test-rejection-system.js` - Tests rejection functionality
- `test-complete-system.js` - Full system test

### Test Results:
✅ Doctor approval/rejection working
✅ Patient approval/rejection working
✅ Database fields updated correctly
✅ Image proxy system functional
✅ Admin authentication working

## Security Features

- JWT token authentication required
- Admin ID logged for audit trail
- Timestamp tracking for all decisions
- Secure image proxy for document viewing

## Usage Example

```javascript
// Admin approves a doctor
const response = await fetch('/api/admin/doctor/123/approval', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ approved: true })
});

// Result in database:
// {
//   _id: "123",
//   firstName: "John",
//   lastName: "Doe",
//   isApproved: true,
//   status: "approved",
//   updatedAt: "2026-02-01T10:41:21.000Z",
//   approvedBy: "admin_id_here"
// }
```

## Integration Notes

1. **User Profile Status**: User applications should check the `status` field for the most readable status
2. **Backward Compatibility**: The `isApproved` field is maintained for existing integrations
3. **Audit Trail**: The `approvedBy` and `updatedAt` fields provide complete audit information
4. **Real-time Updates**: Consider implementing WebSocket notifications for real-time status updates to users