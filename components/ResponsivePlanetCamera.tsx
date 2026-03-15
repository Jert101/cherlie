'use client'

import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'

/**
 * Adjusts camera position and FOV so the planet scene fits on all viewports.
 * Portrait/narrow screens: pull back and widen FOV so the ring isn't cut off.
 */
export default function ResponsivePlanetCamera() {
  const { camera, size } = useThree()

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    if (!cam || !cam.position) return
    const aspect = size.width / size.height
    let z: number
    let fov: number
    if (aspect < 0.7) {
      z = 16
      fov = 80
    } else if (aspect < 0.9) {
      z = 14
      fov = 78
    } else if (aspect < 1.15) {
      z = 12
      fov = 76
    } else {
      z = 10
      fov = 75
    }
    cam.position.set(0, 0, z)
    cam.fov = fov
    cam.updateProjectionMatrix()
  }, [camera, size.width, size.height])

  return null
}
