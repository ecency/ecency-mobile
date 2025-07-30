#!/usr/bin/env bash -e

# macOS compatibility - detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    IS_MACOS=true
else
    IS_MACOS=false
fi

# Function to check React Native version
check_rn_version() {
    echo "🔍 Checking React Native version..."
    
    # Check if package.json exists
    if [[ ! -f "package.json" ]]; then
        echo "❌ Error: package.json not found. Please run this script from your React Native project root."
        exit 1
    fi
    
    # Extract React Native version from package.json
    local rn_version
    if command -v jq >/dev/null 2>&1; then
        # Use jq if available (more reliable)
        rn_version=$(jq -r '.dependencies["react-native"] // .devDependencies["react-native"] // empty' package.json 2>/dev/null)
    else
        # Fallback to grep/sed (works without jq)
        rn_version=$(grep -E '"react-native"' package.json | head -1 | sed -E 's/.*"react-native"[[:space:]]*:[[:space:]]*"([^"]*)".*$/\1/')
    fi
    
    # Clean version string (remove ^, ~, etc.)
    rn_version=$(echo "$rn_version" | sed -E 's/[\^~>=<]*//')
    
    if [[ -z "$rn_version" ]]; then
        echo "❌ Error: Could not detect React Native version from package.json"
        echo "Please make sure React Native is listed in dependencies or devDependencies."
        exit 1
    fi
    
    echo "📱 Detected React Native version: $rn_version"
    
    # Check if version is exactly 0.79.5
    if [[ "$rn_version" != "0.79.5" ]]; then
        echo ""
        echo "⚠️  WARNING: This patch is designed for React Native 0.79.5"
        echo "📱 Your version: $rn_version"
        echo "🎯 Required version: 0.79.5"
        echo ""
        echo "🚨 IMPORTANT: Before using this patch with a different version:"
        echo "   1. Test your build WITHOUT this patch first"
        echo "   2. Remove script if app build on Github Action without this script"
        echo "   3. If not, update rn version on script and make sure patch is applied to file correctly"
        echo "   4. For ref of patch content check url: https://github.com/cortinico/react-native/commit/7795d3472e2ee2571148b91f7570758fbf7d2b38"
        echo ""
        echo "💡 This patch modifies Gradle build dependencies and may not be"
        echo "   compatible with other React Native versions."
        echo ""
        echo "❌ Patch aborted for safety. To proceed anyway, update the script."
        exit 1
    fi
    
    echo "✅ React Native version 0.79.5 confirmed - proceeding with patch"
    echo ""
}

# Define the file paths to patch
FILE_PATHS=(
    "node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/src/main/kotlin/com/facebook/react/ReactRootProjectPlugin.kt"
)

# Define the snippet to insert (at line 29)
read -r -d '' SNIPPET << 'EOF'
    // We need to make sure that `:app:preBuild` task depends on all other subprojects' preBuild
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
    }
EOF

# Function to patch a single file
patch_file() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    echo "📁 Processing: $file_name"
    
    # Check if file exists
    if [[ ! -f "$file_path" ]]; then
        echo "⚠️  File not found at $file_path - skipping"
        return 1
    fi
    
    # Check if snippet already exists
    if grep -q "project.gradle.projectsEvaluated" "$file_path"; then
        echo "✅ Snippet already exists in $file_name - skipping"
        return 0
    fi
    
    # Check if file has at least 29 lines
    local line_count
    if [[ "$IS_MACOS" == true ]]; then
        line_count=$(wc -l < "$file_path" | tr -d ' ')
    else
        line_count=$(wc -l < "$file_path")
    fi
    
    if [[ $line_count -lt 29 ]]; then
        echo "❌ Error: File $file_path has only $line_count lines, cannot insert at line 29"
        return 1
    fi
    
    # Create backup
    local backup_path="${file_path}.backup"
    cp "$file_path" "$backup_path"
    echo "📄 Backup created: $backup_path"
    
    # Create temporary file with the patch
    local temp_file
    if [[ "$IS_MACOS" == true ]]; then
        temp_file=$(mktemp -t patch_script)
    else
        temp_file=$(mktemp)
    fi
    
    # Insert snippet at line 29
    if [[ "$IS_MACOS" == true ]]; then
        # macOS version - using gsed if available, otherwise sed with different syntax
        if command -v gsed >/dev/null 2>&1; then
            # Use GNU sed if installed (brew install gnu-sed)
            {
                head -n 28 "$file_path"
                echo "$SNIPPET"
                tail -n +29 "$file_path"
            } > "$temp_file"
        else
            # Use BSD sed (default on macOS)
            {
                head -n 28 "$file_path"
                echo "$SNIPPET"
                tail -n +29 "$file_path"
            } > "$temp_file"
        fi
    else
        # Linux version
        {
            head -n 28 "$file_path"     # Lines 1-28
            echo "$SNIPPET"             # Insert snippet
            tail -n +29 "$file_path"    # Lines 29 onwards
        } > "$temp_file"
    fi
    
    # Replace original file with patched version
    if mv "$temp_file" "$file_path"; then
        echo "✅ Successfully added snippet to $file_name"
        return 0
    else
        echo "❌ Error: Failed to write patched content to $file_path"
        # Restore from backup if write failed
        if [[ -f "$backup_path" ]]; then
            cp "$backup_path" "$file_path"
            echo "🔄 Restored original file from backup"
        fi
        return 1
    fi
}

# Check React Native version first
check_rn_version

# Main execution
echo "🔧 Patching ReactRootProjectPlugin.kt files..."
echo ""

success_count=0
total_files=0

for file_path in "${FILE_PATHS[@]}"; do
    ((total_files++))
    echo "Processing file $total_files/${#FILE_PATHS[@]}: $(basename "$file_path")"
    
    if patch_file "$file_path"; then
        ((success_count++))
    fi
    
    echo ""
done

echo "📊 Summary:"
echo "✅ Successfully patched: $success_count/$total_files files"

if [[ $success_count -eq 0 ]]; then
    echo ""
    echo "⚠️  No files were modified. Please make sure you are running this script from your React Native project root directory."
    exit 1
elif [[ $success_count -lt $total_files ]]; then
    echo ""
    echo "⚠️  Some files could not be patched. This is normal if they don't exist in your React Native version."
fi

echo ""
echo "🎉 Patch script completed!"