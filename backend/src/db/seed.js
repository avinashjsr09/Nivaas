const bcrypt = require('bcryptjs');
const { run, get, initDb } = require('./index');

async function seed() {
  console.log('Seeding database...');
  await initDb();

  // Create demo society
  let society = await get(`SELECT * FROM societies WHERE code = ?`, ['GH101']);
  if (!society) {
    const res = await run(
      `INSERT INTO societies (name, code, address, city, total_flats) VALUES (?, ?, ?, ?, ?)`,
      ['Green Heights Society', 'GH101', '100 Palm Avenue, Bandra', 'Mumbai', 120]
    );
    society = { id: res.id };
    console.log('Created Demo Society: Green Heights (Code: GH101)');
  } else {
    console.log('Demo Society already exists.');
  }

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Secretary / Admin
  let admin = await get(`SELECT * FROM users WHERE email = ?`, ['admin@nivaas.com']);
  if (!admin) {
    await run(
      `INSERT INTO users (name, email, phone, password, role, society_id, flat_number, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      ['Rajesh Sharma (Secretary)', 'admin@nivaas.com', '9876543210', hashedPassword, 'ADMIN', society.id, 'A-101']
    );
    console.log('Created Admin user: admin@nivaas.com');
  }

  // Create Resident
  let resident = await get(`SELECT * FROM users WHERE email = ?`, ['resident@nivaas.com']);
  if (!resident) {
    await run(
      `INSERT INTO users (name, email, phone, password, role, society_id, flat_number, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      ['Priya Verma (Resident)', 'resident@nivaas.com', '9876543211', hashedPassword, 'RESIDENT', society.id, 'B-402']
    );
    console.log('Created Resident user: resident@nivaas.com');
  }

  // Create Security Guard
  let security = await get(`SELECT * FROM users WHERE email = ?`, ['security@nivaas.com']);
  if (!security) {
    await run(
      `INSERT INTO users (name, email, phone, password, role, society_id, flat_number, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      ['Ramesh Kumar (Security Gate 1)', 'security@nivaas.com', '9876543212', hashedPassword, 'SECURITY', society.id, 'Main Gate']
    );
    console.log('Created Security Guard user: security@nivaas.com');
  }

  console.log('Database seeding complete!');
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = seed;
