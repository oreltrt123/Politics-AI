import React from "react";
import "./css/section_1.css"

type CardData = {
  id: number;
  image: string;
  title: string;
  tagline?: string;
  description: string;
};

const cards: CardData[] = [
  {
    id: 1,
    image: "/images/featured/discover1.png",
    title: "פוסטים פוליטיים שנוצרו על ידי AI",
    description:
      "תכנים פוליטיים מקוריים שנוצרו בעזרת AI, מספקים ניתוח, עדכונים ותובנות על הפוליטיקה בישראל ובעולם.",
  },
  {
    id: 2,
    image: "/images/featured/LiveChat.png",
    title: "צ’אט פוליטי חי – שאל כל שאלה",
    description:
      "קבלו תשובות בזמן אמת לשאלות פוליטיות באמצעות צ’אט מבוסס AI. הישארו מעודכנים, קבלו תובנות והבינו את ההתפתחויות האחרונות בפוליטיקה מיד.",
  },
  {
    id: 3,
    image: "/images/featured/politicais.png",
    title: "צפו בפוליטיקאים המשפיעים ביותר השבוע",
    description:
      "עקבו אחרי הפעילות וההשפעה של הפוליטיקאים הבולטים השבוע, עם ניתוח מעמיק ותובנות בזמן אמת.",
  },
];

const Section_1: React.FC = () => {
  return (
    <ul className="cards">
    <h1 className="left-[-150px] top-[-17px] relative font-sans font-light">פיצ'רים</h1>
      {cards.map((card) => (
        <li key={card.id}>
          <a href="#" className="card">
            <img src={card.image} className="card__image" alt={card.title} />
            <div className="card__overlay">
              <div className="card__header">
                <svg className="card__arc" xmlns="http://www.w3.org/2000/svg">
                  <path />
                </svg>
                <div className="card__header-text">
                  <h3 className="card__title font-sans font-light">{card.title}</h3>
                </div>
              </div>
              <p className="card__description font-sans font-light">{card.description}</p>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default Section_1;