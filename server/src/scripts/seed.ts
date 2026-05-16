import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/db";
import { User } from "../models/User";

async function seed() {
  await connectDatabase();

  const accounts = [
    {
      name: "Demo Student",
      email: "student@demo.lk",
      password: "student123",
      role: "student" as const,
      university: "University of Colombo",
      course: "BSc Computer Science",
      preferredLanguage: "both" as const,
    },
    {
      name: "Demo Lecturer",
      email: "lecturer@demo.lk",
      password: "lecturer123",
      role: "lecturer" as const,
      university: "University of Colombo",
      course: "Operating Systems",
      preferredLanguage: "english" as const,
    },
    {
      name: "System Admin",
      email: "admin@demo.lk",
      password: "admin123",
      role: "admin" as const,
    },
  ];

  for (const acc of accounts) {
    const exists = await User.findOne({ email: acc.email });
    if (exists) {
      console.log(`Skipped (exists): ${acc.email}`);
      continue;
    }
    const hashed = await bcrypt.hash(acc.password, 12);
    await User.create({ ...acc, password: hashed });
    console.log(`Created: ${acc.email} / ${acc.password}`);
  }

  console.log("\nSeed complete.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
