# High-Level Architecture

This project aims to provide an on-site, visually-editable CMS system for MDX content, leveraging a modern tech stack for both development flexibility and production scalability.

---

## Frontend Stack

- **Astro**: Serves as the main framework for building a static/SSR-capable site that integrates seamlessly with other frontend libraries.  
- **React**: Used within Astro components for building interactive UI and complex client-side functionality.  
- **Tailwind CSS**: Manages styling across components in a utility-first manner.  
- **ShadCN UI**: Provides a collection of pre-built UI components and patterns to ensure consistent design.  
- **Zod**: Handles form/data validation and ensures type-safe schemas throughout the application.  

### Frontend Flow
1. Astro statically generates pages and handles server-side or client-side rendering where appropriate.  
2. React components within Astro handle dynamic content and interactive editing features for the CMS.  
3. Tailwind CSS + ShadCN UI ensures the UI is both aesthetically consistent and easy to maintain.  
4. Zod validations can run both client-side (for immediate feedback) and server-side (for secure, final checks).

---

## Runtime and Backend

- **Bun**: The JavaScript runtime environment for both local development and potentially some server-side operations.  
- **Elysia (Optional)**: A lightweight Node-like framework that can provide backend routes or microservice capabilities if Astro’s built-in server functionality does not cover all use cases. Astro often can handle most SSR/SSG tasks, but Elysia can be added for more specialized APIs or heavier server logic when needed.

### Content Storage Approach
- **Production:**  
  - Uses Git to store MDX content. The user-facing CMS writes changes to a Git repository, allowing version tracking and collaborative workflows.
- **Local Development:**  
  - Utilizes a local file system folder for MDX content, making it easy to test changes without pushing to remote Git.

---

## Authentication and Authorization

- **better-auth**:  
  - Manages the application’s authentication and authorization flows.  
  - Integrates neatly with the Astro environment or with Elysia if we expand the backend.  
  - Supports features like session management, OAuth, JWT, or other strategies as needed.

---

## Deployment

- **Vercel**:  
  - Handles deployment of the Astro project seamlessly.  
  - Integrates well with Git-based workflows so updates can auto-deploy upon pushes to the main branch.  
  - Provides serverless functions, which can be utilized for Elysia if necessary.

---

## Security Considerations

- Ensure that all user data and editing workflows are protected by requiring authentication through better-auth before granting write access.
- Use Zod schemas to sanitize and validate data from forms and other inputs.
- Restrict direct file system writes to authorized roles, preventing unauthorized changes in production or local development environments.
- When using Git as the content store, ensure minimal privileges (e.g., commit scopes) and store tokens securely.

---

## Scalability Patterns

- **Static/SSG & Caching**: Astro produces static pages where feasible, reducing server load and improving response times.
- **Serverless Functions**: On Vercel, serverless functions can be scaled automatically to handle spiky traffic.
- **Microservices**:
  - Elysia can be broken out as a standalone microservice if certain functionalities become large or require independent scaling.
- **Runtime**:
  - Bun offers performance improvements over some other JavaScript runtimes, helping with quick server startup and concurrent connections.

---

## Summary

This architecture combines a powerful static/SSR framework (Astro), React components for dynamic functionalities, and a flexible approach to content storage (Git in production, local file system in development). Tailwind CSS, ShadCN, and Zod streamline the frontend development and validation processes, while better-auth manages authentication and authorization flows. By deploying to Vercel with optional server-backed capabilities in Elysia under the Bun runtime, the system can efficiently handle modern, Git-based CMS workflows for MDX content.
