import { PipeMaterial, FluidPreset, CalculationInputs, CalculationResults } from '../types';

export const PIPE_MATERIALS: Record<string, PipeMaterial> = {
  commercial_steel: {
    name: 'Commercial Steel (new)',
    roughnessMm: 0.045,
    description: 'Standard carbon steel schedule pipes (ASTM A53/A106)',
  },
  stainless_steel: {
    name: 'Stainless Steel',
    roughnessMm: 0.015,
    description: 'Cleaned austenitic stainless steel (304/316)',
  },
  drawn_copper_brass: {
    name: 'Drawn Copper / Brass',
    roughnessMm: 0.0015,
    description: 'Extruded seamless tubing for HVAC and plumbing',
  },
  pvc_plastic: {
    name: 'PVC / HDPE / Plastic',
    roughnessMm: 0.0015,
    description: 'Hydraulically smooth thermoplastic polymer pipes',
  },
  cast_iron: {
    name: 'Cast Iron (new)',
    roughnessMm: 0.26,
    description: 'Standard ductile or gray cast iron water mains',
  },
  galvanized_iron: {
    name: 'Galvanized Iron',
    roughnessMm: 0.15,
    description: 'Zinc-coated steel or wrought iron pipe',
  },
  concrete_smooth: {
    name: 'Smooth Concrete',
    roughnessMm: 0.30,
    description: 'Pre-cast finished concrete culverts and penstocks',
  },
  custom: {
    name: 'Custom Absolute Roughness (ε)',
    roughnessMm: 0.05,
    description: 'User-specified internal surface roughness',
  },
};

export const FLUID_PRESETS: Record<string, FluidPreset> = {
  water_20c: {
    name: 'Water (20°C / 68°F)',
    density: 998.2, // kg/m^3
    viscosity: 0.001002, // Pa.s = 1.002 cP
    description: 'Standard municipal/potable water at room temperature',
  },
  water_60c: {
    name: 'Water (Hot, 60°C / 140°F)',
    density: 983.2,
    viscosity: 0.000467,
    description: 'Hot domestic or process water loop',
  },
  seawater_20c: {
    name: 'Seawater (3.5% salinity, 20°C)',
    density: 1025.0,
    viscosity: 0.00108,
    description: 'Marine cooling and offshore piping systems',
  },
  diesel_fuel: {
    name: 'Diesel Fuel #2 (20°C)',
    density: 850.0,
    viscosity: 0.0030,
    description: 'Light hydrocarbon distillate fuel',
  },
  crude_oil_light: {
    name: 'Light Crude Oil (35° API, 20°C)',
    density: 850.0,
    viscosity: 0.010,
    description: 'Typical pipeline crude oil',
  },
  crude_oil_medium: {
    name: 'Medium Crude Oil (20°C)',
    density: 890.0,
    viscosity: 0.025,
    description: 'Medium viscosity petroleum liquid',
  },
  ethylene_glycol_50: {
    name: 'Ethylene Glycol (50% aq. solution, 20°C)',
    density: 1070.0,
    viscosity: 0.0034,
    description: 'HVAC chiller antifreeze and hydronic heat transfer fluid',
  },
  sae30_oil: {
    name: 'Lube Oil (SAE 30, 20°C)',
    density: 890.0,
    viscosity: 0.290,
    description: 'High viscosity industrial lubricating oil',
  },
  custom: {
    name: 'Custom Fluid Properties',
    density: 1000.0,
    viscosity: 0.001,
    description: 'User-specified density and dynamic viscosity',
  },
};

/**
 * Calculates Darcy friction factor f using the Colebrook-White equation:
 * 1 / sqrt(f) = -2 * log10( (epsilon / D) / 3.7 + 2.51 / (Re * sqrt(f)) )
 * 
 * Includes:
 * - Laminar regime (Re < 2000): f = 64 / Re (Hagen-Poiseuille)
 * - Turbulent regime (Re > 4000): Colebrook-White iterative solution via Newton-Raphson
 * - Critical / Transition regime (2000 <= Re <= 4000): Cubic Hermite transition to avoid discontinuities
 */
export function calculateFrictionFactor(Re: number, relativeRoughness: number): number {
  if (Re <= 0) return 0;

  // 1. Laminar Flow
  if (Re < 2000) {
    return 64.0 / Re;
  }

  // Helper: Colebrook-White solver for turbulent regime
  const solveColebrookWhite = (reynolds: number, relRough: number): number => {
    // Initial guess using Swamee-Jain explicit formula (1976)
    const term1 = relRough / 3.7;
    const term2 = 5.74 / Math.pow(reynolds, 0.9);
    const sjDenominator = Math.log10(term1 + term2);
    let f = 0.25 / Math.pow(sjDenominator, 2);

    // Guard initial value
    if (isNaN(f) || f <= 0.005 || f > 0.15) {
      f = 0.02;
    }

    // Newton-Raphson root finding on F(x) = x + 2*log10(relRough/3.7 + 2.51*x/Re) = 0 where x = 1/sqrt(f)
    let x = 1.0 / Math.sqrt(f);
    const maxIter = 50;
    const tolerance = 1e-7;

    for (let i = 0; i < maxIter; i++) {
      const insideLog = relRough / 3.7 + (2.51 * x) / reynolds;
      if (insideLog <= 0) break;
      
      const F = x + 2.0 * Math.log10(insideLog);
      // Derivative dF/dx: 1 + 2 / (ln(10) * insideLog) * (2.51 / reynolds)
      const dF = 1.0 + (2.0 / (Math.LN10 * insideLog)) * (2.51 / reynolds);
      
      const deltaX = F / dF;
      x = x - deltaX;
      
      if (Math.abs(deltaX) < tolerance) {
        break;
      }
    }

    const calculatedF = 1.0 / (x * x);
    return Math.max(0.008, Math.min(calculatedF, 0.12));
  };

  // 2. Turbulent Flow
  if (Re > 4000) {
    return solveColebrookWhite(Re, relativeRoughness);
  }

  // 3. Transition Zone (2000 <= Re <= 4000)
  // Continuous smooth interpolation between laminar at 2000 and turbulent at 4000
  const fLaminar2000 = 64.0 / 2000.0; // 0.032
  const fTurbulent4000 = solveColebrookWhite(4000, relativeRoughness);
  
  // Normalized transition factor t from 0 to 1
  const t = (Re - 2000.0) / 2000.0;
  // Smoothstep interpolation (3t^2 - 2t^3)
  const smoothT = t * t * (3.0 - 2.0 * t);
  return fLaminar2000 + (fTurbulent4000 - fLaminar2000) * smoothT;
}

export function computeHydraulics(inputs: CalculationInputs): CalculationResults {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validation
  if (inputs.diameterMm <= 0) {
    errors.push('Pipe Inner Diameter must be strictly positive (> 0 mm / in).');
  }
  if (inputs.lengthM <= 0) {
    errors.push('Pipe Length must be strictly positive (> 0 m / ft).');
  }
  if (inputs.flowRateM3h < 0) {
    errors.push('Flow rate cannot be negative.');
  }

  const roughnessMm = inputs.materialKey === 'custom'
    ? inputs.customRoughnessMm
    : (PIPE_MATERIALS[inputs.materialKey]?.roughnessMm ?? 0.045);

  if (roughnessMm < 0) {
    errors.push('Pipe roughness (ε) cannot be negative.');
  }

  const density = inputs.fluidKey === 'custom'
    ? inputs.customDensity
    : (FLUID_PRESETS[inputs.fluidKey]?.density ?? 998.2);

  const viscosity = inputs.fluidKey === 'custom'
    ? inputs.customViscosity
    : (FLUID_PRESETS[inputs.fluidKey]?.viscosity ?? 0.001002);

  if (density <= 0) {
    errors.push('Fluid density must be greater than 0 kg/m³.');
  }
  if (viscosity <= 0) {
    errors.push('Fluid dynamic viscosity must be greater than 0 Pa·s.');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
      diameterM: 0,
      areaM2: 0,
      flowRateM3s: 0,
      velocityMs: 0,
      density: Math.max(1, density),
      dynamicViscosity: Math.max(1e-6, viscosity),
      kinematicViscosity: 0,
      relativeRoughness: 0,
      reynoldsNumber: 0,
      flowRegime: 'Laminar',
      frictionFactor: 0,
      velocityHeadM: 0,
      frictionalHeadLossM: 0,
      minorHeadLossM: 0,
      staticHeadM: 0,
      totalHeadLossM: 0,
      frictionalPressureDropKPa: 0,
      totalPressureDropKPa: 0,
      totalPressureDropBar: 0,
      totalPressureDropPsi: 0,
      hydraulicPowerKw: 0,
      shaftPowerKw: 0,
      hydraulicPowerHp: 0,
      systemCurve: [],
    };
  }

  const g = 9.80665; // m/s^2
  const diameterM = inputs.diameterMm / 1000.0;
  const areaM2 = (Math.PI * Math.pow(diameterM, 2)) / 4.0;
  const flowRateM3s = inputs.flowRateM3h / 3600.0;
  const velocityMs = areaM2 > 0 ? flowRateM3s / areaM2 : 0;

  const kinematicViscosity = viscosity / density;
  const relativeRoughness = (roughnessMm / 1000.0) / diameterM;

  const reynoldsNumber = (density * velocityMs * diameterM) / viscosity;

  let flowRegime: 'Laminar' | 'Transition' | 'Turbulent' = 'Laminar';
  if (reynoldsNumber < 2000) {
    flowRegime = 'Laminar';
  } else if (reynoldsNumber <= 4000) {
    flowRegime = 'Transition';
    warnings.push('Reynolds number is in the critical transition zone (2,000 ≤ Re ≤ 4,000). Flow is unstable and can oscillate between laminar and turbulent states.');
  } else {
    flowRegime = 'Turbulent';
  }

  if (velocityMs > 4.0) {
    warnings.push(`High flow velocity (${velocityMs.toFixed(2)} m/s). Velocities above 3-4 m/s in liquid pipes often cause excessive noise, erosion, and water hammer vulnerability.`);
  } else if (velocityMs < 0.3 && inputs.flowRateM3h > 0) {
    warnings.push(`Low flow velocity (${velocityMs.toFixed(2)} m/s). Low velocity can cause sedimentation or particle settling in slurry/process lines.`);
  }

  const frictionFactor = calculateFrictionFactor(reynoldsNumber, relativeRoughness);

  // Velocity head: v^2 / (2g)
  const velocityHeadM = (velocityMs * velocityMs) / (2 * g);

  // Darcy-Weisbach frictional head loss: h_f = f * (L / D) * (v^2 / 2g)
  const frictionalHeadLossM = frictionFactor * (inputs.lengthM / diameterM) * velocityHeadM;

  // Minor head loss: h_m = K * (v^2 / 2g)
  const minorLossK = Math.max(0, inputs.minorLossK || 0);
  const minorHeadLossM = minorLossK * velocityHeadM;

  // Static head (elevation difference): delta_z
  const staticHeadM = inputs.elevationChangeM || 0;

  // Total head required: h_total = h_f + h_m + delta_z
  const totalHeadLossM = frictionalHeadLossM + minorHeadLossM + staticHeadM;

  // Pressure drops: Delta P = rho * g * h
  const frictionalPressureDropPa = density * g * frictionalHeadLossM;
  const frictionalPressureDropKPa = frictionalPressureDropPa / 1000.0;

  const totalPressureDropPa = density * g * totalHeadLossM;
  const totalPressureDropKPa = totalPressureDropPa / 1000.0;
  const totalPressureDropBar = totalPressureDropPa / 100000.0;
  const totalPressureDropPsi = totalPressureDropKPa * 0.145038;

  // Hydraulic power: P = Q * Delta P = rho * g * Q * H
  const hydraulicPowerW = flowRateM3s * totalPressureDropPa;
  const hydraulicPowerKw = hydraulicPowerW / 1000.0;
  const hydraulicPowerHp = hydraulicPowerKw * 1.34102;
  const efficiencyDecimal = Math.max(0.1, Math.min(1.0, (inputs.pumpEfficiency || 75) / 100.0));
  const shaftPowerKw = hydraulicPowerKw > 0 ? hydraulicPowerKw / efficiencyDecimal : 0;

  // Generate System Curve points (0 to 1.6x operating flow rate)
  const systemCurve: Array<{
    flowRateM3h: number;
    flowRateGpm: number;
    pressureDropKPa: number;
    pressureDropPsi: number;
    headLossM: number;
    headLossFt: number;
    frictionFactor: number;
    velocityMs: number;
  }> = [];

  const maxQ = Math.max(inputs.flowRateM3h * 1.6, 5.0);
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const qCurM3h = (maxQ / steps) * i;
    const qCurM3s = qCurM3h / 3600.0;
    const vCur = areaM2 > 0 ? qCurM3s / areaM2 : 0;
    const reCur = (density * vCur * diameterM) / viscosity;
    const fCur = calculateFrictionFactor(reCur, relativeRoughness);
    const vHeadCur = (vCur * vCur) / (2 * g);
    const hfCur = fCur * (inputs.lengthM / diameterM) * vHeadCur;
    const hmCur = minorLossK * vHeadCur;
    const hTotalCur = hfCur + hmCur + staticHeadM;
    const pTotalPaCur = density * g * hTotalCur;
    const pTotalKPaCur = pTotalPaCur / 1000.0;

    systemCurve.push({
      flowRateM3h: Number(qCurM3h.toFixed(2)),
      flowRateGpm: Number((qCurM3h * 4.40287).toFixed(2)),
      pressureDropKPa: Number(pTotalKPaCur.toFixed(2)),
      pressureDropPsi: Number((pTotalKPaCur * 0.145038).toFixed(2)),
      headLossM: Number(hTotalCur.toFixed(2)),
      headLossFt: Number((hTotalCur * 3.28084).toFixed(2)),
      frictionFactor: Number(fCur.toFixed(5)),
      velocityMs: Number(vCur.toFixed(2)),
    });
  }

  return {
    isValid: true,
    errors,
    warnings,
    diameterM,
    areaM2,
    flowRateM3s,
    velocityMs,
    density,
    dynamicViscosity: viscosity,
    kinematicViscosity,
    relativeRoughness,
    reynoldsNumber,
    flowRegime,
    frictionFactor,
    velocityHeadM,
    frictionalHeadLossM,
    minorHeadLossM,
    staticHeadM,
    totalHeadLossM,
    frictionalPressureDropKPa,
    totalPressureDropKPa,
    totalPressureDropBar,
    totalPressureDropPsi,
    hydraulicPowerKw,
    shaftPowerKw,
    hydraulicPowerHp,
    systemCurve,
  };
}
