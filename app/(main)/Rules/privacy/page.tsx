"use client"

import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="w-full min-h-screen text-blackl bg-white relative">
      <main className="flex flex-col gap-16 items-center">
        <section className="px-6 mx-auto max-w-[800px]">
          <h1 className="mb-10 text-6xl font-sans font-light tracking-tighter text-center leading-none">
            מדיניות פרטיות
          </h1>

          <div className="space-y-8 text-lg">

            <div className="p-8 rounded-2xl bg-black/5 hover:bg-black/6 transition-colors">
              <h2 className="text-2xl font-sans font-light mb-3">
                1. מבוא
              </h2>
              <p className="text-black/80">
                ב-PoliticsAI אנו מחויבים להגן על פרטיות המשתמשים. מסמך זה מסביר כיצד אנו אוספים, משתמשים ושומרים על המידע שלך בעת השימוש באתר.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-black/5 hover:bg-black/6 transition-colors">
              <h2 className="text-2xl font-sans font-light mb-3">
                2. מידע שאנו אוספים
              </h2>
              <p className="text-black/80">
                אנו עשויים לאסוף מידע בסיסי כגון כתובת דוא"ל (אם נדרש), נתוני שימוש באתר, ותשובותיך בצ'אט עם ה-AI. אין אנו אוספים מידע אישי רגיש ללא הסכמה.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-black/5 hover:bg-black/6 transition-colors">
              <h2 className="text-2xl font-sans font-light mb-3">
                3. שימוש במידע
              </h2>
              <p className="text-black/80">
                המידע שנאסף משמש אך ורק לשיפור חוויית המשתמש באתר, להפעלת הפוסטים האוטומטיים ולתשובות ה-AI. אנו לא משתפים את המידע עם צדדים שלישיים לצורכי פרסום.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-black/5 hover:bg-black/6 transition-colors">
              <h2 className="text-2xl font-sans font-light mb-3">
                4. שמירת מידע
              </h2>
              <p className="text-black/80">
                אנו שומרים את המידע שלך רק למשך הזמן הנדרש למטרות השימוש באתר. לאחר מכן, המידע נמחק או מנותח באופן אנונימי.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-black/5 hover:bg-black/6 transition-colors">
              <h2 className="text-2xl font-sans font-light mb-3">
                5. אבטחה
              </h2>
              <p className="text-black/80">
                אנו נוקטים באמצעים סבירים להגן על המידע שלך מפני גישה לא מורשית, שינוי, חשיפה או השמדה.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-black/5 hover:bg-black/6 transition-colors">
              <h2 className="text-2xl font-sans font-light mb-3">
                6. זכויות המשתמש
              </h2>
              <p className="text-black/80">
                יש לך את הזכות לבקש גישה, תיקון או מחיקה של המידע האישי שלך. ניתן לפנות אלינו דרך פרטי ההתקשרות באתר.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-black/5 hover:bg-black/6 transition-colors">
              <h2 className="text-2xl font-sans font-light mb-3">
                7. שינויים במדיניות
              </h2>
              <p className="text-black/80">
                אנו עשויים לעדכן את מדיניות הפרטיות מעת לעת. שימושך המתמשך באתר מהווה הסכמה למדיניות המעודכנת.
              </p>
            </div>

          </div>
        </section>
      </main>
    </div>
  )
}
