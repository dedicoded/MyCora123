# MyCora Design System & Brand Guidelines

## Overview
MyCora's design system embodies the underground mycelium network theme while maintaining professional fintech aesthetics. The system emphasizes trust, compliance, and organic growth through carefully crafted visual elements.

## Brand Identity

### Core Values
- **Trust**: Visualized through interconnected network nodes and glowing connections
- **Compliance**: Represented by clear status indicators and structured layouts  
- **Growth**: Expressed through organic animations and expanding network visualizations
- **Security**: Conveyed through earthy, grounded color palette and solid foundations

### Visual Metaphor
The mycelium network serves as our central metaphor - an underground fungal network that connects, nourishes, and enables growth. This represents how MyCora connects users, facilitates trust, and enables financial growth.

## Color System

### Primary Palette
- **Primary Green**: `oklch(0.45 0.12 135)` - Earthy, trustworthy foundation
- **Glowing Gold**: `oklch(0.78 0.15 85)` - Innovation, value, highlights
- **Deep Charcoal**: `oklch(0.18 0.02 85)` - Professional, readable text
- **Soft Earth**: `oklch(0.96 0.008 120)` - Clean, organic backgrounds

### Semantic Colors
- **Trust Indicators**: High (Primary Green), Medium (Sage), Low (Warm Yellow)
- **Compliance Status**: Pass (Green), Warning (Gold), Fail (Warm Red)
- **Network Glow**: Translucent gold for connection visualization

### Usage Guidelines
- Use Primary Green for CTAs, navigation, and trust elements
- Apply Glowing Gold sparingly for highlights and important notifications
- Maintain 4.5:1 contrast ratio minimum for accessibility
- Dark mode enhances colors with increased saturation and glow effects

## Typography

### Font Stack
- **Primary**: Geist Sans - Modern, clean, highly readable
- **Monospace**: Geist Mono - Technical data, addresses, codes
- **Fallbacks**: System fonts for performance and compatibility

### Hierarchy
- **H1**: 2.5rem, font-bold, Primary Green
- **H2**: 2rem, font-semibold, Foreground
- **H3**: 1.5rem, font-medium, Foreground  
- **Body**: 1rem, font-normal, Foreground
- **Caption**: 0.875rem, font-normal, Muted Foreground

## Component Guidelines

### Buttons
- **Primary**: Green background, white text, organic rounded corners
- **Secondary**: Gold background, dark text, subtle glow effect
- **Ghost**: Transparent background, hover with earth-tone fill
- **Sizes**: sm (32px), default (36px), lg (40px)

### Cards
- **Background**: Soft earth tone with subtle green tint
- **Borders**: Minimal, earth-toned borders
- **Shadows**: Soft, organic shadows that suggest depth
- **Hover**: Subtle grow animation and glow effect

### Forms
- **Inputs**: Clean white background, earth-toned borders
- **Focus**: Primary green ring with organic glow
- **Validation**: Semantic colors with clear messaging
- **Labels**: Medium weight, proper spacing

### Navigation
- **Sidebar**: Light earth background with organic textures
- **Active States**: Primary green with subtle glow
- **Hover**: Smooth transitions with earth-tone highlights
- **Breadcrumbs**: Fungal trail metaphor with connecting lines

## Animation & Motion

### Principles
- **Organic Growth**: Elements scale and fade naturally
- **Network Flow**: Subtle background animations suggest connectivity
- **Trust Pulse**: Important elements pulse gently to draw attention
- **Smooth Transitions**: 300ms ease-out for most interactions

### Keyframes
- **mycora-pulse**: 2s infinite pulse for trust indicators
- **mycora-grow**: 300ms scale animation for interactions
- **mycora-network-flow**: 8s infinite background flow animation

## Accessibility

### Standards
- WCAG 2.1 AA compliance minimum
- 4.5:1 contrast ratio for normal text
- 3:1 contrast ratio for large text and UI elements
- Keyboard navigation support for all interactive elements

### Implementation
- Semantic HTML structure
- ARIA labels and descriptions
- Focus indicators with sufficient contrast
- Screen reader friendly content structure

## Usage Examples

### Trust Visualization
\`\`\`css
.trust-node {
  @apply rounded-full p-4 mycora-pulse;
  background: var(--mycora-trust-high);
  box-shadow: 0 0 20px var(--mycora-trust-high);
}
\`\`\`

### Compliance Status
\`\`\`css
.compliance-badge {
  @apply px-3 py-1 rounded-full text-sm font-medium;
}
.compliance-badge.pass {
  @apply compliance-pass bg-primary/10;
}
\`\`\`

### Network Background
\`\`\`css
.network-section {
  @apply mycora-network-bg min-h-screen;
}
\`\`\`

## Implementation Notes

### CSS Custom Properties
All colors use OKLCH color space for better perceptual uniformity and easier manipulation. The design system leverages CSS custom properties for consistent theming across light and dark modes.

### Component Variants
Use class-variance-authority (CVA) for component styling with semantic design tokens. This ensures consistency and maintainability across the application.

### Performance
- Animations use transform and opacity for optimal performance
- Background effects are optimized for 60fps
- Images and assets are optimized for web delivery

## Brand Applications

### Logo Usage
- Primary logo on light backgrounds
- White logo on dark/colored backgrounds  
- Minimum size: 120px width
- Clear space: 2x logo height on all sides

### Marketing Materials
- Maintain earthy, organic aesthetic
- Use network visualizations to explain blockchain concepts
- Emphasize trust and security messaging
- Include compliance badges and certifications

### Digital Applications
- Consistent component usage across all platforms
- Responsive design with mobile-first approach
- Progressive enhancement for advanced features
- Accessibility-first implementation

This design system serves as the foundation for all MyCora digital experiences, ensuring consistency, accessibility, and brand alignment across the platform.
