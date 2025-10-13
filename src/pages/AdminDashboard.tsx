import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Users, GraduationCap, FileText, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const adminStats = [
    { label: "Total Students", value: "1,245", icon: GraduationCap, color: "gradient-primary" },
    { label: "Total Faculty", value: "87", icon: Users, color: "gradient-secondary" },
    { label: "Active Classes", value: "42", icon: FileText, color: "gradient-accent" }
  ];

  const managementOptions = [
    {
      title: "Faculty Management",
      description: "Create accounts, assign roles, and manage faculty",
      icon: Users,
      path: "/admin/faculty"
    },
    {
      title: "Student Management",
      description: "View and manage student records and attendance",
      icon: GraduationCap,
      path: "/admin/students"
    },
    {
      title: "Reports & Analytics",
      description: "Generate attendance reports and analytics",
      icon: FileText,
      path: "/admin/reports"
    },
    {
      title: "System Settings",
      description: "Configure system settings and preferences",
      icon: Settings,
      path: "/admin/settings"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-accent rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Portal</h1>
              <p className="text-sm text-muted-foreground">System Administration</p>
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
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {adminStats.map((stat, index) => (
            <Card key={index} className="shadow-medium hover:shadow-large transition-smooth">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Management Options */}
        <Card className="shadow-medium">
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">System Management</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {managementOptions.map((option, index) => (
                <Card 
                  key={index}
                  className="border-2 hover:border-primary transition-smooth cursor-pointer group"
                  onClick={() => navigate(option.path)}
                >
                  <div className="p-6 space-y-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-bounce">
                      <option.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
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

export default AdminDashboard;
