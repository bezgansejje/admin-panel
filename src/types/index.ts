export type UserRole = 'ADMIN' | 'CLIENT';

export interface User {
  id: string;
  login: string;
  email: string;
  avatarUrl?: string | null;
  role: UserRole;
  isActive?: boolean | null;
}

export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface WaterBodyPassport {
  area?: number;
  overgrowthArea?: number;
  altitude?: number;
  length?: number;
  maxWidth?: number;
  coastlineLength?: number;
  coastlineDev?: number;
  catchmentArea?: number;
  currentDepth?: number;
  maxDepth?: number;
  avgDepth?: number;
  volume?: number;

  fisheryType?: string;
  fishProductivity?: number;
  economicDesc?: string;
  waterProtectionZone?: string;
  waterProtectionStrip?: string;

  ichthyofauna?: string;
  mammals?: string;
  invertebrates?: string;
}

export interface WaterBody {
  imageUrl: string;
  id: string;
  name: string;
  district?: string | null;
  locationDesc?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  boundaries?: unknown;
  cadastralNumber?: string | null;
  passport?: WaterBodyPassport | null;
  measurements?: Measurement[];
}

export type ProblemSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export type ProblemStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface WaterBodyProblem {
  id: string;
  userId: string;
  waterBodyId: string;
  title: string;
  description: string;
  severity: ProblemSeverity;
  status: ProblemStatus;
  moderationNote?: string | null;
  createdAt: string;
  updatedAt: string;
  waterBody?: string | WaterBody | null;
}

export interface Measurement {
  id: string;
  waterBodyId: string;
  recordDate?: string | null;

  ph?: number | null;
  turbidity?: number | null;
  dissolvedGases?: string | null;
  biogenicCompounds?: string | null;
  permanganateOxid?: number | null;

  mineralization?: number | null;
  salinity?: number | null;
  hardness?: number | null;
  calcium?: number | null;
  magnesium?: number | null;
  chlorides?: number | null;
  sulfates?: number | null;
  hydrocarbonates?: number | null;
  potassiumSodium?: number | null;

  overgrowthPercent?: number | null;
  overgrowthDegree?: string | null;

  phytoplanktonDev?: string | null;
  zooplanktonTaxa?: string | null;
  zooplanktonGroups?: string | null;
  zoobenthosTaxa?: string | null;
  zoobenthosGroups?: string | null;
  trophicStatus?: string | null;
}
