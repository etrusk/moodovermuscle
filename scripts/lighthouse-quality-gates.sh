#!/bin/bash

# Lighthouse Quality Gates Automation Script

set -e

echo "🚦 Lighthouse Quality Gates"
echo "=============================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_quality_gates() {
    local assertion_file=".lighthouseci/assertion-results.json"
    
    if [ ! -f "$assertion_file" ]; then
        echo -e "${RED}❌ No assertion results found. Run Lighthouse first.${NC}"
        return 1
    fi
    
    local assertion_count=$(cat "$assertion_file" | jq length 2>/dev/null || echo "0")
    
    if [ "$assertion_count" -eq 0 ]; then
        echo -e "${GREEN}✅ All quality gates PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ Quality gates FAILED${NC}"
        cat "$assertion_file" | jq -r '.[] | "  - \(.auditProperty // .category): \(.actual) (required: \(.expected))"' 2>/dev/null || cat "$assertion_file"
        return 1
    fi
}

show_performance_summary() {
    local latest_report=$(ls -t .lighthouseci/lhr-*.json 2>/dev/null | head -1)
    
    if [ -z "$latest_report" ]; then
        echo -e "${YELLOW}⚠️  No performance reports found${NC}"
        return
    fi
    
    echo -e "\n📊 Performance Summary:"
    echo "----------------------"
    
    if command -v jq >/dev/null 2>&1; then
        local perf=$(jq -r '.categories.performance.score * 100 | floor' "$latest_report" 2>/dev/null || echo "N/A")
        local a11y=$(jq -r '.categories.accessibility.score * 100 | floor' "$latest_report" 2>/dev/null || echo "N/A")
        local bp=$(jq -r '.categories["best-practices"].score * 100 | floor' "$latest_report" 2>/dev/null || echo "N/A")
        local seo=$(jq -r '.categories.seo.score * 100 | floor' "$latest_report" 2>/dev/null || echo "N/A")
        
        echo "Performance:     $perf%"
        echo "Accessibility:   $a11y%"
        echo "Best Practices:  $bp%"
        echo "SEO:             $seo%"
    else
        echo "Install 'jq' for detailed metrics"
    fi
}

main() {
    show_performance_summary
    
    echo -e "\n🔍 Quality Gate Validation:"
    
    if check_quality_gates; then
        echo -e "\n${GREEN}🎉 Quality gates passed - Build can proceed${NC}"
        exit 0
    else
        echo -e "\n${RED}🚫 Quality gates failed - Build blocked${NC}"
        echo -e "${YELLOW}Fix issues and re-run: pnpm run lighthouse:test${NC}"
        exit 1
    fi
}

main "$@"