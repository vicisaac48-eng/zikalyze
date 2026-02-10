#!/usr/bin/env python3
"""
AAB Verification Script for Google Play Store
Checks for common issues that prevent AAB uploads from working
"""

import os
import sys
import json
import subprocess
import re
from pathlib import Path

# Color codes for output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.RED}❌ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.ENDC}")

# Repository root
REPO_ROOT = Path(__file__).parent.parent
ANDROID_DIR = REPO_ROOT / "android"
APP_DIR = ANDROID_DIR / "app"
BUILD_GRADLE = APP_DIR / "build.gradle"
MANIFEST = APP_DIR / "src" / "main" / "AndroidManifest.xml"
PROGUARD_RULES = APP_DIR / "proguard-rules.pro"

def check_file_exists(filepath, name):
    """Check if a file exists"""
    if filepath.exists():
        print_success(f"{name} exists: {filepath}")
        return True
    else:
        print_error(f"{name} NOT found: {filepath}")
        return False

def check_build_gradle():
    """Check build.gradle configuration"""
    print_header("Checking build.gradle Configuration")
    
    if not check_file_exists(BUILD_GRADLE, "build.gradle"):
        return False
    
    with open(BUILD_GRADLE, 'r') as f:
        content = f.read()
    
    issues = []
    
    # Check namespace
    if 'namespace "com.zikalyze.app"' in content:
        print_success("Namespace properly set: com.zikalyze.app")
    else:
        print_warning("Namespace might not be set correctly")
        issues.append("namespace")
    
    # Check version code
    version_code_match = re.search(r'versionCode\s+(\d+)', content)
    if version_code_match:
        version_code = version_code_match.group(1)
        print_success(f"Version code: {version_code}")
    else:
        print_error("Version code not found")
        issues.append("versionCode")
    
    # Check version name
    version_name_match = re.search(r'versionName\s+"([^"]+)"', content)
    if version_name_match:
        version_name = version_name_match.group(1)
        print_success(f"Version name: {version_name}")
    else:
        print_error("Version name not found")
        issues.append("versionName")
    
    # Check minification for release
    if 'minifyEnabled true' in content:
        print_success("Minification enabled for release builds")
    else:
        print_warning("Minification not enabled (might increase APK size)")
    
    # Check ProGuard files
    if 'proguardFiles' in content:
        print_success("ProGuard files configured")
    else:
        print_warning("ProGuard files not configured")
        issues.append("proguard")
    
    return len(issues) == 0

def check_proguard_rules():
    """Check ProGuard rules for common issues"""
    print_header("Checking ProGuard Rules")
    
    if not check_file_exists(PROGUARD_RULES, "proguard-rules.pro"):
        print_warning("ProGuard rules file not found - using defaults only")
        return False
    
    with open(PROGUARD_RULES, 'r') as f:
        content = f.read()
    
    issues = []
    
    # Check for WebView/JavaScript rules
    if '-keepclassmembers' in content and 'javascript' in content.lower():
        print_success("JavaScript interface rules present")
    else:
        print_error("Missing JavaScript interface keep rules")
        print_info("This is CRITICAL for Capacitor apps - WebView JS won't work without it!")
        issues.append("javascript-interface")
    
    # Check for source file attributes (line by line to avoid false positives)
    has_source_attributes = False
    for line in content.split('\n'):
        line = line.strip()
        if line.startswith('-keepattributes') and 'SourceFile' in line and 'LineNumberTable' in line:
            if not line.startswith('#'):
                has_source_attributes = True
                break
    
    if has_source_attributes:
        print_success("Source file attributes preserved (helps with debugging)")
    else:
        print_warning("Source file attributes not preserved")
        print_info("Add: -keepattributes SourceFile,LineNumberTable")
        issues.append("source-attributes")
    
    # Check for Capacitor-specific rules
    if 'capacitor' in content.lower() or 'cordova' in content.lower():
        print_success("Capacitor/Cordova-specific rules found")
    else:
        print_warning("Missing Capacitor-specific ProGuard rules")
        issues.append("capacitor-rules")
    
    return len(issues) == 0

def check_manifest():
    """Check AndroidManifest.xml"""
    print_header("Checking AndroidManifest.xml")
    
    if not check_file_exists(MANIFEST, "AndroidManifest.xml"):
        return False
    
    with open(MANIFEST, 'r') as f:
        content = f.read()
    
    issues = []
    
    # Check for INTERNET permission
    if 'android.permission.INTERNET' in content:
        print_success("INTERNET permission declared")
    else:
        print_error("INTERNET permission missing (required for web apps)")
        issues.append("internet-permission")
    
    # Check application ID
    if '${applicationId}' in content or 'com.zikalyze.app' in content:
        print_success("Application ID properly configured")
    else:
        print_warning("Application ID might not be set")
    
    # Check for exported activity
    if 'android:exported="true"' in content:
        print_success("Main activity properly exported")
    else:
        print_warning("Main activity might not be exported")
        issues.append("activity-export")
    
    # Check for launcher intent filter
    if 'android.intent.action.MAIN' in content and 'android.intent.category.LAUNCHER' in content:
        print_success("Launcher intent filter present")
    else:
        print_error("Launcher intent filter missing")
        issues.append("launcher-intent")
    
    return len(issues) == 0

def check_privacy_compliance():
    """Check Play Store privacy compliance"""
    print_header("Checking Play Store Privacy Compliance")
    
    issues = []
    
    # Check for privacy policy
    privacy_html = REPO_ROOT / "public" / "privacy.html"
    if privacy_html.exists():
        print_success("Privacy policy HTML exists")
        print_info("URL: https://zikalyze.com/privacy.html")
    else:
        print_error("Privacy policy HTML not found")
        print_info("Required for Play Store approval!")
        issues.append("privacy-policy")
    
    # Check for terms of service
    terms_html = REPO_ROOT / "public" / "terms.html"
    if terms_html.exists():
        print_success("Terms of service HTML exists")
        print_info("URL: https://zikalyze.com/terms.html")
    else:
        print_warning("Terms of service HTML not found")
        issues.append("terms-of-service")
    
    return len(issues) == 0

def check_aab_file():
    """Check if AAB file exists and is valid"""
    print_header("Checking AAB File")
    
    aab_path = APP_DIR / "build" / "outputs" / "bundle" / "release" / "app-release.aab"
    
    if not aab_path.exists():
        print_warning("AAB file not found at expected location")
        print_info(f"Expected: {aab_path}")
        print_info("You need to build the AAB first:")
        print_info("  cd android && ./gradlew bundleRelease")
        return False
    
    # Check file size
    size_mb = aab_path.stat().st_size / (1024 * 1024)
    print_success(f"AAB file exists: {aab_path}")
    print_info(f"Size: {size_mb:.2f} MB")
    
    if size_mb > 150:
        print_warning(f"AAB size is large ({size_mb:.2f} MB)")
        print_info("Consider enabling ProGuard and resource shrinking")
    
    # Try to get bundletool info if available
    try:
        result = subprocess.run(
            ['which', 'bundletool'],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print_info("Bundletool is available for AAB analysis")
        else:
            print_info("Install bundletool to analyze AAB: https://github.com/google/bundletool")
    except:
        pass
    
    return True

def check_common_issues():
    """Check for common AAB upload issues"""
    print_header("Common AAB Upload Issues")
    
    print_info("Common reasons AABs fail on Play Store:")
    print("")
    print("1. ❌ Missing or incorrect ProGuard rules")
    print("   → WebView/JavaScript interfaces not kept")
    print("   → App crashes when minified")
    print("")
    print("2. ❌ Version code not incremented")
    print("   → Each upload must have a higher versionCode")
    print("")
    print("3. ❌ Missing privacy policy or terms links")
    print("   → Required for Play Store approval")
    print("")
    print("4. ❌ Missing permissions in manifest")
    print("   → App can't access network or other resources")
    print("")
    print("5. ❌ Unsigned AAB or wrong signing key")
    print("   → Must be signed with proper keystore")
    print("")
    print("6. ❌ Minimum SDK version too low")
    print("   → May not meet Play Store requirements")
    print("")

def generate_fixes():
    """Generate recommended fixes"""
    print_header("Recommended Fixes")
    
    print(f"{Colors.BOLD}If your AAB is not working, apply these fixes:{Colors.ENDC}")
    print("")
    print("1. Update ProGuard rules (proguard-rules.pro):")
    print("   See: scripts/fix_proguard.sh")
    print("")
    print("2. Increment version code in build.gradle:")
    print("   versionCode should be higher than previous upload")
    print("")
    print("3. Ensure Privacy Policy is accessible:")
    print("   https://zikalyze.com/privacy.html")
    print("")
    print("4. Build with proper signing:")
    print("   Use Play App Signing or your own keystore")
    print("")
    print("5. Test the AAB before uploading:")
    print("   npx cap run android --target=physical-device")
    print("")

def main():
    print(f"\n{Colors.BOLD}{Colors.BLUE}")
    print("╔═══════════════════════════════════════════════════════╗")
    print("║   AAB Verification Tool for Google Play Store        ║")
    print("║   Zikalyze Project                                    ║")
    print("╚═══════════════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}\n")
    
    all_passed = True
    
    # Run all checks
    all_passed &= check_build_gradle()
    all_passed &= check_proguard_rules()
    all_passed &= check_manifest()
    all_passed &= check_privacy_compliance()
    check_aab_file()  # Don't fail on missing AAB
    check_common_issues()
    generate_fixes()
    
    # Final summary
    print_header("Verification Summary")
    
    if all_passed:
        print_success("All critical checks passed!")
        print_info("Your AAB should be ready for Play Store upload")
    else:
        print_warning("Some issues were found - review the output above")
        print_info("Apply the recommended fixes before uploading to Play Store")
    
    print("")
    print(f"{Colors.BOLD}Next Steps:{Colors.ENDC}")
    print("1. Fix any issues identified above")
    print("2. Build a new AAB: cd android && ./gradlew bundleRelease")
    print("3. Test on a real device before uploading")
    print("4. Upload to Play Console: https://play.google.com/console")
    print("")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
