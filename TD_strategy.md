# TD_strategy.md

**Project:** Participium
**Topic:** Technical Debt Resolution Strategy

---

## 1. Resource Allocation (The Budget)
To ensure the long-term maintainability of *Participium* without stalling feature development, we adopt a flexible but capped approach to technical debt (TD) budgeting per sprint.

* **The "Red Line" Cap (20 Hours):** The absolute maximum time allocated to TD in a single sprint is **20 hours**. This is a team decision reserved for extreme cases.
* **The Standard (10 - 15 Hours):** Under normal operating conditions, the team allocates between **10 to 15 hours** per sprint dedicated to refactoring and debt resolution.

---

## 2. Organization & Workflow

### Who
Technical debt resolution is not a solo task. We assign a small "Strike Team" for each TD cycle:
* **Team Size:** **2 to 3 members** maximum.
* **Collaboration:** Pair programming is encouraged for complex refactoring to ensure knowledge transfer and code correctness.

### When
* **Timing:** TD resolution is scheduled for the **end of the sprint** (with exceptions).
* **Rationale:** This allows the team to focus on feature delivery first. The TD phase is then used to clean up code introduced during the sprint or to address the backlog before the release cut, ensuring the `main` branch remains stable.

---

## 3. Prioritization Framework
When addressing Technical Debt, we strictly adhere to the following hierarchy. We do not move to a lower priority until the higher priority is satisfied.

1.  **Blocker & High Severity:** Issues that prevent compilation, deployment, or represent imminent failure risks. (Must be 100% resolved).
2.  **Security:** Vulnerabilities and hotspots identified by static analysis. (Must be 100% resolved).
3.  **Reliability:** Bugs or patterns that lead to runtime errors. (Target: Resolve the majority or choose what not to resolve).
4.  **Maintainability:** "God classes," high cognitive complexity.
    * *Target:* We do not aim for zero code smells immediately. We aim to cut the volume of smells to **1/2** of their original count during the session.
5.  **Test Coverage:** Ensure the module meets the project quality gate (minimum **80% coverage**).

---

## 4. Structural & Architectural Debt
Static analysis tools cannot find every problem. We reserve a portion of our energy to identify and fix "invisible" structural issues that affect system integrity.

---

## 5. Quality Assurance & Tooling Strategy
To ensure our refactoring does not introduce regressions, we rely on a combination of local feedback and CI automation.

### Local Development (Fast Feedback)
* **IDE Extension:** All developers must use **SonarQube for IDE** (connected to our SonarQube server) within their IDE. This provides real-time "spell-checking" for code quality, allowing developers to fix issues *before* pushing code.
* **Standard Templates:** Quality checks are performed quickly by complying with the "Golden Standards" established in previous fixes.

### CI/CD Automation (Gatekeeper)
We utilize **GitHub Actions** to automate our Quality Gates.
* **Trigger:** The SonarQube analysis workflow is triggered automatically on any **Pull Request and Commit** targeting the **`main`** or **`QA`** branches.
* **Enforcement:** The pipeline will fail if the Quality Gate is not met (e.g., New Code Coverage < 80%, or presence of Blockers). Merging needs approval by the full team if the requirement