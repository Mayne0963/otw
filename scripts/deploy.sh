#!/bin/bash

# Firebase Deployment Script
# This script handles the complete deployment of Firebase services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FUNCTIONS_DIR="$PROJECT_ROOT/functions"
ENV_FILE="$PROJECT_ROOT/.env.local"
FIREBASE_CONFIG="$PROJECT_ROOT/firebase.json"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
        log_error "Firebase CLI is not installed. Please install it first:"
        echo "npm install -g firebase-tools"
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

check_firebase_login() {
    log_info "Checking Firebase authentication..."
    
    if ! firebase projects:list &> /dev/null; then
        log_warning "Not logged in to Firebase. Please login:"
        firebase login
    fi
    
    log_success "Firebase authentication verified"
}

check_environment() {
    log_info "Checking environment configuration..."
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file not found: $ENV_FILE"
        log_info "Please create .env.local with the following variables:"
        echo "NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key"
        echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com"
        echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id"
        echo "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com"
        echo "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id"
        echo "NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id"
        echo "FIREBASE_PRIVATE_KEY=your_private_key"
        echo "FIREBASE_CLIENT_EMAIL=your_service_account_email"
        echo "STRIPE_SECRET_KEY=your_stripe_secret_key"
        echo "STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret"
        echo "SMTP_HOST=your_smtp_host"
        echo "SMTP_PORT=587"
        echo "SMTP_USER=your_smtp_user"
        echo "SMTP_PASS=your_smtp_password"
        exit 1
    fi
    
    log_success "Environment configuration found"
}

install_dependencies() {
    log_info "Installing project dependencies..."
    
    # Install main project dependencies
    cd "$PROJECT_ROOT"
    npm install
    
    # Install functions dependencies
    if [ -d "$FUNCTIONS_DIR" ]; then
        log_info "Installing Cloud Functions dependencies..."
        cd "$FUNCTIONS_DIR"
        npm install
    fi
    
    log_success "Dependencies installed successfully"
}

build_project() {
    log_info "Building project..."
    
    cd "$PROJECT_ROOT"
    
    # Build Next.js project
    npm run build
    
    # Build Cloud Functions
    if [ -d "$FUNCTIONS_DIR" ]; then
        log_info "Building Cloud Functions..."
        cd "$FUNCTIONS_DIR"
        npm run build
    fi
    
    log_success "Project built successfully"
}

run_tests() {
    log_info "Running tests..."
    
    cd "$PROJECT_ROOT"
    
    # Run main project tests if they exist
    if npm run test --dry-run &> /dev/null; then
        npm run test
    else
        log_warning "No tests found in main project"
    fi
    
    # Run functions tests if they exist
    if [ -d "$FUNCTIONS_DIR" ]; then
        cd "$FUNCTIONS_DIR"
        if npm run test --dry-run &> /dev/null; then
            npm run test
        else
            log_warning "No tests found in Cloud Functions"
        fi
    fi
    
    log_success "Tests completed"
}

validate_firebase_config() {
    log_info "Validating Firebase configuration..."
    
    if [ ! -f "$FIREBASE_CONFIG" ]; then
        log_error "Firebase configuration file not found: $FIREBASE_CONFIG"
        exit 1
    fi
    
    # Validate firebase.json structure
    if ! node -e "JSON.parse(require('fs').readFileSync('$FIREBASE_CONFIG', 'utf8'))" &> /dev/null; then
        log_error "Invalid JSON in firebase.json"
        exit 1
    fi
    
    log_success "Firebase configuration is valid"
}

deploy_firestore_rules() {
    log_info "Deploying Firestore security rules..."
    
    cd "$PROJECT_ROOT"
    firebase deploy --only firestore:rules
    
    log_success "Firestore rules deployed successfully"
}

deploy_storage_rules() {
    log_info "Deploying Storage security rules..."
    
    cd "$PROJECT_ROOT"
    firebase deploy --only storage
    
    log_success "Storage rules deployed successfully"
}

deploy_functions() {
    log_info "Deploying Cloud Functions..."
    
    cd "$PROJECT_ROOT"
    firebase deploy --only functions
    
    log_success "Cloud Functions deployed successfully"
}

deploy_hosting() {
    log_info "Deploying to Firebase Hosting..."
    
    cd "$PROJECT_ROOT"
    firebase deploy --only hosting
    
    log_success "Hosting deployed successfully"
}

setup_firestore_indexes() {
    log_info "Setting up Firestore indexes..."
    
    cd "$PROJECT_ROOT"
    
    # Deploy Firestore indexes if firestore.indexes.json exists
    if [ -f "firestore.indexes.json" ]; then
        firebase deploy --only firestore:indexes
        log_success "Firestore indexes deployed"
    else
        log_warning "No Firestore indexes file found"
    fi
}

verify_deployment() {
    log_info "Verifying deployment..."
    
    cd "$PROJECT_ROOT"
    
    # Get project info
    PROJECT_ID=$(firebase use --current 2>/dev/null || echo "unknown")
    
    if [ "$PROJECT_ID" != "unknown" ]; then
        log_success "Deployment verified for project: $PROJECT_ID"
        
        # Show hosting URL if available
        HOSTING_URL="https://$PROJECT_ID.web.app"
        log_info "Hosting URL: $HOSTING_URL"
        
        # Show functions URL if available
        FUNCTIONS_URL="https://us-central1-$PROJECT_ID.cloudfunctions.net"
        log_info "Functions URL: $FUNCTIONS_URL"
    else
        log_warning "Could not verify deployment"
    fi
}

cleanup() {
    log_info "Cleaning up temporary files..."
    
    cd "$PROJECT_ROOT"
    
    # Remove build artifacts if needed
    # Add cleanup commands here if necessary
    
    log_success "Cleanup completed"
}

# Main deployment function
deploy_all() {
    log_info "Starting complete Firebase deployment..."
    
    check_prerequisites
    check_firebase_login
    check_environment
    install_dependencies
    build_project
    
    if [ "$SKIP_TESTS" != "true" ]; then
        run_tests
    fi
    
    validate_firebase_config
    
    # Deploy in order
    deploy_firestore_rules
    deploy_storage_rules
    setup_firestore_indexes
    deploy_functions
    
    if [ "$SKIP_HOSTING" != "true" ]; then
        deploy_hosting
    fi
    
    verify_deployment
    cleanup
    
    log_success "🎉 Complete Firebase deployment finished successfully!"
}

# Parse command line arguments
SKIP_TESTS="false"
SKIP_HOSTING="false"
DEPLOY_TARGET="all"

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS="true"
            shift
            ;;
        --skip-hosting)
            SKIP_HOSTING="true"
            shift
            ;;
        --functions-only)
            DEPLOY_TARGET="functions"
            shift
            ;;
        --rules-only)
            DEPLOY_TARGET="rules"
            shift
            ;;
        --hosting-only)
            DEPLOY_TARGET="hosting"
            shift
            ;;
        --help)
            echo "Firebase Deployment Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --skip-tests      Skip running tests"
            echo "  --skip-hosting    Skip hosting deployment"
            echo "  --functions-only  Deploy only Cloud Functions"
            echo "  --rules-only      Deploy only security rules"
            echo "  --hosting-only    Deploy only hosting"
            echo "  --help           Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Full deployment"
            echo "  $0 --skip-tests       # Deploy without running tests"
            echo "  $0 --functions-only   # Deploy only functions"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Execute deployment based on target
case $DEPLOY_TARGET in
    "functions")
        log_info "Deploying Cloud Functions only..."
        check_prerequisites
        check_firebase_login
        check_environment
        cd "$FUNCTIONS_DIR" && npm install && npm run build
        cd "$PROJECT_ROOT"
        deploy_functions
        ;;
    "rules")
        log_info "Deploying security rules only..."
        check_prerequisites
        check_firebase_login
        validate_firebase_config
        deploy_firestore_rules
        deploy_storage_rules
        setup_firestore_indexes
        ;;
    "hosting")
        log_info "Deploying hosting only..."
        check_prerequisites
        check_firebase_login
        check_environment
        install_dependencies
        build_project
        deploy_hosting
        ;;
    "all")
        deploy_all
        ;;
esac

log_success "Deployment script completed! 🚀"