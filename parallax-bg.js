document.addEventListener('DOMContentLoaded', () => {
  // Create background container
  const bgContainer = document.createElement('div');
  bgContainer.id = 'parallax-bg-container';

  // Abstract shapes definition with different speeds for the parallax effect
  const shapes = [
    { class: 'shape-1', speedX: 0.05, speedY: 0.05, scrollSpeed: 0.2 },
    { class: 'shape-2', speedX: -0.03, speedY: 0.04, scrollSpeed: 0.15 },
    { class: 'shape-3', speedX: 0.04, speedY: -0.06, scrollSpeed: 0.3 },
    { class: 'shape-4', speedX: -0.06, speedY: -0.03, scrollSpeed: 0.1 },
    { class: 'shape-5', speedX: 0.02, speedY: 0.07, scrollSpeed: 0.25 }
  ];

  const shapeElements = [];

  shapes.forEach(shapeDef => {
    const el = document.createElement('div');
    el.className = `parallax-shape ${shapeDef.class}`;
    bgContainer.appendChild(el);
    shapeElements.push({
      el,
      ...shapeDef,
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0
    });
  });

  document.body.prepend(bgContainer);

  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;

  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  window.addEventListener('resize', () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    // Normalize mouse position from -1 to 1
    mouseX = (e.clientX / windowWidth) * 2 - 1;
    mouseY = (e.clientY / windowHeight) * 2 - 1;
  });

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // Linear interpolation for smooth animation
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function animate() {
    shapeElements.forEach(shape => {
      // Amplifying mouseX/Y to set how many pixels it can move at max
      const maxOffset = 150;

      shape.targetX = mouseX * maxOffset * (shape.speedX * 10);
      shape.targetY = mouseY * maxOffset * (shape.speedY * 10) - (scrollY * shape.scrollSpeed);

      // Smoothly move towards the target position
      shape.currentX = lerp(shape.currentX, shape.targetX, 0.05);
      shape.currentY = lerp(shape.currentY, shape.targetY, 0.05);

      shape.el.style.transform = `translate3d(${shape.currentX}px, ${shape.currentY}px, 0)`;
    });

    requestAnimationFrame(animate);
  }

  animate();
});
