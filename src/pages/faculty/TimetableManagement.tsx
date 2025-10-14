import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const TimetableManagement = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [editedEntries, setEditedEntries] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  useEffect(() => {
    if (userProfile?.advisor_class_id) {
      fetchTimetable();
    } else {
      toast.error("You are not a class advisor");
      navigate("/faculty-dashboard");
    }
  }, [userProfile]);

  const fetchTimetable = async () => {
    if (!userProfile?.advisor_class_id) return;

    try {
      const { data, error } = await supabase
        .from("timetable")
        .select("*, faculty(full_name)")
        .eq("class_id", userProfile.advisor_class_id)
        .order("day_of_week")
        .order("period_number");

      if (error) throw error;
      setTimetable(data || []);
    } catch (error) {
      console.error("Error fetching timetable:", error);
      toast.error("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  const getPeriodData = (dayIndex: number, period: number) => {
    return timetable.find((t) => t.day_of_week === dayIndex + 1 && t.period_number === period);
  };

  const handleSubjectChange = (dayIndex: number, period: number, subject: string) => {
    const key = `${dayIndex + 1}-${period}`;
    const existing = getPeriodData(dayIndex, period);
    setEditedEntries(
      new Map(editedEntries).set(key, {
        day_of_week: dayIndex + 1,
        period_number: period,
        subject: subject || null,
        id: existing?.id,
      })
    );
  };

  const handleSave = async () => {
    if (!userProfile?.advisor_class_id) return;

    try {
      const updates = Array.from(editedEntries.values()).filter((entry) => entry.subject);

      const upsertData = updates.map((entry) => ({
        id: entry.id,
        class_id: userProfile.advisor_class_id,
        day_of_week: entry.day_of_week,
        period_number: entry.period_number,
        subject: entry.subject,
        faculty_id: userProfile.id,
      }));

      if (upsertData.length > 0) {
        const { error } = await supabase.from("timetable").upsert(upsertData);
        if (error) throw error;
      }

      toast.success("Timetable updated successfully!");
      setIsEditing(false);
      setEditedEntries(new Map());
      fetchTimetable();
    } catch (error: any) {
      console.error("Error saving timetable:", error);
      toast.error(error.message || "Failed to update timetable");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading timetable...</p>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Timetable Management</h1>
            <p className="text-muted-foreground">
              Managing: {userProfile?.classes?.class_name || "Unknown Class"}
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="gradient-secondary">
                <Edit className="w-4 h-4 mr-2" />
                Edit Timetable
              </Button>
            ) : (
              <>
                <Button onClick={handleSave} className="gradient-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedEntries(new Map());
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        <Card className="shadow-medium overflow-x-auto">
          <div className="p-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-bold">Day / Period</th>
                  {periods.map((period) => (
                    <th key={period} className="p-3 text-center font-bold">
                      Period {period}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day, dayIndex) => (
                  <tr key={day} className="border-b hover:bg-muted/50 transition-smooth">
                    <td className="p-3 font-semibold">{day}</td>
                    {periods.map((period) => {
                      const periodData = getPeriodData(dayIndex, period);
                      const editKey = `${dayIndex + 1}-${period}`;
                      const editedValue = editedEntries.get(editKey);
                      return (
                        <td key={`${day}-${period}`} className="p-3">
                          {isEditing ? (
                            <Input
                              placeholder="Subject"
                              defaultValue={periodData?.subject || ""}
                              onChange={(e) => handleSubjectChange(dayIndex, period, e.target.value)}
                              className="text-sm"
                            />
                          ) : periodData ? (
                            <div className="text-center space-y-1">
                              <p className="font-medium text-sm">{periodData.subject}</p>
                              <p className="text-xs text-muted-foreground">
                                {periodData.faculty?.full_name || "TBA"}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground text-sm">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="shadow-medium">
          <div className="p-6">
            <h3 className="font-bold mb-4">Period Timings</h3>
            <div className="grid md:grid-cols-7 gap-4">
              {[
                { period: 1, time: "09:00 - 10:00" },
                { period: 2, time: "10:00 - 11:00" },
                { period: 3, time: "11:00 - 12:00" },
                { period: 4, time: "12:00 - 01:00" },
                { period: 5, time: "02:00 - 03:00" },
                { period: 6, time: "03:00 - 04:00" },
                { period: 7, time: "04:00 - 05:00" },
              ].map((slot) => (
                <div key={slot.period} className="text-center">
                  <p className="font-semibold">Period {slot.period}</p>
                  <p className="text-sm text-muted-foreground">{slot.time}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default TimetableManagement;
