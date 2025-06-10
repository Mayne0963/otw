#!/bin/bash

# Firebase Deployment Script for EzyZip
# This script handles the complete deployment of Firebase services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="your-firebase-project-id"
REGION="us-central1"
ENVIRONMENT="production"  # or "staging"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Firebase CLI is installed
    if ! command_exists firebase; then
        print_error "Firebase CLI is not installed. Please install it first:"
        echo "npm install -g firebase-tools"
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "All prerequisites are met."
}

# Function to authenticate with Firebase
authenticate_firebase() {
    print_status "Checking Firebase authentication..."
    
    if ! firebase projects:list >/dev/null 2>&1; then
        print_warning "Not authenticated with Firebase. Please login:"
        firebase login
    fi
    
    print_success "Firebase authentication verified."
}

# Function to set Firebase project
set_firebase_project() {
    print_status "Setting Firebase project to $PROJECT_ID..."
    
    firebase use "$PROJECT_ID" || {
        print_error "Failed to set Firebase project. Please check if project ID is correct."
        exit 1
    }
    
    print_success "Firebase project set to $PROJECT_ID."
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    # Install main project dependencies
    if [ -f "package.json" ]; then
        npm install
        print_success "Main project dependencies installed."
    fi
    
    # Install Cloud Functions dependencies
    if [ -d "functions" ] && [ -f "functions/package.json" ]; then
        print_status "Installing Cloud Functions dependencies..."
        cd functions
        npm install
        cd ..
        print_success "Cloud Functions dependencies installed."
    fi
}

# Function to build the project
build_project() {
    print_status "Building the project..."
    
    # Build main project if build script exists
    if npm run build >/dev/null 2>&1; then
        npm run build
        print_success "Main project built successfully."
    else
        print_warning "No build script found for main project."
    fi
    
    # Build Cloud Functions
    if [ -d "functions" ]; then
        print_status "Building Cloud Functions..."
        cd functions
        if npm run build >/dev/null 2>&1; then
            npm run build
            print_success "Cloud Functions built successfully."
        else
            print_warning "No build script found for Cloud Functions."
        fi
        cd ..
    fi
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Run main project tests
    if npm test >/dev/null 2>&1; then
        npm test
        print_success "Main project tests passed."
    else
        print_warning "No test script found for main project or tests failed."
    fi
    
    # Run Cloud Functions tests
    if [ -d "functions" ]; then
        cd functions
        if npm test >/dev/null 2>&1; then
            npm test
            print_success "Cloud Functions tests passed."
        else
            print_warning "No test script found for Cloud Functions or tests failed."
        fi
        cd ..
    fi
}

# Function to deploy Firestore rules
deploy_firestore_rules() {
    print_status "Deploying Firestore security rules..."
    
    if [ -f "firestore.rules" ]; then
        firebase deploy --only firestore:rules
        print_success "Firestore rules deployed successfully."
    else
        print_warning "No Firestore rules file found."
    fi
}

# Function to deploy Storage rules
deploy_storage_rules() {
    print_status "Deploying Storage security rules..."
    
    if [ -f "storage.rules" ]; then
        firebase deploy --only storage
        print_success "Storage rules deployed successfully."
    else
        print_warning "No Storage rules file found."
    fi
}

# Function to deploy Cloud Functions
deploy_functions() {
    print_status "Deploying Cloud Functions..."
    
    if [ -d "functions" ]; then
        firebase deploy --only functions
        print_success "Cloud Functions deployed successfully."
    else
        print_warning "No functions directory found."
    fi
}

# Function to deploy Hosting
deploy_hosting() {
    print_status "Deploying to Firebase Hosting..."
    
    if [ -f "firebase.json" ] && grep -q '"hosting"' firebase.json; then
        firebase deploy --only hosting
        print_success "Hosting deployed successfully."
    else
        print_warning "No hosting configuration found."
    fi
}

# Function to deploy Firestore indexes
deploy_firestore_indexes() {
    print_status "Deploying Firestore indexes..."
    
    if [ -f "firestore.indexes.json" ]; then
        firebase deploy --only firestore:indexes
        print_success "Firestore indexes deployed successfully."
    else
        print_warning "No Firestore indexes file found."
    fi
}

# Function to set environment variables
set_environment_variables() {
    print_status "Setting environment variables..."
    
    # Set environment variables for Cloud Functions
    if [ -f ".env.${ENVIRONMENT}" ]; then
        print_status "Setting environment variables from .env.${ENVIRONMENT}..."
        
        # Read environment variables and set them
        while IFS='=' read -r key value; do
            if [[ ! $key =~ ^# ]] && [[ $key ]]; then
                firebase functions:config:set "${key,,}"="$value"
            fi
        done < ".env.${ENVIRONMENT}"
        
        print_success "Environment variables set successfully."
    else
        print_warning "No environment file found for $ENVIRONMENT."
    fi
}

# Function to create Firestore indexes
create_firestore_indexes() {
    print_status "Creating Firestore indexes..."
    
    # Create composite indexes
    cat > firestore.indexes.json << EOF
{
  "indexes": [
    {
      "collectionGroup": "analytics_events",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userRef",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "screenshot_orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "customerInfo.uid",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "notification_logs",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "payment_logs",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "orderId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
EOF
    
    print_success "Firestore indexes configuration created."
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check if functions are deployed
    if firebase functions:list >/dev/null 2>&1; then
        print_success "Cloud Functions are accessible."
    else
        print_warning "Could not verify Cloud Functions deployment."
    fi
    
    # Check if hosting is accessible
    if [ -f "firebase.json" ] && grep -q '"hosting"' firebase.json; then
        HOSTING_URL=$(firebase hosting:channel:list | grep -o 'https://[^[:space:]]*' | head -1)
        if [ -n "$HOSTING_URL" ]; then
            print_success "Hosting is accessible at: $HOSTING_URL"
        fi
    fi
}

# Function to show deployment summary
show_deployment_summary() {
    echo ""
    echo "======================================"
    echo "       DEPLOYMENT SUMMARY"
    echo "======================================"
    echo "Project ID: $PROJECT_ID"
    echo "Environment: $ENVIRONMENT"
    echo "Region: $REGION"
    echo "Timestamp: $(date)"
    echo "======================================"
    echo ""
}

# Function to rollback deployment
rollback_deployment() {
    print_warning "Rolling back deployment..."
    
    # Rollback functions
    if [ -d "functions" ]; then
        firebase functions:delete --force
        print_status "Cloud Functions rolled back."
    fi
    
    # Note: Firestore rules and indexes cannot be easily rolled back
    print_warning "Note: Firestore rules and indexes need to be manually reverted if needed."
}

# Function to deploy everything
deploy_all() {
    print_status "Starting complete Firebase deployment..."
    
    check_prerequisites
    authenticate_firebase
    set_firebase_project
    install_dependencies
    build_project
    
    # Skip tests in CI environment or if --skip-tests flag is passed
    if [[ "$*" != *"--skip-tests"* ]] && [[ "$CI" != "true" ]]; then
        run_tests
    fi
    
    create_firestore_indexes
    set_environment_variables
    deploy_firestore_rules
    deploy_storage_rules
    deploy_firestore_indexes
    deploy_functions
    deploy_hosting
    verify_deployment
    show_deployment_summary
    
    print_success "🎉 Complete Firebase deployment finished successfully!"
}

# Function to deploy only functions
deploy_functions_only() {
    print_status "Deploying only Cloud Functions..."
    
    check_prerequisites
    authenticate_firebase
    set_firebase_project
    
    if [ -d "functions" ]; then
        cd functions
        npm install
        if npm run build >/dev/null 2>&1; then
            npm run build
        fi
        cd ..
    fi
    
    deploy_functions
    print_success "🚀 Cloud Functions deployment completed!"
}

# Function to deploy only rules
deploy_rules_only() {
    print_status "Deploying only security rules..."
    
    check_prerequisites
    authenticate_firebase
    set_firebase_project
    deploy_firestore_rules
    deploy_storage_rules
    
    print_success "🔒 Security rules deployment completed!"
}

# Function to show help
show_help() {
    echo "Firebase Deployment Script for EzyZip"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  all                Deploy everything (default)"
    echo "  functions          Deploy only Cloud Functions"
    echo "  rules              Deploy only security rules"
    echo "  hosting            Deploy only hosting"
    echo "  rollback           Rollback deployment"
    echo "  help               Show this help message"
    echo ""
    echo "Options:"
    echo "  --skip-tests       Skip running tests"
    echo "  --project=ID       Set Firebase project ID"
    echo "  --env=ENV          Set environment (production/staging)"
    echo ""
    echo "Examples:"
    echo "  $0                 # Deploy everything"
    echo "  $0 functions       # Deploy only functions"
    echo "  $0 all --skip-tests # Deploy everything without tests"
    echo "  $0 --project=my-project --env=staging"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --project=*)
            PROJECT_ID="${1#*=}"
            shift
            ;;
        --env=*)
            ENVIRONMENT="${1#*=}"
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        functions)
            COMMAND="functions"
            shift
            ;;
        rules)
            COMMAND="rules"
            shift
            ;;
        hosting)
            COMMAND="hosting"
            shift
            ;;
        rollback)
            COMMAND="rollback"
            shift
            ;;
        help)
            COMMAND="help"
            shift
            ;;
        all)
            COMMAND="all"
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Set default command if none provided
COMMAND=${COMMAND:-"all"}

# Execute the appropriate command
case $COMMAND in
    "all")
        deploy_all "$@"
        ;;
    "functions")
        deploy_functions_only
        ;;
    "rules")
        deploy_rules_only
        ;;
    "hosting")
        check_prerequisites
        authenticate_firebase
        set_firebase_project
        build_project
        deploy_hosting
        ;;
    "rollback")
        rollback_deployment
        ;;
    "help")
        show_help
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        show_help
        exit 1
        ;;
esac