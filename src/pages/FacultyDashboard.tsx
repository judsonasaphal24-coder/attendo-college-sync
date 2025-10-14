import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar, ClipboardList, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut, loading: authLoading } = useAuth();
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/faculty-login");
      return;
    }

    if (userProfile) {
      fetchTodaySchedule();
    }
  }, [user, userProfile, authLoading]);

  const fetchTodaySchedule = async () => {
    if (!userProfile?.id) return;

    try {
      const today = new Date().getDay();

      const { data } = await supabase
        .from("timetable")
        .select("*, classes(class_name, year, section)")
        .eq("faculty_id", userProfile.id)
        .eq("day_of_week", today)
        .order("period_number");

      setTodayClasses(data || []);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login-selection");
  };

  const handleTakeAttendance = (classData: any) => {
    navigate("/faculty/attendance-marking", {
      state: {
        classId: classData.class_id,
        className: classData.classes?.class_name,
        period: classData.period_number,
        subject: classData.subject,
      },
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">No profile found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-secondary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Faculty Portal</h1>
              <p className="text-sm text-muted-foreground">Welcome, {userProfile.full_name}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Tabs defaultValue="teaching" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="teaching">Teaching Faculty</TabsTrigger>
            <TabsTrigger value="advisor" disabled={!userProfile.is_class_advisor}>
              Class Advisor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teaching" className="space-y-6">
            <Card className="shadow-medium">
              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-primary" />
                  Today's Schedule
                </h2>
                {todayClasses.length === 0 ? (
                  <p className="text-muted-foreground">No classes scheduled for today</p>
                ) : (
                  <div className="space-y-3">
                    {todayClasses.map((classItem) => (
                      <Card
                        key={classItem.id}
                        className="border-2 hover:border-primary transition-smooth"
                      >
                        <div className="p-4 flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-semibold text-lg">Period {classItem.period_number}</p>
                            <p className="text-sm">
                              <span className="font-medium">Class:</span>{" "}
                              {classItem.classes?.class_name}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Subject:</span> {classItem.subject}
                            </p>
                          </div>
                          <Button
                            className="gradient-primary"
                            onClick={() => handleTakeAttendance(classItem)}
                          >
                            <ClipboardList className="w-4 h-4 mr-2" />
                            Take Attendance
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="advisor" className="space-y-6">
            <Card className="shadow-medium">
              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold">Class Advisor Dashboard</h2>
                <p className="text-muted-foreground">
                  Managing: {userProfile.classes?.class_name || "No class assigned"}
                </p>

                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <Button
                    size="lg"
                    className="h-24 flex flex-col gap-2"
                    onClick={() => navigate("/faculty/timetable-management")}
                  >
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
