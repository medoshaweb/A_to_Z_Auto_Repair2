const pool = require("../config/database");
require("dotenv").config();

async function updateUserRole() {
  const email = "hailu@email.com";
  const newRole = "Admin";

  try {
    console.log(`Updating role for user: ${email} to ${newRole}...`);

    // Check if employee exists
    const [existing] = await pool.execute(
      "SELECT id, email, role FROM employees WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      // Update existing employee
      await pool.execute(
        "UPDATE employees SET role = ? WHERE email = ?",
        [newRole, email]
      );
      console.log(`✅ Successfully updated employee role to "${newRole}"`);
      console.log(`   Employee ID: ${existing[0].id}`);
      console.log(`   Email: ${existing[0].email}`);
      console.log(`   Old role: ${existing[0].role}`);
      console.log(`   New role: ${newRole}`);
    } else {
      // Check if user exists in users table
      const [users] = await pool.execute(
        "SELECT id, email FROM users WHERE email = ?",
        [email]
      );

      if (users.length > 0) {
        console.log(`⚠️  User exists in users table but not in employees table.`);
        console.log(`   Since the role lookup defaults to "Admin" if not found in employees table,`);
        console.log(`   the user will get "Admin" role on next login.`);
        console.log(`   User ID: ${users[0].id}`);
        console.log(`   Email: ${users[0].email}`);
        console.log(`\n💡 To ensure the role is set, you can:`);
        console.log(`   1. Log out and log back in (role will default to Admin)`);
        console.log(`   2. Or create an employee entry with Admin role`);
      } else {
        console.log(`❌ User with email "${email}" not found in users or employees table.`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Error updating user role:", error);
    process.exit(1);
  }
}

updateUserRole();

