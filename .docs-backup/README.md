# MoodOverMuscle Documentation

## Quick Start

- **[Current Project Status](./current-task.md)** - Active development tasks and session state
- **[Project Specification](./spec.md)** - Appetite-based project requirements and scope
- **[API Specification](./api/specification.md)** - Technical API documentation and contracts
- **[Technical Debt Tracking](./debt.md)** - Active and resolved technical debt items

## Core Architecture & Design

- **[System Architecture](./architecture.md)** - Technical architecture, constraints, and design patterns
- **[Development Workflows](./workflows.md)** - Appetite-based development processes and quality gates

## Documentation Structure

### **Agent Collaboration**

- **[Handoff Templates](./handoffs/index.md)** - Structured transitions between development modes with template selection guidance
- **[Pattern Library](./patterns/index.md)** - Reusable implementation patterns and solutions

### **Institutional Knowledge**

- **[Memory Index](./memory/index.md)** - Successful approaches, debugging strategies, and complexity insights
- **[Decision Records](./decisions/index.md)** - Architectural decisions and their rationale
- **[Investigations](./investigations/index.md)** - Problem analysis and resolution documentation

### **System Integration**

- **[API Specification](./api/specification.md)** - Interface contracts and integration points

## Navigation Guide

### **For Development Tasks**

1. **Current Context**: Review **[current-task.md](./current-task.md)** for active work and session state
2. **Pattern Discovery**: Search **[patterns](./patterns/index.md)** for proven implementation approaches
3. **Agent Handoffs**: **MANDATORY** - Check **[handoff templates](./handoffs/index.md)** for appropriate transition template before any mode handoff
4. **Technical Constraints**: Reference **[architecture.md](./architecture.md)** for system design boundaries
5. **Quality Processes**: Follow **[workflows.md](./workflows.md)** for quality gates and preview-first deployment
6. **Knowledge Distribution**: Check **[memory](./memory/index.md)** for institutional knowledge and truck number tracking

### **For Architecture & Design**

1. Start with **[spec.md](./spec.md)** for project scope and appetite
2. Review **[architecture.md](./architecture.md)** for system design
3. Check **[decisions](./decisions/index.md)** for architectural rationale
4. Reference **[memory](./memory/index.md)** for complexity insights

### **For Debugging & Investigation**

1. Check **[investigations](./investigations/index.md)** for similar issues
2. Use **[memory/debugging-failures](./memory/debugging-failures-and-recovery-strategies.md)** for proven approaches
3. Apply **[handoff templates](./handoffs/index.md)** for debug escalation
4. Document findings in appropriate investigation files

## Quality Assurance

### **Critical Documents**

- All changes must pass quality gates defined in **[workflows.md](./workflows.md)**
- Architecture decisions require ADR documentation in **[decisions](./decisions/index.md)**
- New patterns must be added to **[patterns](./patterns/index.md)** with usage examples
- API changes must update contracts in **[api/specification.md](./api/specification.md)**

### **Documentation Health & Maintenance**

**Automated Staleness Detection** (Zero Maintenance Overhead):

```bash
# Check documentation health
npm run docs:staleness      # Detailed staleness analysis with recommendations
npm run test:critical       # Includes documentation health checks (integrated)
```

**Health Scoring System (30-day threshold)**:
- **Current (0-30 days)**: Recently updated, likely accurate
- **Stale (31+ days)**: Flagged for review or cleanup

**Target Health Score: >90% current documentation**

**System Benefits**:
- Zero manual tracking overhead - uses git timestamps automatically
- Integrated with critical test workflow for continuous monitoring
- Clear maintenance recommendations with visual priority indicators
- Supports 90% documentation size reduction target

### **Documentation Standards**

- **Appetite-Focused**: All documentation organized around appetite constraints and scope boundaries
- **Agent-Friendly**: Templates and indexes optimized for agent collaboration workflows
- **Pattern-Based**: Reusable solutions documented for complexity estimation and implementation guidance
- **Quality-First**: Critical vs. non-critical requirements clearly defined throughout
- **Navigator-Driver Model**: Clear separation between human strategic decisions and AI tactical execution
- **Knowledge Distribution**: Truck number principle ensures critical knowledge is distributed across team members
- **Health-Monitored**: Automated staleness detection maintains documentation currency

## AI-Assisted Development Guidelines

### **Navigator-Driver Model**

- **Human Navigator**: Sets strategic direction, makes business decisions, provides quality oversight
- **AI Driver**: Handles tactical implementation, follows established patterns, executes within constraints
- **Clear Boundaries**: 70% routine work (AI), 30% critical decisions (human escalation)

### **Automation Principles**

- **Maximize Automation**: Automate repetitive tasks while preserving human oversight for critical decisions
- **Prevent Documentation Drift**: Enhance documentation through automated pattern capture and institutional memory
- **Knowledge Distribution**: Ensure critical knowledge is shared across multiple team members (truck number principle)
- **Quality Gates**: Automated quality enforcement with human escalation for critical failures

---

**Last Updated**: 2025-08-04  
**Documentation Status**: Comprehensive coverage of appetite-based development workflow  
**Next Review**: Quarterly review of pattern effectiveness and agent collaboration efficiency
