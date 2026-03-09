---

# CENTRAL REPORTING SYSTEM

# Reporting Logic & Goal Governance Specification

---

## 1. FIELD STRUCTURE ENHANCEMENT

### 1.1 Field-Level Commentary

Every reportable metric must support:

| Field       | Description              |
| ----------- | ------------------------ |
| Value Input | Numeric / Computed       |
| Comment     | Optional contextual note |

This applies to:

* Weekly Entries
* Monthly Entries
* Goals
* Achieved Values

Separate from:

* General Report Notes (existing)

---

### 1.2 New Data Structure

Each metric now has:

```
Metric Value
Metric Comment (optional)
Goal Value
Goal Comment (optional)
```

Use Case Examples:

| Scenario                | Comment                              |
| ----------------------- | ------------------------------------ |
| Sudden attendance spike | “Joint service with visiting campus” |
| Drop in salvation       | “Heavy rainfall weekend”             |
| High partnership        | “Special giving drive”               |

---

## 2. GOAL MANAGEMENT SYSTEM

Goals are **group-governed**.

---

### 2.1 Monthly Goal Ownership

Owned by:

> Group Admin

Scope:

* Entire Group (default)
* Specific Campuses (override)

---

### 2.2 Goal Creation Modes

Group Admin can set:

| Mode            | Description                    |
| --------------- | ------------------------------ |
| Annual Mode     | Set all 12 months at once      |
| Monthly Mode    | Set individual months          |
| Campus Override | Set different goals per campus |

---

### 2.3 Field-Specific Goals

Goals are set per:

* Strategic Indicator
* Key Metric

Example:

| Indicator  | Metric        | Goal |
| ---------- | ------------- | ---- |
| Attendance | Sunday Male   | 500  |
| Attendance | Sunday Female | 620  |

---

## 3. CUMULATIVE VS NON-CUMULATIVE METRICS

Derived from spreadsheet “MATRICS” column.

### 3.1 Cumulative Metrics

Examples:

* Church Planting
* Salvation
* Partnerships

Monthly value = Sum of weekly values

---

### 3.2 Averaged Metrics

Examples:

* Attendance

Monthly value = Average of weekly values

---

### 3.3 Snapshot Metrics

Examples:

* Number of Workers
* Cells

Monthly value = Last reported value

---

### 3.4 System Requirement

Each metric must be tagged:

```
calculationType:
- SUM
- AVERAGE
- SNAPSHOT
```

---

## 4. YEAR-ON-YEAR (YoY) LOGIC

YoY is NOT manual entry by default.

Primary Source:

> Same period last year

---

### 4.1 YoY Retrieval Hierarchy

System resolves YoY in this order:

| Priority | Source                    |
| -------- | ------------------------- |
| 1        | Previous Year Same Period |
| 2        | Group Admin Manual Entry  |
| 3        | Calculated Estimate       |
| 4        | Safe Zero                 |

---

### 4.2 Calculated Estimate Logic

Fallback estimate options:

* Previous month growth trend
* Rolling average
* Cumulative growth pattern

System must choose the most logical based on data availability.

---

## 5. GOAL EDIT GOVERNANCE

Once submitted:

Monthly Goal
Year-on-Year Goal

→ Become **Locked**

---

### 5.1 Unlock Request Flow

Group Admin must:

* Submit edit request
* Provide reason

Approval required from:

* Super Admin
* SPO
* CEO
* Church Ministry

---

### 5.2 Executive Privileges

Executive stakeholders can:

* Edit directly
* Approve edit requests
* Reject with note

---

## 6. GOAL HIERARCHY

Default:

```
Group Goal → Applies to all campuses
```

Override:

```
Campus Goal → Overrides group goal
```

---

## 7. ANALYTICS REQUIREMENTS

### 7.1 Date Configurability

Analytics must support:

* Weekly
* Monthly
* Quarterly
* Annual
* Custom range

---

### 7.2 Goal-Based Visualizations

Must include:

| Visualization     | Example     |
| ----------------- | ----------- |
| Goal vs Achieved  | Attendance  |
| YoY Growth        | Salvation   |
| Campus Comparison | Partnership |
| Cumulative Trend  | Cells       |

---

### 7.3 Metric-Type-Aware Charts

Charts must adapt based on:

| Type     | Chart         |
| -------- | ------------- |
| SUM      | Trend         |
| AVERAGE  | Rolling Line  |
| SNAPSHOT | Point-in-Time |

---

## 8. PERMISSION MODEL

| Action           | Group Admin | Exec Stakeholders |
| ---------------- | ----------- | ----------------- |
| Set Goals        | ✓           | ✓                 |
| Set All Months   | ✓           | ✓                 |
| Override Campus  | ✓           | ✓                 |
| Edit Locked Goal | ✗           | ✓                 |
| Request Edit     | ✓           | -                 |
| Approve Request  | -           | ✓                 |

---

## 9. DATA MODEL ADDITIONS (IMPORTANT FOR COPILOT)

### MetricDefinition

```
- id
- name
- calculationType
- reportingFrequency
```

---

### Goal

```
- id
- metricId
- groupId
- campusId (nullable)
- month
- year
- value
- yoyValue
- locked
```

---

### GoalEditRequest

```
- id
- goalId
- requestedBy
- reason
- status
```

---

### MetricEntry

```
- id
- metricId
- value
- comment
- week
- month
- campusId
```

---

## 10. SYSTEM BEHAVIOR SUMMARY

| Feature      | Behavior               |
| ------------ | ---------------------- |
| Comments     | Field-level supported  |
| Goals        | Group-driven           |
| YoY          | Auto-retrieved         |
| Missing Data | Logical fallback       |
| Locked Goals | Exec approval required |
| Analytics    | Goal-aware             |
| Metrics      | Typed                  |

---

This gives your Copilot:

* Data logic
* Governance rules
* Calculation logic
* Permissions

---
						
		REPORTING TEMPLATE									
		2026									
											
	MONTH										
	STRATEGIC INDICATOR	KEY MATRICS		GOAL	ACHIEVED	"% 
DIFFERENCE"	"YEAR ON 
YEAR"	"REPORTING 
FREQUENCY"	MATRICS	"OWNER OF REPORT IN 
CAMPUSES"	
	CHURCH PLANTING	"No of Churches to be 
planted"						"Monthly and 
Quarterly"	"Monthly Report:
Summation i.e. the total number after adding each of the month achieved figures"		
		No of Plant Cells and Small Group									
		No of Church Plant Cells 									
	ATTENDANCE	Sunday Attendance 	"Male 
"					Weekly, Monthly, Quarterly, Bi-annual, and Annual	"
Monthly Report: Average of the 4 Weeks or 5 Weeks depending on the month i.e. (W1+W2+W3+W4)/4"		
			Female								
			Children								
		First Timers									
		Worker Attendance									
		Growth Track Attendance									
		Growth Track Unique Attendance									
		Midweek Attendance									
		Workers Attendance: Midweek									
		Small Group Attendance									
		Montly Cell Leaders Attendance (Meeting)									
	NLP	No of NLP Cells						"Weekly and 
Monthly"	"Monthly Report:
Summation i.e. the total number after adding each of the week achieved figures"		
		NLP Leads									
		Mobilizers									
	SALVATION	Soul Saved in Service 						"Weekly and 
Monthly"	"Monthly Report:
Summation i.e. the total number after adding each of the week achieved figures"		
		Soul Saved in Cell									
		Soul Saved in Next Gen									
		No of People Baptized									
	SMALL GROUP	No of Small Group 						"Weekly and
Monthly"	"Monthly Report:
Cummulation i.e. the last reported data as at the end of the month"		
		No of Small Group Leaders									
		No of Assistant Cell Leaders									
		No of Cells that held									
	HAEF	Project Reach						"Monthly and 
Quarterly"			
		Project Impact									
	"DISCIPLESHIP
"	"Foundation Course 
Attendance "						"Quarterly and
Bi-Yearly"	"Monthly Report:
Summation i.e. the total number after adding each of the cohort achieved figures"		
		"Foundation Course 
Graduant"									
		ALC Attendance									
		BLC Attendance									
		PLC Attendance									
		CPC Attendance									
	PARTNERSHIP	No. of Partners						"Monthly and 
Quarterly"	"Monthly Report:
Summation i.e. the total number after adding each of the month achieved figures"		
	PROJECT	No. of Ongoing Project						"Monthly and 
Quarterly"	"Monthly Report:
Cummulation i.e. the last reported data as at the end of the month"		
		Project phase and closure									
	TRANSFORMATION	No of Testimonies						"Monthly and 
Quarterly"	"Monthly Report:
Cummulation i.e. the last reported data as at the end of the month or quartely"		
		No of Birth									
		No of Babies dedicated									
		No of Wedding									
	ASSIMILATION	No Assimilated into Small Groups 						"Monthly and 
Quarterly"	"Monthly Report:
Cummulation i.e. the last reported data as at the end of the month and quarter"		
		No Assimilated into Work Force									
		No of Workers									
		No of Leaders									
	NEXT GEN	Next Gen Attendance	"Kidzone
Stir House"					Weekly and Monthly 	Monthly Report: Average of the 4 Week i.e. (W1+W2+W3+W4)/4		
		First Timers	"Kidzone
Stir House"								
		Workers Attendance	"Kidzone
Stir House"								
		No of Baptized (Water)	"Kidzone
Stir House"					"Monthly and 
Quarterly"	"Monthly Report:
Cummulation i.e. the last reported data as at the end of the month and quarter"		
		No of Baptized (Holy Ghost)	"Kidzone
Stir House"								
		Next Gen Return Rate	"Kidzone
Stir House"								
		No of PD/PF Participant	"Kidzone
Stir House"								
		No of Teen Leaders	Stir House								
		No that Served 	"Kidzone
Stir House"								
		Parental Engaging Rate	"Kidzone
Stir House"								
									