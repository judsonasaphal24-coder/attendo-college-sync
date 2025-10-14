import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Faculty = Database['public']['Tables']['faculty']['Row'];
type FacultyInsert = Database['public']['Tables']['faculty']['Insert'];
type FacultyUpdate = Database['public']['Tables']['faculty']['Update'];
type Student = Database['public']['Tables']['students']['Row'];
type StudentInsert = Database['public']['Tables']['students']['Insert'];
type StudentUpdate = Database['public']['Tables']['students']['Update'];
type Class = Database['public']['Tables']['classes']['Row'];
type ClassInsert = Database['public']['Tables']['classes']['Insert'];
type AttendanceRecord = Database['public']['Tables']['attendance_records']['Row'];

export const adminService = {
  async getAllFaculty() {
    const { data, error } = await supabase
      .from('faculty')
      .select(`
        *,
        advisor_class:classes(*)
      `)
      .order('full_name');

    if (error) throw error;
    return data;
  },

  async getFacultyById(id: string) {
    const { data, error } = await supabase
      .from('faculty')
      .select(`
        *,
        advisor_class:classes(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createFaculty(faculty: FacultyInsert) {
    const { data, error } = await supabase
      .from('faculty')
      .insert(faculty)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFaculty(id: string, updates: FacultyUpdate) {
    const { data, error } = await supabase
      .from('faculty')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteFaculty(id: string) {
    const { error } = await supabase
      .from('faculty')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getAllStudents() {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        class:classes(*)
      `)
      .order('roll_number');

    if (error) throw error;
    return data;
  },

  async getStudentById(id: string) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        class:classes(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createStudent(student: StudentInsert) {
    const { data, error } = await supabase
      .from('students')
      .insert(student)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStudent(id: string, updates: StudentUpdate) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteStudent(id: string) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getAllClasses() {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('year', { ascending: false })
      .order('section');

    if (error) throw error;
    return data;
  },

  async getClassById(id: string) {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createClass(classData: ClassInsert) {
    const { data, error } = await supabase
      .from('classes')
      .insert(classData)
      .select()
      .single();

    if (error) throw error;
    return data;
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

  async getAttendanceStats() {
    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        id,
        status,
        date,
        student:students(full_name, roll_number),
        class:classes(class_name)
      `);

    if (error) throw error;

    const totalRecords = data?.length || 0;
    const presentCount = data?.filter(r => r.status === 'present').length || 0;
    const absentCount = data?.filter(r => r.status === 'absent').length || 0;

    return {
      totalRecords,
      presentCount,
      absentCount,
      attendanceRate: totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0,
      records: data,
    };
  },

  async getAttendanceByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        student:students(*),
        class:classes(*),
        faculty:faculty(*)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getTimetableByClass(classId: string) {
    const { data, error } = await supabase
      .from('timetable')
      .select(`
        *,
        faculty:faculty(*),
        class:classes(*)
      `)
      .eq('class_id', classId)
      .order('day_of_week')
      .order('period_number');

    if (error) throw error;
    return data;
  },
};
