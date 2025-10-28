# GRAY FORUM - Design Guidelines

## Design Approach
**Reference-Based**: Drawing inspiration from underground technical forums (Dread, Exploit.in, CryptBB) with a modern, refined execution. The aesthetic balances anonymity-focused minimalism with functional information density.

## Core Visual Identity
**Color Palette**: Dark gray foundation as specified - charcoal backgrounds (#1a1a1a, #242424, #2d2d2d) with lighter grays for surfaces (#333333, #3d3d3d). Accent with terminal green (#00ff41) or electric blue (#0ea5e9) for interactive elements and status indicators.

## Typography
- **Headlines**: Inter or JetBrains Mono (600-700 weight) for technical credibility
- **Body**: -apple-system, system-ui for readability in long threads
- **Code/Technical**: JetBrains Mono or Fira Code for inline code and technical discussions
- **Hierarchy**: Large thread titles (text-xl/2xl), readable body (text-sm/base), compact metadata (text-xs)

## Layout System
**Spacing Units**: Consistent use of 2, 4, 6, 8, 12, 16 units
- Tight spacing (p-2, p-4) for dense information areas
- Moderate spacing (p-6, p-8) for main content containers
- Generous spacing (p-12, p-16) for section separation

**Grid Structure**: 
- Main content: max-w-7xl with sidebar layouts
- Thread lists: Single column, full-width cards
- Forum categories: 2-column grid on desktop, stack on mobile

## Component Library

### Navigation
- **Top Bar**: Sticky header with logo, search, user menu, notifications
- **Breadcrumbs**: Show category > subcategory > thread hierarchy
- **Sidebar**: Collapsible left sidebar with category tree and stats

### Forum Components
- **Category Cards**: Icon, title, description, thread count, last activity timestamp
- **Thread List Items**: Avatar, title, author, reply count, view count, last post preview
- **Post Cards**: Author sidebar (avatar, username, rank, join date, post count) + content area
- **Reply Tree**: Nested indentation with connection lines for threaded discussions

### User Elements
- **Profile Cards**: Avatar, username, reputation score, badges, member since
- **User Ranks**: Visual badges (Newbie, Member, Elite, Admin) with distinct icons
- **Reputation System**: Upvote/downvote counters, trust score indicators

### Interactive Elements
- **Thread Actions**: Reply, Quote, Report, Share buttons with icons
- **Rich Text Editor**: Toolbar with formatting, code blocks, spoiler tags, file uploads
- **Search Bar**: Prominent with advanced filters (by category, date, author)
- **Moderation Tools**: Pin, Lock, Move, Delete actions for authorized users

### Data Display
- **Statistics Dashboard**: Total threads, posts, members, online users
- **Activity Feed**: Recent posts, trending threads, hot topics
- **Pagination**: Page numbers with prev/next, threads per page selector

## Page Structures

### Home/Forum Index
- Hero banner with site name, tagline, search (40vh)
- Category grid with stats and latest activity
- Online members sidebar
- Recent activity feed

### Thread View
- Breadcrumb navigation
- Thread title, author, timestamp, view/reply counts
- First post (OP) with emphasis/highlight
- Reply posts in chronological order
- Reply editor at bottom
- Related threads sidebar

### User Profile
- Header with cover image area, avatar, username, status
- Stats grid (posts, threads, reputation, joined)
- Recent activity tab, posts tab, threads tab
- Badge/achievement showcase

## Animations
Minimal, purposeful interactions:
- Smooth transitions on hover states (200ms)
- Slide-in notifications (300ms ease-out)
- Fade transitions for modal overlays
- No scroll-triggered animations

## Images
**Logo**: Monochromatic "GRAY FORUM" wordmark with subtle geometric icon
**Avatars**: Circular, consistent sizing (32px list, 48px posts, 128px profiles)
**No Hero Image**: Forums prioritize immediate content access over visual storytelling

## Accessibility
- High contrast ratios on dark backgrounds
- Focus indicators on all interactive elements
- Keyboard navigation through threads and posts
- Screen reader labels for icons and actions
- Alt text for user-uploaded images

## Mobile Considerations
- Hamburger menu for category navigation
- Swipe gestures for thread navigation
- Collapsible sidebar on mobile
- Touch-friendly tap targets (44px minimum)
- Responsive tables for user stats

This design creates a professional, secure-feeling environment that respects the underground forum aesthetic while maintaining modern usability standards.