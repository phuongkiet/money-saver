import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../utils/db';
import { useApp } from './AppContext';
import { supabase } from '../utils/supabaseClient';
import type {
  PartnerBasicInfo,
  PartnerPreference,
  PartnerDislike,
  PartnerAppointment,
  SpecialDate,
  GiftIdea,
  MenstrualData,
  CycleEntry,
  DailyEntry
} from '../types';

interface DeletedRecord {
  id: string;
  table: string;
  updatedAt: number;
}

interface CompanionContextType {
  basicInfo: PartnerBasicInfo;
  preferences: PartnerPreference[];
  dislikes: PartnerDislike[];
  appointments: PartnerAppointment[];
  specialDates: SpecialDate[];
  giftIdeas: GiftIdea[];
  menstrualData: MenstrualData;
  loading: boolean;
  isSyncing: boolean;

  // Actions
  updateBasicInfo: (info: PartnerBasicInfo) => void;
  addPreference: (category: PartnerPreference['category'], content: string) => void;
  deletePreference: (id: string) => void;
  addDislike: (category: PartnerDislike['category'], content: string) => void;
  deleteDislike: (id: string) => void;
  addAppointment: (appt: Omit<PartnerAppointment, 'id'>) => void;
  updateAppointment: (id: string, updates: Partial<PartnerAppointment>) => void;
  deleteAppointment: (id: string) => void;
  addSpecialDate: (date: Omit<SpecialDate, 'id'>) => void;
  updateSpecialDate: (id: string, updates: Partial<SpecialDate>) => void;
  deleteSpecialDate: (id: string) => void;
  addGiftIdea: (gift: Omit<GiftIdea, 'id' | 'isPurchased'>) => void;
  updateGiftIdea: (id: string, updates: Partial<GiftIdea>) => void;
  deleteGiftIdea: (id: string) => void;
  updateMenstrualData: (updates: Partial<MenstrualData>) => void;
  
  // Advanced cycle tracking actions
  addCycleEntry: (startDate: string, endDate?: string) => void;
  updateCycleEntry: (id: string, updates: Partial<CycleEntry>) => void;
  deleteCycleEntry: (id: string) => void;
  addDailyEntry: (entry: DailyEntry) => void;
  deleteDailyEntry: (date: string) => void;

  clearCompanionData: () => Promise<void>;
  syncCompanionData: () => Promise<boolean>;

  // Helpers
  getUpcomingAppointments: (days?: number) => PartnerAppointment[];
  getUpcomingSpecialDates: () => { date: SpecialDate; daysRemaining: number; nextDateStr: string }[];
  getPredictedNextPeriod: () => string;
  getCurrentCyclePhase: () => { phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'unknown'; label: string; daysRemaining: number; currentDay: number };
}

const CompanionContext = createContext<CompanionContextType | undefined>(undefined);

const defaultBasicInfo: PartnerBasicInfo = {
  nickname: '',
  birthday: '',
  shirtSize: '',
  pantsSize: '',
  ringSize: '',
  notes: ''
};

const defaultMenstrualData: MenstrualData = {
  avgCycleLength: 28,
  avgPeriodLength: 5,
  isIrregular: false,
  cycleLog: [],
  dailyLog: [],
  lastPeriodDate: '',
  cycleLength: 28,
  periodLength: 5
};

const dateDiffInDays = (date1Str: string, date2Str: string): number => {
  const d1 = new Date(date1Str);
  const d2 = new Date(date2Str);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
};

const addDaysToDate = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// Map DB row helpers
const mapBasicInfoToDb = (info: PartnerBasicInfo, uid: string) => ({
  user_id: uid,
  nickname: info.nickname || null,
  birthday: info.birthday || null,
  shirt_size: info.shirtSize || null,
  pants_size: info.pantsSize || null,
  ring_size: info.ringSize || null,
  notes: info.notes || null,
  updated_at: info.updatedAt ? new Date(info.updatedAt).toISOString() : new Date().toISOString()
});

const mapBasicInfoFromDb = (row: any): PartnerBasicInfo => ({
  nickname: row.nickname || '',
  birthday: row.birthday || '',
  shirtSize: row.shirt_size || '',
  pantsSize: row.pants_size || '',
  ringSize: row.ring_size || '',
  notes: row.notes || '',
  updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
});

const mapPrefToDb = (pref: PartnerPreference, uid: string) => ({
  id: pref.id,
  user_id: uid,
  category: pref.category,
  content: pref.content,
  created_at: pref.updatedAt ? new Date(pref.updatedAt).toISOString() : new Date().toISOString()
});

const mapPrefFromDb = (row: any): PartnerPreference => ({
  id: row.id,
  category: row.category,
  content: row.content,
  updatedAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
});

const mapDislikeToDb = (dis: PartnerDislike, uid: string) => ({
  id: dis.id,
  user_id: uid,
  category: dis.category,
  content: dis.content,
  created_at: dis.updatedAt ? new Date(dis.updatedAt).toISOString() : new Date().toISOString()
});

const mapDislikeFromDb = (row: any): PartnerDislike => ({
  id: row.id,
  category: row.category,
  content: row.content,
  updatedAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
});

const mapApptToDb = (appt: PartnerAppointment, uid: string) => ({
  id: appt.id,
  user_id: uid,
  title: appt.title,
  date: appt.date,
  time: appt.time || null,
  location: appt.location || null,
  category: appt.category,
  notes: appt.notes || null,
  is_completed: appt.isCompleted || false,
  updated_at: appt.updatedAt ? new Date(appt.updatedAt).toISOString() : new Date().toISOString()
});

const mapApptFromDb = (row: any): PartnerAppointment => ({
  id: row.id,
  title: row.title,
  date: row.date,
  time: row.time || '',
  location: row.location || '',
  category: row.category,
  notes: row.notes || '',
  isCompleted: row.is_completed || false,
  updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
});

const mapSpecialDateToDb = (sd: SpecialDate, uid: string) => ({
  id: sd.id,
  user_id: uid,
  title: sd.title,
  date: sd.date,
  is_recurring: sd.isRecurring,
  notes: sd.notes || null,
  created_at: sd.updatedAt ? new Date(sd.updatedAt).toISOString() : new Date().toISOString()
});

const mapSpecialDateFromDb = (row: any): SpecialDate => ({
  id: row.id,
  title: row.title,
  date: row.date,
  isRecurring: row.is_recurring !== undefined ? row.is_recurring : true,
  notes: row.notes || '',
  updatedAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
});

const mapGiftToDb = (gift: GiftIdea, uid: string) => ({
  id: gift.id,
  user_id: uid,
  name: gift.name,
  price: gift.price || null,
  priority: gift.priority,
  link: gift.link || null,
  is_purchased: gift.isPurchased || false,
  notes: gift.notes || null,
  created_at: gift.updatedAt ? new Date(gift.updatedAt).toISOString() : new Date().toISOString()
});

const mapGiftFromDb = (row: any): GiftIdea => ({
  id: row.id,
  name: row.name,
  price: row.price ? Number(row.price) : undefined,
  priority: row.priority as any,
  link: row.link || '',
  isPurchased: row.is_purchased || false,
  notes: row.notes || '',
  updatedAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
});

const mapMenstrualToDb = (m: MenstrualData, uid: string) => ({
  user_id: uid,
  avg_cycle_length: m.avgCycleLength,
  avg_period_length: m.avgPeriodLength,
  is_irregular: m.isIrregular,
  cycle_log: m.cycleLog,
  daily_log: m.dailyLog,
  updated_at: new Date().toISOString()
});

const mapMenstrualFromDb = (row: any): MenstrualData => ({
  avgCycleLength: row.avg_cycle_length || 28,
  avgPeriodLength: row.avg_period_length || 5,
  isIrregular: row.is_irregular || false,
  cycleLog: row.cycle_log || [],
  dailyLog: row.daily_log || [],
  lastPeriodDate: row.cycle_log && row.cycle_log.length > 0 ? row.cycle_log[row.cycle_log.length - 1].startDate : '',
  cycleLength: row.avg_cycle_length || 28,
  periodLength: row.avg_period_length || 5
});

export const CompanionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useApp();
  
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [basicInfo, setBasicInfo] = useState<PartnerBasicInfo>(defaultBasicInfo);
  const [preferences, setPreferences] = useState<PartnerPreference[]>([]);
  const [dislikes, setDislikes] = useState<PartnerDislike[]>([]);
  const [appointments, setAppointments] = useState<PartnerAppointment[]>([]);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [giftIdeas, setGiftIdeas] = useState<GiftIdea[]>([]);
  const [menstrualData, setMenstrualData] = useState<MenstrualData>(defaultMenstrualData);
  const [deletedRecords, setDeletedRecords] = useState<DeletedRecord[]>([]);

  // Load from IndexedDB
  useEffect(() => {
    const loadCompanionData = async () => {
      try {
        const savedBasic = await db.get<PartnerBasicInfo>('ms_companion_basic', defaultBasicInfo);
        const savedPrefs = await db.get<PartnerPreference[]>('ms_companion_prefs', []);
        const savedDislikes = await db.get<PartnerDislike[]>('ms_companion_dislikes', []);
        const savedAppts = await db.get<PartnerAppointment[]>('ms_companion_appointments', []);
        const savedDates = await db.get<SpecialDate[]>('ms_companion_special_dates', []);
        const savedGifts = await db.get<GiftIdea[]>('ms_companion_gifts', []);
        const savedMenstrual = await db.get<MenstrualData>('ms_companion_menstrual', defaultMenstrualData);
        const savedDeletions = await db.get<DeletedRecord[]>('ms_companion_deleted_records', []);

        setBasicInfo(savedBasic);
        setPreferences(savedPrefs);
        setDislikes(savedDislikes);
        setAppointments(savedAppts);
        setSpecialDates(savedDates);
        setGiftIdeas(savedGifts);
        setMenstrualData(savedMenstrual);
        setDeletedRecords(savedDeletions);
      } catch (err) {
        console.error('Lỗi khi load dữ liệu companion từ IndexedDB:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCompanionData();
  }, []);

  // Save to IndexedDB
  useEffect(() => { if (!loading) db.set('ms_companion_basic', basicInfo); }, [basicInfo, loading]);
  useEffect(() => { if (!loading) db.set('ms_companion_prefs', preferences); }, [preferences, loading]);
  useEffect(() => { if (!loading) db.set('ms_companion_dislikes', dislikes); }, [dislikes, loading]);
  useEffect(() => { if (!loading) db.set('ms_companion_appointments', appointments); }, [appointments, loading]);
  useEffect(() => { if (!loading) db.set('ms_companion_special_dates', specialDates); }, [specialDates, loading]);
  useEffect(() => { if (!loading) db.set('ms_companion_gifts', giftIdeas); }, [giftIdeas, loading]);
  useEffect(() => { if (!loading) db.set('ms_companion_menstrual', menstrualData); }, [menstrualData, loading]);
  useEffect(() => { if (!loading) db.set('ms_companion_deleted_records', deletedRecords); }, [deletedRecords, loading]);

  // Sync companion data automatically when online status or session changes
  const syncCompanionData = useCallback(async (activeSession = session): Promise<boolean> => {
    if (!activeSession) return false;
    if (!window.navigator.onLine) return false;

    setIsSyncing(true);
    const userId = activeSession.user.id;

    try {
      // 1. Sync Basic Info
      if (basicInfo.pendingSync) {
        const { error } = await supabase
          .from('companion_basic_info')
          .upsert(mapBasicInfoToDb(basicInfo, userId));
        if (error) throw error;
        setBasicInfo(prev => ({ ...prev, pendingSync: false }));
      } else {
        const { data: cloudBasic, error: basicErr } = await supabase
          .from('companion_basic_info')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (basicErr && basicErr.code !== 'PGRST116') throw basicErr;
        if (cloudBasic) {
          const cloudBasicMapped = mapBasicInfoFromDb(cloudBasic);
          if (!basicInfo.updatedAt || (cloudBasicMapped.updatedAt || 0) > (basicInfo.updatedAt || 0)) {
            setBasicInfo(cloudBasicMapped);
          }
        }
      }

      // 2. Sync Menstrual Data
      if (menstrualData.pendingSync) {
        const { error } = await supabase
          .from('companion_menstrual')
          .upsert(mapMenstrualToDb(menstrualData, userId));
        if (error) throw error;
        setMenstrualData(prev => ({ ...prev, pendingSync: false }));
      } else {
        const { data: cloudMenstrual, error: menstrualErr } = await supabase
          .from('companion_menstrual')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (menstrualErr && menstrualErr.code !== 'PGRST116') throw menstrualErr;
        if (cloudMenstrual) {
          const cloudMMapped = mapMenstrualFromDb(cloudMenstrual);
          const cloudUpdated = cloudMenstrual.updated_at ? new Date(cloudMenstrual.updated_at).getTime() : 0;
          const localUpdated = menstrualData.updatedAt || 0;
          if (cloudUpdated > localUpdated) {
            setMenstrualData({ ...cloudMMapped, updatedAt: cloudUpdated });
          }
        }
      }

      // Helper to sync sub-tables
      const syncSubTable = async <T extends { id: string; updatedAt?: number; pendingSync?: boolean }>({
        tableName,
        localItems,
        setLocalItems,
        mapToDb,
        mapFromDb,
        deletedTableKey
      }: {
        tableName: string;
        localItems: T[];
        setLocalItems: React.Dispatch<React.SetStateAction<T[]>>;
        mapToDb: (item: T, uid: string) => any;
        mapFromDb: (row: any) => T;
        deletedTableKey: string;
      }) => {
        // A. Upload changes
        const pendingUpload = localItems.filter(item => item.pendingSync);
        if (pendingUpload.length > 0) {
          const dbRows = pendingUpload.map(item => mapToDb(item, userId));
          const { error: uploadError } = await supabase
            .from(tableName)
            .upsert(dbRows);
          if (uploadError) throw uploadError;

          setLocalItems(prev => prev.map(item => {
            if (pendingUpload.some(p => p.id === item.id)) {
              return { ...item, pendingSync: false };
            }
            return item;
          }));
        }

        // B. Upload deletions
        const pendingDeletions = deletedRecords.filter(r => r.table === deletedTableKey);
        if (pendingDeletions.length > 0) {
          const deletePromises = pendingDeletions.map(async (r) => {
            const { error: deleteError } = await supabase
              .from(tableName)
              .delete()
              .eq('id', r.id)
              .eq('user_id', userId);
            if (deleteError) throw deleteError;
          });
          await Promise.all(deletePromises);
          setDeletedRecords(prev => prev.filter(r => !(r.table === deletedTableKey && pendingDeletions.some(pd => pd.id === r.id))));
        }

        // C. Download changes
        const { data: cloudRows, error: downloadError } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', userId);

        if (downloadError) throw downloadError;
        if (cloudRows) {
          const cloudMapped = cloudRows.map(mapFromDb);
          setLocalItems(prev => {
            const merged = [...prev];
            cloudMapped.forEach(cloudItem => {
              const index = merged.findIndex(item => item.id === cloudItem.id);
              if (index > -1) {
                if ((cloudItem.updatedAt || 0) > (merged[index].updatedAt || 0) && !merged[index].pendingSync) {
                  merged[index] = cloudItem;
                }
              } else {
                merged.push(cloudItem);
              }
            });
            // Filter out items not present in cloud and not pending upload (i.e. deleted on other device)
            return merged.filter(localItem => {
              if (localItem.pendingSync) return true;
              return cloudMapped.some(cloudItem => cloudItem.id === localItem.id);
            });
          });
        }
      };

      // 3. Sync Preferences
      await syncSubTable({
        tableName: 'companion_preferences',
        localItems: preferences,
        setLocalItems: setPreferences,
        mapToDb: mapPrefToDb,
        mapFromDb: mapPrefFromDb,
        deletedTableKey: 'companion_preferences'
      });

      // 4. Sync Dislikes
      await syncSubTable({
        tableName: 'companion_dislikes',
        localItems: dislikes,
        setLocalItems: setDislikes,
        mapToDb: mapDislikeToDb,
        mapFromDb: mapDislikeFromDb,
        deletedTableKey: 'companion_dislikes'
      });

      // 5. Sync Appointments
      await syncSubTable({
        tableName: 'companion_appointments',
        localItems: appointments,
        setLocalItems: setAppointments,
        mapToDb: mapApptToDb,
        mapFromDb: mapApptFromDb,
        deletedTableKey: 'companion_appointments'
      });

      // 6. Sync Special Dates
      await syncSubTable({
        tableName: 'companion_special_dates',
        localItems: specialDates,
        setLocalItems: setSpecialDates,
        mapToDb: mapSpecialDateToDb,
        mapFromDb: mapSpecialDateFromDb,
        deletedTableKey: 'companion_special_dates'
      });

      // 7. Sync Gift Ideas
      await syncSubTable({
        tableName: 'companion_gift_ideas',
        localItems: giftIdeas,
        setLocalItems: setGiftIdeas,
        mapToDb: mapGiftToDb,
        mapFromDb: mapGiftFromDb,
        deletedTableKey: 'companion_gift_ideas'
      });

      return true;
    } catch (err) {
      console.error('Lỗi đồng bộ dữ liệu Companion:', err);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [session, basicInfo, menstrualData, preferences, dislikes, appointments, specialDates, giftIdeas, deletedRecords]);

  // Sync on session change
  useEffect(() => {
    if (session) {
      syncCompanionData();
    }
  }, [session]);

  const queueDeletion = (id: string, tableName: string) => {
    setDeletedRecords(prev => [...prev, { id, table: tableName, updatedAt: Date.now() }]);
  };

  // Actions implementations
  const updateBasicInfo = (info: PartnerBasicInfo) => {
    setBasicInfo({
      ...info,
      updatedAt: Date.now(),
      pendingSync: true
    });
  };

  const addPreference = (category: PartnerPreference['category'], content: string) => {
    if (!content.trim()) return;
    const newPref: PartnerPreference = {
      id: `pref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category,
      content: content.trim(),
      updatedAt: Date.now(),
      pendingSync: true
    };
    setPreferences(prev => [...prev, newPref]);
  };

  const deletePreference = (id: string) => {
    queueDeletion(id, 'companion_preferences');
    setPreferences(prev => prev.filter(p => p.id !== id));
  };

  const addDislike = (category: PartnerDislike['category'], content: string) => {
    if (!content.trim()) return;
    const newDis: PartnerDislike = {
      id: `dislike-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category,
      content: content.trim(),
      updatedAt: Date.now(),
      pendingSync: true
    };
    setDislikes(prev => [...prev, newDis]);
  };

  const deleteDislike = (id: string) => {
    queueDeletion(id, 'companion_dislikes');
    setDislikes(prev => prev.filter(d => d.id !== id));
  };

  const addAppointment = (appt: Omit<PartnerAppointment, 'id'>) => {
    const newAppt: PartnerAppointment = {
      ...appt,
      id: `appt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isCompleted: false,
      updatedAt: Date.now(),
      pendingSync: true
    };
    setAppointments(prev => [...prev, newAppt]);
  };

  const updateAppointment = (id: string, updates: Partial<PartnerAppointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: Date.now(), pendingSync: true } : a));
  };

  const deleteAppointment = (id: string) => {
    queueDeletion(id, 'companion_appointments');
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const addSpecialDate = (date: Omit<SpecialDate, 'id'>) => {
    const newDate: SpecialDate = {
      ...date,
      id: `date-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      updatedAt: Date.now(),
      pendingSync: true
    };
    setSpecialDates(prev => [...prev, newDate]);
  };

  const updateSpecialDate = (id: string, updates: Partial<SpecialDate>) => {
    setSpecialDates(prev => prev.map(d => d.id === id ? { ...d, ...updates, updatedAt: Date.now(), pendingSync: true } : d));
  };

  const deleteSpecialDate = (id: string) => {
    queueDeletion(id, 'companion_special_dates');
    setSpecialDates(prev => prev.filter(d => d.id !== id));
  };

  const addGiftIdea = (gift: Omit<GiftIdea, 'id' | 'isPurchased'>) => {
    const newGift: GiftIdea = {
      ...gift,
      id: `gift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isPurchased: false,
      updatedAt: Date.now(),
      pendingSync: true
    };
    setGiftIdeas(prev => [...prev, newGift]);
  };

  const updateGiftIdea = (id: string, updates: Partial<GiftIdea>) => {
    setGiftIdeas(prev => prev.map(g => g.id === id ? { ...g, ...updates, updatedAt: Date.now(), pendingSync: true } : g));
  };

  const deleteGiftIdea = (id: string) => {
    queueDeletion(id, 'companion_gift_ideas');
    setGiftIdeas(prev => prev.filter(g => g.id !== id));
  };

  const recalculatePredictions = (data: MenstrualData) => {
    if (data.cycleLog.length < 2) {
      data.isIrregular = false;
      return;
    }

    // Sort logs ascending by startDate
    const sorted = [...data.cycleLog].sort((a, b) => a.startDate.localeCompare(b.startDate));
    
    // Calculate cycle lengths
    const lengths: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const diff = dateDiffInDays(sorted[i].startDate, sorted[i-1].startDate);
      if (diff > 0 && diff < 100) {
        lengths.push(diff);
      }
    }

    if (lengths.length === 0) return;

    // Weighted average of last 3 cycle lengths
    const lastLengths = lengths.slice(-3);
    let weightedAvg = 28;
    if (lastLengths.length === 3) {
      weightedAvg = Math.round(lastLengths[0] * 0.2 + lastLengths[1] * 0.3 + lastLengths[2] * 0.5);
    } else if (lastLengths.length === 2) {
      weightedAvg = Math.round(lastLengths[0] * 0.4 + lastLengths[1] * 0.6);
    } else if (lastLengths.length === 1) {
      weightedAvg = lastLengths[0];
    }

    data.avgCycleLength = weightedAvg;
    data.cycleLength = weightedAvg;

    // Calculate period lengths from endDate
    const periodLengths: number[] = [];
    sorted.forEach(c => {
      if (c.startDate && c.endDate) {
        const diff = dateDiffInDays(c.endDate, c.startDate) + 1;
        if (diff > 0 && diff < 20) {
          periodLengths.push(diff);
        }
      }
    });

    if (periodLengths.length > 0) {
      const avgPeriod = Math.round(periodLengths.reduce((sum, val) => sum + val, 0) / periodLengths.length);
      data.avgPeriodLength = avgPeriod;
      data.periodLength = avgPeriod;
    }

    // Irregular flag (max length - min length > 7 days in last 3)
    if (lastLengths.length >= 2) {
      const maxVal = Math.max(...lastLengths);
      const minVal = Math.min(...lastLengths);
      data.isIrregular = (maxVal - minVal) > 7;
    } else {
      data.isIrregular = false;
    }
  };

  const updateMenstrualData = (updates: Partial<MenstrualData>) => {
    setMenstrualData(prev => {
      const newData = {
        ...prev,
        ...updates,
        updatedAt: Date.now(),
        pendingSync: true
      };

      // Compatibility mapping
      if (updates.lastPeriodDate !== undefined || updates.cycleLength !== undefined || updates.periodLength !== undefined) {
        const lastDate = updates.lastPeriodDate || prev.lastPeriodDate || (prev.cycleLog.length > 0 ? prev.cycleLog[prev.cycleLog.length - 1].startDate : '');
        const cycleLen = updates.cycleLength || prev.cycleLength || prev.avgCycleLength || 28;
        const periodLen = updates.periodLength || prev.periodLength || prev.avgPeriodLength || 5;

        newData.avgCycleLength = cycleLen;
        newData.avgPeriodLength = periodLen;
        newData.cycleLength = cycleLen;
        newData.periodLength = periodLen;
        newData.lastPeriodDate = lastDate;

        if (lastDate) {
          const exists = prev.cycleLog.find(c => c.startDate === lastDate);
          if (!exists) {
            const newLog = [...prev.cycleLog, { id: `cycle-${Date.now()}`, startDate: lastDate }]
              .sort((a, b) => a.startDate.localeCompare(b.startDate))
              .slice(-12);
            newData.cycleLog = newLog;
          }
        }
        recalculatePredictions(newData);
      }
      return newData;
    });
  };

  const addCycleEntry = (startDate: string, endDate?: string) => {
    setMenstrualData(prev => {
      const newEntry: CycleEntry = {
        id: `cycle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startDate,
        endDate: endDate || undefined
      };
      
      const newLog = [...prev.cycleLog.filter(c => c.startDate !== startDate), newEntry]
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .slice(-12); // Retention policy: 12 entries
      
      const lastEntry = newLog[newLog.length - 1];
      const newData: MenstrualData = {
        ...prev,
        cycleLog: newLog,
        lastPeriodDate: lastEntry ? lastEntry.startDate : prev.lastPeriodDate,
        cycleLength: prev.avgCycleLength,
        periodLength: prev.avgPeriodLength,
        updatedAt: Date.now(),
        pendingSync: true
      };

      recalculatePredictions(newData);
      return newData;
    });
  };

  const updateCycleEntry = (id: string, updates: Partial<CycleEntry>) => {
    setMenstrualData(prev => {
      const newLog = prev.cycleLog.map(c => c.id === id ? { ...c, ...updates } : c)
        .sort((a, b) => a.startDate.localeCompare(b.startDate));
      
      const lastEntry = newLog[newLog.length - 1];
      const newData: MenstrualData = {
        ...prev,
        cycleLog: newLog,
        lastPeriodDate: lastEntry ? lastEntry.startDate : prev.lastPeriodDate,
        updatedAt: Date.now(),
        pendingSync: true
      };

      recalculatePredictions(newData);
      return newData;
    });
  };

  const deleteCycleEntry = (id: string) => {
    setMenstrualData(prev => {
      const newLog = prev.cycleLog.filter(c => c.id !== id);
      const lastEntry = newLog[newLog.length - 1];
      const newData: MenstrualData = {
        ...prev,
        cycleLog: newLog,
        lastPeriodDate: lastEntry ? lastEntry.startDate : '',
        updatedAt: Date.now(),
        pendingSync: true
      };

      recalculatePredictions(newData);
      return newData;
    });
  };

  const addDailyEntry = (entry: DailyEntry) => {
    setMenstrualData(prev => {
      // 90-day symptom log retention cleanup policy
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      const filteredLog = prev.dailyLog.filter(e => e.date >= cutoffStr && e.date !== entry.date);
      const newLog = [...filteredLog, entry].sort((a, b) => a.date.localeCompare(b.date));

      return {
        ...prev,
        dailyLog: newLog,
        updatedAt: Date.now(),
        pendingSync: true
      };
    });
  };

  const deleteDailyEntry = (date: string) => {
    setMenstrualData(prev => {
      const newLog = prev.dailyLog.filter(e => e.date !== date);
      return {
        ...prev,
        dailyLog: newLog,
        updatedAt: Date.now(),
        pendingSync: true
      };
    });
  };

  const clearCompanionData = async () => {
    setBasicInfo(defaultBasicInfo);
    setPreferences([]);
    setDislikes([]);
    setAppointments([]);
    setSpecialDates([]);
    setGiftIdeas([]);
    setMenstrualData(defaultMenstrualData);
    setDeletedRecords([]);

    const keys = [
      'ms_companion_basic',
      'ms_companion_prefs',
      'ms_companion_dislikes',
      'ms_companion_appointments',
      'ms_companion_special_dates',
      'ms_companion_gifts',
      'ms_companion_menstrual',
      'ms_companion_deleted_records'
    ];
    for (const key of keys) {
      await db.remove(key);
    }
  };

  // Helper implementations
  const getUpcomingAppointments = (days?: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = appointments.filter(a => {
      const apptDate = new Date(a.date);
      if (apptDate < today) return false;
      if (days !== undefined) {
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + days);
        return apptDate <= maxDate;
      }
      return true;
    });

    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getUpcomingSpecialDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const list: { date: SpecialDate; daysRemaining: number; nextDateStr: string }[] = [];

    // Process companion birthday if exists
    if (basicInfo.birthday) {
      const bdayDate = new Date(basicInfo.birthday);
      let nextBday = new Date(today.getFullYear(), bdayDate.getMonth(), bdayDate.getDate());
      if (nextBday < today) {
        nextBday.setFullYear(today.getFullYear() + 1);
      }
      const diffTime = nextBday.getTime() - today.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const mockSpecialDate: SpecialDate = {
        id: 'birthday-partner',
        title: `Sinh nhật ${basicInfo.nickname || 'Người ấy'}`,
        date: basicInfo.birthday,
        isRecurring: true,
        notes: 'Ngày sinh nhật của người thương'
      };

      list.push({
        date: mockSpecialDate,
        daysRemaining: days === 366 || days === 365 ? 0 : days,
        nextDateStr: nextBday.toISOString().split('T')[0]
      });
    }

    // Process user-added special dates
    specialDates.forEach(sd => {
      const originalDate = new Date(sd.date);
      let nextOcc = new Date(today.getFullYear(), originalDate.getMonth(), originalDate.getDate());
      
      if (!sd.isRecurring) {
        const eventDate = new Date(sd.date);
        eventDate.setHours(0, 0, 0, 0);
        if (eventDate >= today) {
          const diffTime = eventDate.getTime() - today.getTime();
          const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          list.push({
            date: sd,
            daysRemaining: days,
            nextDateStr: sd.date
          });
        }
      } else {
        if (nextOcc < today) {
          nextOcc.setFullYear(today.getFullYear() + 1);
        }
        const diffTime = nextOcc.getTime() - today.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        list.push({
          date: sd,
          daysRemaining: days === 366 || days === 365 ? 0 : days,
          nextDateStr: nextOcc.toISOString().split('T')[0]
        });
      }
    });

    return list.sort((a, b) => a.daysRemaining - b.daysRemaining);
  };

  const getPredictedNextPeriod = (): string => {
    const lastDate = menstrualData.lastPeriodDate || (menstrualData.cycleLog.length > 0 ? menstrualData.cycleLog[menstrualData.cycleLog.length - 1].startDate : '');
    if (!lastDate) return '';
    const cycleLen = menstrualData.avgCycleLength || 28;
    return addDaysToDate(lastDate, cycleLen);
  };

  const getCurrentCyclePhase = () => {
    const lastDate = menstrualData.lastPeriodDate || (menstrualData.cycleLog.length > 0 ? menstrualData.cycleLog[menstrualData.cycleLog.length - 1].startDate : '');
    
    if (!lastDate) {
      return { phase: 'unknown' as const, label: 'Chưa thiết lập dữ liệu chu kỳ', daysRemaining: 0, currentDay: 0 };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastPeriodStartDate = new Date(lastDate);
    
    const diffTime = today.getTime() - lastPeriodStartDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { phase: 'unknown' as const, label: 'Ngày nhập lớn hơn ngày hiện tại', daysRemaining: 0, currentDay: 0 };
    }
    
    const cycleLen = menstrualData.avgCycleLength || 28;
    const periodLen = menstrualData.avgPeriodLength || 5;
    
    const currentDay = (diffDays % cycleLen) + 1;
    
    if (currentDay <= periodLen) {
      return {
        phase: 'menstrual' as const,
        label: 'Giai đoạn hành kinh (Mùa dâu 🍓)',
        daysRemaining: periodLen - currentDay + 1,
        currentDay
      };
    } else if (currentDay < cycleLen - 16) {
      return {
        phase: 'follicular' as const,
        label: 'Giai đoạn nang trứng (Tươi tắn 🌱)',
        daysRemaining: (cycleLen - 16) - currentDay,
        currentDay
      };
    } else if (currentDay <= cycleLen - 11) {
      return {
        phase: 'ovulatory' as const,
        label: 'Giai đoạn rụng trứng (Rực rỡ ✨)',
        daysRemaining: (cycleLen - 11) - currentDay + 1,
        currentDay
      };
    } else {
      return {
        phase: 'luteal' as const,
        label: 'Giai đoạn hoàng thể (Chuẩn bị 🧸)',
        daysRemaining: cycleLen - currentDay + 1,
        currentDay
      };
    }
  };

  return (
    <CompanionContext.Provider value={{
      basicInfo,
      preferences,
      dislikes,
      appointments,
      specialDates,
      giftIdeas,
      menstrualData,
      loading,
      isSyncing,
      updateBasicInfo,
      addPreference,
      deletePreference,
      addDislike,
      deleteDislike,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      addSpecialDate,
      updateSpecialDate,
      deleteSpecialDate,
      addGiftIdea,
      updateGiftIdea,
      deleteGiftIdea,
      updateMenstrualData,
      addCycleEntry,
      updateCycleEntry,
      deleteCycleEntry,
      addDailyEntry,
      deleteDailyEntry,
      clearCompanionData,
      syncCompanionData,
      getUpcomingAppointments,
      getUpcomingSpecialDates,
      getPredictedNextPeriod,
      getCurrentCyclePhase
    }}>
      {children}
    </CompanionContext.Provider>
  );
};

export const useCompanion = () => {
  const context = useContext(CompanionContext);
  if (context === undefined) {
    throw new Error('useCompanion must be used within a CompanionProvider');
  }
  return context;
};
