export type Review = {
  id: string;
  name: string;
  university: string;
  course: string;
  rating: number;
  title: string;
  body: string;
  date: string;
};

export const DEMO_REVIEWS: Review[] = [
  {
    id: "demo-1",
    name: "Amaya Perera",
    university: "University of Colombo",
    course: "BSc Computer Science",
    rating: 5,
    title: "Saved me before OS viva",
    body: "Uploaded one PDF and got cheat sheets, flashcards, and Tamil voice explanations. The mock viva felt like a real examiner. Walk & Learn is perfect when revising on the bus.",
    date: "2026-04-12",
  },
  {
    id: "demo-2",
    name: "Kavindu Silva",
    university: "University of Moratuwa",
    course: "BEng Computer Engineering",
    rating: 5,
    title: "Tamil mix actually sounds natural",
    body: "Other apps translate word-for-word. This explains like a senior student — Tamil–English mix is exactly how we study. Flashcards from my DBMS slides were spot on.",
    date: "2026-04-08",
  },
  {
    id: "demo-3",
    name: "Nethmi Fernando",
    university: "University of Peradeniya",
    course: "BSc Information Technology",
    rating: 5,
    title: "Best study stack from one upload",
    body: "I use cheat sheet + 5-day plan + MCQ quiz for every module now. PDF download works great for printing before exams. UI is clean and easy on mobile too.",
    date: "2026-03-28",
  },
  {
    id: "demo-4",
    name: "Ravidu Jayawardena",
    university: "SLIIT",
    course: "BSc Software Engineering",
    rating: 4,
    title: "Mock viva practice is the highlight",
    body: "Speaking answers out loud with feedback helped my confidence. Voice lessons take a few seconds to generate but quality is worth the wait. Highly recommend for final year.",
    date: "2026-03-20",
  },
  {
    id: "demo-5",
    name: "Tharushi Wickramasinghe",
    university: "University of Kelaniya",
    course: "BSc Physical Sciences",
    rating: 5,
    title: "Perfect for Sri Lankan uni life",
    body: "Ask a doubt by voice while revising — got a clear explanation with audio. Lecturer-style Tamil option is unique. My whole study group uses it now.",
    date: "2026-03-15",
  },
  {
    id: "demo-6",
    name: "Dineth Bandara",
    university: "NSBM Green University",
    course: "BSc Cyber Security",
    rating: 4,
    title: "Solid AI study companion",
    body: "Works well with text-based PDFs from our Moodle uploads. Library saves all my generated materials. Would love more Sinhala voice options — but English and Tamil mix are already strong.",
    date: "2026-02-22",
  },
];

export function averageRating(reviews: Review[]): number {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
