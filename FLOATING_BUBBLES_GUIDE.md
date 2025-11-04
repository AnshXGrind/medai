# 🎨 Floating Insurance & Government Schemes Bubbles

## Overview
Beautiful animated floating bubbles displaying insurance plans and government schemes around the patient dashboard. Each bubble is interactive, showing detailed information on click.

## Features

### ✨ Visual Design
- **8 Insurance Schemes** displayed as floating gradient bubbles
- **4 Government Schemes** with distinct colors
- **Smooth floating animations** (up and down movement)
- **Hover effects** with tooltips showing scheme names
- **Click to expand** detailed information cards
- **Responsive positioning** (corners and sides of screen)

### 📋 Insurance Schemes Included

1. **Ayushman Bharat PM-JAY** 🛡️
   - Coverage: ₹5 Lakh/year
   - Premium: FREE
   - 25,000+ empanelled hospitals
   - For low-income families

2. **ESI Scheme** 💼
   - Coverage: Full medical care
   - Premium: 1.75% of wages
   - For employees earning ≤₹21,000/month
   - Includes maternity & disability benefits

3. **CGHS** 🩺
   - Coverage: Comprehensive healthcare
   - Premium: ₹125-1000/month
   - For Central Government employees
   - OPD, IPD, and medicine supply

4. **PM Suraksha Bima Yojana** 🛡️
   - Coverage: ₹2 Lakh (Accident)
   - Premium: ₹12/year
   - Age: 18-70 with bank account
   - Accidental death & disability cover

5. **PM Jeevan Jyoti Bima** ❤️
   - Coverage: ₹2 Lakh (Life)
   - Premium: ₹436/year
   - Age: 18-50 with bank account
   - Life insurance with death benefit

6. **RSBY** 👥
   - Coverage: ₹30,000/year
   - Premium: ₹30/year
   - For BPL families
   - Smart card based, cashless

7. **Janani Suraksha Yojana** 👶
   - Coverage: ₹600-1400
   - Premium: FREE
   - For pregnant women (BPL)
   - Cash assistance for delivery

8. **Aam Aadmi Bima Yojana** 🏠
   - Coverage: ₹75,000
   - Premium: ₹200/year
   - For rural landless households
   - Includes scholarship for children

### 🏛️ Government Schemes Included

1. **Ayushman Bharat PM-JAY**
   - World's largest health insurance
   - ₹5 Lakh coverage per family
   - 10.74 crore families covered

2. **Arogya Sanjeevani Policy**
   - Standard health insurance
   - ₹50,000 - ₹10,00,000 coverage
   - All age groups eligible

3. **Jan Aushadhi Scheme**
   - Affordable generic medicines
   - Save up to 90% on medicines
   - 10,000+ Jan Aushadhi Kendras

4. **National Health Mission**
   - Maternal & child health
   - Communicable disease control
   - Free diagnostics

## 🎯 Bubble Positioning

### Desktop Layout:
```
┌─────────────────────────────────────┐
│  [Bubble 1]            [Bubble 9]   │ Top
│  [Bubble 2]            [Bubble 10]  │
│                                     │
│                                     │
│  [Bubble 5]            [Bubble 7]   │ Middle (XL screens)
│  [Bubble 6]            [Bubble 8]   │
│                                     │
│                                     │
│  [Bubble 3]            [Bubble 11]  │ Bottom
│  [Bubble 4]            [Bubble 12]  │
└─────────────────────────────────────┘
```

### Bubble Colors:
- 🔵 **Blue-Cyan**: Health insurance (Ayushman Bharat, RSBY)
- 🟢 **Green-Emerald**: ESI, Aam Aadmi schemes
- 🟣 **Purple-Pink**: CGHS, Maternity schemes
- 🟠 **Orange-Red**: Accident insurance, National Health
- 🔴 **Rose-Pink**: Life insurance, Maternity benefits
- 🟦 **Indigo-Blue**: RSBY
- 🟢 **Teal-Green**: Aam Aadmi Bima

## 🎨 Interactive Features

### On Hover:
- Bubble scales up (110%)
- Shows tooltip with scheme name and coverage
- Shadow intensifies
- Z-index increases (appears on top)

### On Click:
- Opens detailed modal card
- Shows full scheme information:
  - Coverage amount
  - Premium cost
  - Eligibility criteria
  - Key benefits (bullet points)
  - Apply link (external)

### Modal Card Features:
- Gradient icon matching bubble color
- Coverage and premium display
- Eligibility section with background
- Benefits list with bullet points
- "Apply Now" button (opens official website)
- "Close" button to dismiss

## 🎭 Animations

### Floating Animation:
```css
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}
```
- Duration: 3-4 seconds
- Easing: ease-in-out
- Infinite loop
- Each bubble has slightly different timing

### Fade-in Animation:
```css
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```
- Used for tooltips
- Duration: 0.3 seconds

### Scale-in Animation:
```css
@keyframes scale-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```
- Used for modal cards
- Duration: 0.3 seconds
- Smooth appearance

## 💻 Technical Implementation

### Component Structure:
```
FloatingBubbles
├── Insurance Bubbles (8)
│   ├── Top Left (2)
│   ├── Top Right (2)
│   ├── Bottom Left (2)
│   ├── Bottom Right (2)
│   └── Middle (XL screens, 4)
├── Government Scheme Bubbles (4)
│   ├── Top Right (2)
│   └── Bottom Right (2)
└── Detail Modal (conditional)
```

### State Management:
- `selectedBubble`: Currently selected bubble ID
- `hoveredBubble`: Currently hovered bubble ID
- Both control visual states

### Props:
- No props required
- Fully self-contained component

## 📱 Responsive Behavior

### Small Screens (< 768px):
- Bubbles size: 80px (reduced from 96px)
- Only corner bubbles visible (8 bubbles)
- Touch-friendly click areas

### Medium Screens (768px - 1280px):
- Bubbles size: 96px (standard)
- Corner and top/bottom bubbles (12 bubbles)

### Large Screens (> 1280px):
- Bubbles size: 96px
- All bubbles visible including middle ones (16 bubbles)
- Maximum visual impact

## 🎯 Usage

### In PatientDashboard:
```tsx
import FloatingBubbles from "@/components/FloatingBubbles";

return (
  <div className="min-h-screen bg-background">
    <Navbar />
    <DashboardSidebar />
    <FloatingBubbles />  {/* Add this line */}
    {/* Rest of dashboard content */}
  </div>
);
```

### Styling Notes:
- Uses `fixed` positioning (won't scroll with page)
- `pointer-events-none` on container (clicks pass through)
- `pointer-events-auto` on individual bubbles (clickable)
- `z-30` for bubbles, `z-100` for modal
- Doesn't interfere with sidebar or navbar

## 🔧 Customization

### Add New Insurance Scheme:
```tsx
{
  id: "new-scheme",
  name: "New Insurance Scheme",
  icon: Shield,
  type: "health",
  provider: "Provider Name",
  coverage: "₹X Lakh",
  premium: "₹Y/year",
  color: "from-color-500 to-color-600",
  benefits: ["Benefit 1", "Benefit 2"],
  eligibility: "Who can apply",
  applyLink: "https://example.com"
}
```

### Add New Government Scheme:
```tsx
{
  id: "new-govt-scheme",
  name: "Government Scheme Name",
  icon: Heart,
  ministry: "Ministry Name",
  coverage: "Coverage details",
  eligibility: "Who can apply",
  color: "from-color-500 to-color-600",
  benefits: ["Benefit 1", "Benefit 2"],
  applyLink: "https://example.com"
}
```

### Change Bubble Colors:
Use Tailwind gradient classes:
- `from-blue-500 to-cyan-500`
- `from-green-500 to-emerald-500`
- `from-purple-500 to-pink-500`
- `from-orange-500 to-red-500`

### Adjust Positioning:
Modify absolute positioning classes:
- `top-24` → Change top position
- `left-4` → Change left position
- `bottom-24` → Change bottom position
- `right-4` → Change right position

## 🎨 Design Principles

### Visual Hierarchy:
1. **Color-coded by type**: Easy identification
2. **Gradient backgrounds**: Modern and attractive
3. **White icons**: Clear contrast
4. **Hover states**: Interactive feedback

### User Experience:
1. **Non-intrusive**: Fixed position doesn't block content
2. **Always accessible**: Visible throughout dashboard
3. **Quick information**: Tooltips on hover
4. **Detailed on demand**: Modal for full details

### Accessibility:
- Keyboard navigation support
- Aria labels on interactive elements
- Clear visual feedback
- High contrast icons

## 📊 Statistics

**Code Metrics:**
- Lines of code: ~500
- Insurance schemes: 8
- Government schemes: 4
- Total bubbles: 12-16 (responsive)
- Animations: 3 types
- Colors: 8 gradients

**Data Provided:**
- Total coverage information
- Premium costs for 8 schemes
- Eligibility for 12 programs
- 40+ benefits listed
- 12 official apply links

## 🚀 Performance

**Optimizations:**
- CSS animations (GPU accelerated)
- No JavaScript animations
- Minimal re-renders
- Lazy modal rendering
- Efficient state management

**Bundle Impact:**
- Component size: ~15KB
- No external dependencies
- Uses existing UI components
- Pure CSS animations

## 🎉 Result

Beautiful, informative, and interactive floating bubbles that:
- ✅ Look visually appealing
- ✅ Provide quick insurance/scheme information
- ✅ Don't interfere with main content
- ✅ Are fully responsive
- ✅ Include 12 comprehensive schemes
- ✅ Have smooth animations
- ✅ Open official application links

Perfect addition to make your MedAid dashboard more engaging and informative! 🌟
