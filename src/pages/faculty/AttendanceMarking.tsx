import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Student {
  rollNo: string;
  name: string;
  status: "present" | "absent" | "leave" | "onduty";
}

const AttendanceMarking = () => {
  const navigate = useNavigate();
  
  // Mock class data
  const classInfo = {
    period: 3,
    time: "11:00 - 12:00",
    class: "3rd Year CSE A",
    subject: "Database Management"
  };

  // Mock students - all default to present
  const [students, setStudents] = useState<Student[]>([
    { rollNo: "21CS001", name: "John Doe", status: "present" },
    { rollNo: "21CS002", name: "Jane Smith", status: "present" },
    { rollNo: "21CS003", name: "Mike Johnson", status: "present" },
    { rollNo: "21CS004", name: "Sarah Williams", status: "present" },
    { rollNo: "21CS005", name: "David Brown", status: "present" },
    { rollNo: "21CS006", name: "Emily Davis", status: "present" },
    { rollNo: "21CS007", name: "Robert Wilson", status: "present" },
    { rollNo: "21CS008", name: "Lisa Anderson", status: "present" },
    { rollNo: "21CS009", name: "James Taylor", status: "present" },
    { rollNo: "21CS010", name: "Maria Garcia", status: "present" },
  ]);

  const updateStudentStatus = (rollNo: string, status: "present" | "absent" | "leave" | "onduty") => {
    setStudents(students.map(s => 
      s.rollNo === rollNo ? { ...s, status } : s
    ));
  };

  const handleSaveAttendance = () => {
    const presentCount = students.filter(s => s.status === "present").length;
    const absentCount = students.filter(s => s.status === "absent").length;
    
    toast.success(`Attendance saved! Present: ${presentCount}, Absent: ${absentCount}`);
    navigate("/faculty-dashboard");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "text-secondary";
      case "absent": return "text-destructive";
      case "leave": return "text-accent";
      case "onduty": return "text-primary";
      default: return "";
    }
  };

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
        {/* Class Info */}
        <Card className="shadow-medium">
          <div className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="text-lg font-semibold">Period {classInfo.period}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="text-lg font-semibold">{classInfo.time}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="text-lg font-semibold">{classInfo.class}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="text-lg font-semibold">{classInfo.subject}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Attendance Summary */}
        <Card className="shadow-medium">
          <div className="p-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">{students.filter(s => s.status === "present").length}</p>
                <p className="text-sm text-muted-foreground">Present</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">{students.filter(s => s.status === "absent").length}</p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{students.filter(s => s.status === "leave").length}</p>
                <p className="text-sm text-muted-foreground">Leave</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{students.filter(s => s.status === "onduty").length}</p>
                <p className="text-sm text-muted-foreground">On Duty</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Student List */}
        <Card className="shadow-medium">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Mark Attendance</h2>
              <Button onClick={handleSaveAttendance} className="gradient-primary">
                <Save className="w-4 h-4 mr-2" />
                Save Attendance
              </Button>
            </div>

            <div className="space-y-3">
              {students.map((student) => (
                <Card key={student.rollNo} className="border-2">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.rollNo}</p>
                      </div>
                      
                      <RadioGroup
                        value={student.status}
                        onValueChange={(value: "present" | "absent" | "leave" | "onduty") => 
                          updateStudentStatus(student.rollNo, value)
                        }
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="present" id={`${student.rollNo}-present`} />
                          <Label htmlFor={`${student.rollNo}-present`} className="text-secondary font-medium cursor-pointer">
                            Present
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="absent" id={`${student.rollNo}-absent`} />
                          <Label htmlFor={`${student.rollNo}-absent`} className="text-destructive font-medium cursor-pointer">
                            Absent
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="leave" id={`${student.rollNo}-leave`} />
                          <Label htmlFor={`${student.rollNo}-leave`} className="text-accent font-medium cursor-pointer">
                            Leave
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="onduty" id={`${student.rollNo}-onduty`} />
                          <Label htmlFor={`${student.rollNo}-onduty`} className="text-primary font-medium cursor-pointer">
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
