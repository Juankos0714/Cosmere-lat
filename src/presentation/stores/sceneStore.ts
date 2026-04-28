import { create } from 'zustand'
import type { SystemId } from '@/domain/entities/System'

export type SceneState = 'galaxy' | 'flying' | 'system'

interface Vec3 { x: number; y: number; z: number }

export interface FlyPath {
  start: Vec3
  mid: Vec3
  target: Vec3
  targetLook: Vec3
  duration: number
  destinationSystemId: SystemId | null
}

export interface MarkerPosition {
  id: string
  x: number
  y: number
  behind: boolean
}

interface SceneStore {
  state: SceneState
  activeSystemId: SystemId | null
  flyPath: FlyPath | null
  markerPositions: MarkerPosition[]
  requestFlyTo: (systemId: SystemId, camPos: Vec3, systemPos: Vec3) => void
  requestFlyBack: (camPos: Vec3) => void
  completeFly: () => void
  setMarkerPositions: (positions: MarkerPosition[]) => void
}

const CAM_HOME: Vec3 = { x: 0, y: 11, z: 17 }
const LOOK_HOME: Vec3 = { x: 0, y: 0, z: 0 }

export const useSceneStore = create<SceneStore>((set, get) => ({
  state: 'galaxy',
  activeSystemId: null,
  flyPath: null,
  markerPositions: [],

  requestFlyTo(systemId, camPos, systemPos) {
    if (get().state === 'flying') return
    const dest: Vec3 = { x: systemPos.x + 2, y: systemPos.y + 3, z: systemPos.z + 7 }
    const mid: Vec3 = {
      x: (camPos.x + dest.x) / 2,
      y: (camPos.y + dest.y) / 2 + 5,
      z: (camPos.z + dest.z) / 2 - 2,
    }
    set({
      state: 'flying',
      flyPath: {
        start: camPos, mid, target: dest,
        targetLook: systemPos, duration: 2.8,
        destinationSystemId: systemId,
      },
    })
  },

  requestFlyBack(camPos) {
    if (get().state === 'flying') return
    const mid: Vec3 = {
      x: (camPos.x + CAM_HOME.x) / 2,
      y: (camPos.y + CAM_HOME.y) / 2 + 6,
      z: (camPos.z + CAM_HOME.z) / 2 + 3,
    }
    set({
      state: 'flying',
      flyPath: {
        start: camPos, mid, target: CAM_HOME,
        targetLook: LOOK_HOME, duration: 2.5,
        destinationSystemId: null,
      },
    })
  },

  completeFly() {
    const path = get().flyPath
    if (!path) return
    if (path.destinationSystemId) {
      set({ state: 'system', activeSystemId: path.destinationSystemId, flyPath: null })
    } else {
      set({ state: 'galaxy', activeSystemId: null, flyPath: null })
    }
  },

  setMarkerPositions(positions) {
    set({ markerPositions: positions })
  },
}))
