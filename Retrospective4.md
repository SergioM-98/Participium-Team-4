# TEMPLATE FOR RETROSPECTIVE (Team ##)

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES

### Macro statistics

- Number of stories committed vs done:
  > 6 committed, 6 done
- Total points committed vs done :
  > 25 committed, 25 done
- Nr of hours planned vs spent (as a team) :
  > 101 committed, 86 spent

**Remember** a story is done ONLY if it fits the Definition of Done:

- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD

### Detailed statistics

| Story | # Tasks | Points | Hours est. | Hours actual |
| ----- | ------- | ------ | ---------- | ------------ |
| _#0_  | 15      | -      | 72.5       | 56.5         |
| 13    | 4       | 5      | 3.5        | 4.25         |
| 14    | 3       | 5      | 2          | 2            |
| 15    | 5       | 1      | 4.5        | 4.15         |
| 18    | 6       | 3      | 9          | 9.25         |
| 28    | 5       | 3      | 5          | 5            |
| 30    | 3       | 8      | 4.5        | 4.83         |

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task (average, standard deviation)

  > |            | Average | StDev |
  > | ---------- | ------- | ----- |
  > | Estimation | 2.46    | 3.64  |
  > | Actual     | 2.10    | 2.99  |

- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent -1
  > (101 / 86) - 1 = 0.17

## QUALITY MEASURES

- Unit Testing:

  - Total hours estimated
    > 6.65
  - Total hours spent
    > 7.48
  - Nr of automated unit test cases
    > 1293
  - Coverage (if available)
    | % Stmts | % Branch | % Funcs | % Lines |
    | ------- | -------- | ------- | ------- |
    | 86.93 | 82.63 | 83.63 | 86.93 |

- E2E testing:
  - Total hours estimated
    > 4.15
  - Total hours spent
    > 4.9
- Code review:
  - Total hours estimated
    > 2.5
  - Total hours spent
    > 2.15
- Technical Debt management:
  - Strategy adopted
    > We first completed the majority of the stories and then started working on it. We prioritized the issues based on their severity and managed to solve all of them. Since, at the end, we still had more time left to spend on technical debt, we decided to write more tests to increase coverage, which went up to 86.2%
  - Total hours estimated estimated at sprint planning
    > 12 hours
  - Total hours spent
    > 11.5 hours

## ASSESSMENT

- What caused your errors in estimation (if any)?

  The error ratio was 0.17 which is actually better than sprint 3. The main problems came from underestimating how complex some integrations would be, especially for stories 13 and 18 where we had to connect with existing parts of the system. On the other hand we overestimated the time for technical tasks because honestly we're getting faster at this stuff now. Also E2E testing took a bit more than we thought (4.9h instead of 4.15h) but nothing too serious.

- What lessons did you learn (both positive and negative) in this sprint?

  On the positive side, writing better task descriptions like we planned last sprint really helped - way less confusion and misunderstandings this time. We're also just getting better with the technologies we use so things go smoother. We managed technical debt better by not leaving everything to the end, which was good because it didn't block anyone.

  Negative stuff: we still need to get better at estimating testing time. Unit testing took 7.48h instead of the 6.65h we planned. Coverage went up to 86.93% though so at least there's that. Also some tasks dependencies still caused small delays here and there but much less than before.

- Which improvement goals set in the previous retrospective were you able to achieve?

  We actually achieved both goals from last retrospective. Writing detailed descriptions for tasks on GitHub/YouTrack worked really well - we had way less miscommunication and all 6 stories went pretty smoothly. Also putting deadlines somewhere everyone could see them helped a lot with time management, you can see it in the better estimation accuracy (0.17 vs 0.18 last sprint) and we finished all 25 points on time.

- Which ones you were not able to achieve? Why?

  Honestly we achieved what we set out to do. The task descriptions and visible deadlines thing really worked so there's nothing we didn't accomplish from last sprint's goals.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  First, we want to push coverage from 86.93% to 90% or higher. The idea is to write tests while developing features instead of leaving it for later - each person should dedicate time to tests as they go instead of treating it as seperate phase.

  Second, E2E testing efficiency needs work since it took longer than estimated. We should make some reusable fixtures and helper functions that everyone can use. Maybe spend 2-3 hours at the start of next sprint setting up a shared framework for E2E tests so we don't reinvent the wheel every time.

- One thing you are proud of as a Team!!

  Going from 319 tests in sprint 3 to 1293 tests now is honestly insane! The coverage also jumped to 86.93% which shows we're really taking code quality seriously. Plus we delivered all 6 stories (25 points) on time while also dealing with technical debt properly. Looking back at how we struggled with deadlines and communication in earlier sprints, it's pretty cool to see how much we've improved as a team.
