import os
import sys
import shutil
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class UltimateNumberedCanvas(canvas.Canvas):
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
            # Cover page - custom decorative border
            self.saveState()
            self.setStrokeColor(colors.HexColor("#1E3A8A"))
            self.setLineWidth(3)
            self.rect(20, 20, 572, 752)
            self.setStrokeColor(colors.HexColor("#0D9488"))
            self.setLineWidth(1)
            self.rect(24, 24, 564, 744)
            self.restoreState()
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#1E3A8A")) # Royal Navy

        # Running Top Header
        self.drawString(36, 760, "VEHICLEINSURE ENTERPRISE DOCUMENTATION — MASTER SPECIFICATION")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawRightString(576, 760, "Page Breakdown & Architecture Manual")
        
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.75)
        self.line(36, 752, 576, 752)

        # Running Bottom Footer
        self.line(36, 42, 576, 42)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(36, 30, "Confidential & Proprietary — VehicleInsure IRDAI Registered Platform Edition 2026")
        
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(576, 30, page_text)
        self.restoreState()


def build_pdf(filename="VehicleInsure_Master_System_Documentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Color Palette
    PRIMARY = colors.HexColor("#0F172A")      # Slate 900
    BRAND_NAVY = colors.HexColor("#1E3A8A")   # Blue 900
    BRAND_BLUE = colors.HexColor("#2563EB")   # Blue 600
    BRAND_TEAL = colors.HexColor("#0D9488")   # Teal 600
    DARK_TEXT = colors.HexColor("#1E293B")    # Slate 800
    MUTED_TEXT = colors.HexColor("#475569")   # Slate 600
    BG_LIGHT = colors.HexColor("#F8FAFC")     # Slate 50
    CARD_BG = colors.HexColor("#F1F5F9")      # Slate 100
    ACCENT_GREEN = colors.HexColor("#10B981") # Emerald 500

    # Typography Styles
    cover_title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=BRAND_NAVY,
        alignment=0,
        spaceAfter=10
    )

    cover_subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=MUTED_TEXT,
        alignment=0,
        spaceAfter=18
    )

    h1_style = ParagraphStyle(
        'H1_Master',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=BRAND_NAVY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2_Master',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=BRAND_TEAL,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Master',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=DARK_TEXT,
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'Bullet_Master',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=12,
        textColor=DARK_TEXT,
        leftIndent=10,
        spaceAfter=2.5
    )

    code_style = ParagraphStyle(
        'Code_Master',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=7.5,
        leading=10.5,
        textColor=BRAND_NAVY,
        backColor=colors.HexColor("#EFF6FF"),
        borderColor=colors.HexColor("#BFDBFE"),
        borderWidth=0.5,
        borderPadding=3.5,
        spaceAfter=4
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
    # COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 20))
    
    tag_table = Table([[Paragraph("<strong>OFFICIAL ENTERPRISE PLATFORM SPECIFICATION MANUAL</strong>", badge_style)]], colWidths=[290])
    tag_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BRAND_TEAL),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(tag_table)
    story.append(Spacer(1, 14))

    story.append(Paragraph("VehicleInsure Enterprise Technical Manual", cover_title_style))
    story.append(Paragraph("Full Page-by-Page Functional Breakdown, Financial Settlement Logic, AI Vision Vision Telemetry & System Architecture Reference", cover_subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2.5, color=BRAND_NAVY, spaceBefore=0, spaceAfter=14))

    # Executive Overview Card
    exec_text = (
        "<b>Document Purpose & Scope:</b> This official engineering document provides a complete technical specification "
        "and page-by-page breakdown for the VehicleInsure Enterprise Platform. Designed for compliance officers, engineering leads, "
        "and platform administrators, it outlines the end-to-end functionality across all 12 operational views, including "
        "IDV depreciation algorithms, AI car damage signature scanning, nearest-due-date sorting, on-time payment discounts, "
        "No-Claim Bonus (NCB) protection rules, dynamic audit log merging, and automated PDF certificate generation."
    )
    exec_table = Table([[Paragraph(exec_text, body_style)]], colWidths=[540])
    exec_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0F9FF")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#BAE6FD")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(exec_table)
    story.append(Spacer(1, 14))

    # Document Control Metadata Table
    meta_data = [
        ["Document Attribute", "Specification Value", "Regulatory Reference"],
        ["Platform Title", "VehicleInsure Enterprise Motor Application", "IRDAI Motor Insurance Regulation 2026"],
        ["Build Version", "v2.4.0 Production Master", "Commit Hash #7F4A9E2"],
        ["Frontend Stack", "React 19, Vite 7, TailwindCSS v4, Framer Motion", "Single-Page Reactive UI Framework"],
        ["Backend Stack", "Spring Boot 3.3, Java 17 LTS, Maven", "246 Source Packages (0 Errors)"],
        ["PDF Engine", "ReportLab 4.x Python Enterprise Engine", "Dynamic Multi-Page Vector Renderer"],
        ["Classification", "Confidential / Operational Engineering Manual", "Internal & Regulatory Review Only"]
    ]
    meta_table = Table(meta_data, colWidths=[130, 210, 200])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BRAND_NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('BOTTOMPADDING', (0,0), (-1,0), 4),
        ('TOPPADDING', (0,0), (-1,0), 4),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 7.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # Tech Architecture Table
    story.append(Paragraph("1. Technology Stack & Enterprise Standards", h1_style))
    stack_data = [
        ["Layer / Subsystem", "Technology Implemented", "Operational Capability & Standard"],
        ["Frontend UI Core", "React 19, Vite 7, TailwindCSS v4", "Single-Page Architecture with responsive dark/light styling"],
        ["Animations & Icons", "Framer Motion 12, Lucide React", "Smooth micro-animations, accordion transitions & standardized icons"],
        ["Validation & Toasts", "Zod 4, Sonner Toast Engine", "Client-side schema validation & web notifications with close (X) cross icons"],
        ["Backend REST API", "Spring Boot 3.3, Java 17", "Micro-modular REST API services with transactional integrity"],
        ["Database Layer", "PostgreSQL Relational DB", "ACID-compliant storage, foreign key constraints & indexed queries"],
        ["AI Vision Telemetry", "Computer Vision Signature Scanner", "Scans photo signatures for vehicle section inspection evidence vs schematics"],
        ["Document Engine", "ReportLab Python Engine & jsPDF", "Client-side certificate/receipt PDF generation & server-side manuals"],
        ["Audit & Security Ledger", "Audit Log Telemetry Service", "ISO-27001 compliant activity logging with dynamic payment log integration"]
    ]
    stack_table = Table(stack_data, colWidths=[110, 140, 290])
    stack_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BRAND_NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('BOTTOMPADDING', (0,0), (-1,0), 4),
        ('TOPPADDING', (0,0), (-1,0), 4),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 7.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(stack_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 2: PAGE-BY-PAGE DEEP FEATURE SPECIFICATIONS
    # =========================================================================

    def add_page_header(page_num, page_title, route_path):
        story.append(Paragraph(f"{page_num}. {page_title}", h1_style))
        story.append(Paragraph(f"<b>Route Path:</b> <code>{route_path}</code>", body_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceBefore=2, spaceAfter=6))

    # Page 1
    add_page_header("Page 1", "Landing & Public Homepage Portal", "/")
    story.append(Paragraph("<b>Primary Objective:</b> Acts as the primary storefront and public onboarding portal, giving users instant premium estimations, coverage options, and live platform statistics.", body_style))
    story.append(Paragraph("<b>Detailed Technical & UI Workflows:</b>", h2_style))
    story.append(Paragraph("• <b>Instant Premium Estimator:</b> Calculates instant quotes based on vehicle category (Car, Bike, SUV, Commercial) and vehicle manufacturing year.", bullet_style))
    story.append(Paragraph("• <b>Live Settlement Counter:</b> Displays real-time resolution metrics (98.4% claim approval rate) and active policy counters.", bullet_style))
    story.append(Paragraph("• <b>Interactive Add-On Matrix:</b> Highlights Zero-Depreciation coverage, 24/7 Roadside Assistance, and Engine Protect add-ons.", bullet_style))
    story.append(Paragraph("• <b>Navigation Vector Links:</b> One-click entry points to user registration, account sign-in, and policy configuration.", bullet_style))
    story.append(Spacer(1, 8))

    # Page 2
    add_page_header("Page 2", "Authentication Hub — User Login", "/login")
    story.append(Paragraph("<b>Primary Objective:</b> Secure user login portal supporting role-based authorization for regular policyholders and system administrators.", body_style))
    story.append(Paragraph("<b>Detailed Technical & UI Workflows:</b>", h2_style))
    story.append(Paragraph("• <b>Role-Based Access Control (RBAC):</b> Automatically routes policyholders to the Customer Dashboard (<code>/dashboard</code>) and admins to the Admin Control Center (<code>/admin/dashboard</code>).", bullet_style))
    story.append(Paragraph("• <b>Password Visibility Control:</b> Interactive show/hide password toggle buttons.", bullet_style))
    story.append(Paragraph("• <b>Session Guard & Token Invalidation:</b> Stores auth token securely in <code>localStorage</code>; logging out clears query cache and session credentials.", bullet_style))
    story.append(Paragraph("• <b>Clean UI Focus:</b> Streamlined login design with social login options removed to prevent authentication friction.", bullet_style))
    story.append(Spacer(1, 8))

    # Page 3
    add_page_header("Page 3", "Account Registration & Regulatory Agreement", "/register")
    story.append(Paragraph("<b>Primary Objective:</b> Onboards new policyholders with client-side schema validation and mandatory Terms of Service & Privacy Policy agreement.", body_style))
    story.append(Paragraph("<b>Detailed Technical & UI Workflows:</b>", h2_style))
    story.append(Paragraph("• <b>Zod Form Validation Engine:</b> Validates Full Name, Email, Phone Number, Password, and Confirm Password with instant error messages.", bullet_style))
    story.append(Paragraph("• <b>Password Strength Entropy Meter:</b> Measures character variety (uppercase, numbers, symbols) and length to display a color-coded strength bar.", bullet_style))
    story.append(Paragraph("• <b>Functional & Required Terms Checkbox:</b> The 'I agree to Terms & Conditions' checkbox is wrapped in a clickable label and strictly enforced. Attempting to submit without agreeing displays a red error alert.", bullet_style))
    story.append(Paragraph("• <b>Interactive Terms & Privacy Modal:</b> Popup dialog displaying IRDAI regulatory guidelines. Clicking 'I Understand & Agree' inside the modal automatically checks the registration checkbox.", bullet_style))
    story.append(Spacer(1, 8))

    # Page 4
    add_page_header("Page 4", "Policyholder Executive Dashboard", "/dashboard")
    story.append(Paragraph("<b>Primary Objective:</b> Central operational hub for policyholders, presenting executive summary cards for active policies, financial commitments, and claims.", body_style))
    story.append(Paragraph("<b>Detailed Technical & UI Workflows:</b>", h2_style))
    story.append(Paragraph("• <b>Active Policy Overview Cards:</b> Displays policy numbers, covered vehicle make/model, renewal dates, and status badges.", bullet_style))
    story.append(Paragraph("• <b>Monthly Financial Commitment Metric:</b> Shows total scheduled commitments vs. verified paid amounts.", bullet_style))
    story.append(Paragraph("• <b>Quick Action Launcher:</b> Direct links to file new claims, apply for policies, or manage billing.", bullet_style))
    story.append(Paragraph("• <b>Recent Activity Feed:</b> Displays recent claim updates, surveyor notes, and upcoming installment reminders.", bullet_style))

    story.append(PageBreak())

    # Page 5
    add_page_header("Page 5", "Policy Creation & Configurator Wizard", "/policies/create")
    story.append(Paragraph("<b>Primary Objective:</b> Guided multi-step wizard for configuring new vehicle insurance policies, choosing riders, and generating payment schedules.", body_style))
    story.append(Paragraph("<b>Detailed Technical & UI Workflows:</b>", h2_style))
    story.append(Paragraph("• <b>Vehicle Tiering Selector:</b> Custom choices for Cars / Sedans, Two-Wheelers / Bikes, SUVs / Crossovers, and Commercial Vehicles.", bullet_style))
    story.append(Paragraph("• <b>Dynamic IDV Calculation Formula:</b> Calculates Insured Declared Value (IDV):", bullet_style))
    story.append(Paragraph("<code>IDV = ExShowroomPrice * (1 - DepreciationRateByAge)</code>", code_style))
    story.append(Paragraph("• <b>Coverage Plan Selector:</b> Choose Comprehensive or Third-Party plans with Zero-Depreciation and NCB Protection riders.", bullet_style))
    story.append(Paragraph("• <b>Schedule Frequency Picker:</b> Select Annual (1x), Semi-Annual (2x), Quarterly (4x), or Monthly (12x) payment schedules.", bullet_style))
    story.append(Spacer(1, 8))

    # Page 6
    add_page_header("Page 6", "Active Policies Overview & Certificate Generator", "/applications & /policies/:id")
    story.append(Paragraph("<b>Primary Objective:</b> Displays policy details, vehicle specs, chassis numbers, and enables instant client-side PDF certificate downloads.", body_style))
    story.append(Paragraph("<b>Detailed Technical & UI Workflows:</b>", h2_style))
    story.append(Paragraph("• <b>Policy Certificate PDF Download:</b> Instant client-side PDF generation featuring policy schedules, vehicle specifications, IDV values, and IRDAI registration marks.", bullet_style))
    story.append(Paragraph("• <b>Policy Status Badging:</b> Real-time indicators for Active, Renewed, Expired, and Suspended states.", bullet_style))
    story.append(Paragraph("• <b>Annual Claim Capacity Meter:</b> Tracks claims filed against annual policy limits (max 2 claims/year allowed).", bullet_style))
    story.append(Spacer(1, 8))

    # Page 7
    add_page_header("Page 7", "Payments & Billing Ledger", "/payments")
    story.append(Paragraph("<b>Primary Objective:</b> Financial ledger for managing installment schedules, claiming prompt payment discounts, viewing policy dropdown logs, and downloading receipts.", body_style))
    story.append(Paragraph("<b>Detailed Technical & UI Workflows:</b>", h2_style))
    story.append(Paragraph("• <b>Interactive Schedule Calendar Widget:</b> Monthly calendar grid highlighting due dates, overdue items, and paid installments.", bullet_style))
    story.append(Paragraph("• <b>On-Time Premium Benefits Banner:</b> Real-time checker displaying 5% Prompt Payment Renewal Discounts and 100% No-Claim Bonus (NCB) protection status.", bullet_style))
    story.append(Paragraph("• <b>Policy-Grouped Accordions:</b> Installments are grouped under Policy Cards with expandable dropdown menus for clean viewing.", bullet_style))
    story.append(Paragraph("• <b>Active Payment Actions:</b> Clear, spacious <code>Pay ₹Amount</code> buttons on every row and <code>Pay All Pending (₹Total)</code> bulk payment buttons on policy headers.", bullet_style))
    story.append(Paragraph("• <b>Nearest Due Date Sorting Logic:</b> Payment items are sorted mathematically so due dates closest to today appear at the top:", bullet_style))
    story.append(Paragraph("<code>SortByDistance = Math.abs(new Date(item.dueDate).getTime() - Date.now())</code>", code_style))
    story.append(Paragraph("• <b>PDF Receipt & CSV Export:</b> Download official payment receipts in PDF format or export complete system payment logs to UTF-8 CSV files.", bullet_style))
    story.append(Spacer(1, 8))

    # Page 8
    add_page_header("Page 8", "Personal Claims Management & Payout Hub", "/claim-tracking")
    story.append(Paragraph("<b>Primary Objective:</b> Allows policyholders to track claim progress, run AI assessments, update statuses, and trigger payout settlements.", body_style))
    story.append(Paragraph("<b>Detailed Technical & UI Workflows:</b>", h2_style))
    story.append(Paragraph("• <b>Category Tabs:</b> Filter claims by state: All, Filed, Under Review, Approved, Closed, and Rejected.", bullet_style))
    story.append(Paragraph("• <b>Individual Claim Payout Button:</b> Each claim card features a green <code>Pay & Settle Payout (₹Amount)</code> button that marks the claim as Closed and records disbursement.", bullet_style))
    story.append(Paragraph("• <b>Bulk Claim Payout Button:</b> Top header action allowing one-click <code>Pay & Settle All Claims</code> for all active claims.", bullet_style))
    story.append(Paragraph("• <b>Claims Resolution Progress Meter:</b> Gradient progress bar calculating overall claim settlement percentage.", bullet_style))

    story.append(PageBreak())

    # Page 9
    add_page_header("Page 9", "Intimate a New Accident Claim", "/claims/create")
    story.append(Paragraph("<b>Primary Objective:</b> Accident intimation form featuring AI visual damage photo analysis and pre-claim probability scoring.", body_style))
    story.append(Paragraph("<b>Detailed Technical & UI Workflows:</b>", h2_style))
    story.append(Paragraph("• <b>Incident Information Form:</b> Date, time, location, accident description, and third-party details.", bullet_style))
    story.append(Paragraph("• <b>AI Photo Signature Scanner (<code>descriptionValidator.ts</code>):</b> Evaluates damage photos. Accepts photos of specific car sections (front bumper, rear bumper, fender, door) while rejecting non-vehicle appliance diagrams.", bullet_style))
    story.append(Paragraph("• <b>Pre-Claim Approval Score Matrix:</b> Scores description detail (50%), photo presence (30%), policy status (10%), and claim limits (10%).", bullet_style))
    story.append(Spacer(1, 8))

    # Page 10
    add_page_header("Page 10", "Detailed Claim Telemetry & Review", "/claims/:id")
    story.append(Paragraph("<b>Primary Objective:</b> Deep inspection view displaying damaged area breakdowns, cost estimates, surveyor notes, and claim reports.", body_style))
    story.append(Paragraph("<b>Detailed Technical & UI Workflows:</b>", h2_style))
    story.append(Paragraph("• <b>Damaged Area Grid:</b> Displays damaged points, severity levels (Critical, High, Moderate), and repair cost estimates.", bullet_style))
    story.append(Paragraph("• <b>Policy Capacity Cap Verifier:</b> Displays active policy status, annual claim cap headroom, and deductible rules.", bullet_style))
    story.append(Paragraph("• <b>Official Claim Report PDF Download:</b> Generates a formal claim audit report PDF featuring telemetry data, surveyor notes, and AI match scores.", bullet_style))
    story.append(Spacer(1, 8))

    # Page 11
    add_page_header("Page 11", "Admin Audit Logs & Security Portal", "/admin/audit-logs")
    story.append(Paragraph("<b>Primary Objective:</b> Security and compliance portal tracking system activities, administrative decisions, user authentication, and billing activities.", body_style))
    story.append(Paragraph("<b>Detailed Technical & UI Workflows:</b>", h2_style))
    story.append(Paragraph("• <b>System Event Tracking:</b> Records actions including PAYMENT, CREATE, APPROVE, REJECT, UPDATE, LOGIN, and UPLOAD.", bullet_style))
    story.append(Paragraph("• <b>Dynamic Payment Log Merging:</b> Payment transactions completed on the platform are dynamically recorded into audit logs with user IDs, timestamps, and policy numbers.", bullet_style))
    story.append(Paragraph("• <b>Multi-Criteria Filter Bar:</b> Filter by Action Type, User Role (Customer vs Admin), Search Query, and Time Range (Today, Week, Month, Quarter, Custom Date Range).", bullet_style))
    story.append(Paragraph("• <b>Audit Trail CSV Export:</b> Export complete system audit logs to UTF-8 CSV format for regulatory review.", bullet_style))
    story.append(Spacer(1, 8))

    # Page 12
    add_page_header("Page 12", "Terms & Regulatory Engine", "/terms")
    story.append(Paragraph("<b>Primary Objective:</b> Educational and analytical hub explaining policy terms, regulatory guidelines, Zero-Depreciation coverage, and NCB rules.", body_style))
    story.append(Paragraph("<b>Detailed Technical & UI Workflows:</b>", h2_style))
    story.append(Paragraph("• <b>IRDAI Guidelines Breakdown:</b> Explanations of own-damage vs. third-party liability rules.", bullet_style))
    story.append(Paragraph("• <b>NCB Protection Matrix:</b> Demonstrates how prompt payments protect No-Claim Bonus discounts across renewals.", bullet_style))
    story.append(Paragraph("• <b>Fraud Prevention & Intimation Rules:</b> Guidelines on document submissions and claim frequency limits.", bullet_style))

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=BRAND_NAVY, spaceBefore=4, spaceAfter=10))

    # Database Schema Reference Table
    story.append(Paragraph("3. Relational Database Schema & Data Dictionary", h1_style))
    db_data = [
        ["Table Name", "Primary Key", "Core Columns / Foreign Keys", "Description & Constraints"],
        ["users", "id (UUID)", "email, password_hash, role, phone", "System accounts (Customer, Admin) with role guards"],
        ["policies", "id (UUID)", "user_id, policy_number, vehicle_make, idv, status", "Active and expired motor insurance policies"],
        ["claims", "id (UUID)", "policy_id, claim_number, status, estimated_amount", "Filed accident claims with status tracking"],
        ["payments", "id (UUID)", "policy_id, due_date, amount, status, receipt_no", "Installment payment schedules and transaction logs"],
        ["audit_logs", "id (UUID)", "user_id, action, entity, entity_id, timestamp, ip", "System audit trail and dynamic payment logs"]
    ]
    db_table = Table(db_data, colWidths=[80, 70, 190, 200])
    db_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BRAND_NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('BOTTOMPADDING', (0,0), (-1,0), 4),
        ('TOPPADDING', (0,0), (-1,0), 4),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 7.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(db_table)

    # Build Document
    doc.build(story, canvasmaker=UltimateNumberedCanvas)
    print(f"Successfully generated Master PDF: {os.path.abspath(filename)}")

    # Copy to artifact path if available
    artifact_dir = r"C:\Users\meetl\.gemini\antigravity\brain\48573a55-7156-44d1-9c19-d9676bf3607e"
    if os.path.exists(artifact_dir):
        dest_pdf = os.path.join(artifact_dir, os.path.basename(filename))
        shutil.copyfile(filename, dest_pdf)
        print(f"Copied Master PDF to Artifact Directory: {dest_pdf}")

if __name__ == "__main__":
    build_pdf()
