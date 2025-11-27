# TEMPLATE FOR RETROSPECTIVE (Team ##)

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES

### Macro statistics

- Number of stories committed vs. done
  > 7 stories commited, 7 stories completed
- Total points committed vs. done
  > 41 points committed, 41 done
- Nr of hours planned vs. spent (as a team)
  > 99.08 hours planned, 97.9 hours spent

**Remember**a story is done ONLY if it fits the Definition of Done:

- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!)

### Detailed statistics

| Story           | # Tasks | Points | Hours est. | Hours actual |
| --------------- | ------- | ------ | ---------- | ------------ |
| _Uncategorized_ | 18      |        | 57.5       | 49.8         |
| n.6             | 4       | 5      | 6          | 5.5          |
| n.7             | 6       | 13     | 8.5        | 9.1          |
| n.8             | 5       | 2      | 4.5        | 5.5          |
| n.9             | 5       | 5      | 6          | 6.5          |
| n.10            | -       | -      | -          | -            |
| n.11            | 7       | 8      | 10         | 9.7          |
| n.12            | 7       | 8      | 8.5        | 12.5         |

> story `Uncategorized` is for technical tasks, leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)

|            | Mean | StDev |
| ---------- | ---- | ----- |
| Estimation | 1.9  | 2.8   |
| Actual     | 1.9  | 2.7   |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

  $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1$$

  > 0.009

- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

  $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| $$

  > 0.17

## QUALITY MEASURES

- Unit Testing:
  - Total hours estimated
    > 5.5
  - Total hours spent
    > 6
  - Nr of automated unit test cases
    > 171
- E2E testing:
  - Total hours estimated
    > 5.5
  - Total hours spent
    > 6.2
  - Nr of test cases
    > 66
- Coverage:
  | % Stmts | % Branch | % Funcs | % Lines |
  | ------- | -------- | ------- | ------- |
  | 83.12 | 79.2 | 86.95 | 83.12 |

- Code review
  - Total hours estimated
    > 5.5
  - Total hours spent
    > 6.1

## ASSESSMENT

- **What went wrong in the sprint?**

  Mainly, the internal deadline of the 21st November we set up wasn't respected, which is shown by the plateau between the 21st and 23rd of November on Youtrack. This resulted in a lot of work concentrated in the second week and a big disalignment with the ideal burndown.

- **What caused your errors in estimation (if any)?**  
  We made the biggest mistakes in the Uncategorized tasks and story 12: the former can be attributed to the fact that this sprint we ended up needing less meetings compared the last one. The latter was caused by the fact that none of us knew how to build a telegram bot, so we ended up needing more hours than predicted.

- **What lessons did you learn (both positive and negative) in this sprint?**  
  We learned that communication and sharing opinions on other team members' work is crucial to improving the quality of the project.
  Of course, we didn't respect deadlines and that slowed down the process.

- **Which improvement goals set in the previous retrospective were you able to achieve?**  
  We respected the internal deadlines we set for the most part, but this was not always the case and this is reflected in the burndown chart on Youtrack, which shows that some team members were stuck because they were waiting for the completion of the other stories.

  Futhermore, getting comfortable with the communication channels we set up, we managed to reduce the amount of discrepancies between different branches. However, there were still some.

- **Which ones were you not able to achieve? Why?**  
  As for the previous answer, not all of us respected the internal deadlines, which slowed us down.

- **Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)**  
  Definitely to respect deadlines more strictly and avoid underestimating stories that involve frameworks/technologies that we do not know.
  In addition, communication has steadily improved throughout the sprints, but some misunderstandings still happend (e.g. different DTOs at the beginning), especially at the start of the sprint, when stories can be carried forward without interacting with the others. We could set up 1-on-1 meetings iron out the differences before being too deep in the developement of each story.

- **One thing you are proud of as a team!**  
  Communication between backend-frontend team members is improving, but there is of course room for enhancement.
