#!/bin/bash

# ========================================================================
# Enhanced Firebase Deployment Script
# Comprehensive deployment automation for Firebase backend services
# ========================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/deployment.log"
BACKUP_DIR="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"

# Default values
ENVIRONMENT="staging"
DEPLOY_FUNCTIONS=true
DEPLOY_RULES=true
DEPLOY_INDEXES=true
DEPLOY_HOSTING=false
SKIP_TESTS=false
SKIP_BACKUP=false
VERBOSE=false
DRY_RUN=false

# ========================================================================
# UTILITY FUNCTIONS
# ========================================================================

log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
    esac
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

show_help() {
    cat << EOF
Enhanced Firebase Deployment Script

Usage: $0 [OPTIONS]

Options:
    -e, --environment ENV       Deployment environment (staging|production) [default: staging]
    -f, --functions             Deploy Cloud Functions [default: true]
    -r, --rules                 Deploy security rules [default: true]
    -i, --indexes               Deploy Firestore indexes [default: true]
    -h, --hosting               Deploy hosting [default: false]
    --skip-tests                Skip running tests
    --skip-backup               Skip creating backups
    --dry-run                   Show what would be deployed without actually deploying
    -v, --verbose               Enable verbose output
    --help                      Show this help message

Examples:
    $0                                          # Deploy to staging with default options
    $0 -e production                           # Deploy to production
    $0 -e staging --skip-tests                 # Deploy to staging without running tests
    $0 -e production -f -r                     # Deploy only functions and rules to production
    $0 --dry-run                               # Show what would be deployed

Environment Variables:
    FIREBASE_TOKEN                             # Firebase CI token (required for non-interactive)
    FIREBASE_PROJECT_STAGING                   # Staging project ID
    FIREBASE_PROJECT_PRODUCTION                # Production project ID

EOF
}

check_dependencies() {
    log "INFO" "Checking dependencies..."
    
    # Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
        log "ERROR" "Firebase CLI is not installed. Please install it with: npm install -g firebase-tools"
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log "ERROR" "Node.js is not installed. Please install Node.js"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log "ERROR" "npm is not installed. Please install npm"
        exit 1
    fi
    
    log "SUCCESS" "All dependencies are available"
}

validate_environment() {
    log "INFO" "Validating environment: $ENVIRONMENT"
    
    case $ENVIRONMENT in
        "staging")
            if [ -n "$FIREBASE_PROJECT_STAGING" ]; then
                FIREBASE_PROJECT="$FIREBASE_PROJECT_STAGING"
            else
                FIREBASE_PROJECT="your-project-staging"
            fi
            ;;
        "production")
            if [ -n "$FIREBASE_PROJECT_PRODUCTION" ]; then
                FIREBASE_PROJECT="$FIREBASE_PROJECT_PRODUCTION"
            else
                FIREBASE_PROJECT="your-project-production"
            fi
            ;;
        *)
            log "ERROR" "Invalid environment: $ENVIRONMENT. Must be 'staging' or 'production'"
            exit 1
            ;;
    esac
    
    log "INFO" "Using Firebase project: $FIREBASE_PROJECT"
}

validate_firebase_config() {
    log "INFO" "Validating Firebase configuration..."
    
    # Check if firebase.json exists
    if [ ! -f "$PROJECT_ROOT/firebase.json" ]; then
        log "ERROR" "firebase.json not found in project root"
        exit 1
    fi
    
    # Validate JSON syntax
    if ! node -e "JSON.parse(require('fs').readFileSync('$PROJECT_ROOT/firebase.json', 'utf8'))" 2>/dev/null; then
        log "ERROR" "firebase.json has invalid JSON syntax"
        exit 1
    fi
    
    log "SUCCESS" "Firebase configuration is valid"
}

validate_security_rules() {
    log "INFO" "Validating security rules..."
    
    # Validate Firestore rules
    if [ -f "$PROJECT_ROOT/firestore.rules" ]; then
        if firebase firestore:rules:validate "$PROJECT_ROOT/firestore.rules" --project=demo-project 2>/dev/null; then
            log "SUCCESS" "firestore.rules is valid"
        else
            log "ERROR" "firestore.rules validation failed"
            exit 1
        fi
    fi
    
    if [ -f "$PROJECT_ROOT/firestore-enhanced.rules" ]; then
        if firebase firestore:rules:validate "$PROJECT_ROOT/firestore-enhanced.rules" --project=demo-project 2>/dev/null; then
            log "SUCCESS" "firestore-enhanced.rules is valid"
        else
            log "ERROR" "firestore-enhanced.rules validation failed"
            exit 1
        fi
    fi
    
    # Validate Storage rules
    if [ -f "$PROJECT_ROOT/storage.rules" ]; then
        if firebase storage:rules:validate "$PROJECT_ROOT/storage.rules" --project=demo-project 2>/dev/null; then
            log "SUCCESS" "storage.rules is valid"
        else
            log "ERROR" "storage.rules validation failed"
            exit 1
        fi
    fi
    
    if [ -f "$PROJECT_ROOT/storage-enhanced.rules" ]; then
        if firebase storage:rules:validate "$PROJECT_ROOT/storage-enhanced.rules" --project=demo-project 2>/dev/null; then
            log "SUCCESS" "storage-enhanced.rules is valid"
        else
            log "ERROR" "storage-enhanced.rules validation failed"
            exit 1
        fi
    fi
}

run_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        log "WARNING" "Skipping tests as requested"
        return 0
    fi
    
    log "INFO" "Running tests..."
    
    # Test Cloud Functions if they exist
    if [ -d "$PROJECT_ROOT/functions" ]; then
        log "INFO" "Testing Cloud Functions..."
        
        cd "$PROJECT_ROOT/functions"
        
        # Install dependencies
        if [ -f "package.json" ]; then
            npm ci
        fi
        
        # Run TypeScript compilation
        if npm run build 2>/dev/null; then
            log "SUCCESS" "Functions build successful"
        else
            log "ERROR" "Functions build failed"
            exit 1
        fi
        
        # Run linting if available
        if npm run lint --if-present 2>/dev/null; then
            log "SUCCESS" "Linting passed"
        else
            log "WARNING" "Linting not configured or failed"
        fi
        
        # Run unit tests if available
        if npm test --if-present 2>/dev/null; then
            log "SUCCESS" "Unit tests passed"
        else
            log "WARNING" "Unit tests not configured or failed"
        fi
        
        cd "$PROJECT_ROOT"
    fi
    
    log "SUCCESS" "All tests completed"
}

create_backup() {
    if [ "$SKIP_BACKUP" = true ]; then
        log "WARNING" "Skipping backup as requested"
        return 0
    fi
    
    log "INFO" "Creating deployment backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Set Firebase project
    firebase use "$FIREBASE_PROJECT" 2>/dev/null || true
    
    # Backup Firestore rules
    if firebase firestore:rules:get > "$BACKUP_DIR/firestore-rules.txt" 2>/dev/null; then
        log "SUCCESS" "Firestore rules backed up"
    else
        log "WARNING" "Could not backup Firestore rules"
    fi
    
    # Backup Storage rules
    if firebase storage:rules:get > "$BACKUP_DIR/storage-rules.txt" 2>/dev/null; then
        log "SUCCESS" "Storage rules backed up"
    else
        log "WARNING" "Could not backup Storage rules"
    fi
    
    # Backup Firestore indexes
    if firebase firestore:indexes > "$BACKUP_DIR/firestore-indexes.json" 2>/dev/null; then
        log "SUCCESS" "Firestore indexes backed up"
    else
        log "WARNING" "Could not backup Firestore indexes"
    fi
    
    # Create deployment manifest
    cat > "$BACKUP_DIR/deployment-manifest.json" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$ENVIRONMENT",
  "project": "$FIREBASE_PROJECT",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "deploy_functions": $DEPLOY_FUNCTIONS,
  "deploy_rules": $DEPLOY_RULES,
  "deploy_indexes": $DEPLOY_INDEXES,
  "deploy_hosting": $DEPLOY_HOSTING
}
EOF
    
    log "SUCCESS" "Backup created at: $BACKUP_DIR"
}

perform_deployment() {
    log "INFO" "Starting deployment to $ENVIRONMENT..."
    
    # Set Firebase project
    firebase use "$FIREBASE_PROJECT"
    
    # Build deployment command
    local deploy_targets=()
    
    if [ "$DEPLOY_FUNCTIONS" = true ]; then
        deploy_targets+=("functions")
        log "INFO" "Will deploy Cloud Functions"
    fi
    
    if [ "$DEPLOY_RULES" = true ]; then
        deploy_targets+=("firestore:rules")
        deploy_targets+=("storage")
        log "INFO" "Will deploy security rules"
    fi
    
    if [ "$DEPLOY_INDEXES" = true ]; then
        deploy_targets+=("firestore:indexes")
        log "INFO" "Will deploy Firestore indexes"
    fi
    
    if [ "$DEPLOY_HOSTING" = true ]; then
        deploy_targets+=("hosting")
        log "INFO" "Will deploy hosting"
    fi
    
    if [ ${#deploy_targets[@]} -eq 0 ]; then
        log "ERROR" "No deployment targets specified"
        exit 1
    fi
    
    # Join array elements with commas
    local IFS=','
    local targets_string="${deploy_targets[*]}"
    
    local deploy_command="firebase deploy --only $targets_string"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        deploy_command="$deploy_command --force"
    fi
    
    if [ "$DRY_RUN" = true ]; then
        log "INFO" "DRY RUN: Would execute: $deploy_command"
        log "INFO" "DRY RUN: Deployment targets: $targets_string"
        return 0
    fi
    
    log "INFO" "Executing: $deploy_command"
    
    if eval "$deploy_command"; then
        log "SUCCESS" "Deployment completed successfully!"
    else
        log "ERROR" "Deployment failed!"
        exit 1
    fi
}

verify_deployment() {
    if [ "$DRY_RUN" = true ]; then
        return 0
    fi
    
    log "INFO" "Verifying deployment..."
    
    # Wait for functions to be ready
    if [ "$DEPLOY_FUNCTIONS" = true ]; then
        log "INFO" "Waiting for functions to be ready..."
        sleep 30
        
        if firebase functions:list 2>/dev/null | grep -q "✓"; then
            log "SUCCESS" "Functions are healthy"
        else
            log "WARNING" "Functions status unclear"
        fi
    fi
    
    # Check rules deployment
    if [ "$DEPLOY_RULES" = true ]; then
        log "INFO" "Verifying security rules..."
        
        # This is a basic check - in practice, you might want more sophisticated verification
        if firebase firestore:rules:get >/dev/null 2>&1; then
            log "SUCCESS" "Firestore rules are active"
        else
            log "WARNING" "Could not verify Firestore rules"
        fi
        
        if firebase storage:rules:get >/dev/null 2>&1; then
            log "SUCCESS" "Storage rules are active"
        else
            log "WARNING" "Could not verify Storage rules"
        fi
    fi
    
    log "SUCCESS" "Deployment verification completed"
}

cleanup() {
    log "INFO" "Performing cleanup..."
    
    # Clean up temporary files if any
    if [ -d "$PROJECT_ROOT/functions/lib" ]; then
        log "INFO" "Cleaning up function build artifacts..."
    fi
    
    # Remove old backups (keep last 10)
    if [ -d "$PROJECT_ROOT/backups" ]; then
        log "INFO" "Cleaning up old backups..."
        cd "$PROJECT_ROOT/backups"
        ls -t | tail -n +11 | xargs -r rm -rf
        cd "$PROJECT_ROOT"
    fi
    
    log "SUCCESS" "Cleanup completed"
}

# ========================================================================
# MAIN SCRIPT
# ========================================================================

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -f|--functions)
            DEPLOY_FUNCTIONS=true
            DEPLOY_RULES=false
            DEPLOY_INDEXES=false
            DEPLOY_HOSTING=false
            shift
            ;;
        -r|--rules)
            DEPLOY_FUNCTIONS=false
            DEPLOY_RULES=true
            DEPLOY_INDEXES=false
            DEPLOY_HOSTING=false
            shift
            ;;
        -i|--indexes)
            DEPLOY_FUNCTIONS=false
            DEPLOY_RULES=false
            DEPLOY_INDEXES=true
            DEPLOY_HOSTING=false
            shift
            ;;
        -h|--hosting)
            DEPLOY_HOSTING=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log "ERROR" "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
main() {
    log "INFO" "Starting Enhanced Firebase Deployment"
    log "INFO" "Environment: $ENVIRONMENT"
    log "INFO" "Deploy Functions: $DEPLOY_FUNCTIONS"
    log "INFO" "Deploy Rules: $DEPLOY_RULES"
    log "INFO" "Deploy Indexes: $DEPLOY_INDEXES"
    log "INFO" "Deploy Hosting: $DEPLOY_HOSTING"
    log "INFO" "Dry Run: $DRY_RUN"
    
    # Create log file
    mkdir -p "$(dirname "$LOG_FILE")"
    touch "$LOG_FILE"
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Execute deployment steps
    check_dependencies
    validate_environment
    validate_firebase_config
    validate_security_rules
    run_tests
    create_backup
    perform_deployment
    verify_deployment
    cleanup
    
    log "SUCCESS" "🚀 Deployment completed successfully!"
    log "INFO" "Timestamp: $(date -u)"
    log "INFO" "Environment: $ENVIRONMENT"
    log "INFO" "Project: $FIREBASE_PROJECT"
    
    if [ "$DRY_RUN" = false ]; then
        log "INFO" "Deployment log: $LOG_FILE"
        log "INFO" "Backup location: $BACKUP_DIR"
    fi
}

# Trap errors and cleanup
trap 'log "ERROR" "Deployment failed with exit code $?"; cleanup; exit 1' ERR

# Run main function
main "$@"