import { execSync } from 'child_process';

async function main() {
  try {
    console.log("Updating database schema automatically...");
    
    // Run the drizzle-kit push command
    execSync('echo 1 | npx drizzle-kit push', { stdio: 'inherit' });
    
    console.log("Database schema updated successfully.");
  } catch (error) {
    console.error("Failed to update database schema:", error);
    process.exit(1);
  }
}

main();