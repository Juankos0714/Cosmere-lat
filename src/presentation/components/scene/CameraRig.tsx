'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneStore } from '@/presentation/stores/sceneStore'
import { easeInOutCubic } from '@/shared/lib/easing'

const CAM_HOME = new THREE.Vector3(0, 11, 17)
const LOOK_HOME = new THREE.Vector3(0, 0, 0)

export function CameraRig() {
  const { camera } = useThree()
  const store = useSceneStore()

  const progressRef = useRef(0)
  const lookTarget  = useRef(LOOK_HOME.clone())
  const elapsed     = useRef(0)

  // When flyPath changes, reset progress
  useEffect(() => {
    if (store.flyPath) progressRef.current = 0
  }, [store.flyPath])

  useFrame((_, delta) => {
    elapsed.current += delta

    if (store.state === 'galaxy' && !store.flyPath) {
      camera.position.y = CAM_HOME.y + Math.sin(elapsed.current * 0.14) * 0.4
      camera.position.x = CAM_HOME.x
      camera.position.z = CAM_HOME.z
      lookTarget.current.lerp(LOOK_HOME, 0.02)
      camera.lookAt(lookTarget.current)
      return
    }

    if (store.state === 'flying' && store.flyPath) {
      const path = store.flyPath
      const dur  = path.duration
      progressRef.current = Math.min(progressRef.current + delta / dur, 1)
      const t = progressRef.current
      const e = easeInOutCubic(t)
      const u = 1 - e

      // Quadratic bezier: start → mid → target
      const s = path.start, m = path.mid, tgt = path.target
      camera.position.set(
        u * u * s.x + 2 * u * e * m.x + e * e * tgt.x,
        u * u * s.y + 2 * u * e * m.y + e * e * tgt.y,
        u * u * s.z + 2 * u * e * m.z + e * e * tgt.z,
      )

      const tl = path.targetLook
      lookTarget.current.lerp(new THREE.Vector3(tl.x, tl.y, tl.z), e * 0.1)
      camera.lookAt(lookTarget.current)

      if (t >= 1) store.completeFly()
    }
  })

  return null
}
