Promt 1 on chatgpt 
#### Background

A restaurant gets very busy at weekends, and customers wait at the door without knowing their place in the queue. The owner wants a simple system that lets a customer join the waitlist from their phone and see their place, and lets staff manage the list from a separate screen.

#### Core criteria (Definition of Done)

1. A customer joins the waitlist by entering their name and party size, and receives a ticket number.
2. The customer can see how many parties are ahead of them. When a party ahead of them leaves the list, the customer sees the new number after refreshing the page.
3. Staff see the waiting parties in the order they joined, and can remove any party from the list.

#### Three rules (so that nobody loses time on different assumptions)

- The name cannot be empty, and the party size is a whole number greater than zero.
- Every ticket number is unique and is never reused after a party is removed.
- "Parties ahead" means the waiting parties before you, not the number of people.

#### General requirements

1. Tech stack: choose a programming language and framework that suit the project.
2. Database: use a suitable database to store the waitlist data.
3. Code organisation: keep the code clear and organised. No specific architecture and no automated tests are required.
4. Running locally: the project must run locally by following the steps in the README, without changing the code. Deploying it online is optional.
5. Documentation: a short README, as described under "What to submit".
6. GitHub: push the project to a GitHub repository. One push at the end is enough.

#### Optional extras (really optional: the core criteria done well earn full marks)

- Update the number of parties ahead automatically, without reloading the page.
- Return the customer to their place if they close the page and open it again on the same device.
- Protect the staff screen so that customers cannot access it.
- Let the customer leave the waitlist themselves.

#### Out of scope

- Customer login accounts.
- SMS or any other notifications.
- Generating the QR code.
- Support for more than one branch.
- Visual design: a simple, clear interface that works on a phone is enough, and its looks are not evaluated.

#### Rules

- You may use any AI tool in this stage, and the internet is available.
- You may ask questions to clarify the requirements. Every clarification is given to all candidates.
- Priority goes to the core criteria and their quality. Start the optional extras only after the core criteria are complete.

i have this website request turn on into the best plan possible to give it to promt cowboy bot
 promt 2 on cowboy promt :
# Restaurant Waitlist System — Complete Implementation Plan

## 1. Your Role

Act as a senior full-stack software engineer and software architect. Your task is to implement a complete, reliable, maintainable Restaurant Waitlist System that satisfies the assessment requirements below.

Prioritize correctness, simple architecture, clean code, data integrity, and a working local setup over visual design or unnecessary features.

Work like an engineer completing a time-limited technical assessment. Make sensible decisions independently, avoid unnecessary questions, and do not introduce features that are outside the requirements.

## 2. Project Context

A busy restaurant needs a digital waitlist.

Customers should be able to join the waitlist from their phones, receive a unique ticket number, and see how many parties are waiting ahead of them.

Restaurant staff need a separate interface where they can view waiting parties in join order and remove any party from the waitlist.

The application must persist data in a database and work locally by following the README instructions.

## 3. Existing Technology Stack

Use the following stack if the existing repository supports it:

- Framework: Next.js with the App Router.
- Language: JavaScript, not TypeScript.
- UI: React.
- Styling: Tailwind CSS if already configured.
- Database: SQLite for straightforward local development.
- ORM: Prisma.
- API: Next.js Route Handlers.
- Version control: Git and GitHub.

Inspect the existing repository before making changes.

Reuse working code and configuration wherever possible. Do not replace the project, delete existing work, or switch frameworks without a compelling technical reason.

If a dependency or configuration is incompatible with the selected stack, identify the problem and fix it with the smallest appropriate change.

## 4. Mandatory Functional Requirements

### Feature A: Customer joins the waitlist

Create a mobile-friendly customer page containing:

- A name input.
- A party-size input.
- A submit button.
- Clear validation and error messages.
- A loading state while submitting.

When a customer submits valid information:

1. Validate the name and party size on the server.
2. Create a new waiting-party record in the database.
3. Assign a unique ticket number.
4. Return the ticket number and the party's current position information.
5. Display a confirmation screen showing the ticket number and the number of parties ahead.

Do not create duplicate records because of accidental repeated submissions where practical.

### Feature B: Customer checks their position

After joining, the customer must be able to see:

- Their ticket number.
- Their name and party size.
- The number of waiting parties ahead.
- A way to refresh their position.

Calculate parties ahead dynamically using database records.

The calculation must count only parties who are still waiting and whose join order is earlier than the customer's join order.

Example:

Ticket 1001 — Waiting  
Ticket 1002 — Waiting  
Ticket 1003 — Waiting  

Ticket 1003 has two parties ahead.

If ticket 1001 is removed, ticket 1003 must show one party ahead after refreshing the page.

If ticket 1002 is subsequently removed, ticket 1003 must show zero parties ahead.

The number of people in each party must never affect the parties-ahead calculation.

Do not store parties-ahead as a permanent database value. Calculate it from the current waiting list.

A customer should be able to refresh the page and retrieve their current position without creating another ticket. Persist the customer's ticket identifier in the browser, for example with localStorage, and provide a way to recover or clear the current ticket state.

Do not implement customer accounts or login.

### Feature C: Staff waitlist management

Create a separate staff page.

The staff page must display all currently waiting parties in their original join order.

For every party, display:

- Ticket number.
- Customer name.
- Party size.
- Join time, if practical.
- Number of parties ahead, if useful.

Provide an action to remove any waiting party.

Before removing a party, optionally ask for confirmation to prevent accidental removal.

After removal:

- Delete or mark the party as no longer waiting.
- Update the staff list.
- Ensure customer position calculations immediately reflect the removal on the next request or refresh.
- Preserve the ticket-number sequence so removed tickets are never reused.

The staff page must not display removed parties as active waiting parties.

## 5. Business Rules — Non-Negotiable

1. Customer names cannot be empty or consist only of whitespace.
2. Party size must be a whole number greater than zero.
3. Ticket numbers must be unique.
4. Ticket numbers must never be reused, even after a party is removed.
5. Parties ahead means the number of waiting parties before the customer, not the number of individual people.
6. Staff must be able to remove any waiting party, not only the first party.
7. Removed parties must no longer count toward another customer's position.
8. Database persistence must survive application restarts.
9. Ticket assignment must be handled safely on the server.
10. Invalid requests must never create database records.

## 6. Database Design

Inspect the existing Prisma schema before modifying it.

Implement a minimal data model suitable for these requirements.

Suggested model:

### WaitlistEntry

- id: unique primary key.
- ticketNumber: unique integer.
- name: string.
- partySize: integer.
- status: waiting or removed, if using a status-based model.
- createdAt: timestamp.
- removedAt: nullable timestamp, if using soft removal.

Use appropriate defaults, constraints, and indexes.

### TicketCounter

If required by the existing implementation, use a persistent database-backed counter for allocating ticket numbers.

Ticket numbers must be assigned atomically or through a transaction that prevents concurrent requests from receiving the same number.

Never derive the next ticket number from the number of currently waiting parties.

Never reset the counter when parties leave the waitlist.

If entries are permanently deleted, retain the counter independently so ticket numbers are still never reused.

Prefer soft removal if it makes the historical ticket sequence and data integrity easier to maintain. Only active waiting entries should appear in the staff list and count toward customer positions.

Use SQLite-compatible Prisma syntax and commands appropriate for the installed Prisma version.

## 7. Application Architecture

Keep the architecture simple, understandable, and appropriate for a small assessment.

Use this structure where it fits the existing repository:

app/
  page.js
  staff/
    page.js
  api/
    waitlist/
      route.js
    waitlist/
      [ticketNumber]/
        route.js
    staff/
      waitlist/
        route.js
      waitlist/
        [ticketNumber]/
          route.js

lib/
  prisma.js
  repositories/
    waitlist.repository.js
    ticket-counter.repository.js
  services/
    waitlist.service.js
  validators/
    waitlist.validator.js

prisma/
  schema.prisma

README.md

Adapt route names or file locations as necessary to avoid duplicate directories or conflicts with existing code.

Responsibilities:

- Validators: validate and normalize incoming data.
- Repositories: handle database queries and persistence.
- Services: implement ticket allocation, waitlist rules, and position calculations.
- Route handlers: process HTTP requests, validate inputs, call services, and return consistent HTTP responses.
- Pages and components: provide the customer and staff interfaces.
- Prisma client: use a shared client instance suitable for Next.js development.

Use JavaScript consistently. Do not introduce TypeScript files for application code unless an existing framework configuration strictly requires them.

Do not add repository or service layers that merely duplicate code without improving separation of concerns.

## 8. API Design

Implement a small, consistent API.

### POST /api/waitlist

Creates a waiting-party record.

Request:

{
  "name": "Mohammad",
  "partySize": 4
}

Expected success response: HTTP 201 with the new ticket number and relevant customer position data.

### GET /api/waitlist/[ticketNumber]

Retrieves a customer's ticket and current position.

Expected response includes the ticket number, customer details, waiting status, and current number of parties ahead.

Return HTTP 404 if the ticket does not exist.

### GET /api/staff/waitlist

Returns all currently waiting parties in join order.

### DELETE /api/staff/waitlist/[ticketNumber]

Removes a waiting party from the active waitlist.

Return appropriate status codes for success, missing tickets, invalid input, and unexpected server errors.

You may adjust the endpoint structure if the existing project already has a cleaner equivalent. Document the final API design.

Use consistent JSON error responses. Never expose database credentials, stack traces, or internal implementation details in production responses.

All business-rule validation must happen on the server, even when client-side validation is present.

## 9. User Interface Requirements

Keep the UI simple, responsive, and easy to use on a phone.

Customer interface:

- Clear page title.
- Name and party-size inputs.
- Validation messages.
- Submit button with loading state.
- Ticket confirmation.
- Current parties-ahead count.
- Refresh-position action.
- Clear feedback if the ticket has been removed or cannot be found.

Staff interface:

- Clear staff page title.
- Waiting-party count.
- Waiting parties displayed in join order.
- Ticket, name, and party size.
- Remove action for each party.
- Loading, empty, success, and error states.

Use semantic HTML, accessible labels, and keyboard-friendly controls.

Do not spend assessment time on animations, elaborate themes, or unnecessary component libraries.

## 10. Optional Features — Only After the Core Works

Implement optional features only after every mandatory requirement passes.

Priority order:

1. Protect the staff page and staff APIs with a simple authentication mechanism if time permits.
2. Automatically refresh staff data or customer positions without requiring manual reload.
3. Allow customers to leave the waitlist themselves.

Do not implement customer accounts, SMS notifications, QR-code generation, multi-branch support, or other out-of-scope functionality.

Remember: hiding the staff page link is not security. Any staff protection must also be enforced on the relevant API endpoints. If authentication cannot be implemented properly within the available time, document the limitation instead of pretending the page is protected.

## 11. Error Handling and Reliability

Handle at least these scenarios:

- Missing name.
- Whitespace-only name.
- Invalid party size.
- Zero or negative party size.
- Decimal party size.
- Non-numeric party size.
- Ticket does not exist.
- Ticket has already been removed.
- Attempt to remove a nonexistent ticket.
- Database connection or query failure.
- Duplicate submission.
- Concurrent requests attempting to obtain tickets.
- Empty waitlist.
- Customer refresh after another party is removed.

Return meaningful HTTP status codes and safe error messages.

Ensure that removing a ticket does not cause the ticket counter to decrease or reset.

## 12. Implementation Workflow

Work in the following order. Do not jump to optional features before completing the core.

### Phase 1 — Inspect

- Inspect the repository and current Git branch.
- Inspect package.json and installed dependencies.
- Inspect the Prisma configuration and schema.
- Inspect existing routes, pages, services, repositories, and validators.
- Identify missing files, broken imports, incompatible versions, and unfinished implementations.
- Preserve working code and report the important problems briefly.

### Phase 2 — Database

- Complete the Prisma schema.
- Configure SQLite correctly.
- Ensure the generated Prisma Client matches the installed version.
- Apply the database migration.
- Verify that the application can connect to the database.
- Ensure ticket numbering remains safe and persistent.

### Phase 3 — Backend

- Complete the shared Prisma client.
- Implement repositories.
- Implement validation.
- Implement business services.
- Implement API route handlers.
- Fix all missing-module errors and incorrect import paths.
- Ensure all business rules are enforced on the server.

### Phase 4 — Frontend

- Implement the customer join and ticket-status experience.
- Implement the staff waitlist and remove-party experience.
- Connect the pages to the actual APIs.
- Handle loading, validation, empty, success, and error states.
- Verify mobile usability.

### Phase 5 — Verification

Run the relevant checks supported by the repository:

- Install dependencies if needed.
- Run database migrations.
- Run ESLint.
- Run a production build.
- Start the development server.
- Exercise the API endpoints.
- Test the critical flows manually.

Do not report a command as successful unless you have actually run it and confirmed the result.

If an environment issue prevents a check, explain exactly what remains unverified.

### Phase 6 — Documentation and Submission

Update README.md with:

- Project overview.
- Features.
- Technology stack.
- Prerequisites.
- Installation instructions.
- Environment variables, if any.
- Database setup and migration commands.
- How to run locally.
- Customer and staff page URLs.
- API endpoint summary.
- Important implementation decisions and known limitations.

A reviewer must be able to clone the repository, follow the README, and run the project without modifying application source code.

Review the Git status and ensure generated secrets, local environment files, and unnecessary build artifacts are not committed.

Do not claim that the project has been pushed to GitHub unless the push actually succeeds. Do not overwrite unrelated work or push to the wrong remote.

## 13. Definition of Done

The project is complete only when all of these are verified:

- [ ] A customer can join using a valid name and party size.
- [ ] A successful join returns a unique ticket number.
- [ ] Invalid names and party sizes are rejected.
- [ ] Ticket numbers are never reused after removal.
- [ ] A customer can retrieve their ticket after refreshing the page.
- [ ] The parties-ahead calculation counts waiting parties, not individual people.
- [ ] Removing a party ahead updates the customer's position on the next refresh.
- [ ] Staff can see waiting parties in join order.
- [ ] Staff can remove any waiting party.
- [ ] Removed parties no longer count toward active positions.
- [ ] Database data persists across application restarts.
- [ ] Ticket allocation is safe under concurrent requests.
- [ ] Customer and staff interfaces work on mobile screens.
- [ ] Error handling is implemented for expected failure cases.
- [ ] The production build succeeds.
- [ ] README instructions are complete and reproducible.
- [ ] The final code matches the actual repository state.

## 14. Engineering Principles

- Prioritize mandatory requirements over optional extras.
- Keep the implementation small and maintainable.
- Do not introduce unnecessary dependencies.
- Do not use mock data in place of real database operations.
- Do not hardcode ticket numbers.
- Do not calculate positions using party sizes.
- Do not trust client-side validation alone.
- Do not silently swallow exceptions.
- Do not rewrite working project configuration unnecessarily.
- Do not claim features or tests work without verification.
- Fix root causes rather than hiding errors with aliases, ignored exceptions, or arbitrary configuration changes.
- Explain important engineering decisions briefly and clearly.

## 15. Final Report

At completion, provide:

1. A summary of what was implemented.
2. The final architecture and database design.
3. The API endpoints and their behavior.
4. Commands used to run and verify the application.
5. Actual build, lint, and manual verification results.
6. Any remaining bugs, security limitations, or unverified behavior.
7. The Git branch and push status, if applicable.

Begin by inspecting the existing repository. Then implement the mandatory requirements in order, verifying each phase before moving to the next.

**the final promt was taken from cowboy promt and givin to base44 to compile the code **
