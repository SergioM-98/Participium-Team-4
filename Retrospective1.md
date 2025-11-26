TEMPLATE FOR RETROSPECTIVE (Team ##)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done 
  > 6 stories commited, 5 stories completed
- Total points committed vs. done 
  > 33 points committed, 28 done
- Nr of hours planned vs. spent (as a team)
  > 97 hours planned, 96,6 hours spent

**Remember**a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _Uncategorized_   |    10     |       |      44.5      |      39.5      |
| n.1      |     4    |    3    |    9        |       8.5       | 
| n.2      |     4    |    3    |    6.5        |       8.2       | 
| n.3      |     4    |    1    |    5.5        |       5.5       | 
| n.4      |     4    |    8    |    8.5        |       13.5       | 
| n.5      |     4    |    13    |    14       |       13.3       |  

> story `Uncategorized` is for technical tasks, leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)

|            | Mean | StDev |
|------------|------|-------|
| Estimation |   2.36   |   2.35    | 
| Actual     |  2.6    |   2.97    |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1$$

    > -0.09
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| $$

    > 0.12
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated
    > 6.25
  - Total hours spent
    > 4.1
  - Nr of automated unit test cases 
    > 85
  - Coverage
- E2E testing:
  - Total hours estimated
    > 6.25
  - Total hours spent
    > 3.5
  - Nr of test cases
    > 35
- Code review 
  - Total hours estimated 
    > 6
  - Total hours spent
    > 6.6
  


## ASSESSMENT

- **What went wrong in the sprint?**  
  In particular, there was an unexpected issue caused by merging the registration feature. Additionally, poor communication within team groups led to duplicated work: for example, in the backend we ended up with 3 different database implementations, which drained a lot of hours during the merge phase.

- **What caused your errors in estimation (if any)?**  
  Probably because we didn't properly account for the time required for the final fixing phase, even though it was better than in the previous sprint. In particular, the last story was not completed because of the hours spent working on bug fixing.

- **What lessons did you learn (both positive and negative) in this sprint?**  
  We learned that communication and sharing opinions on other team members' work is crucial to improving the quality of the project.
  Of course, we didn't respect deadlines and that slowed down the process.

- **Which improvement goals set in the previous retrospective were you able to achieve?**  
  We managed to divide the team into more areas: this was crucial to develop everything faster and minimize dependencies between tasks.

  We set up a communication channel (divided into various chats such as notification channel, frontend channel, ...) that was crucial for team members to meet and share opinions on their work. In this way, the quality of the project improved.

- **Which ones were you not able to achieve? Why?**  
  Deadlines were not really strict or written on a calendar, and we didn't respect them as we should have. This caused a delay in the last part of the project dedicated to merging and bug fixing.

- **Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)**  
  Definitely to respect deadlines more strictly and avoid underestimating the merge and final fixing phase.
  In addition, communication was good but of course need to be improved in the common parts of the project (for example the db)

- **One thing you are proud of as a team!**  
  There is always a good communication between team members, not only in team meetings but also between each of us. Of course this improved our work