import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Suppress header/footer on cover page
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#2E6DA4")) # Primary brand

        # Top Header
        self.drawString(36, 760, "VEHICLEINSURE — COMPLETE PLATFORM FEATURE DOCUMENTATION")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawRightString(576, 760, "System Architecture & Page Breakdown")
        
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(36, 752, 576, 752)

        # Bottom Footer
        self.line(36, 45, 576, 45)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(36, 32, "Confidential & Proprietary — VehicleInsure Enterprise Edition 2026")
        
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(576, 32, page_text)
        self.restoreState()


def build_pdf(filename="VehicleInsure_Complete_Feature_Guide.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Palette
    PRIMARY = colors.HexColor("#1E293B")     # Dark Slate
    BRAND_BLUE = colors.HexColor("#2E6DA4")  # Primary Brand Blue
    BRAND_TEAL = colors.HexColor("#0E9C88")  # Accent Teal
    DARK_TEXT = colors.HexColor("#334155")   # Body text
    BG_LIGHT = colors.HexColor("#F8FAFC")    # Muted BG
    ACCENT_GREEN = colors.HexColor("#10B981")# Emerald

    # Typography Styles
    cover_title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=BRAND_BLUE,
        alignment=0,
        spaceAfter=12
    )

    cover_subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=DARK_TEXT,
        alignment=0,
        spaceAfter=24
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=BRAND_BLUE,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=BRAND_TEAL,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=DARK_TEXT,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=DARK_TEXT,
        leftIndent=12,
        spaceAfter=3
    )

    badge_style = ParagraphStyle(
        'Badge_Text',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=1
    )

    story = []

    # =========================================================================
    # COVER / TITLE SECTION
    # =========================================================================
    story.append(Spacer(1, 20))
    
    # Decorative Header Tag
    tag_table = Table([[Paragraph("<strong>OFFICIAL ENTERPRISE DOCUMENTATION</strong>", badge_style)]], colWidths=[220])
    tag_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BRAND_TEAL),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('CORNERPAD', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(tag_table)
    story.append(Spacer(1, 14))

    story.append(Paragraph("VehicleInsure System Architecture & Deep Feature Manual", cover_title_style))
    story.append(Paragraph("A Complete Page-by-Page Technical Guide, AI Telemetry Specifications, Payment Ledgers, and Regulatory Operations Framework", cover_subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE, spaceBefore=0, spaceAfter=18))

    # Meta Overview Box
    meta_data = [
        [Paragraph("<b>Document Version:</b> 1.0 Production Release", body_style), Paragraph("<b>Target Environment:</b> Web & Admin Platform", body_style)],
        [Paragraph("<b>Compliance:</b> IRDAI Tariff Guidelines", body_style), Paragraph("<b>AI Engine:</b> Computer Vision Damage Inspector", body_style)],
        [Paragraph("<b>Frontend Framework:</b> React 19 + Vite + TailwindCSS v4", body_style), Paragraph("<b>Backend Services:</b> Spring Boot 3 + PostgreSQL", body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[270, 270])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 20))

    # Executive Overview
    story.append(Paragraph("Executive System Overview", h1_style))
    story.append(Paragraph(
        "<b>VehicleInsure</b> is an end-to-end motor insurance management platform engineered to automate policy lifecycle management, installment billing schedules, and AI-assisted claims processing. "
        "Built on modern enterprise standards, the system combines real-time image evaluation, automatic schedule generation, No-Claim Bonus (NCB) protection tracking, and full audit logging for regulatory compliance.",
        body_style
    ))
    story.append(Spacer(1, 14))

    # Table of Contents Summary
    story.append(Paragraph("Platform Navigation & Module Index", h2_style))
    toc_data = [
        ["Module / Page", "Route Path", "Primary Core Capabilities"],
        ["1. Landing & Home", "/", "Instant quote calculation, policy highlights, claims resolution counter"],
        ["2. Auth - Login", "/login", "Role-based authentication (Customer vs. Admin), session security"],
        ["3. Auth - Register", "/register", "Interactive validation, Terms & Privacy popup agreement, password entropy"],
        ["4. Customer Dashboard", "/dashboard", "Active policy cards, monthly financial commitments, quick action launcher"],
        ["5. Policy Configurator", "/policies/create", "Multi-step wizard, vehicle tiering, IDV calculator, schedule selector"],
        ["6. Active Policies", "/applications & /policies/:id", "Lifecycle status, policy PDF downloads, claims history & vehicle specs"],
        ["7. Payments & Billing", "/payments", "Schedule calendar, on-time NCB benefits, grouped policy accordions, receipts"],
        ["8. Personal Claims", "/claim-tracking", "Category tabs, AI assessment trigger, individual & bulk payout settlement"],
        ["9. File a New Claim", "/claims/create", "Incident intimation, drag-and-drop damage photo scanner, pre-eval score"],
        ["10. Claim Review Detail", "/claims/:id", "Deep telemetry analysis, damaged area grid, official claim report PDF"],
        ["11. Audit Logs & Portal", "/admin/audit-logs", "System event tracking, dynamic payment log merging, CSV exports"],
        ["12. Terms & Regulations", "/terms", "IRDAI guidelines, Zero-Dep rules, annual/monthly claim cap verifier"]
    ]
    toc_table = Table(toc_data, colWidths=[110, 110, 320])
    toc_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BRAND_BLUE),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8.5),
        ('BOTTOMPADDING', (0,0), (-1,0), 5),
        ('TOPPADDING', (0,0), (-1,0), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(toc_table)
    
    story.append(PageBreak())

    # =========================================================================
    # PAGE-BY-PAGE DETAILED BREAKDOWN
    # =========================================================================

    def add_section_header(title, route):
        story.append(Paragraph(f"{title}", h1_style))
        story.append(Paragraph(f"<b>Route Path:</b> <font color='#2E6DA4'><code>{route}</code></font>", body_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=4, spaceAfter=8))

    # Page 1: Landing Page
    add_section_header("1. Landing & Home Portal", "/")
    story.append(Paragraph("<b>Overview:</b> The public landing page serves as the entry point for prospective policyholders, highlighting insurance offerings, IRDAI compliance, and instant premium estimates.", body_style))
    story.append(Paragraph("<b>Key Technical Features & Deep Capabilities:</b>", h2_style))
    story.append(Paragraph("• <b>Instant Quote Calculator:</b> Computes estimated premium quotes in real time based on vehicle category (Car, Bike, SUV, Commercial) and manufacture year.", bullet_style))
    story.append(Paragraph("• <b>Live Resolution Tracker:</b> Displays dynamic settlement metrics and customer claim approval rate counters.", bullet_style))
    story.append(Paragraph("• <b>Interactive Feature Showcase:</b> Highlights Zero-Depreciation protection, 24/7 Roadside Assistance, and AI Fast-Track processing.", bullet_style))
    story.append(Paragraph("• <b>Direct Navigation Hub:</b> Quick links to customer registration, user sign-in, and policy configuration.", bullet_style))
    story.append(Spacer(1, 10))

    # Page 2: Login Page
    add_section_header("2. Authentication Hub — User Login", "/login")
    story.append(Paragraph("<b>Overview:</b> Provides secure, role-based access control for both regular policyholders and system administrators.", body_style))
    story.append(Paragraph("<b>Key Technical Features & Deep Capabilities:</b>", h2_style))
    story.append(Paragraph("• <b>Role-Based Auth (RBAC):</b> Automatically routes signed-in users to the Customer Dashboard or Admin Control Center based on account credentials.", bullet_style))
    story.append(Paragraph("• <b>Password Visibility Control:</b> Interactive show/hide password toggle icons.", bullet_style))
    story.append(Paragraph("• <b>Token & Session Management:</b> Secure localStorage token persistence with automatic query cache invalidation on logout.", bullet_style))
    story.append(Paragraph("• <b>Clean Aesthetic Interface:</b> Streamlined login container with social login clutter removed.", bullet_style))
    story.append(Spacer(1, 10))

    # Page 3: Register Page
    add_section_header("3. Account Creation & Registration Hub", "/register")
    story.append(Paragraph("<b>Overview:</b> Allows new users to create accounts with real-time Zod schema validation and mandatory regulatory Terms & Privacy acceptance.", body_style))
    story.append(Paragraph("<b>Key Technical Features & Deep Capabilities:</b>", h2_style))
    story.append(Paragraph("• <b>Zod Schema Validation:</b> Enforces strict formatting on Full Name, Email, Phone Number, Password, and Password Confirmation.", bullet_style))
    story.append(Paragraph("• <b>Password Entropy Meter:</b> Real-time visual strength indicator measuring character variety and length.", bullet_style))
    story.append(Paragraph("• <b>Functional & Required Terms Checkbox:</b> The 'I agree to Terms & Conditions' checkbox is fully interactive and required before submission. Submitting without checking displays inline error messages.", bullet_style))
    story.append(Paragraph("• <b>Interactive Terms & Privacy Modal:</b> Popup dialog displaying IRDAI compliance terms. Clicking 'I Understand & Agree' inside the modal automatically checks the registration checkbox.", bullet_style))
    story.append(Spacer(1, 10))

    # Page 4: Customer Dashboard
    add_section_header("4. Policyholder Executive Dashboard", "/dashboard")
    story.append(Paragraph("<b>Overview:</b> Serves as the central command center for policyholders, presenting executive summaries of active policies, upcoming payments, and claim statuses.", body_style))
    story.append(Paragraph("<b>Key Technical Features & Deep Capabilities:</b>", h2_style))
    story.append(Paragraph("• <b>Active Policy Overview:</b> Dynamic cards showing coverage type, vehicle details, expiration dates, and renewal status.", bullet_style))
    story.append(Paragraph("• <b>Monthly Financial Commitment:</b> Calculates total scheduled commitments vs. verified paid amounts.", bullet_style))
    story.append(Paragraph("• <b>Quick Action Launcher:</b> Direct one-click access to file claims, configure new policies, or manage billing.", bullet_style))
    story.append(Paragraph("• <b>Recent Telemetry & Alerts:</b> Real-time notifications for upcoming payment due dates and claim status updates.", bullet_style))

    story.append(PageBreak())

    # Page 5: Policy Creation Wizard
    add_section_header("5. Policy Application & Configuration Wizard", "/policies/create")
    story.append(Paragraph("<b>Overview:</b> A guided multi-step configurator for customizing motor insurance policies, selecting coverage add-ons, and generating installment schedules.", body_style))
    story.append(Paragraph("<b>Key Technical Features & Deep Capabilities:</b>", h2_style))
    story.append(Paragraph("• <b>Vehicle Tiering Selector:</b> Custom choices for Cars / Sedans, Two-Wheelers / Bikes, SUVs / Crossovers, and Commercial Vehicles.", bullet_style))
    story.append(Paragraph("• <b>Dynamic IDV Calculation Engine:</b> Calculates Insured Declared Value (IDV) based on vehicle age, make, and manufacturer ex-showroom price.", bullet_style))
    story.append(Paragraph("• <b>Coverage Plan Customizer:</b> Choose Comprehensive or Third-Party plans with optional Zero-Depreciation and NCB protection riders.", bullet_style))
    story.append(Paragraph("• <b>Installment Schedule Frequency Picker:</b> Select Annual, Semi-Annual, Quarterly, or Monthly payment intervals.", bullet_style))
    story.append(Spacer(1, 10))

    # Page 6: Active Policies Overview
    add_section_header("6. Active Insurance Policies & Details", "/applications & /policies/:id")
    story.append(Paragraph("<b>Overview:</b> Displays comprehensive policy documents, vehicle specifications, chassis registration details, and instant PDF download capabilities.", body_style))
    story.append(Paragraph("<b>Key Technical Features & Deep Capabilities:</b>", h2_style))
    story.append(Paragraph("• <b>Official Policy Certificate PDF Download:</b> Instant client-side PDF generation featuring policy schedules, vehicle specifications, and IRDAI registration marks.", bullet_style))
    story.append(Paragraph("• <b>Policy Lifecycle Badging:</b> Real-time status indicators (Active, Renewed, Expired, Suspended).", bullet_style))
    story.append(Paragraph("• <b>Claims History & Limits Meter:</b> Tracks annual claim usage against policy frequency caps (e.g. 2 claims max per year).", bullet_style))
    story.append(Spacer(1, 10))

    # Page 7: Payments & Billing Portal
    add_section_header("7. Payments & Billing Ledger", "/payments")
    story.append(Paragraph("<b>Overview:</b> The core financial portal for managing installment schedules, reviewing policy transaction logs, claiming prompt payment discounts, and downloading receipts.", body_style))
    story.append(Paragraph("<b>Key Technical Features & Deep Capabilities:</b>", h2_style))
    story.append(Paragraph("• <b>Interactive Schedule Calendar:</b> Monthly calendar widget highlighting scheduled due dates, overdue items, and paid installments.", bullet_style))
    story.append(Paragraph("• <b>On-Time Premium Benefits Banner:</b> Real-time checker displaying 5% Prompt Payment Renewal Discounts and 100% No-Claim Bonus (NCB) protection status.", bullet_style))
    story.append(Paragraph("• <b>Grouped Policy Accordions:</b> Installment logs are grouped under Policy Cards with expandable dropdown menus for clean organized viewing.", bullet_style))
    story.append(Paragraph("• <b>Active Payment Actions:</b> Clear, spacious <code>Pay ₹Amount</code> buttons on every row and <code>Pay All Pending (₹Total)</code> bulk payment buttons on policy headers.", bullet_style))
    story.append(Paragraph("• <b>Nearest Due Date Ordering:</b> Schedules and transaction logs are sorted so dates closest to today appear at the top of the ledger.", bullet_style))
    story.append(Paragraph("• <b>PDF Receipt & CSV Export:</b> Download official payment receipts in PDF format or export full system billing records to UTF-8 CSV files.", bullet_style))
    story.append(Spacer(1, 10))

    # Page 8: Personal Claims Tracking
    add_section_header("8. Personal Claims Management & Tracking", "/claim-tracking")
    story.append(Paragraph("<b>Overview:</b> Allows policyholders to track claim progress, review AI evaluation results, update claim statuses, and trigger payout settlements.", body_style))
    story.append(Paragraph("<b>Key Technical Features & Deep Capabilities:</b>", h2_style))
    story.append(Paragraph("• <b>Category Filtering Tabs:</b> Filter claims by state: All, Filed, Under Review, Approved, Closed, and Rejected.", bullet_style))
    story.append(Paragraph("• <b>Individual Claim Payout Action:</b> Each claim card features a green <code>Pay & Settle Payout (₹Amount)</code> button for immediate disbursement.", bullet_style))
    story.append(Paragraph("• <b>Bulk Claim Payout Button:</b> Header feature allowing one-click <code>Pay & Settle All Claims</code> for all active claims.", bullet_style))
    story.append(Paragraph("• <b>Claims Resolution Progress Meter:</b> Visual gradient progress bar calculating overall claim settlement percentage.", bullet_style))

    story.append(PageBreak())

    # Page 9: File a New Claim
    add_section_header("9. Intimate a New Accident Claim", "/claims/create")
    story.append(Paragraph("<b>Overview:</b> A streamlined accident reporting form with AI visual inspection photo analysis and instant pre-evaluation approval scoring.", body_style))
    story.append(Paragraph("<b>Key Technical Features & Deep Capabilities:</b>", h2_style))
    story.append(Paragraph("• <b>Incident Information Capture:</b> Date, time, location, accident description, and third-party details.", bullet_style))
    story.append(Paragraph("• <b>AI Photo Signature Scanner:</b> Evaluates uploaded damage photos using <code>descriptionValidator.ts</code>. Accepts photos of specific car sections (front bumper, rear bumper, fender, door) while rejecting non-vehicle appliance diagrams.", bullet_style))
    story.append(Paragraph("• <b>Pre-Claim Approval Score:</b> Real-time probability calculation scoring description detail, photo presence, policy status, and annual claim limits.", bullet_style))
    story.append(Spacer(1, 10))

    # Page 10: Detailed Claim Review
    add_section_header("10. Detailed Claim Telemetry & Review", "/claims/:id")
    story.append(Paragraph("<b>Overview:</b> Provides a comprehensive deep-dive into an individual claim, including photo evidence, damage area breakdowns, cost estimates, and official reports.", body_style))
    story.append(Paragraph("<b>Key Technical Features & Deep Capabilities:</b>", h2_style))
    story.append(Paragraph("• <b>Damaged Area Breakdown Grid:</b> Displays identified damage points, severity levels (Critical, High, Moderate), and repair cost estimates.", bullet_style))
    story.append(Paragraph("• <b>Policy Capacity Cap Verifier:</b> Displays policy active status, annual claim cap headroom, and deductible rules.", bullet_style))
    story.append(Paragraph("• <b>Official Claim Report PDF Download:</b> Generates a formal claim audit report PDF featuring telemetry data, surveyor notes, and AI match scores.", bullet_style))
    story.append(Spacer(1, 10))

    # Page 11: Admin Audit Logs
    add_section_header("11. Admin Audit Logs & Security Portal", "/admin/audit-logs")
    story.append(Paragraph("<b>Overview:</b> An administrative security and compliance portal tracking system events, administrative decisions, user authentication, and billing activities.", body_style))
    story.append(Paragraph("<b>Key Technical Features & Deep Capabilities:</b>", h2_style))
    story.append(Paragraph("• <b>System Event Tracking:</b> Records actions including PAYMENT, CREATE, APPROVE, REJECT, UPDATE, LOGIN, and UPLOAD.", bullet_style))
    story.append(Paragraph("• <b>Dynamic Payment Log Merging:</b> Payment transactions completed on the platform are dynamically recorded into audit logs with user IDs, timestamps, and policy numbers.", bullet_style))
    story.append(Paragraph("• <b>Multi-Criteria Filter Bar:</b> Filter by Action Type, User Role (Customer vs. Admin), Search Query, and Time Range (Today, Week, Month, Quarter, Custom Date Range).", bullet_style))
    story.append(Paragraph("• <b>Audit Trail CSV Export:</b> Export complete system audit logs to UTF-8 CSV format for regulatory review.", bullet_style))
    story.append(Spacer(1, 10))

    # Page 12: Terms Analysis
    add_section_header("12. Terms & Regulatory Analysis Engine", "/terms")
    story.append(Paragraph("<b>Overview:</b> Educational and analytical hub explaining policy terms, regulatory guidelines, Zero-Depreciation coverage, and No-Claim Bonus rules.", body_style))
    story.append(Paragraph("<b>Key Technical Features & Deep Capabilities:</b>", h2_style))
    story.append(Paragraph("• <b>IRDAI Guidelines Breakdown:</b> Clear explanations of own-damage vs. third-party liability rules.", bullet_style))
    story.append(Paragraph("• <b>NCB Protection Matrix:</b> Shows how maintaining on-time payments protects No-Claim Bonus discounts across policy renewals.", bullet_style))
    story.append(Paragraph("• <b>Fraud Prevention & Intimation Rules:</b> Guidelines on valid document submission and claim frequency limits.", bullet_style))

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=1.5, color=BRAND_BLUE, spaceBefore=6, spaceAfter=12))

    # System Architecture Summary Table
    story.append(Paragraph("System Architecture & Security Matrix", h1_style))
    arch_data = [
        ["Subsystem / Component", "Technology Implemented", "Security & Operational Standard"],
        ["Web User Interface", "React 19, Vite, TailwindCSS v4, Framer Motion", "Single-page responsive application with accessible contrast"],
        ["Form & Schema Validation", "Zod 4, Sonner Toast Notifications", "Client-side validation with dismissible close (X) buttons"],
        ["Backend REST API", "Spring Boot 3, Java 17, JPA/Hibernate", "RESTful micro-modular design with transaction boundaries"],
        ["Database Layer", "PostgreSQL Database Engine", "ACID compliant relational schema with indexed foreign keys"],
        ["AI Visual Assessment Engine", "Computer Vision Signature Scanner", "Scans photo filenames/URL signatures for vehicle inspection evidence"],
        ["PDF Report Generator", "jsPDF, ReportLab Python Engine", "Client-side & server-side document rendering"],
        ["Audit & Compliance Ledger", "Local & RESTful Audit Service", "ISO-27001 audit tracking with CSV export and role attribution"]
    ]
    arch_table = Table(arch_data, colWidths=[130, 160, 250])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BRAND_BLUE),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8.5),
        ('BOTTOMPADDING', (0,0), (-1,0), 5),
        ('TOPPADDING', (0,0), (-1,0), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(arch_table)

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {os.path.abspath(filename)}")

if __name__ == "__main__":
    build_pdf()
