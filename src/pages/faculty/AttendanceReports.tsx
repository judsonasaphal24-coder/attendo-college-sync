import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import CircularProgress from "@/components/CircularProgress";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface StudentAttendance {
  id: string;
  roll_number: string;
  full_name: string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  ondutyCount: number;
  percentage: number;
}

const AttendanceReports = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (userProfile?.advisor_class_id) {
      fetchAttendanceReports();
    } else {
      toast.error("You are not a class advisor");
      navigate("/faculty-dashboard");
    }
  }, [userProfile]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = students.filter(
        (student) =>
          student.roll_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const fetchAttendanceReports = async () => {
    if (!userProfile?.advisor_class_id) return;

    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("id, roll_number, full_name")
        .eq("class_id", userProfile.advisor_class_id)
        .order("roll_number");

      if (studentsError) throw studentsError;

      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance_records")
        .select("student_id, status")
        .eq("class_id", userProfile.advisor_class_id);

      if (attendanceError) throw attendanceError;

      const attendanceMap = new Map<string, any>();

      attendanceData?.forEach((record) => {
        if (!attendanceMap.has(record.student_id)) {
          attendanceMap.set(record.student_id, {
            total: 0,
            present: 0,
            absent: 0,
            leave: 0,
            onduty: 0,
          });
        }
        const stats = attendanceMap.get(record.student_id);
        stats.total += 1;
        if (record.status === "present") stats.present += 1;
        if (record.status === "absent") stats.absent += 1;
        if (record.status === "leave") stats.leave += 1;
        if (record.status === "onduty") stats.onduty += 1;
      });

      const studentAttendance: StudentAttendance[] =
        studentsData?.map((student) => {
          const stats = attendanceMap.get(student.id) || {
            total: 0,
            present: 0,
            absent: 0,
            leave: 0,
            onduty: 0,
          };
          const effectivePresent = stats.present + stats.onduty;
          const percentage = stats.total > 0 ? (effectivePresent / stats.total) * 100 : 0;

          return {
            id: student.id,
            roll_number: student.roll_number,
            full_name: student.full_name,
            totalClasses: stats.total,
            presentCount: stats.present,
            absentCount: stats.absent,
            leaveCount: stats.leave,
            ondutyCount: stats.onduty,
            percentage,
          };
        }) || [];

      setStudents(studentAttendance);
      setFilteredStudents(studentAttendance);
    } catch (error: any) {
      console.error("Error fetching attendance reports:", error);
      toast.error("Failed to load attendance reports");
    } finally {
      setLoading(false);
    }
  };

  const downloadClassReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Class Attendance Report", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Class: ${userProfile?.classes?.class_name || "Unknown"}`, 14, 35);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 42);
    doc.text(`Total Students: ${students.length}`, 14, 49);

    const classAverage =
      students.length > 0
        ? students.reduce((sum, s) => sum + s.percentage, 0) / students.length
        : 0;
    doc.text(`Class Average Attendance: ${classAverage.toFixed(2)}%`, 14, 56);

    const tableData = students.map((student) => [
      student.roll_number,
      student.full_name,
      student.totalClasses.toString(),
      student.presentCount.toString(),
      student.absentCount.toString(),
      student.leaveCount.toString(),
      student.ondutyCount.toString(),
      `${student.percentage.toFixed(2)}%`,
    ]);

    autoTable(doc, {
      startY: 65,
      head: [["Roll No", "Name", "Total", "Present", "Absent", "Leave", "On Duty", "Percentage"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246],
        fontSize: 9,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        7: { halign: "right" },
      },
    });

    const fileName = `${userProfile?.classes?.class_name}_Attendance_Report.pdf`;
    doc.save(fileName.replace(/ /g, "_"));
    toast.success("Class report downloaded!");
  };

  const downloadStudentReport = (student: StudentAttendance) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Student Attendance Report", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 28, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Student Information", 14, 40);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${student.full_name}`, 14, 48);
    doc.text(`Roll Number: ${student.roll_number}`, 14, 55);
    doc.text(`Class: ${userProfile?.classes?.class_name || "Unknown"}`, 14, 62);
    doc.text(`Overall Attendance: ${student.percentage.toFixed(2)}%`, 14, 69);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Attendance Summary", 14, 83);

    const summaryData = [
      ["Total Classes", student.totalClasses.toString()],
      ["Present", student.presentCount.toString()],
      ["Absent", student.absentCount.toString()],
      ["Leave", student.leaveCount.toString()],
      ["On Duty", student.ondutyCount.toString()],
      ["Attendance Percentage", `${student.percentage.toFixed(2)}%`],
    ];

    autoTable(doc, {
      startY: 88,
      head: [["Category", "Count"]],
      body: summaryData,
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246],
        fontSize: 10,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 9,
      },
    });

    const fileName = `${student.roll_number}_Attendance_Report.pdf`;
    doc.save(fileName);
    toast.success("Student report downloaded!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading attendance reports...</p>
      </div>
    );
  }

  const classAverage =
    students.length > 0 ? students.reduce((sum, s) => sum + s.percentage, 0) / students.length : 0;

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Attendance Reports</h1>
            <p className="text-muted-foreground">
              Class: {userProfile?.classes?.class_name || "Unknown"}
            </p>
          </div>
          <Button onClick={downloadClassReport} className="gradient-primary">
            <Download className="w-4 h-4 mr-2" />
            Download Class Report
          </Button>
        </div>

        <Card className="shadow-medium">
          <div className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{students.length}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary">{classAverage.toFixed(2)}%</p>
                <p className="text-sm text-muted-foreground">Class Average</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">
                  {students.filter((s) => s.percentage >= 75).length}
                </p>
                <p className="text-sm text-muted-foreground">Above 75%</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-destructive">
                  {students.filter((s) => s.percentage < 75).length}
                </p>
                <p className="text-sm text-muted-foreground">Below 75%</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="shadow-medium">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by roll number or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="border-2 hover:border-primary transition-smooth">
                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-lg">{student.full_name}</p>
                      <p className="text-sm text-muted-foreground">{student.roll_number}</p>
                    </div>

                    <div className="flex justify-center">
                      <CircularProgress percentage={student.percentage} size={100} />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Classes:</span>
                        <span className="font-medium">{student.totalClasses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Present:</span>
                        <span className="font-medium text-secondary">{student.presentCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Absent:</span>
                        <span className="font-medium text-destructive">{student.absentCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Leave:</span>
                        <span className="font-medium text-accent">{student.leaveCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">On Duty:</span>
                        <span className="font-medium text-primary">{student.ondutyCount}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => downloadStudentReport(student)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No students found</p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AttendanceReports;
