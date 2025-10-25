"use client"

import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="w-full min-h-screen text-blackl bg-white relative">
      <main className="flex flex-col gap-16 items-center">
        <section className="px-6 mx-auto max-w-[800px]">
          <h1 className="mb-10 text-6xl font-sans font-light tracking-tighter text-center leading-none">
            תנאי שימוש
          </h1>

          <div className="space-y-8 text-lg">

            <div className="p-8 rounded-2xl bg-black/5 hover:bg-black/6 transition-colors">
              <h2 className="text-2xl font-sans font-light mb-3">
                1. מבוא
              </h2>
              <p className="text-black/80">
                ברוכים הבאים ל-PoliticsAI, אתר שבו תוכל לקרוא פוסטים אוטומטיים בנושאים פוליטיים ולשוחח עם בינה מלאכותית (AI) על נושאים אלה. השימוש באתר כפוף לתנאי שימוש אלה. נא לקרוא בעיון.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-black/5 hover:bg-black/6 transition-colors">
              <h2 className="text-2xl font-sans font-light mb-3">
                2. זכאות
              </h2>
              <p className="text-black/80">
                השימוש באתר מיועד לגילאי 12 ומעלה. בשימושך באתר, אתה מאשר שאתה עומד בדרישה זו.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-black/5 hover:bg-black/6 transition-colors">
              <h2 className="text-2xl font-sans font-light mb-3">
                3. שימוש נאות
              </h2>
              <p className="text-black/80">
                המשתמשים מתחייבים להשתמש באתר בצורה אחראית ולכבד את הכללים החינוכיים. אין להשתמש באתר למטרות פוגעניות או להפצת שנאה.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-black/5 hover:bg-black/6 transition-colors">
              <h2 className="text-2xl font-sans font-light mb-3">
                4. תוכן האתר וה- AI
              </h2>
              <p className="text-black/80">
                כל התוכן באתר, כולל הפוסטים והתגובות של ה-AI, נוצר באופן אוטומטי ומסופק למטרות חינוכיות ואינפורמטיביות בלבד. הפלטפורמה אינה אחראית לדיוק מוחלט של המידע, ואין לראות בתוכן ייעוץ מקצועי או פוליטי.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-black/5 hover:bg-black/6 transition-colors">
              <h2 className="text-2xl font-sans font-light mb-3">
                5. פרטיות
              </h2>
              <p className="text-black/80">
                אנו שומרים על פרטיות המשתמשים בהתאם למדיניות הפרטיות שלנו. מידע אישי אינו מועבר לצדדים שלישיים ללא הסכמה.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-black/5 hover:bg-black/6 transition-colors">
              <h2 className="text-2xl font-sans font-light mb-3">
                6. הגבלת אחריות
              </h2>
              <p className="text-black/80">
                השימוש באתר הוא על אחריות המשתמש בלבד. אנו לא נושאים באחריות לנזקים ישירים או עקיפים כתוצאה מהשימוש באתר או מהמידע המוצג בו.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-black/5 hover:bg-black/6 transition-colors">
              <h2 className="text-2xl font-sans font-light mb-3">
                7. שינויים בתנאים
              </h2>
              <p className="text-black/80">
                אנו רשאים לעדכן את תנאי השימוש מעת לעת. שימושך המתמשך באתר מהווה הסכמה לתנאים המעודכנים.
              </p>
            </div>

          </div>
        </section>
      </main>
    </div>
  )
}
