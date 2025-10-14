import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Book } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@/components/CircularProgress";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const StudentDashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/student-login");
      }
    });
  }, [navigate]);

  // Mock student data - In real app, this would come from backend
  const studentData = {
    name: "John Doe",
    rollNumber: "21CS001",
    department: "Computer Science",
    overallAttendance: 85.5,
    subjects: [
      { name: "Data Structures", attendance: 92.0, present: 46, total: 50 },
      { name: "Database Management", attendance: 88.0, present: 44, total: 50 },
      { name: "Operating Systems", attendance: 80.0, present: 40, total: 50 },
      { name: "Computer Networks", attendance: 78.0, present: 39, total: 50 },
      { name: "Web Technologies", attendance: 90.0, present: 45, total: 50 }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Student Portal</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {studentData.name}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/login-selection")}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Student Info Card */}
        <Card className="shadow-medium">
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              Student Information
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{studentData.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Roll Number</p>
                <p className="text-lg font-semibold">{studentData.rollNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="text-lg font-semibold">{studentData.department}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Overall Attendance */}
        <Card className="shadow-medium">
          <div className="p-6 text-center space-y-4">
            <h2 className="text-2xl font-bold">Overall Attendance</h2>
            <div className="flex justify-center py-4">
              <CircularProgress 
                percentage={studentData.overallAttendance} 
                size={160}
                strokeWidth={12}
              />
            </div>
          </div>
        </Card>

        {/* Subject-wise Attendance */}
        <Card className="shadow-medium">
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Book className="w-6 h-6 text-primary" />
              Subject-wise Attendance
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentData.subjects.map((subject, index) => (
                <Card key={index} className="border-2 hover:border-primary transition-smooth">
                  <div className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg">{subject.name}</h3>
                    <div className="flex justify-center">
                      <CircularProgress 
                        percentage={subject.attendance}
                        size={120}
                      />
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      <p>Present: {subject.present} / {subject.total}</p>
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

export default StudentDashboard;
