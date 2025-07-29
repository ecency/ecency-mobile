/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

// Define the file paths to patch
const filePaths = [
  'node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/src/main/kotlin/com/facebook/react/ReactRootProjectPlugin.kt',
  'node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/bin/src/main/kotlin/com/facebook/react/ReactRootProjectPlugin.kt',
];

// Define the snippet to insert
const snippet = `    // We need to make sure that \`:app:preBuild\` task depends on all other subprojects' preBuild
    // tasks. This is necessary in order to have all the codegen generated code before the CMake
    // configuration build kicks in.
    project.gradle.projectsEvaluated {
      val appProject = project.rootProject.subprojects.find { it.name == "app" }
      val appPreBuild = appProject?.tasks?.findByName("preBuild")
      if (appPreBuild != null) {
        // Find all other subprojects' preBuild tasks
        val otherPreBuildTasks =
            project.rootProject.subprojects
                .filter { it != appProject }
                .mapNotNull { it.tasks.findByName("preBuild") }
        // Make :app:preBuild depend on all others
        appPreBuild.dependsOn(otherPreBuildTasks)
      }
    }`;

function addSnippetToFile(filePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found at ${filePath} - skipping`);
      return false;
    }

    // Read the existing file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');

    // Check if the snippet already exists to avoid duplicates
    if (fileContent.includes('project.gradle.projectsEvaluated')) {
      console.log(`✅ Snippet already exists in ${path.basename(filePath)} - skipping`);
      return true;
    }

    // Insert the snippet at line 18 (index 17, since arrays are 0-based)
    const insertIndex = 27; // Line 18 in 0-based indexing

    if (insertIndex > lines.length) {
      console.error(
        `❌ Error: File ${filePath} has only ${lines.length} lines, cannot insert at line 18`,
      );
      return false;
    }

    // Split the snippet into lines and insert them
    const snippetLines = snippet.split('\n');
    lines.splice(insertIndex, 0, ...snippetLines);

    // Join the lines back together
    const modifiedContent = lines.join('\n');

    // Create a backup of the original file
    const backupPath = `${filePath}.backup`;
    fs.writeFileSync(backupPath, fileContent);
    console.log(`📄 Backup created: ${backupPath}`);

    // Write the modified content back to the file
    fs.writeFileSync(filePath, modifiedContent);

    console.log(`✅ Successfully added snippet to ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error modifying ${filePath}:`, error.message);

    // If there's an error and we created a backup, offer to restore it
    const backupPath = `${filePath}.backup`;
    if (fs.existsSync(backupPath)) {
      console.log(`To restore this file, run: cp "${backupPath}" "${filePath}"`);
    }
    return false;
  }
}

// Run the function for all file paths
console.log('🔧 Patching ReactRootProjectPlugin.kt files...\n');

let successCount = 0;
let totalFiles = 0;

filePaths.forEach((filePath, index) => {
  console.log(`📁 Processing file ${index + 1}/${filePaths.length}: ${path.basename(filePath)}`);
  totalFiles++;

  if (addSnippetToFile(filePath)) {
    successCount++;
  }

  console.log(''); // Add spacing between files
});

console.log('📊 Summary:');
console.log(`✅ Successfully patched: ${successCount}/${totalFiles} files`);

if (successCount === 0) {
  console.log(
    '\n⚠️  No files were modified. Please make sure you are running this script from your React Native project root directory.',
  );
} else if (successCount < totalFiles) {
  console.log(
    "\n⚠️  Some files could not be patched. This is normal if they don't exist in your React Native version.",
  );
}
