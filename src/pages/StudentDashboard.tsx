import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Book, Download, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@/components/CircularProgress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { generateAttendancePDF, generateTimetablePDF } from "@/utils/pdfGenerator";
import { toast } from "sonner";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut, loading: authLoading } = useAuth();
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/student-login");
      return;
    }

    if (userProfile) {
      fetchAttendanceData();
      fetchTimetable();
    }
  }, [user, userProfile, authLoading]);

  const fetchAttendanceData = async () => {
    if (!userProfile?.id) return;

    try {
      const { data: records } = await supabase
        .from("attendance_records")
        .select("*, classes(class_name, department)")
        .eq("student_id", userProfile.id);

      const subjectMap = new Map();

      records?.forEach((record: any) => {
        const subject = record.subject || "Unknown";
        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, { total: 0, present: 0 });
        }
        const stats = subjectMap.get(subject);
        stats.total += 1;
        if (record.status === "present" || record.status === "onduty") {
          stats.present += 1;
        }
      });

      const subjects = Array.from(subjectMap.entries()).map(([name, stats]: any) => ({
        name,
        attendance: stats.total > 0 ? (stats.present / stats.total) * 100 : 0,
        present: stats.present,
        total: stats.total,
      }));

      const totalPresent = subjects.reduce((sum, s) => sum + s.present, 0);
      const totalClasses = subjects.reduce((sum, s) => sum + s.total, 0);
      const overallAttendance = totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;

      setAttendanceData({
        name: userProfile.full_name,
        rollNumber: userProfile.roll_number,
        department: userProfile.classes?.department || "Computer Science",
        className: userProfile.classes?.class_name || "",
        overallAttendance,
        subjects,
      });
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    if (!userProfile?.class_id) return;

    try {
      const { data } = await supabase
        .from("timetable")
        .select("*, faculty(full_name)")
        .eq("class_id", userProfile.class_id)
        .order("day_of_week")
        .order("period_number");

      setTimetable(data || []);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  const handleDownloadAttendance = () => {
    if (attendanceData) {
      generateAttendancePDF({
        name: attendanceData.name,
        rollNumber: attendanceData.rollNumber,
        department: attendanceData.department,
        className: attendanceData.className,
        overallAttendance: attendanceData.overallAttendance,
        subjects: attendanceData.subjects,
      });
      toast.success("Attendance report downloaded!");
    }
  };

  const handleDownloadTimetable = () => {
    if (timetable.length > 0 && userProfile?.classes) {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const timetableData = timetable.map((entry) => ({
        day: days[entry.day_of_week],
        period: entry.period_number,
        subject: entry.subject,
        faculty: entry.faculty?.full_name || "TBA",
      }));

      generateTimetablePDF(userProfile.classes.class_name, timetableData);
      toast.success("Timetable downloaded!");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login-selection");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">No data available</p>
      </div>
    );
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Student Portal</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {attendanceData.name}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card className="shadow-medium">
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              Student Information
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{attendanceData.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Roll Number</p>
                <p className="text-lg font-semibold">{attendanceData.rollNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="text-lg font-semibold">{attendanceData.department}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="text-lg font-semibold">{attendanceData.className}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="shadow-medium">
          <div className="p-6 text-center space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Overall Attendance</h2>
              <Button onClick={handleDownloadAttendance} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
            <div className="flex justify-center py-4">
              <CircularProgress
                percentage={attendanceData.overallAttendance}
                size={160}
                strokeWidth={12}
              />
            </div>
          </div>
        </Card>

        <Card className="shadow-medium">
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Book className="w-6 h-6 text-primary" />
              Subject-wise Attendance
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendanceData.subjects.map((subject: any, index: number) => (
                <Card key={index} className="border-2 hover:border-primary transition-smooth">
                  <div className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg">{subject.name}</h3>
                    <div className="flex justify-center">
                      <CircularProgress percentage={subject.attendance} size={120} />
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      <p>
                        Present: {subject.present} / {subject.total}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>

        <Card className="shadow-medium">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                Class Timetable
              </h2>
              <Button onClick={handleDownloadTimetable} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Timetable
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-3 text-left font-semibold">Period</th>
                    {days.map((day) => (
                      <th key={day} className="border p-3 text-center font-semibold">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7].map((period) => (
                    <tr key={period} className="hover:bg-muted/50">
                      <td className="border p-3 font-medium">Period {period}</td>
                      {days.map((day, dayIndex) => {
                        const entry = timetable.find(
                          (t) => t.day_of_week === dayIndex + 1 && t.period_number === period
                        );
                        return (
                          <td key={day} className="border p-3 text-center text-sm">
                            {entry ? (
                              <div>
                                <div className="font-medium">{entry.subject}</div>
                                <div className="text-xs text-muted-foreground">
                                  {entry.faculty?.full_name || "TBA"}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default StudentDashboard;
