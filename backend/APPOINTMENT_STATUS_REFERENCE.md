# Appointment Status Reference Guide

## Database Appointment Structure

The appointments in the database have the following structure:

```javascript
{
  "_id": "ObjectId",
  "patientId": "ObjectId",
  "doctorId": "ObjectId",
  "patientName": "string",
  "patientPhone": "string",
  "patientEmail": "string",
  "doctorName": "string",
  "doctorSpecialization": "string",
  "appointmentDate": "Date",
  "appointmentTime": "string",
  "appointmentType": "string",
  "reasonForVisit": "string",        // ⚠️ Note: NOT "reason"
  "symptoms": "string",
  "status": "string",                // ⚠️ Can be: pending-admin, pending, requested, approved, rejected
  "adminApproved": "boolean",
  "doctorConfirmed": "boolean",
  "consultationFee": "number",
  "paymentMethod": "string",
  "paymentStatus": "string",
  "patientNotes": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Status Values

### Pending Statuses (Admin Approval Needed)
- `pending-admin` - Appointment awaiting admin approval (most common)
- `pending` - Generic pending status
- `requested` - Appointment was requested
- `null` or undefined - No status set

### Final Statuses
- `approved` - Admin has approved the appointment
- `rejected` - Admin has rejected the appointment

## API Endpoints

### Get Pending Appointments (Awaiting Admin Approval)
```
GET /api/admin/pending-appointments
Authorization: Bearer {token}
```

Returns all appointments with status: `pending-admin`, `pending`, `requested`, or no status.

### Get Approved Appointments
```
GET /api/admin/approved-appointments
Authorization: Bearer {token}
```

Returns all appointments with status: `approved`.

### Update Appointment Status
```
PUT /api/admin/appointment/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "approved" | "rejected"
}
```

## Frontend Field Mapping

The frontend component handles both field name variations:

| Database Field | Frontend Fallback | Display |
|---|---|---|
| `reasonForVisit` | `reason` | Reason for Visit |
| `appointmentDate` | - | Appointment Date |
| `appointmentTime` | - | Appointment Time |
| `patientName` | - | Patient Name |
| `doctorName` | - | Doctor Name |

## Common Issues & Solutions

### Issue: Appointments not showing in admin dashboard

**Cause:** Status value mismatch

**Solution:** Ensure the appointment status is one of:
- `pending-admin`
- `pending`
- `requested`
- `null` or undefined

### Issue: Reason field shows "N/A"

**Cause:** Database uses `reasonForVisit` but code looks for `reason`

**Solution:** Frontend now checks both:
```javascript
{appointment.reasonForVisit || appointment.reason || 'N/A'}
```

### Issue: Appointment count in stats doesn't match

**Cause:** Stats query not including all pending statuses

**Solution:** Stats endpoint now queries:
```javascript
$or: [
  { status: { $in: ['pending', 'requested', 'pending-admin'] } },
  { status: { $exists: false } },
  { status: null }
]
```

## Testing

### Check Appointment in Database
```bash
node backend/test-appointment-raw.js
```

### Test API Endpoints
```bash
bash backend/test-appointment-curl.sh
```

### Check All Database Content
```bash
node backend/check-all-databases.js
```

## Recent Changes (March 11, 2026)

✅ Updated all appointment queries to include `pending-admin` status
✅ Fixed frontend field mapping for `reasonForVisit`
✅ Removed duplicate endpoint definitions
✅ Updated stats calculation for pending appointments
✅ All tests passing - appointments now display correctly
