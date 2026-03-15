'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Mesh, Group, Vector3 } from 'three'
import { Text, Float, Image, Billboard } from '@react-three/drei'
import { supabase, SiteSettings, Memory } from '@/lib/supabase'
import { useEffect } from 'react'
import * as THREE from 'three'

interface PlanetSceneProps {
  onEnterWorld: () => void
}

export default function PlanetScene({ onEnterWorld }: PlanetSceneProps) {
  const { size } = useThree()
  const planetRef = useRef<Group>(null)
  const rocketRef = useRef<Group>(null)
  const ringsRef = useRef<(Group | null)[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [hovered, setHovered] = useState(false)

  const isNarrow = size.width < 768
  const isSmall = size.width < 480

  const memoryStarPositions = useMemo(() => {
    if (!memories.length) return [] as [number, number, number][]
    const count = Math.min(memories.length, 24)
    const radius = 9
    const height = 3.5

    return memories.slice(0, count).map((_, index) => {
      const angle = (index / count) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = height + ((index % 3) - 1) * 0.4
      return [x, y, z] as [number, number, number]
    })
  }, [memories])

  useEffect(() => {
    loadSettings()
    loadMemories()
  }, [])

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .single()
      if (data) setSettings(data)
    } catch (err) {
      console.error('Error loading settings:', err)
    }
  }

  const loadMemories = async () => {
    try {
      const { data } = await supabase
        .from('memories')
        .select('*')
        .eq('visible', true)
        .order('date', { ascending: false })
        // No limit - use all memories to create the ring
      
      if (data) setMemories(data)
    } catch (err) {
      console.error('Error loading memories:', err)
    }
  }

  useFrame((state) => {
    if (planetRef.current) {
      const speed = settings?.planet_rotation_speed || 0.5
      planetRef.current.rotation.y += 0.01 * speed
    }

    if (rocketRef.current) {
      rocketRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5
    }

    // Rotate rings around the planet - smooth continuous circular motion
    ringsRef.current.forEach((ring, index) => {
      if (ring) {
        const baseSpeed = settings?.planet_rotation_speed || 0.5
        // Smooth continuous rotation around Y axis (circling the planet)
        const ringSpeed = baseSpeed * 0.6
        ring.rotation.y += 0.01 * ringSpeed
      }
    })
  })

  const handlePlanetClick = () => {
    // Speed of light animation will be handled in the parent component
    // Just call onEnterWorld immediately, parent will handle animation
    onEnterWorld()
  }

  return (
    <>
      {/* Enhanced Planet with Ring - Clickable */}
      <group 
        ref={planetRef}
        onClick={(e) => {
          e.stopPropagation()
          handlePlanetClick()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          if (!hovered) setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          if (hovered) setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        {/* Main Planet — warm pink-gold with golden highlight */}
        <mesh position={[0, 0, 0]} renderOrder={1000}>
          <sphereGeometry args={[2, 64, 64]} />
          <shaderMaterial
            vertexShader={`
              varying vec3 vWorldPosition;
              varying vec3 vNormal;
              varying vec2 vUv;
              void main() {
                vNormal = normalize(normalMatrix * normal);
                vUv = uv;
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              varying vec3 vWorldPosition;
              varying vec3 vNormal;
              varying vec2 vUv;
              void main() {
                vec3 pink = vec3(1.0, 0.45, 0.72);
                vec3 gold = vec3(1.0, 0.85, 0.45);
                float shadow = smoothstep(0.25, 0.75, vUv.y);
                float goldHighlight = smoothstep(0.5, 0.85, vUv.y) * (0.5 + 0.5 * sin(vUv.x * 6.0));
                vec3 baseColor = mix(pink, gold, goldHighlight * 0.35);
                float detail1 = step(0.85, sin(vUv.x * 8.0 + vUv.y * 6.0));
                float detail2 = step(0.88, sin(vUv.x * 12.0 - vUv.y * 10.0));
                vec3 detailColor = vec3(0.6, 0.35, 0.45);
                baseColor = mix(baseColor, baseColor * 0.9, shadow * 0.25);
                baseColor = mix(baseColor, detailColor, (detail1 + detail2) * 0.2);
                float emissive = 0.88;
                gl_FragColor = vec4(baseColor * emissive, 1.0);
              }
            `}
            side={2}
          />
        </mesh>

        {/* Warm outline ring */}
        <mesh position={[0, 0, 0]} renderOrder={999}>
          <sphereGeometry args={[2.05, 64, 64]} />
          <meshStandardMaterial
            color="#E9A855"
            emissive="#C75090"
            emissiveIntensity={0.25}
            transparent
            opacity={0.55}
            side={1}
          />
        </mesh>

        {/* Atmosphere — golden-pink glow, stronger on hover */}
        <mesh position={[0, 0, 0]} renderOrder={999}>
          <sphereGeometry args={[2.1, 32, 32]} />
          <meshStandardMaterial
            color="#FBBF24"
            emissive="#EC4899"
            emissiveIntensity={hovered ? 0.55 : 0.35}
            transparent
            opacity={hovered ? 0.35 : 0.22}
            side={2}
          />
        </mesh>

        {hovered && (
          <mesh position={[0, 0, 0]} renderOrder={998}>
            <sphereGeometry args={[2.2, 32, 32]} />
            <meshStandardMaterial
              color="#FCD34D"
              emissive="#F9A8D4"
              emissiveIntensity={0.4}
              transparent
              opacity={0.18}
              side={2}
            />
          </mesh>
        )}
        
        
      </group>

      {/* Memory stars — warm golden-pink */}
      {memoryStarPositions.map((pos, idx) => (
        <mesh key={`memory-sky-star-${idx}`} position={pos} raycast={() => null}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color="#FCD34D" />
        </mesh>
      ))}

      {/* Rotating Ring of Memory Images - asteroid-like, always facing camera */}
      {memories.length > 0 && (() => {
        const imagesPerRing = isSmall ? 40 : isNarrow ? 60 : 100
        const baseRadius = isSmall ? 5.5 : isNarrow ? 6 : 6.5
        const baseY = 0
        const imageScale = isSmall ? 0.14 : isNarrow ? 0.17 : 0.2
        const glowSize = imageScale * 1.4
        
        // Duplicate memories to fill the ring if we have fewer memories than imagesPerRing
        const duplicatedMemories: (Memory & { duplicateIndex?: number })[] = []
        if (memories.length < imagesPerRing) {
          // Repeat memories to fill the ring
          const multiplier = Math.ceil(imagesPerRing / memories.length)
          for (let i = 0; i < multiplier; i++) {
            memories.forEach((memory, idx) => {
              if (duplicatedMemories.length < imagesPerRing) {
                duplicatedMemories.push({ ...memory, duplicateIndex: i })
              }
            })
          }
        } else {
          // Use all memories, or take first imagesPerRing
          duplicatedMemories.push(...memories.slice(0, imagesPerRing))
        }
        
        // Generate random offsets for each image to create asteroid-like distribution
        // Keep images in a flat horizontal plane like Saturn's rings
        const imageOffsets = duplicatedMemories.map((_, i) => {
          // Use seed based on index for consistent randomness
          const seed = i * 123.456
          const random1 = (Math.sin(seed) * 10000) % 1
          const random2 = (Math.sin(seed * 2) * 10000) % 1
          const random3 = (Math.sin(seed * 3) * 10000) % 1
          
          return {
            radiusOffset: (random1 - 0.5) * 0.8, // Increased radius variation for thicker ring
            yOffset: (random2 - 0.5) * 1.2, // Increased vertical variation to thicken the ring
            angleOffset: (random3 - 0.5) * 0.2, // Random angle offset
            rotationX: (random1 - 0.5) * Math.PI * 0.2, // Random X rotation (smaller)
            rotationY: (random2 - 0.5) * Math.PI * 0.2, // Random Y rotation (smaller)
            rotationZ: (random3 - 0.5) * Math.PI * 0.2, // Random Z rotation (smaller)
          }
        })
        
        return (
          <group
            key="main-ring-group"
            ref={(el) => {
              if (el) ringsRef.current[0] = el
            }}
          >
            {duplicatedMemories.map((memory, i) => {
              // Base angle with random offset for imperfect alignment
              const baseAngle = (i / duplicatedMemories.length) * Math.PI * 2
              const angle = baseAngle + imageOffsets[i].angleOffset
              const radius = baseRadius + imageOffsets[i].radiusOffset
              const yPos = baseY + imageOffsets[i].yOffset
              
              return (
                <Billboard
                  key={`ring-image-${memory.id}-${memory.duplicateIndex || 0}-${i}`}
                  position={[
                    Math.cos(angle) * radius,
                    yPos,
                    Math.sin(angle) * radius,
                  ]}
                  follow={true}
                  lockX={false}
                  lockY={false}
                  lockZ={false}
                >
                  <group
                    rotation={[
                      imageOffsets[i].rotationX,
                      imageOffsets[i].rotationY,
                      imageOffsets[i].rotationZ,
                    ]}
                    onPointerOver={(e) => e.stopPropagation()}
                    onPointerOut={(e) => e.stopPropagation()}
                  >
                    {/* Golden-pink glow behind image */}
                    <mesh raycast={() => null} position={[0, 0, -0.01]}>
                      <planeGeometry args={[glowSize, glowSize]} />
                      <meshStandardMaterial
                        color="#FBBF24"
                        emissive="#F9A8D4"
                        emissiveIntensity={0.5}
                        transparent
                        opacity={0.2}
                        side={2}
                      />
                    </mesh>
                    
                    {/* Memory Image - always faces camera, responsive size */}
                    <Image
                      url={memory.image_url}
                      scale={[imageScale, imageScale]}
                      position={[0, 0, 0]}
                      transparent
                      raycast={() => null}
                    />
                  </group>
                </Billboard>
              )
            })}
          </group>
        )
      })()}
      

      {/* Rocket — golden, magical */}
      <group ref={rocketRef} position={[0, 3, 0]} raycast={() => null}>
        <mesh>
          <coneGeometry args={[0.32, 1, 8]} />
          <meshStandardMaterial
            color="#FCD34D"
            emissive="#FBBF24"
            emissiveIntensity={0.7}
          />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[0.42, 0.32, 0.42]} />
          <meshStandardMaterial
            color="#F9A8D4"
            emissive="#EC4899"
            emissiveIntensity={0.4}
          />
        </mesh>
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[0, -0.8 - i * 0.12, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color="#FDE68A"
              emissive="#FBBF24"
              emissiveIntensity={1}
            />
          </mesh>
        ))}
      </group>

    </>
  )
}
