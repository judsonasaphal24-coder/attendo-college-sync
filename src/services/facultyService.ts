import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AttendanceRecord = Database['public']['Tables']['attendance_records']['Row'];
type AttendanceInsert = Database['public']['Tables']['attendance_records']['Insert'];
type AttendanceUpdate = Database['public']['Tables']['attendance_records']['Update'];
type Timetable = Database['public']['Tables']['timetable']['Row'];
type TimetableInsert = Database['public']['Tables']['timetable']['Insert'];
type TimetableUpdate = Database['public']['Tables']['timetable']['Update'];
type AdvisorSubstitution = Database['public']['Tables']['advisor_substitutions']['Row'];
type AdvisorSubstitutionInsert = Database['public']['Tables']['advisor_substitutions']['Insert'];

export const facultyService = {
  async getFacultyProfile(userId: string) {
    const { data, error } = await supabase
      .from('faculty')
      .select(`
        *,
        advisor_class:classes(*)
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getFacultyById(facultyId: string) {
    const { data, error } = await supabase
      .from('faculty')
      .select(`
        *,
        advisor_class:classes(*)
      `)
      .eq('id', facultyId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAssignedClasses(facultyId: string) {
    const { data, error } = await supabase
      .from('timetable')
      .select(`
        class_id,
        class:classes(*)
      `)
      .eq('faculty_id', facultyId);

    if (error) throw error;

    const uniqueClasses = Array.from(
      new Map(data?.map(item => [item.class_id, item.class])).values()
    );

    return uniqueClasses;
  },

  async getTimetableForFaculty(facultyId: string) {
    const { data, error } = await supabase
      .from('timetable')
      .select(`
        *,
        class:classes(*)
      `)
      .eq('faculty_id', facultyId)
      .order('day_of_week')
      .order('period_number');

    if (error) throw error;
    return data;
  },

  async getTimetableForClass(classId: string, dayOfWeek?: number) {
    let query = supabase
      .from('timetable')
      .select(`
        *,
        faculty:faculty(*),
        class:classes(*)
      `)
      .eq('class_id', classId);

    if (dayOfWeek !== undefined) {
      query = query.eq('day_of_week', dayOfWeek);
    }

    const { data, error } = await query
      .order('day_of_week')
      .order('period_number');

    if (error) throw error;
    return data;
  },

  async updateTimetable(id: string, updates: TimetableUpdate) {
    const { data, error } = await supabase
      .from('timetable')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createTimetableEntry(entry: TimetableInsert) {
    const { data, error } = await supabase
      .from('timetable')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTimetableEntry(id: string) {
    const { error } = await supabase
      .from('timetable')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getStudentsByClass(classId: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .order('roll_number');

    if (error) throw error;
    return data;
  },

  async markAttendance(attendanceRecords: AttendanceInsert[]) {
    const { data, error } = await supabase
      .from('attendance_records')
      .insert(attendanceRecords)
      .select();

    if (error) throw error;
    return data;
  },

  async updateAttendance(id: string, updates: AttendanceUpdate) {
    const { data, error } = await supabase
      .from('attendance_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAttendanceByDate(classId: string, date: string) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        student:students(*),
        faculty:faculty(*)
      `)
      .eq('class_id', classId)
      .eq('date', date)
      .order('period_number')
      .order('student_id');

    if (error) throw error;
    return data;
  },

  async getAttendanceByDateAndPeriod(classId: string, date: string, periodNumber: number) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        student:students(*)
      `)
      .eq('class_id', classId)
      .eq('date', date)
      .eq('period_number', periodNumber)
      .order('student_id');

    if (error) throw error;
    return data;
  },

  async getAttendanceStats(classId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('attendance_records')
      .select('*')
      .eq('class_id', classId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const totalRecords = data?.length || 0;
    const presentCount = data?.filter(r => r.status === 'present').length || 0;
    const absentCount = data?.filter(r => r.status === 'absent').length || 0;

    return {
      totalRecords,
      presentCount,
      absentCount,
      attendanceRate: totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0,
    };
  },

  async createAdvisorSubstitution(substitution: AdvisorSubstitutionInsert) {
    const { data, error } = await supabase
      .from('advisor_substitutions')
      .insert(substitution)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getActiveSubstitutions(classId: string, currentDate: string) {
    const { data, error } = await supabase
      .from('advisor_substitutions')
      .select(`
        *,
        original_advisor:faculty!advisor_substitutions_original_advisor_id_fkey(*),
        substitute_advisor:faculty!advisor_substitutions_substitute_advisor_id_fkey(*)
      `)
      .eq('class_id', classId)
      .lte('from_date', currentDate)
      .gte('to_date', currentDate);

    if (error) throw error;
    return data;
  },

  async getAllFaculty() {
    const { data, error } = await supabase
      .from('faculty')
      .select('*')
      .order('full_name');

    if (error) throw error;
    return data;
  },
};
