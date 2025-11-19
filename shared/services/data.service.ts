import { localDb } from './local.db';
import { supabase } from '@/integrations/supabase/client';

// Local-first data service: reads from IndexedDB, falls back to Supabase,
// then writes results back to local DB for subsequent reads.
export const dataService = {
  // Health ID
  async getHealthIdByNumber(healthIdNumber: string) {
    if (!healthIdNumber) return null;

    // Try local DB first
    const local = await localDb.health_ids.where('health_id_number').equals(healthIdNumber).first();
    if (local) return local;

    // Fallback to Supabase
    const { data, error } = await supabase
      .from('health_ids')
      .select('*')
      .eq('health_id_number', healthIdNumber)
      .single();

    if (error) throw error;

    if (data) {
      try { await localDb.health_ids.put(data); } catch (e) { console.warn('Local DB write failed', e); }
    }

    return data;
  },

  // Family members for primary health id
  async getFamilyMembers(primaryHealthId: string) {
    if (!primaryHealthId) return [];

    const local = await localDb.family_members.where('primary_health_id').equals(primaryHealthId).toArray();
    if (local && local.length) return local;

    const { data, error } = await supabase
      .from('family_members')
      .select(`*, member:member_health_id ( health_id_number, full_name, date_of_birth, blood_group )`)
      .eq('primary_health_id', primaryHealthId);

    if (error) throw error;

    if (data) {
      try { await localDb.family_members.bulkPut(data); } catch (e) { console.warn('Local DB write failed', e); }
    }

    return data || [];
  },

  // Reconcile pending locally-generated health IDs with Supabase.
  async reconcilePendingHealthIds() {
    try {
      const all = await localDb.health_ids.toArray();
      const pending = all.filter((h: any) => h.pending_verification === true);
      if (!pending.length) return { reconciled: 0 };

      let reconciled = 0;

      for (const item of pending) {
        try {
          // Check if already exists on server
          const { data, error } = await supabase
            .from('health_ids')
            .select('*')
            .eq('health_id_number', item.health_id_number)
            .maybeSingle();

          if (error) {
            console.warn('Reconcile lookup error', error);
            continue;
          }

          if (data) {
            // Server already has it; mark local as reconciled
            await localDb.health_ids.update(item.id, { pending_verification: false, synced_at: new Date().toISOString() });
            reconciled++;
            continue;
          }

          // Insert into server
          const insertPayload = { ...item, pending_verification: undefined };
          const { data: inserted, error: insertErr } = await supabase.from('health_ids').insert(insertPayload).select().single();
          if (insertErr) {
            console.warn('Failed to insert pending health id', insertErr);
            continue;
          }

          // Update local record
          await localDb.health_ids.update(item.id, { pending_verification: false, synced_at: new Date().toISOString(), server_id: inserted?.id });
          reconciled++;
        } catch (inner) {
          console.warn('Failed to reconcile item', inner);
          continue;
        }
      }

      return { reconciled };
    } catch (err) {
      console.warn('Failed to reconcile pending health ids', err);
      return { reconciled: 0 };
    }
  },

  async getVaccinationsForHealthId(healthId: string) {
    if (!healthId) return [];
    const local = await localDb.vaccinations.where('health_id').equals(healthId).toArray();
    if (local && local.length) return local.sort((a,b) => new Date(b.administered_date).getTime() - new Date(a.administered_date).getTime());

    const { data, error } = await supabase
      .from('vaccinations')
      .select('*')
      .eq('health_id', healthId)
      .order('administered_date', { ascending: false })
      .limit(100);

    if (error) throw error;
    if (data) { try { await localDb.vaccinations.bulkPut(data); } catch (e) { console.warn('Local DB write failed', e); } }
    return data || [];
  },

  async getMedicalRecordsForHealthId(healthId: string) {
    if (!healthId) return [];
    const local = await localDb.medical_records.where('health_id').equals(healthId).toArray();
    if (local && local.length) return local.sort((a,b) => new Date(b.diagnosis_date).getTime() - new Date(a.diagnosis_date).getTime());

    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('health_id', healthId)
      .order('diagnosis_date', { ascending: false })
      .limit(100);

    if (error) throw error;
    if (data) { try { await localDb.medical_records.bulkPut(data); } catch (e) { console.warn('Local DB write failed', e); } }
    return data || [];
  },

  async getInsurancePoliciesForHealthId(healthId: string) {
    if (!healthId) return [];
    const local = await localDb.insurance_policies.where('health_id').equals(healthId).toArray();
    if (local && local.length) return local;

    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('health_id', healthId)
      .eq('status', 'active');

    if (error) throw error;
    if (data) { try { await localDb.insurance_policies.bulkPut(data); } catch (e) { console.warn('Local DB write failed', e); } }
    return data || [];
  },

  // Consultations and Appointments (by patient)
  async getConsultationsByPatient(patientId: string) {
    if (!patientId) return [];
    const local = await localDb.consultations.where('patient_id').equals(patientId).sortBy('created_at');
    if (local && local.length) return local.reverse();

    const { data, error } = await supabase
      .from('consultations')
      .select('*, profiles!consultations_patient_id_fkey(full_name, health_id)')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    if (data) { try { await localDb.consultations.bulkPut(data); } catch (e) { console.warn('Local DB write failed', e); } }
    return data || [];
  },

  async getAppointmentsByPatient(patientId: string) {
    if (!patientId) return [];
    const local = await localDb.appointments.where('patient_id').equals(patientId).sortBy('appointment_date');
    if (local && local.length) return local.reverse();

    const { data, error } = await supabase
      .from('appointments')
      .select('*, profiles!appointments_patient_id_fkey(full_name, health_id)')
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: false })
      .limit(200);

    if (error) throw error;
    if (data) { try { await localDb.appointments.bulkPut(data); } catch (e) { console.warn('Local DB write failed', e); } }
    return data || [];
  }
};

export default dataService;
