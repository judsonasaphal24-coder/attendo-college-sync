import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AttendanceRecord = Database['public']['Tables']['attendance_records']['Row'];
type Student = Database['public']['Tables']['students']['Row'];
type Timetable = Database['public']['Tables']['timetable']['Row'];

export const studentService = {
  async getStudentProfile(userId: string) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        class:classes(*)
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getStudentById(studentId: string) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        class:classes(*)
      `)
      .eq('id', studentId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getMyAttendance(studentId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('attendance_records')
      .select(`
        *,
        class:classes(*),
        faculty:faculty(*)
      `)
      .eq('student_id', studentId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query
      .order('date', { ascending: false })
      .order('period_number');

    if (error) throw error;
    return data;
  },

  async getAttendanceByDate(studentId: string, date: string) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        class:classes(*),
        faculty:faculty(*)
      `)
      .eq('student_id', studentId)
      .eq('date', date)
      .order('period_number');

    if (error) throw error;
    return data;
  },

  async getAttendanceStats(studentId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const totalClasses = data?.length || 0;
    const presentCount = data?.filter(r => r.status === 'present').length || 0;
    const absentCount = data?.filter(r => r.status === 'absent').length || 0;

    return {
      totalClasses,
      presentCount,
      absentCount,
      attendancePercentage: totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0,
    };
  },

  async getAttendanceBySubject(studentId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const subjectStats = data?.reduce((acc, record) => {
      const subject = record.subject || 'Unknown';
      if (!acc[subject]) {
        acc[subject] = {
          subject,
          total: 0,
          present: 0,
          absent: 0,
          percentage: 0,
        };
      }
      acc[subject].total += 1;
      if (record.status === 'present') {
        acc[subject].present += 1;
      } else if (record.status === 'absent') {
        acc[subject].absent += 1;
      }
      acc[subject].percentage = (acc[subject].present / acc[subject].total) * 100;
      return acc;
    }, {} as Record<string, { subject: string; total: number; present: number; absent: number; percentage: number }>);

    return Object.values(subjectStats || {});
  },

  async getMyTimetable(studentId: string) {
    const student = await this.getStudentById(studentId);

    if (!student?.class_id) {
      throw new Error('Student class not found');
    }

    const { data, error } = await supabase
      .from('timetable')
      .select(`
        *,
        faculty:faculty(*),
        class:classes(*)
      `)
      .eq('class_id', student.class_id)
      .order('day_of_week')
      .order('period_number');

    if (error) throw error;
    return data;
  },

  async getTimetableByDay(studentId: string, dayOfWeek: number) {
    const student = await this.getStudentById(studentId);

    if (!student?.class_id) {
      throw new Error('Student class not found');
    }

    const { data, error } = await supabase
      .from('timetable')
      .select(`
        *,
        faculty:faculty(*)
      `)
      .eq('class_id', student.class_id)
      .eq('day_of_week', dayOfWeek)
      .order('period_number');

    if (error) throw error;
    return data;
  },

  async getClassmates(studentId: string) {
    const student = await this.getStudentById(studentId);

    if (!student?.class_id) {
      throw new Error('Student class not found');
    }

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', student.class_id)
      .neq('id', studentId)
      .order('roll_number');

    if (error) throw error;
    return data;
  },

  async getClassAdvisor(studentId: string) {
    const student = await this.getStudentById(studentId);

    if (!student?.class_id) {
      throw new Error('Student class not found');
    }

    const { data, error } = await supabase
      .from('faculty')
      .select('*')
      .eq('advisor_class_id', student.class_id)
      .eq('is_class_advisor', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getMonthlyAttendanceSummary(studentId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const dailySummary = data?.reduce((acc, record) => {
      const date = record.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          total: 0,
          present: 0,
          absent: 0,
        };
      }
      acc[date].total += 1;
      if (record.status === 'present') {
        acc[date].present += 1;
      } else if (record.status === 'absent') {
        acc[date].absent += 1;
      }
      return acc;
    }, {} as Record<string, { date: string; total: number; present: number; absent: number }>);

    return Object.values(dailySummary || {});
  },
};
