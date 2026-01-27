# Let'sChat

A real-time messaging and calling web application similar to WhatsApp, built with React/Next.js frontend and Node.js backend.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Functional Requirements](#functional-requirements)
- [Non-Functional Requirements](#non-functional-requirements)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Real-Time Communication](#real-time-communication)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Development Phases](#development-phases)
- [Security Considerations](#security-considerations)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Project Overview

Let'sChat is a full-stack web application that enables users to:
- Send and receive real-time messages (text, images, files)
- Make audio and video calls
- Manage contacts and chat groups
- View online/offline status and typing indicators
- Track message delivery and read receipts

**Target Users:** Individuals and small teams looking for a WhatsApp-like communication platform.

---

## ✅ Functional Requirements

### FR1: User Authentication & Authorization
- **FR1.1:** Users can register with email, username, and password
- **FR1.2:** Users can login with credentials
- **FR1.3:** Users can logout from their account
- **FR1.4:** Users can reset forgotten passwords via email
- **FR1.5:** JWT-based session management with refresh tokens
- **FR1.6:** Protected routes require valid authentication
- **FR1.7:** Users can update their profile (avatar, status, bio)

### FR2: Contact Management
- **FR2.1:** Users can search for other users by username/email
- **FR2.2:** Users can send contact requests
- **FR2.3:** Users can accept/reject contact requests
- **FR2.4:** Users can view their contact list
- **FR2.5:** Users can block/unblock contacts
- **FR2.6:** Users can remove contacts from their list

### FR3: Chat Functionality
- **FR3.1:** Users can create 1-on-1 chats with contacts
- **FR3.2:** Users can create group chats with multiple participants
- **FR3.3:** Users can send text messages in real-time
- **FR3.4:** Users can send images, files, and documents
- **FR3.5:** Users can send emoji reactions
- **FR3.6:** Users can reply to specific messages
- **FR3.7:** Users can forward messages to other chats
- **FR3.8:** Users can delete messages (for themselves or everyone)
- **FR3.9:** Users can edit sent messages
- **FR3.10:** Messages display delivery status (sent, delivered, read)
- **FR3.11:** Users can see typing indicators
- **FR3.12:** Users can search messages within a chat
- **FR3.13:** Users can view chat history with pagination
- **FR3.14:** Group admins can add/remove members
- **FR3.15:** Group admins can change group name and avatar

### FR4: Real-Time Communication
- **FR4.1:** Messages are delivered instantly via WebSocket
- **FR4.2:** Users see real-time online/offline status
- **FR4.3:** Users see "last seen" timestamp
- **FR4.4:** Typing indicators appear in real-time
- **FR4.5:** Message read receipts update in real-time
- **FR4.6:** New message notifications appear instantly

### FR5: Audio/Video Calling
- **FR5.1:** Users can initiate audio calls with contacts
- **FR5.2:** Users can initiate video calls with contacts
- **FR5.3:** Users can accept incoming calls
- **FR5.4:** Users can reject incoming calls
- **FR5.5:** Users can end ongoing calls
- **FR5.6:** Users can mute/unmute audio during calls
- **FR5.7:** Users can enable/disable video during calls
- **FR5.8:** Users can share screen during video calls
- **FR5.9:** Call quality adapts to network conditions
- **FR5.10:** Users can view call history
- **FR5.11:** Users can see missed call notifications

### FR6: Notifications
- **FR6.1:** Users receive browser notifications for new messages
- **FR6.2:** Users receive notifications for incoming calls
- **FR6.3:** Users can enable/disable notifications
- **FR6.4:** Notification badges show unread message count
- **FR6.5:** Users receive email notifications for important events (optional)

### FR7: Media Management
- **FR7.1:** Users can upload images (max 10MB)
- **FR7.2:** Users can upload files (max 50MB)
- **FR7.3:** Images are displayed with preview
- **FR7.4:** Files are downloadable
- **FR7.5:** Media files are stored securely
- **FR7.6:** Users can view media gallery in chat

### FR8: User Interface
- **FR8.1:** Responsive design for desktop, tablet, and mobile
- **FR8.2:** Dark mode and light mode themes
- **FR8.3:** Intuitive chat interface with message bubbles
- **FR8.4:** Contact list with search functionality
- **FR8.5:** Chat list sorted by most recent activity
- **FR8.6:** Smooth animations and transitions
- **FR8.7:** Loading states for async operations
- **FR8.8:** Error messages for failed operations

---

## 🔧 Non-Functional Requirements

### NFR1: Performance
- **NFR1.1:** Page load time < 2 seconds on 3G connection
- **NFR1.2:** Message delivery latency < 500ms
- **NFR1.3:** Call connection establishment < 3 seconds
- **NFR1.4:** Support 1000+ concurrent users per server instance
- **NFR1.5:** Database queries optimized with proper indexing
- **NFR1.6:** Image/file uploads complete within 10 seconds (for 10MB file)
- **NFR1.7:** Chat history loads in chunks (pagination) for performance
- **NFR1.8:** Frontend bundle size < 500KB (gzipped)

### NFR2: Scalability
- **NFR2.1:** Horizontal scaling support for backend servers
- **NFR2.2:** Redis pub/sub for multi-server Socket.io communication
- **NFR2.3:** Database connection pooling
- **NFR2.4:** CDN for static assets
- **NFR2.5:** Load balancer support
- **NFR2.6:** Microservices-ready architecture (optional future enhancement)

### NFR3: Reliability & Availability
- **NFR3.1:** System uptime > 99.5%
- **NFR3.2:** Graceful error handling for all operations
- **NFR3.3:** Automatic reconnection for WebSocket connections
- **NFR3.4:** Database backup strategy (daily backups)
- **NFR3.5:** Message persistence even if user is offline
- **NFR3.6:** Retry mechanism for failed API calls
- **NFR3.7:** Health check endpoints for monitoring

### NFR4: Security
- **NFR4.1:** All communications encrypted (HTTPS/WSS)
- **NFR4.2:** Passwords hashed using bcrypt (salt rounds: 10)
- **NFR4.3:** JWT tokens with expiration (access: 15min, refresh: 7days)
- **NFR4.4:** Rate limiting on API endpoints (100 requests/minute per IP)
- **NFR4.5:** Input validation and sanitization
- **NFR4.6:** CORS configuration for allowed origins
- **NFR4.7:** SQL injection prevention (using Prisma ORM)
- **NFR4.8:** XSS protection
- **NFR4.9:** File upload validation (type, size limits)
- **NFR4.10:** Secure session management
- **NFR4.11:** Optional: End-to-end encryption for messages (future)

### NFR5: Usability
- **NFR5.1:** Intuitive user interface (similar to WhatsApp)
- **NFR5.2:** Mobile-responsive design
- **NFR5.3:** Keyboard shortcuts for common actions
- **NFR5.4:** Accessible UI (WCAG 2.1 Level AA compliance)
- **NFR5.5:** Multi-language support (i18n) - future enhancement
- **NFR5.6:** Clear error messages and user feedback

### NFR6: Maintainability
- **NFR6.1:** Modular code structure
- **NFR6.2:** TypeScript for type safety
- **NFR6.3:** Code documentation (JSDoc comments)
- **NFR6.4:** Consistent code style (ESLint, Prettier)
- **NFR6.5:** Unit tests coverage > 70%
- **NFR6.6:** Integration tests for critical flows
- **NFR6.7:** API documentation (Swagger/OpenAPI)

### NFR7: Compatibility
- **NFR7.1:** Support modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- **NFR7.2:** WebRTC support for calling feature
- **NFR7.3:** Progressive Web App (PWA) capabilities
- **NFR7.4:** Mobile browser optimization

### NFR8: Data Management
- **NFR8.1:** Data retention policy (messages stored indefinitely)
- **NFR8.2:** User data export capability (GDPR compliance)
- **NFR8.3:** User account deletion with data cleanup
- **NFR8.4:** Database migration strategy
- **NFR8.5:** Efficient storage for media files

### NFR9: Monitoring & Logging
- **NFR9.1:** Application logging (Winston/Pino)
- **NFR9.2:** Error tracking (Sentry - optional)
- **NFR9.3:** Performance monitoring
- **NFR9.4:** Real-time metrics dashboard
- **NFR9.5:** User activity analytics

### NFR10: Cost Optimization
- **NFR10.1:** Efficient database queries to reduce costs
- **NFR10.2:** Image compression before storage
- **NFR10.3:** CDN caching for static assets
- **NFR10.4:** Optimized bundle sizes

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand / React Context
- **Data Fetching:** React Query (TanStack Query)
- **Real-Time:** Socket.io-client
- **WebRTC:** Simple-peer / PeerJS
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion
- **Icons:** Lucide React / React Icons

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Real-Time:** Socket.io
- **WebRTC Signaling:** Socket.io
- **Database:** PostgreSQL 15+
- **ORM:** Prisma
- **Cache/Session:** Redis
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer
- **Validation:** Zod
- **Password Hashing:** bcryptjs

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Version Control:** Git
- **CI/CD:** GitHub Actions (optional)
- **Hosting:** 
  - Frontend: Vercel / Netlify
  - Backend: AWS EC2 / DigitalOcean / Railway
  - Database: AWS RDS / Supabase
  - Redis: AWS ElastiCache / Upstash
- **CDN:** Cloudflare
- **STUN/TURN:** Google STUN (free) / Twilio TURN (paid)

---

## 🏗 Architecture

### System Architecture
```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │◄───────►│   Next.js   │◄───────►│   Express   │
│  (Browser)  │  HTTPS  │  Frontend   │  REST   │   Backend   │
└─────────────┘         └─────────────┘         └─────────────┘
                              │                        │
                              │ WebSocket              │
                              │ (Socket.io)            │
                              │                        │
                              ▼                        ▼
                        ┌─────────────┐         ┌─────────────┐
                        │  Socket.io  │         │ PostgreSQL   │
                        │   Server    │         │  Database    │
                        └─────────────┘         └─────────────┘
                                                       │
                                                       ▼
                                                ┌─────────────┐
                                                │    Redis    │
                                                │   Cache     │
                                                └─────────────┘
```

### Real-Time Communication Flow

**Messaging:**
1. User sends message → Frontend emits Socket.io event
2. Backend receives → Saves to PostgreSQL
3. Backend emits to recipient(s) via Socket.io
4. Recipient's frontend receives → Updates UI

**Calling:**
1. User initiates call → Frontend creates WebRTC offer
2. Frontend emits Socket.io: "call_initiate"
3. Backend routes to recipient: "incoming_call"
4. Recipient accepts → Creates WebRTC answer
5. Exchange ICE candidates via Socket.io
6. WebRTC peer-to-peer connection established

---

## ✨ Features

### Core Features
- ✅ Real-time messaging (text, images, files)
- ✅ Audio and video calling
- ✅ Online/offline status
- ✅ Typing indicators
- ✅ Message delivery and read receipts
- ✅ Contact management
- ✅ Group chats
- ✅ Message search
- ✅ Dark/Light theme
- ✅ Responsive design

### Advanced Features (Future)
- 🔄 End-to-end encryption
- 🔄 Message reactions
- 🔄 Voice messages
- 🔄 Status updates (stories)
- 🔄 Message scheduling
- 🔄 Chat backup/export
- 🔄 Multi-language support

---

## 🗄 Database Schema

### Core Tables

**Users**
```sql
- id (UUID, Primary Key)
- username (String, Unique)
- email (String, Unique)
- password_hash (String)
- avatar_url (String, Nullable)
- status (String: online/offline/away)
- last_seen (Timestamp)
- bio (String, Nullable)
- created_at (Timestamp)
- updated_at (Timestamp)
```

**Chats**
```sql
- id (UUID, Primary Key)
- type (Enum: one_on_one, group)
- name (String, Nullable) -- for group chats
- avatar_url (String, Nullable)
- created_by (UUID, Foreign Key → Users)
- created_at (Timestamp)
- updated_at (Timestamp)
```

**ChatMembers**
```sql
- id (UUID, Primary Key)
- chat_id (UUID, Foreign Key → Chats)
- user_id (UUID, Foreign Key → Users)
- role (Enum: member, admin)
- joined_at (Timestamp)
- last_read_at (Timestamp)
```

**Messages**
```sql
- id (UUID, Primary Key)
- chat_id (UUID, Foreign Key → Chats)
- sender_id (UUID, Foreign Key → Users)
- content (Text)
- type (Enum: text, image, file, audio, video)
- file_url (String, Nullable)
- reply_to_id (UUID, Foreign Key → Messages, Nullable)
- created_at (Timestamp)
- updated_at (Timestamp)
- deleted_at (Timestamp, Nullable)
```

**MessageReads**
```sql
- id (UUID, Primary Key)
- message_id (UUID, Foreign Key → Messages)
- user_id (UUID, Foreign Key → Users)
- read_at (Timestamp)
```

**Contacts**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → Users)
- contact_id (UUID, Foreign Key → Users)
- status (Enum: pending, accepted, blocked)
- created_at (Timestamp)
```

**CallLogs**
```sql
- id (UUID, Primary Key)
- caller_id (UUID, Foreign Key → Users)
- receiver_id (UUID, Foreign Key → Users)
- chat_id (UUID, Foreign Key → Chats)
- type (Enum: audio, video)
- status (Enum: initiated, accepted, rejected, ended, missed)
- started_at (Timestamp)
- ended_at (Timestamp, Nullable)
- duration (Integer, Nullable) -- in seconds
```

### Indexes
```sql
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_chats_updated ON chats(updated_at DESC);
CREATE INDEX idx_chat_members_user ON chat_members(user_id);
CREATE INDEX idx_chat_members_chat ON chat_members(chat_id);
```

---

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Chat Endpoints
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get chat details
- `PUT /api/chats/:id` - Update chat (group name, etc.)
- `DELETE /api/chats/:id` - Delete chat
- `POST /api/chats/:id/members` - Add member to group
- `DELETE /api/chats/:id/members/:userId` - Remove member from group

### Message Endpoints
- `GET /api/chats/:chatId/messages` - Get messages (paginated)
- `POST /api/chats/:chatId/messages` - Send message
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message
- `POST /api/messages/:id/read` - Mark message as read
- `GET /api/messages/search?q=query` - Search messages

### Contact Endpoints
- `GET /api/contacts` - Get user's contacts
- `POST /api/contacts` - Send contact request
- `PUT /api/contacts/:id` - Accept/reject contact request
- `DELETE /api/contacts/:id` - Remove/block contact
- `GET /api/users/search?q=query` - Search users

### Call Endpoints
- `GET /api/calls` - Get call history
- `POST /api/calls` - Create call log entry
- `PUT /api/calls/:id` - Update call status

### File Upload
- `POST /api/upload` - Upload image/file

---

## 🔌 Real-Time Communication

### Socket.io Events

**Client → Server:**
```typescript
- "send_message"        // { chatId, content, type, fileUrl? }
- "typing_start"         // { chatId }
- "typing_stop"          // { chatId }
- "mark_read"            // { messageId }
- "join_chat"            // { chatId }
- "leave_chat"           // { chatId }
- "call_initiate"        // { receiverId, type, chatId }
- "call_accept"          // { callId }
- "call_reject"          // { callId }
- "call_end"             // { callId }
- "call_offer"           // WebRTC offer
- "call_answer"          // WebRTC answer
- "ice_candidate"        // ICE candidate
```

**Server → Client:**
```typescript
- "new_message"          // New message received
- "message_delivered"    // Message delivery confirmation
- "message_read"         // Message read confirmation
- "user_typing"          // { chatId, userId, username }
- "user_online"          // { userId }
- "user_offline"         // { userId }
- "incoming_call"        // { callId, callerId, type }
- "call_accepted"        // { callId }
- "call_rejected"        // { callId }
- "call_ended"           // { callId }
- "call_offer"           // WebRTC offer
- "call_answer"          // WebRTC answer
- "ice_candidate"        // ICE candidate
```

---

## 📁 Project Structure

```
letschat/
├── frontend/                 # Next.js application
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (chat)/
│   │   │   ├── chat/
│   │   │   │   └── [chatId]/
│   │   │   ├── calls/
│   │   │   └── contacts/
│   │   ├── api/              # Next.js API routes (optional)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── chat/
│   │   ├── call/
│   │   ├── common/
│   │   └── layout/
│   ├── hooks/
│   │   ├── useSocket.ts
│   │   ├── useWebRTC.ts
│   │   └── useChat.ts
│   ├── lib/
│   │   ├── socket.ts
│   │   ├── webrtc.ts
│   │   └── api.ts
│   ├── store/
│   │   ├── chatStore.ts
│   │   └── authStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── public/
│   └── package.json
│
├── backend/                  # Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   └── socket.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── chatController.ts
│   │   │   ├── messageController.ts
│   │   │   └── callController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── models/
│   │   │   └── (Prisma schema)
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── chat.routes.ts
│   │   │   ├── message.routes.ts
│   │   │   └── call.routes.ts
│   │   ├── services/
│   │   │   ├── socketService.ts
│   │   │   ├── webrtcService.ts
│   │   │   └── notificationService.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   └── validation.ts
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── package.json
│
├── shared/                   # Shared types
│   └── types/
│       └── index.ts
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 15+
- Redis 7+
- Git

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/Beast-dev1/letschat.git
cd letschat
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database and Redis credentials
npx prisma generate
npx prisma migrate dev
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with API URL
npm run dev
```

4. **Run with Docker (Alternative)**
```bash
docker-compose up -d
```

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/letschat
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_STUN_SERVER=stun:stun.l.google.com:19302
```

---

## 📅 Development Phases

### Phase 1: Foundation (Week 1-2)
- [x] Project setup and repository initialization
- [ ] Next.js + Node.js project structure
- [ ] Database schema design and Prisma setup
- [ ] Authentication system (JWT)
- [ ] Basic UI components and layout

### Phase 2: Messaging Core (Week 3-4)
- [ ] Socket.io integration
- [ ] Message sending/receiving
- [ ] Chat list and chat window UI
- [ ] Message display with timestamps
- [ ] Contact management

### Phase 3: Real-Time Features (Week 5)
- [ ] Typing indicators
- [ ] Online/offline status
- [ ] Read receipts
- [ ] Message delivery status
- [ ] Browser notifications

### Phase 4: Calling Feature (Week 6-7)
- [ ] WebRTC setup
- [ ] Audio calling
- [ ] Video calling
- [ ] Call UI components
- [ ] Call history

### Phase 5: Advanced Features (Week 8)
- [ ] File uploads (images, documents)
- [ ] Message search
- [ ] Group chat management
- [ ] Message reactions
- [ ] Dark mode

### Phase 6: Polish & Testing (Week 9-10)
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Unit and integration tests
- [ ] Security audit
- [ ] Documentation completion

---

## 🔒 Security Considerations

- ✅ HTTPS/WSS for all communications
- ✅ Password hashing with bcrypt
- ✅ JWT token expiration and refresh mechanism
- ✅ Rate limiting on API endpoints
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection
- ✅ File upload validation
- ✅ Secure session management
- 🔄 End-to-end encryption (future enhancement)

---

## 🚢 Deployment

### Production Deployment Steps

1. **Backend Deployment**
   - Deploy to AWS EC2 / DigitalOcean / Railway
   - Setup PostgreSQL (AWS RDS / Supabase)
   - Setup Redis (AWS ElastiCache / Upstash)
   - Configure environment variables
   - Setup PM2 or similar process manager

2. **Frontend Deployment**
   - Deploy to Vercel / Netlify
   - Configure environment variables
   - Setup custom domain

3. **Infrastructure**
   - Setup CDN (Cloudflare)
   - Configure SSL certificates
   - Setup monitoring and logging
   - Configure backups

### Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add comments for complex logic

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Beast-dev1** - *Initial work*

---

## 🙏 Acknowledgments

- Inspired by WhatsApp
- Built with modern web technologies
- Community contributions welcome

---

## 📞 Support

For support, email support@letschat.com or open an issue in the repository.

---

**Status:** 🚧 In Development

**Last Updated:** 2024







