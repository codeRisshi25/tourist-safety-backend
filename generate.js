// generateAuthority.js
const bcrypt = require('bcryptjs');

async function generateAuthority() {
  const password = 'authority_password'; // Choose a secure password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  console.log('--- Hashed Password ---');
  console.log(hashedPassword);
  console.log('\n--- SQL INSERT Statement ---');
  console.log(
    `INSERT INTO authorities (name, email, password, jurisdiction, "createdAt", "updatedAt") VALUES ('Admin User', 'admin@example.com', '${hashedPassword}', 'National', NOW(), NOW());`
  );
}

generateAuthority();