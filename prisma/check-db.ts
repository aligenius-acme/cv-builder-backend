import { prisma } from '../src/utils/prisma';

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'aligenius@gmail.com' } });
  if (!user) { console.log('User not found'); return; }
  console.log('User:', user.id, user.firstName, user.lastName);

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    select: { id: true, title: true, parseStatus: true, createdAt: true },
  });
  console.log('\nResumes:');
  resumes.forEach(r => console.log(' -', r.id, '|', r.title, '|', r.parseStatus));

  const jobs = await prisma.savedJob.findMany({
    where: { userId: user.id },
    select: { id: true, title: true, company: true, location: true, salary: true, description: true },
  });
  console.log('\nSaved Jobs:', jobs.length);
  jobs.forEach(j => {
    console.log(' -', j.id);
    console.log('   Title:', j.title);
    console.log('   Company:', j.company);
    console.log('   Location:', j.location);
    console.log('   Salary:', j.salary);
    console.log('   Desc preview:', j.description?.slice(0, 120));
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
