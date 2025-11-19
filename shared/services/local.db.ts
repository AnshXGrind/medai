import Dexie from 'dexie';

// Local IndexedDB using Dexie for offline-first caching
export class LocalDB extends Dexie {
  health_ids: Dexie.Table<any, string>;
  family_members: Dexie.Table<any, string>;
  vaccinations: Dexie.Table<any, string>;
  medical_records: Dexie.Table<any, string>;
  insurance_policies: Dexie.Table<any, string>;
  consultations: Dexie.Table<any, string>;
  appointments: Dexie.Table<any, string>;

  constructor() {
    super('MedAidLocalDB');
    this.version(1).stores({
      health_ids: 'id,health_id_number',
      family_members: 'id,primary_health_id',
      vaccinations: 'id,health_id,administered_date',
      medical_records: 'id,health_id,diagnosis_date',
      insurance_policies: 'id,health_id,status',
      consultations: 'id,patient_id,created_at',
      appointments: 'id,patient_id,appointment_date'
    });

    this.health_ids = this.table('health_ids');
    this.family_members = this.table('family_members');
    this.vaccinations = this.table('vaccinations');
    this.medical_records = this.table('medical_records');
    this.insurance_policies = this.table('insurance_policies');
    this.consultations = this.table('consultations');
    this.appointments = this.table('appointments');
  }
}

export const localDb = new LocalDB();

export default localDb;
