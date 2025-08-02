#!/bin/bash

# Lighthouse Quality Gates Automation Script
# Demonstrates automated quality enforcement without manual intervention

set -e  # Exit on any error

echo "🚦 Lighthouse Quality Gates - Automated Performance Enforcement"
echo "=============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if quality gates passed
check_quality_gates() {
    local assertion_file=".lighthouseci/assertion-results.json"
    
    if [ ! -f "$assertion_file" ]; then
        echo -e "${RED}❌ No assertion results found. Run Lighthouse first.${NC}"
        return 1
    fi
    
    local assertions=$(cat "$assertion_file")
    local assertion_count=$(echo "$assertions" | jq length 2>/dev/null || echo "0")
    
    if [ "$assertion_count" -eq 0 ]; then
        echo -e "${GREEN}✅ All quality gates PASSED - Build can proceed${NC}"
        return 0
    else
        echo -e "${RED}❌ Quality gates FAILED - Build blocked${NC}"
        echo -e "${YELLOW}Failed assertions:${NC}"
        echo "$assertions" | jq -r '.[] | "  - \(.auditProperty // .category): \(.actual) (required: \(.expected))"' 2>/dev/null || echo "$assertions"
        return 1
    fi
}

# Function to show performance summary
show_performance_summary() {
    local latest_report=$(ls -t .lighthouseci/lhr-*.json 2>/dev/null | head -1)
    
    if [ -z "$latest_report" ]; then
        echo -e "${YELLOW}⚠️  No performance reports found${NC}"
        return
    fi
    
    echo -e "\n${BLUE}📊 Performance Summary (Latest Run):${NC}"
    echo "----------------------------------------"
    
    # Extract key metrics using jq
    if command -v jq >/dev/null 2>&1; then
        local performance=$(jq -r '.categories.performance.score * 100 | floor' "$latest_report" 2>/dev/null || echo "N/A")
        local accessibility=$(jq -r '.categories.accessibility.score * 100 | floor' "$latest_report" 2>/dev/null || echo "N/A")
        local bestPractices=$(jq -r '.categories["best-practices"].score * 100 | floor' "$latest_report" 2>/dev/null || echo "N/A")
        local seo=$(jq -r '.categories.seo.score * 100 | floor' "$latest_report" 2>/dev/null || echo "N/A")
        
        local fcp=$(jq -r '.audits["first-contentful-paint"].numericValue' "$latest_report" 2>/dev/null || echo "N/A")
        local lcp=$(jq -r '.audits["largest-contentful-paint"].numericValue' "$latest_report" 2>/dev/null || echo "N/A")
        local cls=$(jq -r '.audits["cumulative-layout-shift"].numericValue' "$latest_report" 2>/dev/null || echo "N/A")
        
        echo "Performance:     ${performance}% (threshold: 85%)"
        echo "Accessibility:   ${accessibility}% (threshold: 90%)"
        echo "Best Practices:  ${bestPractices}% (threshold: 85%)"
        echo "SEO:             ${seo}% (threshold: 90%)"
        echo ""
        echo "Core Web Vitals:"
        echo "  FCP: ${fcp}ms (budget: <2000ms)"
        echo "  LCP: ${lcp}ms (budget: <2500ms)"
        echo "  CLS: ${cls} (budget: <0.1)"
    else
        echo "Install 'jq' for detailed metrics display"
    fi
}

# Function to demonstrate automated workflow integration
demonstrate_automation() {
    echo -e "\n${BLUE}🤖 Automated Quality Gate Integration:${NC}"
    echo "======================================"
    echo ""
    echo "1. Pre-commit Hook Integration:"
    echo "   Add to .husky/pre-commit:"
    echo "   npm run lighthouse:test && ./scripts/lighthouse-quality-gates.sh"
    echo ""
    echo "2. CI/CD Pipeline Integration:"
    echo "   GitHub Actions automatically runs quality gates"
    echo "   Deployment blocked if critical thresholds fail"
    echo ""
    echo "3. Local Development Workflow:"
    echo "   npm run lighthouse:test  # Runs tests + quality gates"
    echo "   Exit code 0 = All gates passed, proceed"
    echo "   Exit code 1 = Gates failed, fix issues"
    echo ""
    echo "4. Quality Gate Categories:"
    echo "   🔴 ERROR (blocks build): Accessibility, SEO, LCP, CLS"
    echo "   🟡 WARN (tracked): Performance, FCP, Resource budgets"
}

# Main execution
main() {
    echo -e "${BLUE}Checking latest Lighthouse results...${NC}"
    
    # Show performance summary
    show_performance_summary
    
    # Check quality gates
    echo -e "\n${BLUE}🔍 Quality Gate Validation:${NC}"
    echo "----------------------------"
    
    if check_quality_gates; then
        echo -e "\n${GREEN}🎉 AUTOMATED QUALITY GATES: PASSED${NC}"
        echo -e "${GREEN}✅ Build can proceed to deployment${NC}"
        demonstrate_automation
        exit 0
    else
        echo -e "\n${RED}🚫 AUTOMATED QUALITY GATES: FAILED${NC}"
        echo -e "${RED}❌ Build blocked - fix issues before deployment${NC}"
        echo -e "\n${YELLOW}💡 Next Steps:${NC}"
        echo "1. Review failed assertions above"
        echo "2. Fix performance/accessibility issues"
        echo "3. Re-run: npm run lighthouse:test"
        echo "4. Commit only when all gates pass"
        demonstrate_automation
        exit 1
    fi
}

# Run main function
main "$@"