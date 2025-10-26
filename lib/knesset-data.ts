export interface PoliticianData {
  name: string;
  party: string;
  speeches: number;
  influence: string;
}

export interface LegislationData {
  title: string;
  date: string;
  description: string;
}

export interface KnessetData {
  politicians: PoliticianData[];
  legislation: LegislationData[];
}

export async function getWeeklyKnessetData(): Promise<KnessetData> {
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