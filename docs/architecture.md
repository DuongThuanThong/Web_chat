# Secure Chat App Architecture

This document outlines the target architecture for the **Secure Chat App** project. The goal is to deliver a real-time chat application with end-to-end encryption (E2EE) based on the Signal Protocol.

## Monorepo layout

The project is structured as a monorepo with two main packages:

- **backend/** – Node.js/Express server and real-time gateway.
- **frontend/** – React client application.

A shared directory can be added later for code shared between frontend and backend.

## Backend stack

- **Language:** TypeScript
- **Framework:** Express.js
- **Database layer:** Prisma ORM targeting PostgreSQL or MySQL
- **Real-time transport:** Socket.IO
- **Caching and pub/sub:** Redis
- **Security:** Implements Signal Protocol to provide E2EE. The server only relays encrypted payloads and manages device keys.

## Frontend stack

- **Language:** TypeScript
- **Framework:** React with Vite for bundling
- **Styling:** Tailwind CSS
- **State management:** Zustand or Redux Toolkit
- **E2EE:** `libsignal-typescript` for Signal Protocol operations
- **Real-time:** `socket.io-client` for communication with the backend

## Goals

- Strong security with E2EE
- High performance and scalability
- Maintainable, easily extendable codebase
- Clear separation of concerns between backend and frontend packages
