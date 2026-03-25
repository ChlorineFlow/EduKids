const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding EduKids database...');

  // Create Admin
  const adminPass = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edukids.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@edukids.com',
      password: adminPass,
      role: 'ADMIN',
      verified: true,
      admin: { create: {} }
    }
  });

  // Create Teacher
  const teacherPass = await bcrypt.hash('Teacher@123', 12);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@edukids.com' },
    update: {},
    create: {
      name: 'Mrs. Priya Sharma',
      email: 'teacher@edukids.com',
      password: teacherPass,
      role: 'TEACHER',
      verified: true,
      teacher: { create: {} }
    },
    include: { teacher: true }
  });

  // Create Demo Student
  const studentPass = await bcrypt.hash('Student@123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@edukids.com' },
    update: {},
    create: {
      name: 'Arjun Kumar',
      email: 'student@edukids.com',
      password: studentPass,
      role: 'STUDENT',
      verified: true,
      student: {
        create: {
          age: 9,
          dob: new Date('2015-06-15'),
          parentName: 'Rajesh Kumar',
          phone: '9876543210',
          class: 4,
          language: 'en'
        }
      }
    },
    include: { student: true }
  });

  // Subjects for Classes 1-5
  const subjectsData = [
    // Class 1-5
    { name: 'Maths', nameHi: 'गणित', namePa: 'ਗਣਿਤ', class: 1, isLang: false, icon: '🔢' },
    { name: 'EVS', nameHi: 'पर्यावरण', namePa: 'ਵਾਤਾਵਰਣ', class: 1, isLang: false, icon: '🌿' },
    { name: 'Hindi', nameHi: 'हिंदी', namePa: 'ਹਿੰਦੀ', class: 1, isLang: true, icon: '📝' },
    { name: 'English', nameHi: 'अंग्रेज़ी', namePa: 'ਅੰਗਰੇਜ਼ੀ', class: 1, isLang: true, icon: '📖' },
    { name: 'Maths', nameHi: 'गणित', namePa: 'ਗਣਿਤ', class: 2, isLang: false, icon: '🔢' },
    { name: 'EVS', nameHi: 'पर्यावरण', namePa: 'ਵਾਤਾਵਰਣ', class: 2, isLang: false, icon: '🌿' },
    { name: 'Hindi', nameHi: 'हिंदी', namePa: 'ਹਿੰਦੀ', class: 2, isLang: true, icon: '📝' },
    { name: 'English', nameHi: 'अंग्रेज़ी', namePa: 'ਅੰਗਰੇਜ਼ੀ', class: 2, isLang: true, icon: '📖' },
    { name: 'Maths', nameHi: 'गणित', namePa: 'ਗਣਿਤ', class: 3, isLang: false, icon: '🔢' },
    { name: 'EVS', nameHi: 'पर्यावरण', namePa: 'ਵਾਤਾਵਰਣ', class: 3, isLang: false, icon: '🌿' },
    { name: 'Hindi', nameHi: 'हिंदी', namePa: 'ਹਿੰਦੀ', class: 3, isLang: true, icon: '📝' },
    { name: 'English', nameHi: 'अंग्रेज़ी', namePa: 'ਅੰਗਰੇਜ਼ੀ', class: 3, isLang: true, icon: '📖' },
    { name: 'Maths', nameHi: 'गणित', namePa: 'ਗਣਿਤ', class: 4, isLang: false, icon: '🔢' },
    { name: 'EVS', nameHi: 'पर्यावरण', namePa: 'ਵਾਤਾਵਰਣ', class: 4, isLang: false, icon: '🌿' },
    { name: 'Hindi', nameHi: 'हिंदी', namePa: 'ਹਿੰਦੀ', class: 4, isLang: true, icon: '📝' },
    { name: 'English', nameHi: 'अंग्रेज़ी', namePa: 'ਅੰਗਰੇਜ਼ੀ', class: 4, isLang: true, icon: '📖' },
    { name: 'Maths', nameHi: 'गणित', namePa: 'ਗਣਿਤ', class: 5, isLang: false, icon: '🔢' },
    { name: 'EVS', nameHi: 'पर्यावरण', namePa: 'ਵਾਤਾਵਰਣ', class: 5, isLang: false, icon: '🌿' },
    { name: 'Hindi', nameHi: 'हिंदी', namePa: 'ਹਿੰਦੀ', class: 5, isLang: true, icon: '📝' },
    { name: 'English', nameHi: 'अंग्रेज़ी', namePa: 'ਅੰਗਰੇਜ਼ੀ', class: 5, isLang: true, icon: '📖' },
    // Class 6
    { name: 'Maths', nameHi: 'गणित', namePa: 'ਗਣਿਤ', class: 6, isLang: false, icon: '🔢' },
    { name: 'Science', nameHi: 'विज्ञान', namePa: 'ਵਿਗਿਆਨ', class: 6, isLang: false, icon: '🔬' },
    { name: 'Social Science', nameHi: 'सामाजिक विज्ञान', namePa: 'ਸਮਾਜਿਕ ਵਿਗਿਆਨ', class: 6, isLang: false, icon: '🌍' },
    { name: 'Hindi', nameHi: 'हिंदी', namePa: 'ਹਿੰਦੀ', class: 6, isLang: true, icon: '📝' },
    { name: 'English', nameHi: 'अंग्रेज़ी', namePa: 'ਅੰਗਰੇਜ਼ੀ', class: 6, isLang: true, icon: '📖' },
  ];

  for (const s of subjectsData) {
    await prisma.subject.upsert({
      where: { id: (await prisma.subject.findFirst({ where: { name: s.name, class: s.class } }))?.id || 0 },
      update: {},
      create: s
    });
  }

  const mathClass4 = await prisma.subject.findFirst({ where: { name: 'Maths', class: 4 } });

  if (mathClass4) {
    const chapter = await prisma.chapter.upsert({
      where: { id: (await prisma.chapter.findFirst({ where: { subjectId: mathClass4.id, title: 'Addition and Subtraction' } }))?.id || 0 },
      update: {},
      create: { subjectId: mathClass4.id, title: 'Addition and Subtraction', titleHi: 'जोड़ और घटाव', titlePa: 'ਜੋੜ ਅਤੇ ਘਟਾਓ', order: 1 }
    });

    // Add content in all 3 languages
    const contents = [
      { language: 'en', text: 'Addition means putting numbers together to find the total. When we add 5 + 3, we get 8. Subtraction means taking away from a number. When we subtract 8 - 3, we get 5. Remember: Addition uses the + sign and subtraction uses the - sign! 🌟' },
      { language: 'hi', text: 'जोड़ का मतलब है दो या दो से अधिक संख्याओं को मिलाना। जैसे 5 + 3 = 8। घटाव का मतलब है एक संख्या में से दूसरी संख्या को हटाना। जैसे 8 - 3 = 5। याद रखो: जोड़ में (+) और घटाव में (-) का निशान लगता है! 🌟' },
      { language: 'pa', text: 'ਜੋੜ ਦਾ ਮਤਲਬ ਹੈ ਦੋ ਜਾਂ ਵੱਧ ਸੰਖਿਆਵਾਂ ਨੂੰ ਮਿਲਾਉਣਾ। ਜਿਵੇਂ 5 + 3 = 8। ਘਟਾਓ ਦਾ ਮਤਲਬ ਹੈ ਇੱਕ ਸੰਖਿਆ ਵਿੱਚੋਂ ਦੂਜੀ ਲੈਣਾ। ਜਿਵੇਂ 8 - 3 = 5। ਯਾਦ ਰੱਖੋ: ਜੋੜ ਵਿੱਚ (+) ਅਤੇ ਘਟਾਓ ਵਿੱਚ (-) ਦੀ ਨਿਸ਼ਾਨੀ ਲੱਗਦੀ ਹੈ! 🌟' },
    ];

    for (const c of contents) {
      const exists = await prisma.content.findFirst({ where: { chapterId: chapter.id, language: c.language } });
      if (!exists) {
        await prisma.content.create({ data: { ...c, chapterId: chapter.id } });
      }
    }

    // Create a quiz
    const teacherRecord = await prisma.teacher.findFirst();
    if (teacherRecord) {
      const existingQuiz = await prisma.quiz.findFirst({ where: { title: 'Maths Quiz 1 - Addition' } });
      if (!existingQuiz) {
        const quiz = await prisma.quiz.create({
          data: {
            subjectId: mathClass4.id,
            chapterId: chapter.id,
            teacherId: teacherRecord.id,
            title: 'Maths Quiz 1 - Addition'
          }
        });

        await prisma.question.createMany({
          data: [
            { quizId: quiz.id, question: 'What is 5 + 3?', option1: '7', option2: '8', option3: '9', option4: '10', correctAnswer: '8', marks: 1 },
            { quizId: quiz.id, question: 'What is 12 - 4?', option1: '6', option2: '7', option3: '8', option4: '9', correctAnswer: '8', marks: 1 },
            { quizId: quiz.id, question: 'What is 15 + 7?', option1: '20', option2: '21', option3: '22', option4: '23', correctAnswer: '22', marks: 1 },
          ]
        });
      }
    }
  }

  // Initialize leaderboard for demo student
  if (student.student) {
    await prisma.leaderboard.upsert({
      where: { studentId: student.student.id },
      update: {},
      create: { studentId: student.student.id, class: student.student.class, score: 25, stars: 2, badges: 0 }
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('📧 Admin: admin@edukids.com / Admin@123');
  console.log('👩‍🏫 Teacher: teacher@edukids.com / Teacher@123');
  console.log('👦 Student: student@edukids.com / Student@123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
