import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const Dashboard = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const adminCards = [
    {
      title: "Studenti",
      icon: Users,
      path: "/students",
      description: "Upravljanje studentima",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Profesori",
      icon: GraduationCap,
      path: "/profesori",
      description: "Upravljanje profesorima",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Predmeti",
      icon: BookOpen,
      path: "/predmeti",
      description: "Upravljanje predmetima",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Unos Ocena",
      icon: GraduationCap,
      path: "/prijave-po-roku",
      description: "Unos ocena po rokovima",
      color: "from-green-500 to-green-600",
    },
  ];

  const studentCards = [
    {
      title: "Ispiti",
      icon: BookOpen,
      path: "/ispiti",
      description: "Prijava ispita",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Ocene",
      icon: GraduationCap,
      path: "/ocene",
      description: "Pregled ocena",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Info",
      icon: Users,
      path: "/info",
      description: "Lični podaci",
      color: "from-purple-500 to-purple-600",
    },
  ];

  const cards = role === "Administrator" ? adminCards : studentCards;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-3">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            {role === "Administrator" ? "Administratorski panel" : "Studentski portal"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {cards.map((card, index) => (
            <Card
              key={card.path}
              className="group cursor-pointer hover-lift border-2 transition-all duration-300 hover:border-primary animate-scale-in overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(card.path)}
            >
              <div className={`h-2 bg-gradient-to-r ${card.color}`} />
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className={`p-4 rounded-full bg-gradient-to-br ${card.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
