# CITATIONS.md
## Third-Party Services, APIs, AI Models & Dependencies

### AI Models & APIs

#### Perplexity AI
- **Service**: AI-powered content generation and sentiment analysis
- **Documentation**: https://docs.perplexity.ai/
- **API Endpoint**: https://api.perplexity.ai
- **Models Used**: 
  - `sonar-pro` (primary model for content generation)
  - `sonar` (fallback option)
- **Rate Limits**: 
  - Free tier: 5 requests/hour
  - Pro tier: 300 requests/hour
  - Enterprise: Custom limits
- **Costs**: 
  - Free: $0/month (limited requests)
  - Pro: $20/month
  - Enterprise: Contact sales
- **Access Requirements**: 
  - API key required (PERPLEXITY_API_KEY)
  - Account registration at https://www.perplexity.ai/
- **Usage**: Content adaptation, sentiment analysis, hashtag generation

#### OpenAI Compatible Interface
- **Service**: Used via Perplexity's OpenAI-compatible API
- **Documentation**: https://docs.perplexity.ai/guides/chat-completions-guide
- **Client Library**: `openai` npm package
- **Version**: ^4.28.0
- **Usage**: API client for Perplexity integration

---

### Database Services

#### MongoDB Atlas
- **Service**: Cloud-hosted MongoDB database
- **Documentation**: https://docs.atlas.mongodb.com/
- **Website**: https://www.mongodb.com/atlas
- **Connection**: Via connection string (MONGODB_URI)
- **Rate Limits**:
  - Free tier (M0): 512 MB storage, shared CPU
  - Paid tiers: Varies by cluster size
- **Costs**:
  - Free tier: $0/month (M0 cluster)
  - M2: $9/month
  - M5: $25/month
  - Higher tiers: $57+/month
- **Access Requirements**:
  - Account creation
  - Database user credentials
  - Network access configuration
- **Usage**: User data, content storage, analytics, session management

---

### Development Dependencies

#### Backend Dependencies

**Core Framework**
- **Express.js**
  - Documentation: https://expressjs.com/
  - Version: ^4.19.2
  - License: MIT
  - Usage: Web application framework

**Database & ODM**
- **Mongoose**
  - Documentation: https://mongoosejs.com/
  - Version: ^8.0.0
  - License: MIT
  - Usage: MongoDB object modeling

**Authentication & Security**
- **bcryptjs**
  - Documentation: https://github.com/dcodeIO/bcrypt.js
  - Version: ^2.4.3
  - License: MIT
  - Usage: Password hashing

- **jsonwebtoken**
  - Documentation: https://github.com/auth0/node-jsonwebtoken
  - Version: ^9.0.0
  - License: MIT
  - Usage: JWT token generation/verification

**Middleware & Utilities**
- **cors**
  - Documentation: https://github.com/expressjs/cors
  - Version: ^2.8.5
  - License: MIT
  - Usage: Cross-origin resource sharing

- **dotenv**
  - Documentation: https://github.com/motdotla/dotenv
  - Version: ^16.4.5
  - License: BSD-2-Clause
  - Usage: Environment variable management

#### Frontend Dependencies

**UI Framework**
- **React**
  - Documentation: https://react.dev/
  - Version: ^18.x
  - License: MIT
  - Usage: Frontend framework

**UI Components**
- **shadcn/ui**
  - Documentation: https://ui.shadcn.com/
  - License: MIT
  - Components: Button, Input, Toast, Progress, etc.
  - Usage: Pre-built UI components

- **Radix UI**
  - Documentation: https://www.radix-ui.com/
  - License: MIT
  - Usage: Unstyled UI primitives (used by shadcn/ui)

**Styling**
- **Tailwind CSS**
  - Documentation: https://tailwindcss.com/
  - License: MIT
  - Usage: Utility-first CSS framework

**Icons & Assets**
- **Lucide React**
  - Documentation: https://lucide.dev/
  - Version: Latest
  - License: ISC
  - Usage: Icon components (Check, X, etc.)

**Notifications**
- **Sonner**
  - Documentation: https://sonner.emilkowal.ski/
  - License: MIT
  - Usage: Toast notifications (@/components/ui/sonner)

**Development Tools**
- **TypeScript**
  - Documentation: https://www.typescriptlang.org/
  - License: Apache-2.0
  - Usage: Type safety and better development experience

- **Vite**
  - Documentation: https://vitejs.dev/
  - License: MIT
  - Usage: Build tool and development server

---

### Platform Integrations (Future)

#### Twitter/X API (Planned)
- **Service**: Social media content posting
- **Documentation**: https://developer.twitter.com/en/docs/twitter-api
- **Access**: Developer account required
- **Rate Limits**: 300 tweets per 15 minutes
- **Costs**: Free tier with limitations, paid tiers available
- **Status**: Not yet implemented

#### LinkedIn API (Planned)
- **Service**: Professional network content sharing
- **Documentation**: https://docs.microsoft.com/en-us/linkedin/
- **Access**: LinkedIn Developer Program
- **Rate Limits**: Varies by endpoint
- **Costs**: Free with usage limits
- **Status**: Not yet implemented

#### Instagram Basic Display API (Planned)
- **Service**: Instagram content management
- **Documentation**: https://developers.facebook.com/docs/instagram-basic-display-api
- **Access**: Facebook Developer account
- **Rate Limits**: 200 requests per hour per user
- **Status**: Not yet implemented

---

### Development Services

#### Node.js Runtime
- **Service**: JavaScript runtime environment
- **Documentation**: https://nodejs.org/en/docs/
- **Version**: 22.x (recommended)
- **License**: MIT-style
- **Usage**: Backend server runtime

#### NPM Package Manager
- **Service**: Package management
- **Documentation**: https://docs.npmjs.com/
- **Registry**: https://www.npmjs.com/
- **Usage**: Dependency management

---

### Environment Variables Required

```env
# AI Services
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxx

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Authentication
JWT_SECRET=your-secure-secret-key
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# Server Configuration
NODE_ENV=development
PORT=3001

# Frontend (Optional)
REACT_APP_API_URL=http://localhost:3001
```

---

### Cost Breakdown (Monthly Estimates)

| Service | Tier | Cost | Usage |
|---------|------|------|-------|
| Perplexity AI | Pro | $20 | 300 requests/hour |
| MongoDB Atlas | Free (M0) | $0 | 512MB storage |
| MongoDB Atlas | M2 | $9 | 2GB storage |
| Vercel (Frontend) | Hobby | $0 | Personal projects |
| Vercel (Pro) | Pro | $20 | Team projects |

**Total Monthly Cost (Development)**: $0-$20
**Total Monthly Cost (Production)**: $20-$49

---

### Attribution Requirements

#### MIT Licensed Components
- Express.js, React, Tailwind CSS, shadcn/ui
- **License**: MIT - Permission granted for commercial use
- **Attribution**: Copyright notices must be preserved

#### Open Source Libraries
- All dependencies are open source with permissive licenses
- **No attribution required** in end-user interface
- **Source code**: License files must be preserved in source

---

### API Usage Guidelines

#### Perplexity AI
- **Content Policy**: Follow Perplexity's acceptable use policy
- **Rate Limiting**: Implement exponential backoff for retries
- **Error Handling**: Graceful fallbacks for API failures
- **Data Privacy**: Content is not stored by Perplexity permanently

#### MongoDB Atlas
- **Data Residency**: Choose appropriate region for compliance
- **Security**: Enable authentication and network access control
- **Backup**: Automated backups available (paid tiers)
- **Monitoring**: Built-in performance monitoring

---

### Compliance & Privacy

#### Data Processing
- **User Content**: Processed via Perplexity AI for content generation
- **Sentiment Analysis**: Content analyzed for emotional tone
- **Storage**: User data stored in MongoDB Atlas
- **Retention**: Configurable data retention policies

#### GDPR Compliance
- **Right to Access**: Users can export their data
- **Right to Deletion**: Users can delete their accounts
- **Data Minimization**: Only necessary data is collected
- **Consent**: Clear consent for AI processing

#### Security Measures
- **Encryption**: All data encrypted in transit (HTTPS)
- **Authentication**: JWT-based secure authentication
- **Password Security**: bcrypt hashing with salt rounds
- **Environment Variables**: Secrets stored securely

---

### Support & Documentation

#### Primary Documentation
- **Perplexity AI**: https://docs.perplexity.ai/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **React**: https://react.dev/
- **Express.js**: https://expressjs.com/

#### Community Support
- **Stack Overflow**: Tagged questions for each technology
- **GitHub Issues**: Open source project issue trackers
- **Discord/Reddit**: Community forums for each platform

---

*Last Updated: September 25, 2025*
*Version: 1.0.0*

---

### Notes
- All rate limits and costs are subject to change by service providers
- Always check official documentation for the most current information
- Consider implementing caching and optimization strategies to reduce API usage
- Monitor usage patterns to optimize costs and performance
