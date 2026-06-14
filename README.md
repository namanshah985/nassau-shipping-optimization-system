# 🍬 Factory Reallocation & Shipping Optimization Recommendation System
### Nassau Candy Distributor · Unified Mentor Internship Project · 2026

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![ML](https://img.shields.io/badge/ML-Random%20Forest%20%7C%20Gradient%20Boosting-green?style=flat-square)
![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square)

---

## 📌 Project Overview

Nassau Candy Distributor manages **15 product SKUs** across **5 US manufacturing factories**. Current factory-to-product assignments use static legacy rules — causing suboptimal shipping distances, elevated lead times, and margin erosion.

This project delivers a **Decision Intelligence System** that:
- 🔮 **Predicts** shipping lead times under any factory-product-region configuration
- 🔁 **Simulates** all alternative factory reassignment scenarios
- 🏆 **Recommends** optimal reassignments ranked by lead-time reduction + profit impact
- ⚠️ **Alerts** on high-risk product-route combinations

---

## 🏭 Factory Network

| Factory | State | Coordinates |
|---------|-------|-------------|
| Lot's O' Nuts | AZ | 32.88°N, 111.77°W |
| Wicked Choccy's | GA | 32.08°N, 81.09°W |
| Sugar Shack | MN | 48.12°N, 96.18°W |
| Secret Factory | IL | 41.45°N, 90.57°W |
| The Other Factory | TN | 35.12°N, 89.97°W |

---

## 📊 Dashboard Modules

### 1. 🏭 Factory Optimization Simulator
Select product + region + ship mode → compare predicted lead times across all 5 factories. Best factory highlighted with improvement %.

### 2. 🔬 What-If Scenario Analysis
Side-by-side comparison of current vs. proposed factory assignment with lead time delta, profit impact ($), and Scenario Confidence Score.

### 3. 🏆 Recommendation Dashboard
Ranked reassignment list with **Optimization Priority Slider** (Speed ↔ Profit). Dynamically re-ranks as you adjust.

### 4. ⚠️ Risk & Impact Panel
Product risk classification (High / Medium / Low) by lead-time and margin risk with high-risk route alerts.

---

## 🤖 ML Models

| Model | RMSE | R² | Status |
|-------|------|----|--------|
| Linear Regression | 1.42 | 0.61 | Baseline |
| **Random Forest** | **0.87** | **0.83** | **Selected** |
| Gradient Boosting | 0.91 | 0.81 | Benchmark |

---

## 📈 Key Results

> Reassigning 4 high-risk Sugar Shack products to Secret Factory reduces West-region lead time by **27%** and generates **$5,446 in incremental annual profit** — Confidence Score: 89%.

---

## 🚀 Run the Dashboard

1. Copy `nassau_candy_optimizer.jsx` to [StackBlitz](https://stackblitz.com) (React template)
2. Paste and run — live URL generated instantly
3. Submit that URL as your Deployed Project Link

---

## 👤 Author

**Naman Shah** · MBA Semester 2 · Unified Mentor Internship 2026  
namanshah985@gmail.com
