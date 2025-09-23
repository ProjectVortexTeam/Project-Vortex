# Overview

This is a full-stack web application called "Vortex Proxies" that provides a proxy management platform. The application allows users to access proxy links, submit feedback, and view announcements. It features an admin interface for managing proxy links, announcements, and viewing user feedback. The system is built with a React frontend using TypeScript and a Node.js/Express backend, with PostgreSQL database integration through Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and build processes
- **Authentication**: Context-based auth provider with protected routes

## Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js REST API
- **Authentication**: Passport.js with local strategy using session-based auth
- **Session Management**: Express sessions with PostgreSQL session store
- **Password Security**: Node.js crypto module with scrypt for password hashing
- **Development**: TSX for TypeScript execution in development

## Data Storage
- **Database**: PostgreSQL as the primary database
- **ORM**: Drizzle ORM for database operations and schema management
- **Connection**: Neon Database serverless PostgreSQL driver
- **Migrations**: Drizzle Kit for database schema migrations
- **Fallback Storage**: In-memory storage implementation for development/testing

## Database Schema
- **Users**: ID, username, password (for admin authentication)
- **Proxy Links**: ID, name, URL, description, active status, timestamps
- **Announcements**: ID, text, type (important/general), timestamps
- **Feedback**: ID, name, email, type, message, timestamps

## Authentication & Authorization
- **Admin Access**: Single admin user "Titanmaster" with full CRUD permissions
- **Public Access**: Anonymous users can view active proxy links, submit feedback, and view announcements
- **Session-based**: Uses Express sessions for maintaining authentication state
- **Protected Routes**: Admin-only routes for management functions

## API Structure
- **RESTful Design**: Standard HTTP methods (GET, POST, PUT, DELETE)
- **Route Organization**: Centralized route registration in routes.ts
- **Middleware**: Admin authorization middleware for protected endpoints
- **Error Handling**: Centralized error handling with proper HTTP status codes

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **PostgreSQL**: Primary database engine

## UI Libraries
- **Radix UI**: Headless UI component primitives
- **Shadcn/ui**: Pre-built component library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type system and compiler
- **Drizzle Kit**: Database migration tool
- **ESBuild**: JavaScript bundler for production builds

## Runtime Dependencies
- **TanStack Query**: Server state management
- **Wouter**: Lightweight router
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **Date-fns**: Date manipulation utilities

## Authentication
- **Passport.js**: Authentication middleware
- **Express Session**: Session management
- **Connect PG Simple**: PostgreSQL session store