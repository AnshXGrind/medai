# Sample Doctors Setup Guide

This guide explains how to set up sample doctors in your Supabase database for testing the appointment booking system.

## Option 1: Run Migration (Recommended)

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy the contents of `supabase/migrations/20251102_sample_doctors.sql`
4. Paste and run it in the SQL Editor
5. The sample doctors will be created automatically

## Option 2: Manual Insert via Supabase Dashboard

Go to your Supabase project → SQL Editor and run this query:

```sql
-- Run the migration file
\i supabase/migrations/20251102_sample_doctors.sql
```

## Sample Doctors Created

After running the migration, you'll have 5 sample doctors:

1. **Dr. Rajesh Kumar** (MCI-12345)
   - Specialty: General Physician
   - Consultation Fee: ₹500
   - Status: Verified & Online

2. **Dr. Priya Sharma** (MCI-67890)
   - Specialty: Cardiologist
   - Consultation Fee: ₹1000
   - Status: Verified & Online

3. **Dr. Amit Patel** (MCI-54321)
   - Specialty: Pediatrician
   - Consultation Fee: ₹600
   - Status: Verified & Online

4. **Dr. Sunita Reddy** (MCI-98765)
   - Specialty: Dermatologist
   - Consultation Fee: ₹700
   - Status: Verified & Online

5. **Dr. Vikram Singh** (MCI-11223)
   - Specialty: Orthopedic Surgeon
   - Consultation Fee: ₹1200
   - Status: Verified & Online

## How the System Works

### Patient Side:
1. Patient logs in and goes to "Healthcare" tab
2. Clicks on "Book Appointment"
3. Sees list of available verified doctors
4. Selects a doctor - sees their:
   - Medical ID
   - Name and Specialty
   - Location
   - Experience
   - Consultation rates (Video/In-person)
5. Chooses appointment type, date, time
6. Books the appointment

### Doctor Side:
1. Doctor logs in to Doctor Dashboard
2. Sees real-time list of:
   - New appointment requests (Pending)
   - Confirmed appointments
   - Completed consultations
3. Can confirm or cancel appointments
4. Real-time updates when new appointments are booked

## Real-Time Features

- **Doctor Profiles**: When a new doctor registers, they automatically appear in patient's doctor list
- **Appointments**: When a patient books, the doctor immediately sees it in their dashboard
- **Status Updates**: When doctor confirms/cancels, patient sees the update instantly

## Testing the System

1. **Create a patient account** (if you don't have one)
2. **Log in as patient**
3. **Navigate to Patient Dashboard → Healthcare tab**
4. **Click "Book Appointment"**
5. **Select any sample doctor** - you'll see their full profile
6. **Complete the booking**
7. **Check the appointments section** in patient dashboard - your booking appears
8. **(Optional) Log in as a doctor** - see the appointment in Doctor Dashboard

## Troubleshooting

### Doctors not showing up?
- Check that the migration ran successfully
- Verify RLS policies allow reading from `doctor_profiles` table
- Check browser console for errors

### Real-time not working?
- Ensure Supabase Realtime is enabled for:
  - `doctor_profiles` table
  - `appointments` table
- Check that you're subscribed to the changes in the component

### Can't book appointments?
- Verify you're logged in as a patient
- Check RLS policies on `appointments` table
- Ensure patient_id is correctly set

## Database Schema

The system uses these tables:
- `profiles` - User names and basic info
- `user_roles` - User role assignments (patient/doctor)
- `doctor_profiles` - Doctor-specific data (medical_id, specialty, fees)
- `appointments` - Appointment bookings with status tracking

All tables have proper RLS (Row Level Security) policies to ensure data privacy.
