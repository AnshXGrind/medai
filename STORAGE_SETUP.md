# Storage Setup Guide

## Issue
Upload prescription/Aadhaar was failing with "Failed to upload" error because the Supabase storage bucket wasn't configured.

## Solution

### Option 1: Apply Migration (Recommended)

If you have Supabase CLI installed:

```bash
# Apply the storage bucket migration
supabase db reset

# Or push only the new migration
supabase db push
```

### Option 2: Manual Setup in Supabase Dashboard

1. **Go to Supabase Dashboard** → Your Project → Storage

2. **Create Bucket:**
   - Click "New bucket"
   - Name: `documents`
   - Public bucket: ✅ **Yes** (checked)
   - Click "Create bucket"

3. **Set up Policies:**
   
   Go to Storage → documents bucket → Policies
   
   **Policy 1: Allow authenticated uploads**
   ```sql
   CREATE POLICY "Users can upload documents"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'documents' AND
     (storage.foldername(name))[1] IN ('aadhaar', 'prescriptions')
   );
   ```
   
   **Policy 2: Allow public reads**
   ```sql
   CREATE POLICY "Public can view documents"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'documents');
   ```
   
   **Policy 3: Allow authenticated updates**
   ```sql
   CREATE POLICY "Users can update documents"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (bucket_id = 'documents');
   ```
   
   **Policy 4: Allow authenticated deletes**
   ```sql
   CREATE POLICY "Users can delete documents"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'documents');
   ```

### Option 3: Quick SQL Script

Run this in Supabase SQL Editor:

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up policies (copy from migration file)
```

## Verify Setup

1. Go to Storage in Supabase Dashboard
2. You should see a `documents` bucket
3. Try uploading a prescription or Aadhaar - it should work now!

## Error Messages Explained

Now the upload will show specific errors:

- **"Storage not configured"** → Bucket doesn't exist (follow steps above)
- **"Permission denied"** → Storage policies need to be set up
- **Other errors** → Shows the actual error message for debugging

## Testing

1. Sign in to the app
2. Go to Documents tab
3. Try uploading an Aadhaar card or prescription
4. Check browser console (F12) for detailed logs
5. Should see success message: "✓ Prescription uploaded successfully!"

## File Structure

Files are stored in:
- `documents/aadhaar/[userId]-[timestamp].[ext]`
- `documents/prescriptions/[userId]-[timestamp].[ext]`
