import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar, ClipboardList, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FacultyDashboard = () => {
  const navigate = useNavigate();

  // Mock faculty data
  const facultyData = {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@college.edu",
    isClassAdvisor: true,
    advisorClass: "3rd Year - CSE A"
  };

  // Mock timetable
  const todayClasses = [
    { period: 1, time: "09:00 - 10:00", class: "2nd Year CSE B", subject: "Data Structures" },
    { period: 3, time: "11:00 - 12:00", class: "3rd Year CSE A", subject: "Database Management" },
    { period: 5, time: "02:00 - 03:00", class: "2nd Year CSE A", subject: "Data Structures" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-secondary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Faculty Portal</h1>
              <p className="text-sm text-muted-foreground">Welcome, {facultyData.name}</p>
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
        <Tabs defaultValue="teaching" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="teaching">Teaching Faculty</TabsTrigger>
            <TabsTrigger value="advisor" disabled={!facultyData.isClassAdvisor}>
              Class Advisor
            </TabsTrigger>
          </TabsList>

          {/* Teaching Faculty Tab */}
          <TabsContent value="teaching" className="space-y-6">
            {/* Today's Schedule */}
            <Card className="shadow-medium">
              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-primary" />
                  Today's Schedule
                </h2>
                <div className="space-y-3">
                  {todayClasses.map((classItem) => (
                    <Card key={classItem.period} className="border-2 hover:border-primary transition-smooth">
                      <div className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-lg">Period {classItem.period}</p>
                          <p className="text-sm text-muted-foreground">{classItem.time}</p>
                          <p className="text-sm"><span className="font-medium">Class:</span> {classItem.class}</p>
                          <p className="text-sm"><span className="font-medium">Subject:</span> {classItem.subject}</p>
                        </div>
                        <Button className="gradient-primary">
                          <ClipboardList className="w-4 h-4 mr-2" />
                          Take Attendance
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Class Advisor Tab */}
          <TabsContent value="advisor" className="space-y-6">
            <Card className="shadow-medium">
              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold">Class Advisor Dashboard</h2>
                <p className="text-muted-foreground">Managing: {facultyData.advisorClass}</p>
                
                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <Button size="lg" className="h-24 flex flex-col gap-2">
                    <Calendar className="w-6 h-6" />
                    <span>Manage Timetable</span>
                  </Button>
                  <Button size="lg" className="h-24 flex flex-col gap-2" variant="secondary">
                    <ClipboardList className="w-6 h-6" />
                    <span>View Attendance Reports</span>
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FacultyDashboard;
