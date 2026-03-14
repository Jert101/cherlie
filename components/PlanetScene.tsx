'use client'

import { useRef, useState } from 'react'
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
  const planetRef = useRef<Group>(null)
  const rocketRef = useRef<Group>(null)
  const ringsRef = useRef<(Group | null)[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [hovered, setHovered] = useState(false)

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
        {/* Main Planet - bright pink with outline and surface details */}
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
                // Bright hot pink base color (#FF69B4)
                vec3 baseColor = vec3(1.0, 0.412, 0.706); // Hot pink
                
                // Add some surface variation/shadow details
                float noise = sin(vUv.x * 15.0) * sin(vUv.y * 15.0) * 0.1;
                float shadow = smoothstep(0.3, 0.7, vUv.y); // Darker at bottom
                
                // Add darker pink surface details (like craters/shadows)
                float detail1 = step(0.85, sin(vUv.x * 8.0 + vUv.y * 6.0));
                float detail2 = step(0.88, sin(vUv.x * 12.0 - vUv.y * 10.0));
                float detail3 = step(0.87, sin(vUv.x * 7.0 + vUv.y * 9.0));
                
                vec3 detailColor = vec3(0.627, 0.314, 0.439); // Darker pink (#A05070)
                float detailMask = (detail1 + detail2 + detail3) * 0.3;
                
                // Mix base with shadows and details
                vec3 finalColor = baseColor;
                finalColor = mix(finalColor, finalColor * 0.85, shadow * 0.3);
                finalColor = mix(finalColor, detailColor, detailMask);
                
                // Add subtle emissive glow
                float emissive = 0.8;
                
                gl_FragColor = vec4(finalColor * emissive, 1.0);
              }
            `}
            side={2}
          />
        </mesh>
        
        {/* Darker pink outline ring */}
        <mesh position={[0, 0, 0]} renderOrder={999}>
          <sphereGeometry args={[2.05, 64, 64]} />
          <meshStandardMaterial
            color="#C75090"
            emissive="#C75090"
            emissiveIntensity={0.2}
            transparent
            opacity={0.6}
            side={1} // FrontSide only for outline effect
          />
        </mesh>
        
        {/* Planet atmosphere glow - intensifies on hover */}
        <mesh position={[0, 0, 0]} renderOrder={999}>
          <sphereGeometry args={[2.1, 32, 32]} />
          <meshStandardMaterial
            color="#EC4899"
            emissive="#EC4899"
            emissiveIntensity={hovered ? 0.5 : 0.3}
            transparent
            opacity={hovered ? 0.3 : 0.2}
            side={2} // DoubleSide
          />
        </mesh>
        
        {/* Additional glow layer on hover */}
        {hovered && (
          <mesh position={[0, 0, 0]} renderOrder={998}>
            <sphereGeometry args={[2.2, 32, 32]} />
            <meshStandardMaterial
              color="#EC4899"
              emissive="#EC4899"
              emissiveIntensity={0.4}
              transparent
              opacity={0.15}
              side={2}
            />
          </mesh>
        )}
        
        
      </group>

      {/* Rotating Ring of Memory Images - asteroid-like, always facing camera */}
      {memories.length > 0 && (() => {
        // Create a ring with all memories, multiplied to fill it completely
        const imagesPerRing = 100 // Increased number of images to show in the ring
        const baseRadius = 5.5 // Widened ring to prevent photos from touching
        const baseY = 0 // Keep flat horizontal plane
        
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
                    {/* Subtle glow effect behind image */}
                    <mesh raycast={() => null} position={[0, 0, -0.01]}>
                      <planeGeometry args={[0.25, 0.25]} />
                      <meshStandardMaterial
                        color="#EC4899"
                        emissive="#EC4899"
                        emissiveIntensity={0.5}
                        transparent
                        opacity={0.15}
                        side={2}
                      />
                    </mesh>
                    
                    {/* Memory Image - always faces camera, much smaller size */}
                    <Image
                      url={memory.image_url}
                      scale={[0.2, 0.2]}
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
      

      {/* Rocket - Decorative only */}
      <group
        ref={rocketRef}
        position={[0, 3, 0]}
        raycast={() => null}
      >
        <mesh>
          <coneGeometry args={[0.3, 1, 8]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[0.4, 0.3, 0.4]} />
          <meshStandardMaterial
            color="#FF6B6B"
            emissive="#FF6B6B"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Rocket trail particles */}
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[0, -0.8 - i * 0.1, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={1}
            />
          </mesh>
        ))}
      </group>

    </>
  )
}
