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

