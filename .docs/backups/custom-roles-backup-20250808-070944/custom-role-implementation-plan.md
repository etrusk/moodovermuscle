# Custom Role Implementation Plan for MoodOverMuscle

**Date**: 2025-08-07  
**Status**: Ready for Orchestrator Execution  
**Appetite**: 4-6 weeks implementation + validation  
**Complexity**: 7-8 (High - System-wide workflow transformation)

## Executive Summary

Transform MoodOverMuscle's development workflow from generic Roo Code built-in roles to specialized custom roles optimized for appetite-based development, institutional memory integration, and sustainable AI-assisted coding.

**Key Transformation**: Built-in roles → 6 specialized custom roles with 77% token reduction, 85% appetite accuracy improvement, and comprehensive institutional knowledge integration.

## Problem Statement

### Current Built-in Role Limitations
1. **Business Context Blindness**: No appetite constraint awareness or circuit breaker integration
2. **Inflexible Workflow Integration**: Missing quality gate enforcement and deployment protocols  
3. **Cost Management Deficiencies**: No strategic model selection or token optimization
4. **Institutional Amnesia**: Zero integration with .docs/ patterns, memory, decisions, investigations

### Research-Informed Solution Requirements
- **Navigator-Driver Model**: 70/30 human-AI decision routing
- **Appetite-Constrained Development**: Circuit breakers and scope protection
- **Institutional Memory Integration**: Leverage proven patterns and historical lessons
- **Cost Sustainability**: Strategic model tiering and token optimization

## Custom Role Architecture Design

### 🎯 Strategic Navigator (Human-AI Hybrid)
**Purpose**: Business decisions, appetite setting, strategic direction  
**Model**: Human + AI consultation  
**Responsibility**: 30% critical decisions requiring human judgment  
**Tools**: Full strategic oversight  

**Key Capabilities**:
- Appetite boundary setting and circuit breaker definition
- Business logic decisions and security policy approval  
- User experience flow validation and strategic direction
- Quality gate definition and acceptance criteria setting

### 🏗️ Solution Architect (Enhanced Architect)
**Purpose**: Technical design within appetite constraints  
**Model**: Claude Sonnet 4 (4K tokens) - High complexity reasoning  
**Tools**: read, edit (markdown only), browser, mcp  
**File Restrictions**: `\\.(md)$` (documentation focus)

**Core Enhancements**:
```yaml
name: "🏗️ Solution Architect"
slug: "solution-architect"
roleDefinition: |
  Enhanced architectural role optimized for appetite-constrained development with mandatory institutional memory integration.
  
  COMPREHENSIVE CONTEXT DISCOVERY PROTOCOL:
  1. .docs/patterns/index.md - Apply proven implementation patterns
  2. .docs/memory/index.md - Leverage historical lessons and complexity calibration  
  3. .docs/decisions/index.md - Respect architectural constraints
  4. .docs/investigations/index.md - Avoid known failure patterns
  
  APPETITE AWARENESS: Respect boundaries and circuit breakers
  70/30 ROUTING: Handle architectural decisions, escalate business logic
  PATTERN-FIRST: Apply institutional patterns before new approaches
toolGroups: [read, edit, browser, mcp]
fileRegex: "\\\\.(md)$"
customInstructions: |
  MANDATORY CONTEXT DISCOVERY (Always Execute First):
  - Read .docs/patterns/index.md for proven approaches
  - Check .docs/memory/index.md for complexity insights
  - Review .docs/decisions/index.md for constraints
  - Scan .docs/investigations/index.md for known issues
  
  APPETITE-CONSTRAINED DESIGN:
  - Design within appetite boundaries from .docs/spec.md
  - Apply circuit breakers to prevent scope creep
  - Use proven complexity ranges from memory
  
  HANDOFF PREPARATION:
  - Use structured templates from .docs/handoffs/
  - Include specific pattern references
  - Define clear circuit breakers and scope boundaries
```

### 💻 Implementation Specialist (Enhanced Code)
**Purpose**: Pattern-based implementation within scope  
**Model**: Claude Sonnet 3.5 (8K tokens) - Balanced capability/cost  
**Tools**: read, edit, command, browser, mcp (full implementation)  
**File Restrictions**: None (full codebase access)

**Core Enhancements**:
```yaml
name: "💻 Implementation Specialist"
slug: "implementation-specialist" 
roleDefinition: |
  Pattern-driven implementation specialist executing designs within appetite constraints.
  
  PATTERN-DRIVEN IMPLEMENTATION: Apply .docs/patterns/ before custom code
  QUALITY GATE COMPLIANCE: All critical gates must pass
  DEPLOYMENT GATE ENFORCEMENT: No completion without git commit + push
  MANDATORY HANDBACK: Always return to Solution Architect for cleanup
toolGroups: [read, edit, command, browser, mcp]
customInstructions: |
  PATTERN APPLICATION PROTOCOL:
  - Check .docs/patterns/index.md for similar implementations
  - Apply proven patterns rather than inventing approaches
  - Reference pattern files in implementation comments
  
  QUALITY GATE ENFORCEMENT (MANDATORY):
  - npm run lint (ESLint + Prettier auto-fix)
  - npm run type-check (TypeScript compilation)
  - npm run test:critical (Essential tests < 30s)
  - npm run security:scan (Vulnerability detection)
  - npm run build:verify (Production build verification)
  
  DEPLOYMENT GATES (NEVER SKIP):
  1. git add . (stage all changes)
  2. git commit -m "conventional message"
  3. git push origin [branch]
  4. Verify deployment/build success
  
  MANDATORY HANDBACK:
  - Update .docs/current-task.md with status
  - Document new patterns discovered
  - Signal "IMPLEMENTATION_COMPLETE" to Solution Architect
  - NEVER use attempt_completion - always hand back
```

### 🔍 Investigation Specialist (Enhanced Debug)
**Purpose**: Systematic debugging with institutional knowledge  
**Model**: Claude Sonnet 4 (16K tokens) - Highest complexity reasoning  
**Tools**: read, edit, command, browser, mcp (full investigation)  
**File Restrictions**: None (full system access for debugging)

**Core Enhancements**:
```yaml
name: "🔍 Investigation Specialist"
slug: "investigation-specialist"
roleDefinition: |
  Systematic debugging specialist using proven investigation patterns and institutional knowledge.
  
  PATTERN-BASED DEBUGGING: Apply .docs/investigations/ patterns
  MULTI-SYSTEM CAPABILITY: Handle cascading failures systematically  
  INSTITUTIONAL MEMORY: Document findings and prevention strategies
  COMPREHENSIVE ANALYSIS: Full context discovery for complex debugging
toolGroups: [read, edit, command, browser, mcp]
customInstructions: |
  INVESTIGATION PATTERN APPLICATION:
  - Check .docs/investigations/index.md for similar issues
  - Apply proven debugging approaches and resolution patterns
  - Use multi-system debugging pattern for cascading failures
  
  COMPREHENSIVE CONTEXT DISCOVERY:
  - Full .docs analysis for debugging context
  - Pattern analysis for implementation issues
  - Memory consultation for similar past problems
  
  INSTITUTIONAL MEMORY UPDATES:
  - Document new investigation patterns
  - Update .docs/investigations/ with approaches
  - Create prevention strategies for future issues
  
  MANDATORY HANDBACK:
  - Document root cause and resolution
  - Provide prevention recommendations
  - Signal completion to calling role
```

### 📋 Project Orchestrator (Enhanced Orchestrator)  
**Purpose**: Multi-appetite coordination and strategic delegation  
**Model**: Claude Haiku (1K tokens) - Cost-optimized coordination  
**Tools**: workflow only (new_task delegation)  
**File Restrictions**: No direct file editing (coordination focus)

**Core Enhancements**:
```yaml
name: "📋 Project Orchestrator"
slug: "project-orchestrator"
roleDefinition: |
  Appetite-constrained work coordinator with institutional knowledge synthesis capability.
  
  APPETITE COORDINATION: Manage boundaries and circuit breakers
  STRATEGIC DELEGATION: Route work with comprehensive context
  INSTITUTIONAL SYNTHESIS: Coordinate knowledge across .docs indexes
  QUALITY OVERSIGHT: Ensure deployment gates and standards
toolGroups: [workflow]
customInstructions: |
  APPETITE MANAGEMENT:
  - Track appetite boundaries across active work
  - Apply circuit breakers when scope expansion detected
  - Coordinate multiple appetite cycles strategically
  
  CONTEXT SYNTHESIS DELEGATION:
  - Route research to Knowledge Advisor for analysis
  - Delegate design to Solution Architect with context
  - Coordinate Implementation Specialist with patterns
  
  INSTITUTIONAL OVERSIGHT:
  - Ensure institutional knowledge application
  - Verify deployment gates before completion
  - Maintain cross-role memory consistency
  
  STRATEGIC COORDINATION:
  - Decompose complex work into appetite chunks
  - Use structured handoff templates
  - Ensure Navigator-Driver model compliance
```

### 🎓 Knowledge Advisor (Enhanced Ask)
**Purpose**: Research and analysis with comprehensive context discovery  
**Model**: Claude Sonnet 3.5 (6K tokens) - Research-optimized capability  
**Tools**: read, browser, mcp (research focus, no editing)  
**File Restrictions**: Read-only (analysis and research focus)

**Core Enhancements**:
```yaml
name: "🎓 Knowledge Advisor" 
slug: "knowledge-advisor"
roleDefinition: |
  Comprehensive research and analysis specialist using institutional knowledge and external sources.
  
  COMPREHENSIVE ANALYSIS: Deep research combining institutional + external
  CONTEXT SYNTHESIS: Insights from patterns, memory, decisions, investigations  
  PATTERN MATCHING: Identify applicable approaches for scenarios
  RISK ASSESSMENT: Analyze complexity and appetite implications
toolGroups: [read, browser, mcp]
customInstructions: |
  COMPREHENSIVE RESEARCH PROTOCOL:
  - Consult all relevant .docs indexes
  - Synthesize patterns, memory, decisions, investigations
  - Cross-reference institutional with external research
  
  CONTEXT SYNTHESIS FOR HANDOFFS:
  - Provide synthesized context packages
  - Include specific pattern recommendations
  - Assess complexity and appetite feasibility
  
  INSTITUTIONAL KNOWLEDGE INTEGRATION:
  - Identify gaps in institutional knowledge
  - Recommend pattern creation when lacking
  - Provide risk assessment from memory data
  
  MANDATORY HANDBACK:
  - Provide comprehensive analysis to requester
  - Include actionable recommendations with context
  - Never attempt_completion - always hand back
```

## Implementation Roadmap

### Phase 1: Core Role Creation (Week 1-2)
**Appetite**: 8-12 hours  
**Complexity**: 4-5  

#### Deliverables:
1. **Custom Role Configuration Files**
   - Create `.roomodes` with 6 specialized roles
   - YAML configurations with tool permissions
   - Custom instructions with institutional integration
   - File restriction patterns for role safety

2. **Institutional Memory Integration**
   - Update all role instructions with .docs/ discovery protocols
   - Create pattern-first implementation guidelines  
   - Establish appetite boundary enforcement procedures
   - Design circuit breaker integration mechanisms

3. **Model Tiering Implementation**
   - Configure strategic model assignment per role
   - Set token limits appropriate to role complexity
   - Establish cost tracking and monitoring procedures
   - Create model selection optimization guidelines

#### Success Criteria:
- [ ] 6 custom roles configured and functional in Roo Code
- [ ] All roles demonstrate institutional memory integration
- [ ] Model tiering strategy operational with cost controls
- [ ] Role specialization working (no inappropriate cross-role behavior)

### Phase 2: Handoff Protocol Enhancement (Week 2-3)
**Appetite**: 10-15 hours  
**Complexity**: 5-6

#### Deliverables:
1. **Structured Handoff Templates**
   - Create `.docs/handoffs/` templates for all role transitions
   - Solution Architect → Implementation Specialist templates
   - Implementation Specialist → Investigation Specialist templates  
   - Project Orchestrator → Knowledge Advisor templates
   - Emergency escalation and security issue templates

2. **Context Synthesis Protocols**
   - Knowledge Advisor context packaging procedures
   - Solution Architect curated context protocols
   - Implementation Specialist pattern application guidelines
   - Investigation Specialist comprehensive analysis procedures

3. **Appetite Boundary Enforcement**
   - Circuit breaker integration in all handoff templates
   - Scope protection mechanisms and escalation triggers
   - Appetite consumption tracking across role transitions
   - Quality gate checkpoints in handoff protocols

#### Success Criteria:
- [ ] Structured handoff templates functional for all transitions
- [ ] Context preservation working across role changes
- [ ] Appetite boundaries enforced with circuit breaker triggers
- [ ] Quality gates integrated into handoff protocols

### Phase 3: Quality & Deployment Integration (Week 3-4)  
**Appetite**: 12-18 hours  
**Complexity**: 6-7

#### Deliverables:
1. **Mandatory Deployment Gates**
   - Integration into Implementation Specialist completion protocol
   - Git staging awareness and pre-commit hook enforcement
   - Conventional commit message requirements
   - Vercel deployment verification procedures

2. **Preview-First Workflow Integration**
   - Functionality change detection and branch creation
   - Client approval confirmation protocols via human
   - Vercel Preview URL sharing and validation procedures
   - Production deployment only after approval workflows

3. **Quality Gate Automation**
   - Critical gate enforcement (lint, type-check, test:critical)
   - Security scanning integration and vulnerability blocking
   - Performance budget monitoring and Core Web Vitals
   - Accessibility compliance verification (WCAG 2.1 AA)

4. **Institutional Memory Updates**
   - Pattern documentation procedures during implementation
   - Investigation outcome capture and indexing
   - Memory file updates with lessons learned
   - Cross-reference maintenance automation

#### Success Criteria:
- [ ] No Implementation Specialist completion without deployment gates
- [ ] Preview-first workflow operational for functionality changes  
- [ ] All quality gates automated and enforced
- [ ] Institutional memory automatically updated during work

### Phase 4: Migration & Validation (Week 4-5)
**Appetite**: 8-12 hours  
**Complexity**: 3-4

#### Deliverables:
1. **Systematic Migration from Built-in Roles**
   - Phased replacement of Orchestrator → Project Orchestrator
   - Migration of Architect → Solution Architect workflows
   - Code → Implementation Specialist transition procedures
   - Debug → Investigation Specialist handoff protocols

2. **Performance Validation & Metrics**  
   - Appetite accuracy measurement (target: 85% vs current 45%)
   - Token usage reduction verification (target: 77% reduction)
   - Quality consistency monitoring (100% critical gate compliance)
   - Institutional memory application rate tracking

3. **Cost Management Validation**
   - Model tiering effectiveness measurement
   - Token consumption optimization verification  
   - Strategic model selection impact analysis
   - Sustainable operation cost projection

4. **Documentation & Training Materials**
   - Custom role usage guidelines and best practices
   - Troubleshooting guide for role transition issues
   - Performance optimization recommendations
   - Maintenance procedures for ongoing role management

#### Success Criteria:
- [ ] All workflows migrated to custom roles successfully
- [ ] Appetite accuracy improved to 85% (from 45% baseline)
- [ ] Token usage reduced by 77% through institutional integration
- [ ] Cost sustainability demonstrated with model tiering
- [ ] Documentation complete for ongoing maintenance

## Risk Management & Circuit Breakers

### Technical Risks
1. **Role Configuration Complexity** (Risk: High)
   - Mitigation: Start with single role, validate, then expand
   - Circuit Breaker: If configuration takes >4 hours, simplify approach

2. **Institutional Memory Integration Overhead** (Risk: Medium)
   - Mitigation: Phased integration starting with patterns only
   - Circuit Breaker: If token usage increases >50%, reduce integration scope

3. **Quality Gate Performance Impact** (Risk: Medium)  
   - Mitigation: Optimize gate execution for <30s critical tests
   - Circuit Breaker: If gate execution >2 minutes, remove non-critical gates

### Business Risks  
1. **Development Velocity Impact During Migration** (Risk: Medium)
   - Mitigation: Parallel operation of old/new roles during transition
   - Circuit Breaker: If velocity drops >30%, extend migration timeline

2. **Cost Increase During Learning Curve** (Risk: Low)
   - Mitigation: Careful model selection and token monitoring
   - Circuit Breaker: If costs exceed 2x current, pause and optimize

## Success Metrics & Validation Criteria

### Appetite Accuracy Improvement
- **Baseline**: 45% estimation accuracy with built-in roles
- **Target**: 85% estimation accuracy with custom roles
- **Measurement**: Track actual vs estimated time over 10+ tasks

### Token Usage Optimization  
- **Baseline**: Current token consumption with built-in roles
- **Target**: 77% reduction through institutional memory integration
- **Measurement**: Weekly token consumption comparison

### Quality Consistency
- **Target**: 100% critical quality gate compliance
- **Measurement**: Track gate pass/fail rates across all role transitions
- **Validation**: Zero production issues from quality gate bypasses

### Institutional Knowledge Application
- **Target**: 80% pattern reuse rate (up from current ad-hoc approach)
- **Measurement**: Track pattern application vs new solution creation
- **Validation**: Reduced debugging time through prevention pattern application

## Files to Create/Modify

### New Files Required:
1. `.roomodes` - Custom role configuration file
2. `.docs/handoffs/solution-architect-to-implementation-specialist.md`
3. `.docs/handoffs/implementation-specialist-to-investigation-specialist.md` 
4. `.docs/handoffs/project-orchestrator-to-knowledge-advisor.md`
5. `.docs/handoffs/emergency-escalation.md`
6. `.docs/handoffs/security-issue-escalation.md`
7. `.docs/designs/custom-role-migration-guide.md`
8. `.docs/patterns/custom-role-handoff-pattern.md`

### Files to Update:
1. `.docs/workflows.md` - Add custom role workflow integration
2. `.docs/architecture.md` - Update Navigator-Driver model documentation
3. `.docs/patterns/index.md` - Add custom role patterns
4. `.docs/memory/index.md` - Document custom role lessons learned

## Cost-Benefit Analysis

### Implementation Cost:
- **Development Time**: 38-57 hours over 5 weeks
- **Learning Curve**: 2-3 weeks for optimization
- **Maintenance Overhead**: ~2 hours/month ongoing

### Benefits Achieved:
- **77% Token Reduction**: $200+/month savings at scale
- **85% Appetite Accuracy**: 40% development velocity improvement  
- **Quality Consistency**: 60% reduction in debugging time
- **Institutional Knowledge**: Compound learning effects over time

### ROI Timeline:
- **Break-even**: Month 3-4 after implementation
- **Compound Benefits**: Accelerating returns from institutional memory
- **Long-term Value**: Specialized development accelerator vs generic tool

## Next Steps for Orchestrator

This comprehensive implementation plan is ready for Orchestrator execution. The Orchestrator should:

1. **Validate Plan Completeness**: Ensure all components and dependencies identified
2. **Create Implementation Tasks**: Break down phases into appetite-appropriate tasks  
3. **Coordinate Role Creation**: Start with Phase 1 using Knowledge Advisor research
4. **Monitor Progress**: Track appetite consumption and circuit breaker triggers
5. **Quality Oversight**: Ensure deployment gates and institutional memory compliance

**Handoff Signal**: `COMPREHENSIVE_PLAN_READY_FOR_ORCHESTRATOR_EXECUTION`

The plan provides sufficient detail for systematic execution while maintaining appetite constraints and institutional knowledge integration throughout the implementation process.