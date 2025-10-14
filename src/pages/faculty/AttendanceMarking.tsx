import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Student {
  id: string;
  rollNo: string;
  name: string;
  status: "present" | "absent" | "leave" | "onduty";
}

const AttendanceMarking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const classInfo = location.state || {
    classId: null,
    className: "Unknown Class",
    period: 1,
    subject: "Unknown Subject",
  };

  useEffect(() => {
    if (classInfo.classId) {
      fetchStudents();
    } else {
      toast.error("No class information provided");
      navigate("/faculty-dashboard");
    }
  }, [classInfo.classId]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("id, roll_number, full_name")
        .eq("class_id", classInfo.classId)
        .order("roll_number");

      if (error) throw error;

      const today = new Date().toISOString().split("T")[0];

      const { data: existingAttendance } = await supabase
        .from("attendance_records")
        .select("student_id, status")
        .eq("date", today)
        .eq("period_number", classInfo.period)
        .in(
          "student_id",
          data?.map((s) => s.id) || []
        );

      const attendanceMap = new Map(
        existingAttendance?.map((a) => [a.student_id, a.status]) || []
      );

      setStudents(
        data?.map((s) => ({
          id: s.id,
          rollNo: s.roll_number,
          name: s.full_name,
          status: (attendanceMap.get(s.id) as any) || "present",
        })) || []
      );
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const updateStudentStatus = (
    studentId: string,
    status: "present" | "absent" | "leave" | "onduty"
  ) => {
    setStudents(students.map((s) => (s.id === studentId ? { ...s, status } : s)));
  };

  const handleSaveAttendance = async () => {
    if (!userProfile?.id) {
      toast.error("Faculty profile not found");
      return;
    }

    setSaving(true);

    try {
      const today = new Date().toISOString().split("T")[0];

      const attendanceRecords = students.map((student) => ({
        student_id: student.id,
        class_id: classInfo.classId,
        faculty_id: userProfile.id,
        date: today,
        period_number: classInfo.period,
        status: student.status,
        subject: classInfo.subject,
        marked_by: userProfile.id,
        marked_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("attendance_records").upsert(attendanceRecords, {
        onConflict: "student_id,date,period_number",
        ignoreDuplicates: false,
      });

      if (error) throw error;

      const presentCount = students.filter((s) => s.status === "present").length;
      const absentCount = students.filter((s) => s.status === "absent").length;

      toast.success(`Attendance saved! Present: ${presentCount}, Absent: ${absentCount}`);
      navigate("/faculty-dashboard");
    } catch (error: any) {
      console.error("Error saving attendance:", error);
      toast.error(error.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/faculty-dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card className="shadow-medium">
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="text-lg font-semibold">Period {classInfo.period}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="text-lg font-semibold">{classInfo.className}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="text-lg font-semibold">{classInfo.subject}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="shadow-medium">
          <div className="p-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">
                  {students.filter((s) => s.status === "present").length}
                </p>
                <p className="text-sm text-muted-foreground">Present</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">
                  {students.filter((s) => s.status === "absent").length}
                </p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">
                  {students.filter((s) => s.status === "leave").length}
                </p>
                <p className="text-sm text-muted-foreground">Leave</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {students.filter((s) => s.status === "onduty").length}
                </p>
                <p className="text-sm text-muted-foreground">On Duty</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="shadow-medium">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Mark Attendance</h2>
              <Button
                onClick={handleSaveAttendance}
                className="gradient-primary"
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Attendance"}
              </Button>
            </div>

            <div className="space-y-3">
              {students.map((student) => (
                <Card key={student.id} className="border-2">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.rollNo}</p>
                      </div>

                      <RadioGroup
                        value={student.status}
                        onValueChange={(value: "present" | "absent" | "leave" | "onduty") =>
                          updateStudentStatus(student.id, value)
                        }
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="present" id={`${student.id}-present`} />
                          <Label
                            htmlFor={`${student.id}-present`}
                            className="text-secondary font-medium cursor-pointer"
                          >
                            Present
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="absent" id={`${student.id}-absent`} />
                          <Label
                            htmlFor={`${student.id}-absent`}
                            className="text-destructive font-medium cursor-pointer"
                          >
                            Absent
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="leave" id={`${student.id}-leave`} />
                          <Label
                            htmlFor={`${student.id}-leave`}
                            className="text-accent font-medium cursor-pointer"
                          >
                            Leave
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="onduty" id={`${student.id}-onduty`} />
                          <Label
                            htmlFor={`${student.id}-onduty`}
                            className="text-primary font-medium cursor-pointer"
                          >
                            On Duty
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AttendanceMarking;
