# Hybrid Browser Tool Verification Pattern

## Problem Statement
Browser tools were causing false positives in completion claims by confusing technical verification (page loads, rendering) with functional validation (business logic, user workflows).

## Solution: Staged Verification Protocol

**Phase 1: Technical Verification (Browser Tool Scope)**
- Purpose: Verify technical implementation only
- Scope: Page loads, rendering correctness, navigation, console error absence
- Cannot verify: Business logic, functional correctness, user workflow satisfaction
- Output format: "Browser technical verification: [specific technical results]"
- Critical constraint: Never sufficient alone for completion claims

**Phase 2: Human Verification Checkpoint** 
- Purpose: Validate actual business requirements and user workflows
- Process: Use `ask_followup_question` to request specific manual testing
- Format: "Human verification required for: [specific workflows/behaviors]"
- Wait for explicit human confirmation before proceeding

**Phase 3: Evidence-Based Completion**
- Require both technical AND functional verification evidence
- Format: "[Technical: browser results] [Human: confirmed workflows]"
- Document complete verification chain in completion summaries

## Implementation Guidelines
- Integrate with existing quality gates and role workflows
- Adapt verification scope to role-specific needs (debugging vs implementation)
- Prevent false confidence through clear scope boundaries
- Maintain development velocity while ensuring functional accuracy

## Usage Examples
- Code mode: Technical implementation + human workflow verification
- Debug mode: Technical fix verification + human issue resolution confirmation

## Benefits
- Eliminates false positives from automated browser verification
- Maintains automation benefits for appropriate use cases
- Creates clear verification responsibilities between agents and humans
- Builds institutional memory for verification best practices

**Pattern Status**: Implemented in Code and Debug modes (August 2025)
**Related Patterns**: Quality Gates, Evidence-Based Completion