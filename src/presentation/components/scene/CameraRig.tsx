'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneStore } from '@/presentation/stores/sceneStore'
import { easeInQuartOutCubic, easeOutQuint } from '@/shared/lib/easing'

const CAM_HOME   = new THREE.Vector3(0, 11, 17)
const LOOK_HOME  = new THREE.Vector3(0, 0, 0)
const WORLD_UP   = new THREE.Vector3(0, 1, 0)
const BASE_FOV   = 60
const PEAK_FOV   = 72

export function CameraRig() {
  const { camera } = useThree()
  const cam   = camera as THREE.PerspectiveCamera
  const store = useSceneStore()

  const progressRef = useRef(0)
  const lookTarget  = useRef(LOOK_HOME.clone())
  const elapsed     = useRef(0)

  useEffect(() => {
    if (store.flyPath) progressRef.current = 0
  }, [store.flyPath])

  useFrame((_, delta) => {
    elapsed.current += delta

    if (store.state === 'galaxy' && !store.flyPath) {
      cam.position.y = CAM_HOME.y + Math.sin(elapsed.current * 0.14) * 0.4
      cam.position.x = CAM_HOME.x
      cam.position.z = CAM_HOME.z
      lookTarget.current.lerp(LOOK_HOME, 0.02)
      cam.lookAt(lookTarget.current)
      cam.up.copy(WORLD_UP)
      if (cam.fov !== BASE_FOV) {
        cam.fov = BASE_FOV
        cam.updateProjectionMatrix()
      }
      return
    }

    if (store.state === 'flying' && store.flyPath) {
      const path     = store.flyPath
      const dur      = path.duration
      const isFlyTo  = path.destinationSystemId !== null

      progressRef.current = Math.min(progressRef.current + delta / dur, 1)
      const t = progressRef.current
      const e = isFlyTo ? easeInQuartOutCubic(t) : easeOutQuint(t)
      const u = 1 - e

      // Quadratic bezier: start → mid → target
      const s = path.start, m = path.mid, tgt = path.target
      cam.position.set(
        u * u * s.x + 2 * u * e * m.x + e * e * tgt.x,
        u * u * s.y + 2 * u * e * m.y + e * e * tgt.y,
        u * u * s.z + 2 * u * e * m.z + e * e * tgt.z,
      )

      // Bezier tangent (using e as the curve parameter for direction)
      const tng = new THREE.Vector3(
        2 * (1 - e) * (m.x - s.x) + 2 * e * (tgt.x - m.x),
        2 * (1 - e) * (m.y - s.y) + 2 * e * (tgt.y - m.y),
        2 * (1 - e) * (m.z - s.z) + 2 * e * (tgt.z - m.z),
      ).normalize()

      // Banking: tilt camera.up perpendicular to direction of travel, peak at t=0.5
      const lateral = new THREE.Vector3().crossVectors(tng, WORLD_UP).normalize()
      const bankAmt = Math.sin(Math.PI * t) * 0.08  // ~4.6° max
      cam.up.copy(WORLD_UP).addScaledVector(lateral, bankAmt).normalize()

      // Dynamic FOV during fly-to only
      if (isFlyTo) {
        const fovFactor = t < 0.5 ? t * 2 : 2 - t * 2
        cam.fov = BASE_FOV + (PEAK_FOV - BASE_FOV) * fovFactor
        cam.updateProjectionMatrix()
      }

      const tl = path.targetLook
      lookTarget.current.lerp(new THREE.Vector3(tl.x, tl.y, tl.z), e * 0.4)
      cam.lookAt(lookTarget.current)

      if (t >= 1) {
        cam.up.copy(WORLD_UP)
        cam.fov = BASE_FOV
        cam.updateProjectionMatrix()
        store.completeFly()
      }
    }
  })

  return null
}
