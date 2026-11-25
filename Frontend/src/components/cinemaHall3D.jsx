import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

function CinemaHall3D({
  seats = [],
  selectedSeat = [],
  onSeatClick,
}) {
  const mountRef = useRef(null);

  // Keep the latest props without rebuilding the entire 3D scene
  const selectedSeatRef = useRef(selectedSeat);
  const onSeatClickRef = useRef(onSeatClick);
  const updateColorsRef = useRef(null);

  useEffect(() => {
    selectedSeatRef.current = selectedSeat;
    onSeatClickRef.current = onSeatClick;
  }, [selectedSeat, onSeatClick]);

  // Update seat colours when selection changes
  useEffect(() => {
    if (updateColorsRef.current) {
      updateColorsRef.current();
    }
  }, [selectedSeat, seats]);

  useEffect(() => {
    const container = mountRef.current;

    if (!container || seats.length === 0) return;

    // 1. Create Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x171923);

    // 2. Create Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    camera.position.set(9, 10, 13);
    camera.lookAt(0, 0, 0);

    // 3. Create Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      2
    );

    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      2
    );

    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // 5. Create Floor
    const floorGeometry = new THREE.PlaneGeometry(
      18,
      18
    );

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x292d3e,
      roughness: 0.8,
    });

    const floor = new THREE.Mesh(
      floorGeometry,
      floorMaterial
    );

    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;

    scene.add(floor);

    // 6. Create Cinema Screen
    const screenGeometry = new THREE.BoxGeometry(
      9,
      3,
      0.2
    );

    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f1f1,
      emissive: 0x444444,
    });

    const screen = new THREE.Mesh(
      screenGeometry,
      screenMaterial
    );

    screen.position.set(0, 3, -6);

    scene.add(screen);

    // 7. Orbit Controls
    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.target.set(0, 0.5, 0);

    controls.minDistance = 6;
    controls.maxDistance = 25;

    // 8. Chair Materials
    const seatMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7,
    });

    const backMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7,
    });

    const armMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.6,
    });

    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x777777,
      metalness: 0.5,
      roughness: 0.4,
    });

    // 9. Store All Chairs
    const allChairs = [];

    // Group seats according to rows
    const groupedSeats = {};

    seats.forEach((seat) => {
      if (!groupedSeats[seat.row_name]) {
        groupedSeats[seat.row_name] = [];
      }

      groupedSeats[seat.row_name].push(seat);
    });

    // Sort row names
    const rowNames = Object.keys(groupedSeats).sort();

    // 10. Create Chairs
    rowNames.forEach((rowName, rowIndex) => {
      const rowSeats = groupedSeats[rowName].sort(
        (a, b) =>
          Number(a.seat_number) - Number(b.seat_number)
      );

      rowSeats.forEach((seat, seatIndex) => {
        const chair = new THREE.Group();

        const seatName =
          `${seat.row_name}${seat.seat_number}`;

        chair.userData.seatId = Number(seat.seat_id);
        chair.userData.seatName = seatName;
        chair.userData.status = seat.status;

        // 10.1 Seat Base
        const seatBase = new THREE.Mesh(
          new RoundedBoxGeometry(
            0.85,
            0.22,
            0.85,
            5,
            0.12
          ),
          seatMaterial.clone()
        );

        seatBase.position.set(0, 0.65, 0);
        seatBase.userData.isSeatSurface = true;

        chair.add(seatBase);

        // 10.2 Chair Backrest
        const backrest = new THREE.Mesh(
          new RoundedBoxGeometry(
            0.85,
            1.1,
            0.22,
            5,
            0.10
          ),
          backMaterial.clone()
        );

        backrest.position.set(0, 1.25, 0.38);
        backrest.rotation.x = -0.12;
        backrest.userData.isSeatSurface = true;

        chair.add(backrest);

        // 10.3 Left Armrest
        const leftArm = new THREE.Mesh(
          new RoundedBoxGeometry(
            0.18,
            0.35,
            0.85,
            4,
            0.06
          ),
          armMaterial
        );

        leftArm.position.set(-0.5, 0.85, 0);

        chair.add(leftArm);

        // 10.4 Right Armrest
        const rightArm = new THREE.Mesh(
          new RoundedBoxGeometry(
            0.18,
            0.35,
            0.85,
            4,
            0.06
          ),
          armMaterial
        );

        rightArm.position.set(0.5, 0.85, 0);

        chair.add(rightArm);

        // 10.5 Chair Legs
        [-0.3, 0.3].forEach((x) => {
          [-0.3, 0.3].forEach((z) => {
            const leg = new THREE.Mesh(
              new THREE.BoxGeometry(
                0.08,
                0.5,
                0.08
              ),
              legMaterial
            );

            leg.position.set(x, 0.25, z);

            chair.add(leg);
          });
        });

        // 10.6 Curved Seat Arrangement
        const totalSeats = rowSeats.length;

        const angleStep = 0.12;
        const radius = -15;

        const angle =
          (seatIndex - (totalSeats - 1) / 2) * angleStep;

        const x = radius * Math.sin(angle);

        const z =
          rowIndex * 1.5 - 2 +
          radius * (1 - Math.cos(angle));

        chair.position.set(x, 0, z);

        chair.rotation.y = -angle;

        scene.add(chair);

        allChairs.push(chair);
      });
    });

    // 11. Update Chair Colours
    function updateChairColors() {
      allChairs.forEach((chair) => {
        const seatName = chair.userData.seatName;

        const seatData = seats.find(
          (item) =>
            Number(item.seat_id) === chair.userData.seatId
        );

        const status = String(
          seatData?.status || ''
        ).toLowerCase();

        const isSelected =
          selectedSeatRef.current.includes(seatName);

        let color = 0x3498db; // Available - Blue

        if (status === 'booked') {
          color = 0xe74c3c; // Booked - Red
        } else if (isSelected) {
          color = 0x2ecc71; // Selected by current customer - Green
        } else if (
          seatData?.temporaryStatus === 'Selected'
        ) {
          color = 0xf39c12; // Temporarily locked - Orange
        }

        chair.traverse((child) => {
          if (
            child.isMesh &&
            child.userData.isSeatSurface
          ) {
            child.material.color.setHex(color);
          }
        });
      });
    }

    // Save function for updating colours from React
    updateColorsRef.current = updateChairColors;

    updateChairColors();

    // 12. Detect Seat Clicks Without Interfering With Rotation
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let pointerDownX = 0;
    let pointerDownY = 0;
    let pointerDownId = null;

    function handlePointerDown(event) {
      if (event.button !== 0) return;

      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
      pointerDownId = event.pointerId;
    }

    function handlePointerUp(event) {
      if (event.pointerId !== pointerDownId) {
        return;
      }

      pointerDownId = null;

      // Check whether the mouse was dragged
      const moveX = Math.abs(
        event.clientX - pointerDownX
      );

      const moveY = Math.abs(
        event.clientY - pointerDownY
      );

      // If moved, treat it as rotation
      if (moveX > 5 || moveY > 5) {
        return;
      }

      const rect =
        renderer.domElement.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      mouse.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1;

      mouse.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(
        allChairs,
        true
      );

      if (intersects.length === 0) return;

      let clickedObject = intersects[0].object;

      // Find the parent chair
      while (
        clickedObject &&
        clickedObject.userData.seatName === undefined
      ) {
        clickedObject = clickedObject.parent;
      }

      if (!clickedObject) return;

      const seatName =
        clickedObject.userData.seatName;

      if (seatName && onSeatClickRef.current) {
        onSeatClickRef.current(seatName);
      }
    }

    renderer.domElement.addEventListener(
      'pointerdown',
      handlePointerDown
    );

    renderer.domElement.addEventListener(
      'pointerup',
      handlePointerUp
    );

    // 13. Handle Screen Resizing
    function handleResize() {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (width === 0 || height === 0) return;

      camera.aspect = width / height;

      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    }

    const resizeObserver = new ResizeObserver(
      handleResize
    );

    resizeObserver.observe(container);

    // 14. Animation
    let animationId;

    function animate() {
      animationId = requestAnimationFrame(animate);

      controls.update();

      renderer.render(scene, camera);
    }

    animate();

    // 15. Cleanup
    return () => {
      cancelAnimationFrame(animationId);

      resizeObserver.disconnect();

      renderer.domElement.removeEventListener(
        'pointerdown',
        handlePointerDown
      );

      renderer.domElement.removeEventListener(
        'pointerup',
        handlePointerUp
      );

      controls.dispose();

      // Dispose all geometries and materials only once
      const geometries = new Set();
      const materials = new Set();

      scene.traverse((object) => {
        if (object.isMesh) {
          geometries.add(object.geometry);

          if (Array.isArray(object.material)) {
            object.material.forEach((material) => {
              materials.add(material);
            });
          } else {
            materials.add(object.material);
          }
        }
      });

      geometries.forEach((geometry) => {
        geometry.dispose();
      });

      materials.forEach((material) => {
        material.dispose();
      });

      renderer.dispose();

      renderer.forceContextLoss();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      updateColorsRef.current = null;
    };
  }, [seats]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '550px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#171923',
        touchAction: 'none',
      }}
    />
  );
}

export default CinemaHall3D;