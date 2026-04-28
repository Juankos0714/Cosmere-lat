'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Planet as PlanetEntity } from '@/domain/entities/Planet'
import { planetTextureFactory } from '@/rendering/textures/PlanetTextureFactory'
import { makeCloudTexture } from '@/rendering/textures/CloudTextureFactory'
import { ATMO_VERT, ATMO_FRAG } from '@/rendering/shaders/atmosphere.glsl'
import { STORM_VERT, STORM_FRAG } from '@/rendering/shaders/storm.glsl'
import { CLOUD_VERT, CLOUD_FRAG } from '@/rendering/shaders/cloud.glsl'

interface Props {
  planet: PlanetEntity
  systemSeed: number
  planetIndex: number
}

export function Planet({ planet: pd, systemSeed, planetIndex }: Props) {
  const pivotRef    = useRef<THREE.Object3D>(null)
  const planetRef   = useRef<THREE.Mesh>(null)
  const stormRef    = useRef<THREE.ShaderMaterial>(null)
  const cloudRef    = useRef<THREE.Mesh>(null)
  const moonPivRef  = useRef<THREE.Object3D>(null)

  const seed = systemSeed + planetIndex * 100

  const texture = useMemo(() => planetTextureFactory.create(pd.type, seed), [pd.type, seed])
  const cloudTex = useMemo(
    () => pd.hasClouds ? makeCloudTexture(seed + 37, pd.cloudColor === '#2a1a08') : null,
    [pd.hasClouds, pd.cloudColor, seed],
  )

  const atmoColor  = useMemo(() => pd.atmosphereColor ? new THREE.Color(pd.atmosphereColor) : new THREE.Color('#4488ff'), [pd.atmosphereColor])
  const cloudColor = useMemo(() => new THREE.Color(pd.cloudColor ?? '#ffffff'), [pd.cloudColor])

  useFrame((_, delta) => {
    if (pivotRef.current) pivotRef.current.rotation.y += pd.orbitSpeed * delta
    if (planetRef.current) planetRef.current.rotation.y += 0.25 * delta
    if (stormRef.current) {
      stormRef.current.uniforms['uTime']!.value += delta
      stormRef.current.uniforms['uFront']!.value = 1 - (stormRef.current.uniforms['uTime']!.value * 0.025) % 1
    }
    if (cloudRef.current) cloudRef.current.rotation.y += 0.08 * delta
    if (moonPivRef.current) moonPivRef.current.rotation.y += (pd.moonSpeed ?? 1.5) * delta
  })

  const spinSpeed = useMemo(() => 0.2 + Math.random() * 0.3, [])
  const initAngle = useMemo(() => Math.random() * Math.PI * 2, [])

  return (
    <object3D ref={pivotRef} rotation={[0, initAngle, 0]}>
      {/* Orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[pd.orbitRadius - 0.012, pd.orbitRadius + 0.012, 96]} />
        <meshBasicMaterial color={0x2a3850} transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Planet container placed at orbit distance */}
      <group position={[pd.orbitRadius, 0, 0]}>
        <mesh ref={planetRef} rotation={[0, 0, THREE.MathUtils.degToRad(pd.tilt)]}>
          <sphereGeometry args={[pd.radius, 64, 64]} />
          <meshPhongMaterial
            map={texture}
            shininess={pd.type === 'roshar' ? 25 : 12}
            specular={new THREE.Color(pd.type === 'roshar' ? 0x334466 : 0x1a1a1a)}
          />

          {/* Atmosphere */}
          {pd.hasAtmosphere && (
            <mesh>
              <sphereGeometry args={[pd.radius * 1.18, 48, 48]} />
              <shaderMaterial
                vertexShader={ATMO_VERT}
                fragmentShader={ATMO_FRAG}
                uniforms={{ uColor: { value: atmoColor } }}
                transparent
                blending={THREE.AdditiveBlending}
                side={THREE.FrontSide}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* Highstorm (Roshar) */}
          {pd.hasStorm && (
            <mesh>
              <sphereGeometry args={[pd.radius * 1.012, 64, 64]} />
              <shaderMaterial
                ref={stormRef}
                vertexShader={STORM_VERT}
                fragmentShader={STORM_FRAG}
                uniforms={{ uTime: { value: 0 }, uFront: { value: 0 } }}
                transparent
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.FrontSide}
              />
            </mesh>
          )}

          {/* Clouds */}
          {pd.hasClouds && cloudTex && (
            <mesh ref={cloudRef}>
              <sphereGeometry args={[pd.radius * 1.025, 48, 48]} />
              <shaderMaterial
                vertexShader={CLOUD_VERT}
                fragmentShader={CLOUD_FRAG}
                uniforms={{ uTex: { value: cloudTex }, uColor: { value: cloudColor } }}
                transparent
                depthWrite={false}
                side={THREE.FrontSide}
              />
            </mesh>
          )}

          {/* Moon */}
          {pd.hasMoon && (
            <>
              <object3D ref={moonPivRef}>
                <mesh position={[pd.moonOrbit ?? 1, 0, 0]}>
                  <sphereGeometry args={[pd.moonRadius ?? 0.08, 24, 24]} />
                  <meshPhongMaterial color={0x9a9aaa} />
                </mesh>
              </object3D>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[(pd.moonOrbit ?? 1) - 0.01, (pd.moonOrbit ?? 1) + 0.01, 48]} />
                <meshBasicMaterial color={0x334455} transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
              </mesh>
            </>
          )}
        </mesh>
      </group>
    </object3D>
  )
}
