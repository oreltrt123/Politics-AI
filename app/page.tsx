import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, TrendingUp, Scale, User } from "lucide-react";
import Header from '@/components/Layout/Header'
import  Footer  from "@/components/Layout/Footer";
import Section_1 from "@/components/Layout/Section/Section_1"

interface PoliticianData {
  name: string;
  party: string;
  speeches: number;
  influence: string;
}

interface LegislationData {
  title: string;
  date: string;
  description: string;
}

interface KnessetData {
  politicians: PoliticianData[];
  legislation: LegislationData[];
}

async function getWeeklyKnessetData(): Promise<KnessetData> {
    return {
      politicians: [
        { name: "בנימין נתניהו", party: "ליכוד", speeches: 12, influence: "ראש הממשלה - השפעה גבוהה על חקיקה" },
        { name: "אריה דרעי", party: "ש״ס", speeches: 8, influence: "מנהיג מפלגת ש״ס - דיונים על חוק הגיוס" },
        { name: "עופר כסיף", party: "חד״ש", speeches: 6, influence: "פעיל בנושאי זכויות פלסטינים" },
      ],
      legislation: [
        {
          title: "חוק הגיוס לישיבות",
          date: "23 אוקטובר 2025",
          description: "ש״ס פרשה מתפקידי הקואליציה בעקבות חוק הגיוס לחרדים",
        },
        {
          title: "דיון בהכרה במדינה פלסטינית",
          date: "18 אוקטובר 2025",
          description: "עופר כסיף הרים שלט בכנסת וסולק מהמליאה",
        },
      ],
    };
  }

export default async function HomePage() {
  const data = await getWeeklyKnessetData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header />
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 mt-20">
        {/* Title Section */}
        <div className="text-center mb-16">
          <h2 style={{ fontSize: "50px" }} className="text-black font-sans font-light leading-relaxed max-w-4xl w-full mx-auto text-center"><span className="text-[#0099FF]">הפוליטיקאים</span> המשפיעים ביותר השבוע</h2>
          <p className="font-sans font-light text-lg text-muted-foreground text-balance">מי דיבר הכי הרבה בכנסת והשפיע על החלטות השבוע</p>
        </div>

        {/* Podium Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="flex items-end justify-center gap-4 md:gap-8 mb-8">
            {/* Second Place */}
            <Link
              href={`/chat?politician=${encodeURIComponent(data.politicians[1]?.name || "")}`}
              className="flex-1 max-w-xs group"
            >
              <Card className="h-64 flex flex-col items-center justify-end p-6 bg-gradient-to-t from-muted to-[#0099ff34] cursor-pointer border-none">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-muted-foreground mb-2">2</div>
                  <h3 className="text-xl font-bold mb-1">{data.politicians[1]?.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{data.politicians[1]?.party}</p>
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>{data.politicians[1]?.speeches} נאומים</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#0099ff13] rounded-full" />
              </Card>
            </Link>

            {/* First Place */}
            <Link
              href={`/chat?politician=${encodeURIComponent(data.politicians[0]?.name || "")}`}
              className="flex-1 max-w-xs group"
            >
              <Card className="h-80 flex flex-col items-center justify-end p-6 bg-gradient-to-t from-muted to-[#0099ff34] cursor-pointer border-none">
                <div className="text-center mb-4">
                  <div className="text-6xl font-bold text-primary mb-2">1</div>
                  <h3 className="text-2xl font-bold mb-1">{data.politicians[0]?.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{data.politicians[0]?.party}</p>
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>{data.politicians[0]?.speeches} נאומים</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#0099ff1f] rounded-full" />
              </Card>
            </Link>

            {/* Third Place */}
            <Link
              href={`/chat?politician=${encodeURIComponent(data.politicians[2]?.name || "")}`}
              className="flex-1 max-w-xs group"
            >
              <Card className="h-64 flex flex-col items-center justify-end p-6 bg-gradient-to-t from-muted to-[#0099ff34] cursor-pointer border-none">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-muted-foreground mb-2">3</div>
                  <h3 className="text-lg font-bold mb-1">{data.politicians[2]?.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{data.politicians[2]?.party}</p>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <TrendingUp className="h-3 w-3" />
                    <span>{data.politicians[2]?.speeches} נאומים</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#0099ff13] rounded-full" />
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Legislation Section */}
        {/* <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-6 text-center">חקיקה והחלטות השבוע</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {data.legislation.map((item: LegislationData, index: number) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3">
                  <Scale className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div> */}
      </main>
        <Section_1 />
      {/* Footer */}
      <Footer />
    </div>
  );
}




// "use client";

// import Link from "next/link";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { MessageSquare, TrendingUp, Scale } from "lucide-react";
// import { useEffect, useState } from "react";
// import FAQ from '@/components/home/FAQ'

// interface PoliticianData {
//   name: string;
//   party: string;
//   speeches: number;
//   influence: string;
// }

// interface LegislationData {
//   title: string;
//   date: string;
//   description: string;
// }

// interface KnessetData {
//   politicians: PoliticianData[];
//   legislation: LegislationData[];
// }

// async function getWeeklyKnessetData(): Promise<KnessetData> {
//   return {
//     politicians: [
//       { name: "בנימין נתניהו", party: "ליכוד", speeches: 12, influence: "ראש הממשלה - השפעה גבוהה על חקיקה" },
//       { name: "אריה דרעי", party: "ש״ס", speeches: 8, influence: "מנהיג מפלגת ש״ס - דיונים על חוק הגיוס" },
//       { name: "עופר כסיף", party: "חד״ש", speeches: 6, influence: "פעיל בנושאי זכויות פלסטינים" },
//     ],
//     legislation: [
//       {
//         title: "חוק הגיוס לישיבות",
//         date: "23 אוקטובר 2025",
//         description: "ש״ס פרשה מתפקידי הקואליציה בעקבות חוק הגיוס לחרדים",
//       },
//       {
//         title: "דיון בהכרה במדינה פלסטינית",
//         date: "18 אוקטובר 2025",
//         description: "עופר כסיף הרים שלט בכנסת וסולק מהמליאה",
//       },
//     ],
//   };
// }

// export default function HomePage() {
//   const [data, setData] = useState<KnessetData | null>(null);
//   const [language, setLanguage] = useState<string>("he");

//   useEffect(() => {
//     getWeeklyKnessetData().then(setData);
//   }, []);

//   // Load language from localStorage on mount
//   useEffect(() => {
//     const savedLang = localStorage.getItem("siteLanguage");
//     if (savedLang) setLanguage(savedLang);
//   }, []);

//   const changeLanguage = (lang: string) => {
//     setLanguage(lang);
//     localStorage.setItem("siteLanguage", lang);
//   };

//   if (!data) return <div>Loading...</div>;

//   const texts = {
//     he: {
//       title: "הפוליטיקאים",
//       subtitle: "מי דיבר הכי הרבה בכנסת והשפיע על החלטות השבוע",
//       chatButton: "צ׳אט כללי",
//       footer: "כל הזכויות שמורות PoliticsAI • Politics AI עלול לטעות. בדקו מידע חשוב",
//       speeches: "נאומים",
//       influence: "השפעה",
//       rank: "דירוג",
//       party: "מפלגה",
//     },
//     en: {
//       title: "Politicians",
//       subtitle: "Who spoke the most in the Knesset and influenced decisions this week",
//       chatButton: "General Chat",
//       footer: "All rights reserved PoliticsAI • Politics AI can make mistakes. Check important info",
//       speeches: "Speeches",
//       influence: "Influence",
//       rank: "Rank",
//       party: "Party",
//     },
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
//       {/* Header */}
//       <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <h1 className="text-xl font-bold">
//               <img width={135} height={135} src="/logo.png" alt="logo" />
//             </h1>
//           </div>
//           <div className="flex items-center gap-2">
//             <Link href="/chat">
//               <Button variant="outline" size="sm" className="shadow-none">
//                 <MessageSquare className="h-4 w-4 mr-2" />
//                 {texts[language].chatButton}
//               </Button>
//             </Link>
//             <select
//               value={language}
//               onChange={(e) => changeLanguage(e.target.value)}
//               className="border rounded px-2 py-1 text-sm"
//             >
//               <option value="he">עברית</option>
//               <option value="en">English</option>
//             </select>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="container mx-auto px-4 py-12">
//         {/* Title Section */}
//         <div className="text-center mb-16">
//           <h2
//             style={{ fontSize: "50px" }}
//             className="text-black font-sans font-light leading-relaxed max-w-4xl w-full mx-auto text-center"
//           >
//             <span className="text-[#0099FF]">{texts[language].title}</span> {language === "he" ? "המשפיעים ביותר השבוע" : "Most Influential This Week"}
//           </h2>
//           <p className="font-sans font-light text-lg text-muted-foreground text-balance">
//             {texts[language].subtitle}
//           </p>
//         </div>

//         {/* Podium Section */}
//         <div className="max-w-5xl mx-auto mb-16">
//           <div className="flex items-end justify-center gap-4 md:gap-8 mb-8">
//             {[1, 0, 2].map((idx, podiumIndex) => {
//               const politician = data.politicians[idx];
//               const heights = [64, 80, 64];
//               const textSizes = ["5xl", "6xl", "4xl"];
//               const nameSizes = ["xl", "2xl", "lg"];
//               const speechSizes = ["sm", "sm", "xs"];
//               const iconSizes = [4, 4, 3];
//               return (
//                 <Link
//                   key={idx}
//                   href={`/chat?politician=${encodeURIComponent(politician.name)}`}
//                   className="flex-1 max-w-xs group"
//                 >
//                   <Card
//                     className={`h-${heights[podiumIndex]} flex flex-col items-center justify-end p-6 bg-gradient-to-t from-muted to-[#0099ff34] cursor-pointer border-none`}
//                   >
//                     <div className="text-center mb-4">
//                       <div className={`text-${textSizes[podiumIndex]} font-bold text-${podiumIndex === 1 ? "primary" : "muted-foreground"} mb-2`}>
//                         {podiumIndex + 1}
//                       </div>
//                       <h3 className={`text-${nameSizes[podiumIndex]} font-bold mb-1`}>{politician.name}</h3>
//                       <p className={`text-${speechSizes[podiumIndex]} text-muted-foreground mb-2`}>
//                         {texts[language].party}: {politician.party}
//                       </p>
//                       <div className="flex items-center justify-center gap-1 text-sm">
//                         <TrendingUp className={`h-${iconSizes[podiumIndex]} w-${iconSizes[podiumIndex]} ${podiumIndex === 1 ? "text-primary" : ""}`} />
//                         <span>
//                           {politician.speeches} {texts[language].speeches}
//                         </span>
//                       </div>
//                     </div>
//                     <div className="w-full h-2 bg-[#0099ff13] rounded-full" />
//                   </Card>
//                 </Link>
//               );
//             })}
//           </div>
//         </div>
//       </main>
//       <FAQ />
//       {/* Footer */}
//       <footer className="border-t mt-28 py-8">
//         <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
//           <p>{texts[language].footer}</p>
//         </div>
//       </footer>
//     </div>
//   );
// }
