# Database schema & ER diagram (MongoDB / Mongoose)

```mermaid
erDiagram
    USER ||--o{ ENROLLMENT : "enrolls"
    COURSE ||--o{ ENROLLMENT : "has"
    USER ||--o{ LEARNING_PROGRESS : "tracks"
    COURSE ||--o{ LEARNING_PROGRESS : "measured by"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ MESSAGE : "sends"
    USER ||--o{ MESSAGE : "receives"
    USER ||--o{ COURSE : "creates (admin)"

    USER {
        ObjectId _id PK
        string name "required, ≤100"
        string email UK "required, lowercase"
        string password "bcrypt hash, select:false"
        string phone "optional, 7-15 digits"
        string department
        string role "student | admin"
        date createdAt
    }
    COURSE {
        ObjectId _id PK
        string title "required, ≤160"
        string department "required"
        string description
        string instructor
        string duration
        number totalLessons "1-500, default 10"
        string status "active | archived"
        ObjectId createdBy FK
    }
    ENROLLMENT {
        ObjectId _id PK
        ObjectId student FK "required"
        ObjectId course FK "required"
        date enrolledAt
        string status "active | completed"
    }
    LEARNING_PROGRESS {
        ObjectId _id PK
        ObjectId student FK
        ObjectId course FK
        number completedLessons
        number totalLessons
        number progressPercentage "auto-calculated"
        date lastAccessedAt
    }
    NOTIFICATION {
        ObjectId _id PK
        ObjectId recipient FK
        string title
        string message "≤500"
        string type "info | success | announcement"
        boolean isRead
    }
    MESSAGE {
        ObjectId _id PK
        ObjectId sender FK
        ObjectId recipient FK
        string text "≤2000"
    }
```

## Constraints and indexes
| Collection | Constraint |
|---|---|
| users | `email` unique; `role` enum; `password` never returned by default |
| enrollments | **unique compound index** `(student, course)` – no duplicate enrollment |
| learningprogresses | **unique compound index** `(student, course)`; `progressPercentage` computed in a pre-save hook; completed ≤ total |
| notifications | index `(recipient, createdAt desc)` |
| messages | index `(sender, recipient, createdAt desc)`; text ≤ 2000 chars |
| courses | index on `title`; `totalLessons` 1–500 |

Deleting a course or student also deletes the related enrollments and progress records (done in the controllers).
