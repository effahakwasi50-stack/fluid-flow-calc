export interface PipeMaterial {
  name: string;
  roughnessMm: number; // absolute roughness in mm (e = roughness)
  description: string;
}

export interface FluidPreset {
  name: string;
  density: number; // kg/m^3
  viscosity: number; // Pa.s (N.s/m^2) or kg/(m.s)
  description: string;
}

export type UnitSystem = 'SI' | 'Imperial';

export interface CalculationInputs {
  unitSystem: UnitSystem;
  diameterMm: number; // in mm (SI) or inches (Imperial input converted to mm)
  lengthM: number; // in meters (SI) or feet (Imperial input converted to m)
  flowRateM3h: number; // in m3/h (SI) or GPM (Imperial input converted to m3/h)
  materialKey: string;
  customRoughnessMm: number;
  fluidKey: string;
  customDensity: number;
  customViscosity: number; // in cP (mPa.s) or Pa.s
  elevationChangeM: number; // static head in meters
  minorLossK: number; // sum of minor loss coefficients
  pumpEfficiency: number; // percentage (e.g., 75%)
}

export interface CalculationResults {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  
  // Basic geometry & kinematics
  diameterM: number;
  areaM2: number;
  flowRateM3s: number;
  velocityMs: number;
  
  // Fluid properties
  density: number;
  dynamicViscosity: number; // Pa.s
  kinematicViscosity: number; // m2/s
  
  // Dimensionless parameters
  relativeRoughness: number; // e / D
  reynoldsNumber: number;
  flowRegime: 'Laminar' | 'Transition' | 'Turbulent';
  frictionFactor: number; // Darcy friction factor f
  
  // Head loss & pressure
  velocityHeadM: number;
  frictionalHeadLossM: number;
  minorHeadLossM: number;
  staticHeadM: number;
  totalHeadLossM: number;
  
  frictionalPressureDropKPa: number;
  totalPressureDropKPa: number;
  totalPressureDropBar: number;
  totalPressureDropPsi: number;
  
  // Energy & Power
  hydraulicPowerKw: number;
  shaftPowerKw: number;
  hydraulicPowerHp: number;
  
  // Curve data points
  systemCurve: Array<{
    flowRateM3h: number;
    flowRateGpm: number;
    pressureDropKPa: number;
    pressureDropPsi: number;
    headLossM: number;
    headLossFt: number;
    frictionFactor: number;
    velocityMs: number;
  }>;
}
