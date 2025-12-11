TEMPLATE FOR RETROSPECTIVE (Team 4)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs done : 
  > 5 stories commited, 5 stories done
- Total points committed vs done :
  > 28 points committed, 28 points done
- Nr of hours planned vs spent (as a team) :
  > 98 hours planned, 92.9 hours spent

**Remember**  a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |   20      |    -   |    69        |      64.9        |
| n.24      |    5    |    5   |      5.5      |         6.5     |
| n.25      |    5    |    8   |      8     |     8.1        |
| n.26      |    5    |    5   |      6     |      6       |
| n.27      |    5    |    5   |      4.5   |      4.5      |
| n.10      |    5    |    5   |      5     |      5.5      |   

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task (average, standard deviation)
- 
  |            | Average | StDev |
  | ---------- | ---- | ----- |
  | Estimation | 2.2  | 3.34   |
  | Actual     | 2.1  | 3.21   |

- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent -1
  > 0.06

- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

  > 0.18
  
## QUALITY MEASURES 
36 test passato
466
- Unit Testing:
  - Total hours estimated
    > 7.2
  - Total hours spent
    > 7.5
  - Nr of automated unit test cases
    > 319
  - Coverage (if available)
  | % Stmts | % Branch | % Funcs | % Lines |
  | ------- | -------- | ------- | ------- |
  | 83.6 | 82.36 | 88.23 | 83.6 |

- E2E testing:
  - Total hours estimated 
  > 5.2
  - Total hours spent
  > 6
- Code review: 
  - Total hours estimated 
  > 5
  - Total hours spent
  > 6.3
  
- Technical Debt Management
  - Strategy Adopted For this sprint: we implemented a deviation from our decided standard workflow. While our usual protocol, and future intention, is to resolve technical debt at the end of the sprint, we decided to front-load the majority of the allocated hours to the beginning of this cycle.

The rationale for this shift was preventative: by addressing debt early, we aimed to establish a high code quality standard immediately. This allowed the team to build new features upon a cleaner foundation, effectively preventing almost all the accumulation of new technical debt throughout the rest of the sprint.

Despite the change in timing, the work was strictly executed according to our Prioritization Framework:

Blocker & High Severity: Resolving issues preventing compilation/deployment or risking imminent failure (100% resolution).

Security: Addressing vulnerabilities and hotspots (100% resolution).

Reliability: Fixing bugs and patterns leading to runtime errors.

Maintainability: Reducing "God classes" and high complexity (Targeting a 50% reduction in code smells).

Test Coverage: Ensuring modules meet the 80% coverage quality gate.

  - Total hours estimated at sprint planning 10

  - Total hours spent 10.3
  


## ASSESSMENT

- What caused your errors in estimation (if any)?
  
  There were mainly two reasons. First, a misunderstanding regarding some tasks required us to spend more time than expected on bug fixes and on adjusting tasks to make them compliant with the system, that didn't leave us time on the weeks to do the more accessory task that we wanted to do. Second, moving technical debt to the start of the sprint caused a bottleneck because the persons assigned to it were also working on a User Story that was necessary for other tasks to proceed.

- What lessons did you learn (both positive and negative) in this sprint?
  We learned that taking a bit more time to read the system before starting programming, and asking the group if it is the right interpretation of a story should help, and also giving the right priority to some task to someone can be helpful.

- Which improvement goals set in the previous retrospective were you able to achieve? 
  
  we achieved a better communication, almost no misunderstanding in tasks for the team, and almost everyone has respected the deadlines that we imposed ourselves

- Which ones you were not able to achieve? Why?
- 
  there were still some miscomunication, but at least less on thecnical issues like last time, but more on the tasks description (someone interpreted a task as something different or something like that), this is also the cause for the missed deadlines this time.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  We want to write down detailed descriptions for potentially ambiguous tasks on GitHub, YouTrack, or Telegram, depending on what is most convenient. This ensures they are defined unequivocally and can be double-checked whenever needed.
  Also set up the deadlines in places where can be checked to everyone to make them more easy to follow.

- One thing you are proud of as a Team!!
  