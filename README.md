# Pipe Pressure Drop & Hydraulic Calculator
### Darcy-Weisbach & Colebrook-White System Resistance Analyzer

An engineering-grade hydraulic modeling application and Python/Streamlit script generator for computing pipe friction losses, minor component losses, total dynamic head (TDH), and pumping power requirements.

---

## 📌 Overview

This application implements the classical **Darcy-Weisbach** equation combined with the implicit **Colebrook-White** formula to determine fluid flow resistance and pressure drops in pressurized circular piping networks. It provides both a live interactive web-based simulation with Bento Grid architecture and a downloadable standalone **Python / Streamlit** script (`app.py`) for data scientists and process engineers.

---

## ✨ Key Features

- **Accurate Physics Engine**:
  - Exact Darcy-Weisbach frictional head loss and hydrostatic pressure drop calculations.
  - Robust **Newton-Raphson** numerical root finding for the implicit Colebrook-White friction factor equation with Swamee-Jain initial seed approximation.
  - Continuous cubic Hermite spline interpolation across the critical transition zone ($2{,}000 \le \text{Re} \le 4{,}000$) to prevent mathematical discontinuities.
  - Laminar flow regime handling via the analytical Poiseuille solution ($f = 64 / \text{Re}$).
  - Minor fitting losses via total resistance coefficient ($\sum K$) and static elevation head ($\Delta z$).
  - Hydraulic stream fluid power ($P_{\text{hyd}}$) and motor brake shaft power ($P_{\text{shaft}}$) based on pump efficiency ($\eta$).

- **Dual Unit System**:
  - **SI Metric**: Flow in $\text{m}^3/\text{h}$ or $\text{L/s}$, Diameter in $\text{mm}$, Length in $\text{m}$, Roughness in $\text{mm}$, Density in $\text{kg/m}^3$, Viscosity in $\text{cP}$ or $\text{Pa}\cdot\text{s}$, Pressure in $\text{kPa}$ / $\text{bar}$, Head in $\text{m}$, Power in $\text{kW}$.
  - **US Customary (Imperial)**: Flow in $\text{GPM}$, Diameter in $\text{inches}$, Length in $\text{ft}$, Roughness in $\text{inches}$, Density in $\text{lb/ft}^3$, Viscosity in $\text{cP}$, Pressure in $\text{psi}$, Head in $\text{ft}$, Power in $\text{HP}$.

- **Interactive System Resistance Curve**:
  - Dynamic Plotly-style SVG curve visualizing total head loss and pressure drop as a function of volumetric flow rate ($Q$).
  - Operating design point coordinate tracking with hover inspection.
  - Y-axis metric toggle between **Pressure Drop ($\Delta P$)** and **Total Dynamic Head ($\text{TDH}$)**.

- **Pandas DataFrame Results Grid**:
  - Formatted tabular breakdown of fluid mechanics parameters (flow regime, mean velocity, dynamic pressure, Reynolds number, relative roughness, friction factor, minor losses, head loss, pressure drop, hydraulic power).
  - Real-time search filter and one-click **Copy TSV** button for seamless pasting into Microsoft Excel or Google Sheets.

- **Python / Streamlit Code Generator & Exporter**:
  - View, copy, or download a single-file Python script (`app.py`) powered by `streamlit`, `pandas`, `numpy`, and `plotly`.

- **Engineering Theory Reference**:
  - Built-in engineering reference cards detailing the governing equations, boundary conditions, and mathematical formulations.

---

## 📐 Governing Equations & Formulas

### 1. Darcy-Weisbach Frictional Head Loss
$$h_f = f \cdot \left(\frac{L}{D}\right) \cdot \left(\frac{v^2}{2g}\right)$$

Where:
- $h_f$ = Frictional head loss ($\text{m}$ or $\text{ft}$)
- $f$ = Darcy-Weisbach friction factor (dimensionless)
- $L$ = Pipe length ($\text{m}$ or $\text{ft}$)
- $D$ = Pipe internal diameter ($\text{m}$ or $\text{ft}$)
- $v$ = Mean flow velocity $= \frac{4Q}{\pi D^2}$ ($\text{m/s}$ or $\text{ft/s}$)
- $g$ = Standard gravitational acceleration ($9.80665\,\text{m/s}^2$ or $32.174\,\text{ft/s}^2$)

### 2. Colebrook-White Implicit Equation (Turbulent Regime: $\text{Re} > 4{,}000$)
$$\frac{1}{\sqrt{f}} = -2 \log_{10}\left( \frac{\varepsilon / D}{3.7} + \frac{2.51}{\text{Re} \sqrt{f}} \right)$$

Solved iteratively using Newton-Raphson iteration:
$$F(x) = x + 2 \log_{10}\left( \frac{\varepsilon / D}{3.7} + \frac{2.51 x}{\text{Re}} \right) = 0 \quad \text{where } x = \frac{1}{\sqrt{f}}$$

### 3. Laminar Regime ($\text{Re} < 2{,}000$)
$$f = \frac{64}{\text{Re}}$$

### 4. Transition Zone ($2{,}000 \le \text{Re} \le 4{,}000$)
Evaluated via cubic Hermite polynomial interpolation between $f_{\text{laminar}}(2000) = 0.032$ and $f_{\text{turbulent}}(4000)$ to guarantee continuous differentiable transitions.

### 5. Total Dynamic Head & Pressure Drop
$$H_{\text{total}} = h_f + h_m + \Delta z = f \left(\frac{L}{D}\right) \left(\frac{v^2}{2g}\right) + \sum K \left(\frac{v^2}{2g}\right) + (z_{\text{discharge}} - z_{\text{suction}})$$

$$\Delta P_{\text{total}} = \rho \cdot g \cdot H_{\text{total}}$$

### 6. Hydraulic & Motor Shaft Power
$$P_{\text{hyd}} = \rho \cdot g \cdot Q \cdot H_{\text{total}} = Q \cdot \Delta P$$
$$P_{\text{shaft}} = \frac{P_{\text{hyd}}}{\eta_{\text{pump}}}$$

---

## 🗂️ Project Structure

```
├── index.html                  # HTML5 entry point
├── metadata.json               # Platform metadata & capability declarations
├── package.json                # Project dependencies & build scripts
├── vite.config.ts              # Vite + Tailwind CSS configuration
├── tsconfig.json               # TypeScript compiler configuration
├── README.md                   # Comprehensive project documentation
└── src/
    ├── main.tsx                # React application bootstrapping
    ├── App.tsx                 # Main application layout & state management
    ├── types.ts                # TypeScript interfaces & physics type models
    ├── index.css               # Global Tailwind CSS styles
    ├── components/
    │   ├── Header.tsx          # Top navigation bar, unit toggles, and actions
    │   ├── SidebarInputs.tsx   # Fluid, pipe geometry, and roughness input controls
    │   ├── ResultsTable.tsx    # KPI metric cards & Pandas DataFrame view
    │   ├── SystemCurveChart.tsx# Interactive SVG system resistance curve
    │   ├── PythonCodeViewer.tsx# Streamlit Python script viewer & exporter
    │   └── TheoryCard.tsx      # Engineering equations & theoretical reference
    └── utils/
        ├── hydraulicPhysics.ts # Core numerical hydraulic calculation engine
        └── pythonScript.ts     # Standalone Streamlit/Plotly Python script template
```

---

## 🚀 Getting Started

### Method 1: Web Application (React + Vite)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Local Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for Production**:
   ```bash
   npm run build
   ```

---

### Method 2: Running the Standalone Python / Streamlit App

You can export and run the calculations as a native Streamlit Python application on your machine:

1. **Install Python Prerequisites**:
   ```bash
   pip install streamlit pandas numpy plotly
   ```

2. **Download / Save the Python Script**:
   Copy the code from the **Python Code (app.py)** tab or click **Download app.py**.

3. **Launch the Streamlit App**:
   ```bash
   streamlit run app.py
   ```
   The interactive dashboard will launch at `http://localhost:8501`.

---

## 🧪 Built-in Presets

### Pipe Material Absolute Roughness ($\varepsilon$)
| Material | Absolute Roughness ($\text{mm}$) | Absolute Roughness ($\text{inches}$) |
| :--- | :--- | :--- |
| **Commercial Steel / Carbon Steel** | $0.045\,\text{mm}$ | $0.0018\,\text{in}$ |
| **PVC / HDPE / Drawn Tubing (Smooth)** | $0.0015\,\text{mm}$ | $0.00006\,\text{in}$ |
| **Stainless Steel** | $0.015\,\text{mm}$ | $0.0006\,\text{in}$ |
| **Drawn Brass / Copper** | $0.0015\,\text{mm}$ | $0.00006\,\text{in}$ |
| **Galvanized Iron** | $0.15\,\text{mm}$ | $0.006\,\text{in}$ |
| **Cast Iron (Unlined)** | $0.26\,\text{mm}$ | $0.0102\,\text{in}$ |
| **Smooth Concrete** | $0.30\,\text{mm}$ | $0.0118\,\text{in}$ |
| **Corroded / Encrusted Steel** | $1.20\,\text{mm}$ | $0.0472\,\text{in}$ |

### Fluid Properties ($20^\circ\text{C} / 68^\circ\text{F}$)
| Fluid | Density ($\rho$) | Dynamic Viscosity ($\mu$) |
| :--- | :--- | :--- |
| **Water (Fresh, $20^\circ\text{C}$)** | $998.2\,\text{kg/m}^3$ ($62.32\,\text{lb/ft}^3$) | $1.002\,\text{cP}$ ($1.002 \times 10^{-3}\,\text{Pa}\cdot\text{s}$) |
| **Seawater ($20^\circ\text{C}$)** | $1{,}025.0\,\text{kg/m}^3$ ($63.99\,\text{lb/ft}^3$) | $1.080\,\text{cP}$ ($1.080 \times 10^{-3}\,\text{Pa}\cdot\text{s}$) |
| **Engine Oil (SAE 30)** | $880.0\,\text{kg/m}^3$ ($54.94\,\text{lb/ft}^3$) | $290.0\,\text{cP}$ ($0.290\,\text{Pa}\cdot\text{s}$) |
| **Crude Oil (Light, $35^\circ\,\text{API}$)** | $850.0\,\text{kg/m}^3$ ($53.06\,\text{lb/ft}^3$) | $7.50\,\text{cP}$ ($0.0075\,\text{Pa}\cdot\text{s}$) |
| **Ethylene Glycol (50% Solution)** | $1{,}070.0\,\text{kg/m}^3$ ($66.80\,\text{lb/ft}^3$) | $3.50\,\text{cP}$ ($0.0035\,\text{Pa}\cdot\text{s}$) |
| **Diesel Fuel** | $830.0\,\text{kg/m}^3$ ($51.82\,\text{lb/ft}^3$) | $3.00\,\text{cP}$ ($0.0030\,\text{Pa}\cdot\text{s}$) |
| **Gasoline** | $740.0\,\text{kg/m}^3$ ($46.20\,\text{lb/ft}^3$) | $0.60\,\text{cP}$ ($0.0006\,\text{Pa}\cdot\text{s}$) |
| **Air ($20^\circ\text{C}, 1\,\text{atm}$)** | $1.204\,\text{kg/m}^3$ ($0.0752\,\text{lb/ft}^3$) | $0.0182\,\text{cP}$ ($1.82 \times 10^{-5}\,\text{Pa}\cdot\text{s}$) |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React Icons
- **Physics Engine**: Pure TypeScript implementation of Darcy-Weisbach and Colebrook-White equations
- **Export Framework**: Python 3.9+, Streamlit, Pandas, NumPy, Plotly Express
- **Build Tool**: Vite 6

---

## 📄 License

MIT License — free for academic, personal, and commercial engineering use.
