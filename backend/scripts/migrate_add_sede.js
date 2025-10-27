import db from '../config/database.js'
/* global process */

async function run() {
  console.log("[MIGRATION] Adding column 'sede' to table 'medicos' (if not exists)...")
  try {
    // Check if column exists
    const [cols] = await db.query("SHOW COLUMNS FROM medicos LIKE 'sede'")
    if (cols && cols.length > 0) {
      console.log("[MIGRATION] Column 'sede' already exists. Nothing to do.")
  process.exit(0)
    }

    await db.query("ALTER TABLE medicos ADD COLUMN sede VARCHAR(50) NULL")
    console.log("[MIGRATION] Column 'sede' added successfully.")
  process.exit(0)
  } catch (err) {
    console.error('[MIGRATION] Failed to add column sede:', err.message)
  process.exit(1)
  }
}

run()
