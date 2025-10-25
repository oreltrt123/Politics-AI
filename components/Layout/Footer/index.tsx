'use client';

import Link from "next/link";
// import "./css/footer.css"

const Footer: React.FC = () => {
  return (
 <footer className="bg-white rounded-lg m-4 dark:bg-gray-800">
    <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
      <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2025 <a className="hover:underline">PoliticsAI</a>. כל הזכויות שמורות
    </span>
    <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
        <li>
            <a href="/Rules/privacy" className="hover:underline me-4 md:me-6">מדיניות פרטיות</a>
        </li>
        <li>
            <a href="/Rules/terms" className="hover:underline me-4 md:me-6">תנאי שימוש</a>
        </li>
        <li>
            <a href="/faq" className="hover:underline me-4 md:me-6">שאלות נפוצות</a>
        </li>
    </ul>
    </div>
  </footer>
  );
};

export default Footer;