import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Period {
  day: string;
  period: number;
  subject: string;
  faculty: string;
}

const TimetableManagement = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periods = [1, 2, 3, 4, 5, 6, 7];
  
  // Mock faculty list
  const facultyList = [
    "Dr. Sarah Johnson",
    "Prof. Michael Chen",
    "Dr. Emily Davis",
    "Prof. Robert Wilson",
    "Dr. Lisa Anderson"
  ];

  // Mock timetable data
  const [timetable, setTimetable] = useState<Period[]>([
    { day: "Monday", period: 1, subject: "Data Structures", faculty: "Dr. Sarah Johnson" },
    { day: "Monday", period: 2, subject: "Database Management", faculty: "Prof. Michael Chen" },
    { day: "Monday", period: 3, subject: "Operating Systems", faculty: "Dr. Emily Davis" },
    { day: "Tuesday", period: 1, subject: "Computer Networks", faculty: "Prof. Robert Wilson" },
    { day: "Tuesday", period: 2, subject: "Web Technologies", faculty: "Dr. Lisa Anderson" },
  ]);

  const getPeriodData = (day: string, period: number) => {
    return timetable.find(t => t.day === day && t.period === period);
  };

  const handleSave = () => {
    toast.success("Timetable saved successfully!");
    setIsEditing(false);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Timetable Management</h1>
            <p className="text-muted-foreground">Managing: 3rd Year CSE A</p>
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
                <Button variant="outline" onClick={() => setIsEditing(false)}>
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
                  {periods.map(period => (
                    <th key={period} className="p-3 text-center font-bold">
                      Period {period}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map(day => (
                  <tr key={day} className="border-b hover:bg-muted/50 transition-smooth">
                    <td className="p-3 font-semibold">{day}</td>
                    {periods.map(period => {
                      const periodData = getPeriodData(day, period);
                      return (
                        <td key={`${day}-${period}`} className="p-3">
                          {isEditing ? (
                            <div className="space-y-2">
                              <Select defaultValue={periodData?.faculty}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select Faculty" />
                                </SelectTrigger>
                                <SelectContent>
                                  {facultyList.map(faculty => (
                                    <SelectItem key={faculty} value={faculty}>
                                      {faculty}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : periodData ? (
                            <div className="text-center space-y-1">
                              <p className="font-medium text-sm">{periodData.subject}</p>
                              <p className="text-xs text-muted-foreground">{periodData.faculty}</p>
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground text-sm">
                              Free Period
                            </div>
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

        {/* Time slots reference */}
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
                { period: 7, time: "04:00 - 05:00" }
              ].map(slot => (
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
