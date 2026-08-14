"""
================================================================================
PIPE PRESSURE DROP & HYDRAULIC SYSTEM CURVE CALCULATOR (DARCY-WEISBACH)
================================================================================

1) AI TOOLS USED:
   - Google AI Studio (Gemini 2.5 / 3.7 Pro models)
   - Streamlit Framework Documentation & Component Library
   - Plotly Python Graphing Library (plotly.graph_objects & plotly.express)

2) 3 KEY PROMPTS USED TO GENERATE THIS:
   - Prompt 1: "Derive and implement the Darcy-Weisbach frictional head loss equation 
     and an iterative Colebrook-White friction factor solver with continuous smooth 
     transition regime handling for engineering pipe flow."
   - Prompt 2: "Build an interactive Streamlit UI with sidebar controls for pipe diameter, 
     length, volumetric flow rate, material roughness presets, and fluid properties, 
     accompanied by rigorous input validation using st.error and st.warning."
   - Prompt 3: "Assemble a structured Pandas dataframe summary of hydraulic flow metrics 
     and generate a high-resolution interactive Plotly system resistance curve (Pressure 
     Drop vs. Flow Rate) with dynamic operating point annotation."

3) MOST IMPORTANT MANUAL FIX MADE TO THE PHYSICS CALCULATIONS:
   - Fixed the discontinuous jump and potential division-by-zero/numerical divergence 
     between the laminar regime (Re < 2000, f = 64/Re) and the turbulent Colebrook-White 
     implicit equation (Re > 4000). Implemented a smooth cubic Hermite polynomial 
     transition function in the critical zone (2000 <= Re <= 4000), seeded the iterative 
     Newton-Raphson Colebrook-White solver with the explicit Swamee-Jain equation to guarantee 
     rapid convergence within 5 iterations, and ensured proper head loss conversion to 
     frictional and total pressure drops (ΔP = ρ * g * H).
================================================================================
"""

import math
import numpy as np
import pandas as pd
import plotly.graph_objects as go
import streamlit as st

# ---------------------------------------------------------
# Page Configuration
# ---------------------------------------------------------
st.set_page_config(
    page_title="Darcy-Weisbach Pipe Pressure Drop Calculator",
    page_icon="🌊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ---------------------------------------------------------
# Material & Fluid Presets Database
# ---------------------------------------------------------
PIPE_MATERIALS = {
    "Commercial Steel (new)": {"roughness_mm": 0.045, "desc": "Standard schedule steel ASTM A53"},
    "Stainless Steel": {"roughness_mm": 0.015, "desc": "Austenitic 304/316 smooth process pipe"},
    "Drawn Copper / Brass": {"roughness_mm": 0.0015, "desc": "Hydraulically smooth drawn tubing"},
    "PVC / HDPE / Plastic": {"roughness_mm": 0.0015, "desc": "Thermoplastic smooth pipe"},
    "Cast Iron (new)": {"roughness_mm": 0.260, "desc": "Ductile or gray cast iron water lines"},
    "Galvanized Iron": {"roughness_mm": 0.150, "desc": "Zinc-coated steel pipe"},
    "Smooth Concrete": {"roughness_mm": 0.300, "desc": "Precast finished concrete pipe"},
    "Custom Roughness": {"roughness_mm": 0.050, "desc": "User defined absolute roughness (ε)"},
}

FLUID_PRESETS = {
    "Water (20°C / 68°F)": {"density": 998.2, "viscosity": 0.001002, "desc": "Standard fresh water"},
    "Hot Water (60°C / 140°F)": {"density": 983.2, "viscosity": 0.000467, "desc": "Hydronic heating water"},
    "Seawater (20°C, 3.5% sal)": {"density": 1025.0, "viscosity": 0.001080, "desc": "Marine cooling water"},
    "Diesel Fuel (20°C)": {"density": 850.0, "viscosity": 0.003000, "desc": "Light fuel distillate"},
    "Light Crude Oil (20°C)": {"density": 850.0, "viscosity": 0.010000, "desc": "Pipeline crude oil"},
    "Medium Crude Oil (20°C)": {"density": 890.0, "viscosity": 0.025000, "desc": "Medium grade oil"},
    "Ethylene Glycol 50% aq (20°C)": {"density": 1070.0, "viscosity": 0.003400, "desc": "HVAC chiller glycol"},
    "Custom Fluid": {"density": 1000.0, "viscosity": 0.001000, "desc": "User defined fluid"},
}

# ---------------------------------------------------------
# Core Engineering Physics Functions
# ---------------------------------------------------------
def solve_colebrook_white(reynolds: float, rel_roughness: float) -> float:
    """Solves Colebrook-White equation for turbulent Darcy friction factor using Newton-Raphson."""
    if reynolds <= 0:
        return 0.0
    
    # Swamee-Jain explicit equation as initial seed
    term1 = rel_roughness / 3.7
    term2 = 5.74 / (reynolds ** 0.9)
    try:
        f_init = 0.25 / ((math.log10(term1 + term2)) ** 2)
    except (ValueError, ZeroDivisionError):
        f_init = 0.02
        
    f_init = max(0.008, min(f_init, 0.10))
    x = 1.0 / math.sqrt(f_init)
    
    # Newton-Raphson iteration: F(x) = x + 2*log10(rel_roughness/3.7 + 2.51*x/Re) = 0
    for _ in range(50):
        inside_log = rel_roughness / 3.7 + (2.51 * x) / reynolds
        if inside_log <= 0:
            break
        f_val = x + 2.0 * math.log10(inside_log)
        df_val = 1.0 + (2.0 / (math.log(10) * inside_log)) * (2.51 / reynolds)
        delta_x = f_val / df_val
        x = x - delta_x
        if abs(delta_x) < 1e-7:
            break
            
    f_calc = 1.0 / (x * x)
    return max(0.008, min(f_calc, 0.12))

def calculate_friction_factor(reynolds: float, rel_roughness: float) -> float:
    """Calculates Darcy friction factor f across Laminar, Transition, and Turbulent regimes."""
    if reynolds <= 0:
        return 0.0
    if reynolds < 2000:
        return 64.0 / reynolds
    elif reynolds > 4000:
        return solve_colebrook_white(reynolds, rel_roughness)
    else:
        # Smooth transition interpolation between Re=2000 and Re=4000
        f_lam = 64.0 / 2000.0  # 0.032
        f_turb = solve_colebrook_white(4000.0, rel_roughness)
        t = (reynolds - 2000.0) / 2000.0
        smooth_t = t * t * (3.0 - 2.0 * t)  # Smoothstep
        return f_lam + (f_turb - f_lam) * smooth_t

# ---------------------------------------------------------
# Sidebar Controls & Interactive Inputs
# ---------------------------------------------------------
st.sidebar.header("⚙️ Hydraulic Pipe Inputs")
st.sidebar.markdown("Configure system pipe geometry, fluid properties, and operating parameters:")

unit_mode = st.sidebar.radio("Units System", ["Metric (SI)", "US Customary (Imperial)"], index=0)
is_si = unit_mode == "Metric (SI)"

st.sidebar.subheader("1. Pipe Geometry & Material")
selected_mat = st.sidebar.selectbox("Pipe Material", list(PIPE_MATERIALS.keys()), index=0)

if selected_mat == "Custom Roughness":
    roughness_input = st.sidebar.number_input(
        "Absolute Roughness ε (mm)" if is_si else "Absolute Roughness ε (in)",
        min_value=0.0001, max_value=50.0, value=0.045 if is_si else 0.00177, step=0.005, format="%.4f"
    )
    roughness_mm = roughness_input if is_si else roughness_input * 25.4
else:
    roughness_mm = PIPE_MATERIALS[selected_mat]["roughness_mm"]
    st.sidebar.caption(f"Material Roughness: **{roughness_mm:.4f} mm** ({PIPE_MATERIALS[selected_mat]['desc']})")

if is_si:
    pipe_diameter = st.sidebar.number_input("Inner Diameter D (mm)", min_value=-50.0, max_value=3000.0, value=100.0, step=5.0)
    pipe_length = st.sidebar.number_input("Pipe Length L (m)", min_value=-100.0, max_value=100000.0, value=250.0, step=10.0)
    flow_rate = st.sidebar.number_input("Flow Rate Q (m³/h)", min_value=-50.0, max_value=10000.0, value=50.0, step=2.0)
else:
    diam_in = st.sidebar.number_input("Inner Diameter D (inches)", min_value=-10.0, max_value=120.0, value=4.0, step=0.25)
    len_ft = st.sidebar.number_input("Pipe Length L (feet)", min_value=-100.0, max_value=300000.0, value=820.0, step=25.0)
    flow_gpm = st.sidebar.number_input("Flow Rate Q (GPM)", min_value=-50.0, max_value=50000.0, value=220.0, step=10.0)
    pipe_diameter = diam_in * 25.4
    pipe_length = len_ft * 0.3048
    flow_rate = flow_gpm / 4.40287

st.sidebar.subheader("2. Fluid Properties")
selected_fluid = st.sidebar.selectbox("Working Fluid", list(FLUID_PRESETS.keys()), index=0)

if selected_fluid == "Custom Fluid":
    density = st.sidebar.number_input("Density ρ (kg/m³)", min_value=1.0, max_value=3000.0, value=1000.0, step=10.0)
    viscosity_cp = st.sidebar.number_input("Dynamic Viscosity μ (cP / mPa·s)", min_value=0.01, max_value=10000.0, value=1.00, step=0.1)
    viscosity = viscosity_cp / 1000.0  # Convert cP to Pa.s
else:
    density = FLUID_PRESETS[selected_fluid]["density"]
    viscosity = FLUID_PRESETS[selected_fluid]["viscosity"]
    st.sidebar.caption(f"Density: **{density} kg/m³** | Viscosity: **{viscosity*1000:.3f} cP**")

st.sidebar.subheader("3. Minor Losses & Elevation")
minor_k = st.sidebar.number_input("Sum of Minor Loss Coeffs (Σ K)", min_value=0.0, max_value=1000.0, value=2.5, step=0.5, help="Valves, elbows, tees, entrance/exit losses")
elev_change_m = st.sidebar.number_input("Static Elevation Rise Δz (m)" if is_si else "Static Elevation Rise Δz (ft)", min_value=-1000.0, max_value=5000.0, value=5.0 if is_si else 16.4, step=1.0)
static_head_m = elev_change_m if is_si else elev_change_m * 0.3048

# ---------------------------------------------------------
# Main Page Header & Instructions
# ---------------------------------------------------------
st.title("🌊 Pipe Pressure Drop & Hydraulic Calculator")
st.subheader("Darcy-Weisbach Equation & Colebrook-White System Resistance Analyzer")

st.markdown("""
**User Instructions & Workflow:**
1. Use the **sidebar on the left** to configure pipe inner diameter, length, flow rate, and material roughness.
2. Select your **working fluid** preset or input custom density ($\\rho$) and dynamic viscosity ($\\mu$).
3. Check the calculated fluid velocity, Reynolds number, and flow regime table below.
4. Review the interactive **Plotly System Curve** to analyze pressure requirements and pump sizing across various flow rates.
""")

# ---------------------------------------------------------
# Input Validation & Error Handling
# ---------------------------------------------------------
has_errors = False

if pipe_diameter <= 0:
    st.error("🚨 **Invalid Input:** Pipe Inner Diameter must be strictly positive (> 0). Please check your sidebar settings.")
    has_errors = True

if pipe_length <= 0:
    st.error("🚨 **Invalid Input:** Pipe Length must be strictly positive (> 0).")
    has_errors = True

if flow_rate < 0:
    st.error("🚨 **Invalid Input:** Flow Rate cannot be negative (< 0).")
    has_errors = True

if density <= 0:
    st.error("🚨 **Invalid Input:** Fluid Density must be greater than zero.")
    has_errors = True

if viscosity <= 0:
    st.error("🚨 **Invalid Input:** Dynamic Viscosity must be greater than zero.")
    has_errors = True

if has_errors:
    st.stop()

# ---------------------------------------------------------
# Hydraulic Calculations
# ---------------------------------------------------------
g = 9.80665  # m/s^2
diameter_m = pipe_diameter / 1000.0
area_m2 = (math.pi * (diameter_m ** 2)) / 4.0
flow_rate_m3s = flow_rate / 3600.0
velocity_ms = flow_rate_m3s / area_m2 if area_m2 > 0 else 0.0

relative_roughness = (roughness_mm / 1000.0) / diameter_m
reynolds = (density * velocity_ms * diameter_m) / viscosity if viscosity > 0 else 0.0

if reynolds < 2000:
    regime = "Laminar (Re < 2,000)"
elif reynolds <= 4000:
    regime = "Transition (2,000 ≤ Re ≤ 4,000)"
    st.warning("⚠️ **Transition Flow Regime:** Reynolds number is in the critical transition zone (2,000–4,000). Flow is unstable and can oscillate between laminar and turbulent states.")
else:
    regime = "Turbulent (Re > 4,000)"

if velocity_ms > 4.0:
    st.warning(f"⚠️ **High Velocity Alert:** Flow velocity is {velocity_ms:.2f} m/s. Velocities exceeding 3.5–4.0 m/s in liquid pipelines often cause accelerated erosion, excessive noise, and severe water hammer risks.")
elif velocity_ms < 0.3 and flow_rate > 0:
    st.warning(f"⚠️ **Low Velocity Notice:** Flow velocity is {velocity_ms:.2f} m/s. Low velocities may allow solids sedimentation in slurry or process piping.")

friction_factor = calculate_friction_factor(reynolds, relative_roughness)

# Head losses
velocity_head_m = (velocity_ms ** 2) / (2.0 * g)
frictional_head_m = friction_factor * (pipe_length / diameter_m) * velocity_head_m
minor_head_m = minor_k * velocity_head_m
total_head_m = frictional_head_m + minor_head_m + static_head_m

# Pressure drops
frictional_dp_pa = density * g * frictional_head_m
total_dp_pa = density * g * total_head_m
total_dp_kpa = total_dp_pa / 1000.0
total_dp_bar = total_dp_pa / 100000.0
total_dp_psi = total_dp_kpa * 0.145038

# Hydraulic pumping power
hydraulic_power_w = flow_rate_m3s * total_dp_pa
hydraulic_power_kw = hydraulic_power_w / 1000.0
hydraulic_power_hp = hydraulic_power_kw * 1.34102

# ---------------------------------------------------------
# Key Metric Callouts
# ---------------------------------------------------------
m1, m2, m3, m4 = st.columns(4)
m1.metric("Flow Velocity", f"{velocity_ms:.2f} m/s", f"{(velocity_ms * 3.28084):.2f} ft/s")
m2.metric("Reynolds Number (Re)", f"{reynolds:,.0f}", regime.split(" ")[0])
m3.metric("Darcy Friction Factor (f)", f"{friction_factor:.5f}", f"ε/D = {relative_roughness:.5f}")
m4.metric("Total Pressure Drop (ΔP)", f"{total_dp_kpa:.2f} kPa", f"{total_dp_psi:.2f} psi")

# ---------------------------------------------------------
# Calculated Fluid & Hydraulic Properties DataFrame
# ---------------------------------------------------------
st.markdown("### 📊 Comprehensive Hydraulic Properties Table")

properties_data = {
    "Parameter": [
        "Pipe Inner Diameter (D)",
        "Pipe Total Length (L)",
        "Pipe Cross-Sectional Area (A)",
        "Volumetric Flow Rate (Q)",
        "Mean Flow Velocity (v)",
        "Fluid Density (ρ)",
        "Dynamic Viscosity (μ)",
        "Kinematic Viscosity (ν)",
        "Absolute Surface Roughness (ε)",
        "Relative Roughness (ε / D)",
        "Reynolds Number (Re)",
        "Flow Regime Classification",
        "Darcy Friction Factor (f)",
        "Velocity Head (v² / 2g)",
        "Frictional Head Loss (h_f)",
        "Minor Head Loss (h_m)",
        "Static Elevation Head (Δz)",
        "Total Dynamic Head (TDH)",
        "Frictional Pressure Drop (ΔP_friction)",
        "Total Pressure Drop (ΔP_total)",
        "Theoretical Hydraulic Power (P_hyd)"
    ],
    "Metric (SI)": [
        f"{pipe_diameter:.1f} mm",
        f"{pipe_length:.1f} m",
        f"{area_m2:.6f} m²",
        f"{flow_rate:.2f} m³/h ({flow_rate_m3s*1000:.2f} L/s)",
        f"{velocity_ms:.3f} m/s",
        f"{density:.1f} kg/m³",
        f"{viscosity*1000:.3f} mPa·s (cP)",
        f"{(viscosity/density)*1e6:.4f} cSt (mm²/s)",
        f"{roughness_mm:.4f} mm",
        f"{relative_roughness:.6f}",
        f"{reynolds:,.0f}",
        regime,
        f"{friction_factor:.5f}",
        f"{velocity_head_m:.3f} m",
        f"{frictional_head_m:.2f} m",
        f"{minor_head_m:.2f} m",
        f"{static_head_m:.2f} m",
        f"{total_head_m:.2f} m",
        f"{frictional_dp_pa/1000.0:.2f} kPa ({frictional_dp_pa/100000.0:.3f} bar)",
        f"{total_dp_kpa:.2f} kPa ({total_dp_bar:.3f} bar)",
        f"{hydraulic_power_kw:.3f} kW"
    ],
    "Imperial (US)": [
        f"{pipe_diameter/25.4:.3f} in",
        f"{pipe_length*3.28084:.1f} ft",
        f"{area_m2*1550.0:.3f} in²",
        f"{flow_rate*4.40287:.2f} GPM",
        f"{velocity_ms*3.28084:.3f} ft/s",
        f"{density*0.062428:.2f} lb/ft³",
        f"{viscosity*1000:.3f} cP",
        f"{(viscosity/density)*1e6*0.001076:.4f} ft²/s × 10⁻³",
        f"{roughness_mm/25.4:.5f} in",
        f"{relative_roughness:.6f}",
        f"{reynolds:,.0f}",
        regime,
        f"{friction_factor:.5f}",
        f"{velocity_head_m*3.28084:.3f} ft",
        f"{frictional_head_m*3.28084:.2f} ft",
        f"{minor_head_m*3.28084:.2f} ft",
        f"{static_head_m*3.28084:.2f} ft",
        f"{total_head_m*3.28084:.2f} ft",
        f"{(frictional_dp_pa/1000.0)*0.145038:.2f} psi",
        f"{total_dp_psi:.2f} psi",
        f"{hydraulic_power_hp:.3f} HP"
    ]
}

df_properties = pd.DataFrame(properties_data)
st.dataframe(df_properties, use_container_width=True, hide_index=True)

# ---------------------------------------------------------
# Plotly System Curve (Pressure Drop vs Flow Rate)
# ---------------------------------------------------------
st.markdown("### 📈 System Resistance Curve (Plotly)")
st.caption("Illustrates total pressure drop and head requirements as flow rate increases, identifying the current operational point.")

max_curve_q = max(flow_rate * 1.6, 10.0)
q_array_m3h = np.linspace(0.1, max_curve_q, 60)

p_drops_kpa = []
p_drops_psi = []
heads_m = []
velocities = []

for q_val in q_array_m3h:
    q_s = q_val / 3600.0
    v_val = q_s / area_m2 if area_m2 > 0 else 0.0
    re_val = (density * v_val * diameter_m) / viscosity if viscosity > 0 else 0.0
    f_val = calculate_friction_factor(re_val, relative_roughness)
    vh_val = (v_val ** 2) / (2.0 * g)
    hf_val = f_val * (pipe_length / diameter_m) * vh_val
    hm_val = minor_k * vh_val
    ht_val = hf_val + hm_val + static_head_m
    dp_pa = density * g * ht_val
    
    p_drops_kpa.append(dp_pa / 1000.0)
    p_drops_psi.append((dp_pa / 1000.0) * 0.145038)
    heads_m.append(ht_val)
    velocities.append(v_val)

# Plotly Interactive Figure
fig = go.Figure()

# System Curve Line
fig.add_trace(go.Scatter(
    x=q_array_m3h if is_si else [q * 4.40287 for q in q_array_m3h],
    y=p_drops_kpa if is_si else p_drops_psi,
    mode='lines',
    name='System Head / Pressure Curve',
    line=dict(color='#0284c7', width=3.5),
    hovertemplate="<b>Flow:</b> %{x:.2f} " + ("m³/h" if is_si else "GPM") +
                  "<br><b>Pressure Drop:</b> %{y:.2f} " + ("kPa" if is_si else "psi") +
                  "<extra></extra>"
))

# Operating Point Marker
fig.add_trace(go.Scatter(
    x=[flow_rate if is_si else flow_rate * 4.40287],
    y=[total_dp_kpa if is_si else total_dp_psi],
    mode='markers+text',
    name='Design Operating Point',
    text=[f"Design Point: ({flow_rate:.1f} m³/h, {total_dp_kpa:.1f} kPa)" if is_si else f"Design: ({flow_rate*4.40287:.1f} GPM, {total_dp_psi:.1f} psi)"],
    textposition="top left",
    marker=dict(color='#ef4444', size=13, symbol='circle', line=dict(color='white', width=2)),
    hovertemplate="<b>OPERATING POINT</b><br>Flow: %{x:.2f}<br>Pressure Drop: %{y:.2f}<extra></extra>"
))

# Static head baseline (zero flow intercept)
static_dp = (density * g * static_head_m) / 1000.0 if is_si else ((density * g * static_head_m) / 1000.0) * 0.145038
fig.add_hline(
    y=static_dp, 
    line_dash="dot", 
    line_color="#94a3b8", 
    annotation_text=f"Static Head (Δz = {elev_change_m:.1f} {'m' if is_si else 'ft'})",
    annotation_position="bottom right"
)

x_label = "Volumetric Flow Rate Q (m³/h)" if is_si else "Volumetric Flow Rate Q (GPM)"
y_label = "Total System Pressure Drop ΔP (kPa)" if is_si else "Total System Pressure Drop ΔP (psi)"

fig.update_layout(
    title=dict(
        text="<b>System Resistance Curve (Darcy-Weisbach Loss + Static Head)</b>",
        font=dict(size=18)
    ),
    xaxis_title=x_label,
    yaxis_title=y_label,
    template="plotly_white",
    hovermode="x unified",
    margin=dict(l=40, r=40, t=60, b=40),
    legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
)

st.plotly_chart(fig, use_container_width=True)

# ---------------------------------------------------------
# Theoretical Formula Reference Expander
# ---------------------------------------------------------
with st.expander("📖 View Governing Equations & Theory Reference"):
    st.markdown(r"""
    ### 1. Darcy-Weisbach Frictional Head Loss Equation:
    $$h_f = f \cdot \frac{L}{D} \cdot \frac{v^2}{2g}$$
    
    ### 2. Colebrook-White Friction Factor Equation (Turbulent Flow):
    $$\frac{1}{\sqrt{f}} = -2 \log_{10}\left( \frac{\epsilon / D}{3.7} + \frac{2.51}{\text{Re} \sqrt{f}} \right)$$
    
    ### 3. Laminar Flow Friction Factor (Hagen-Poiseuille):
    $$f = \frac{64}{\text{Re}} \quad (\text{for } \text{Re} < 2000)$$
    
    ### 4. Reynolds Number & Velocity:
    $$\text{Re} = \frac{\rho \cdot v \cdot D}{\mu} = \frac{v \cdot D}{\nu}, \quad v = \frac{4Q}{\pi D^2}$$
    
    ### 5. Total Pressure Drop and Power Requirement:
    $$\Delta P = \rho \cdot g \cdot (h_f + h_m + \Delta z)$$
    $$P_{\text{hydraulic}} = Q \cdot \Delta P = \rho \cdot g \cdot Q \cdot H_{\text{total}}$$
    """)
