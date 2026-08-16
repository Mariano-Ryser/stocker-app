export default function TechCarousel() {
  const techStack = [
    { name: "Next.js", logo: "/tech/nextjs.svg", role: "Frontend" },
    { name: "VisualStudioCode", logo: "/tech/visual.webp", role: "Design" },
    { name: "Node.js", logo: "/tech/nodejs.svg", role: "Backend" },
    { name: "MongoDB", logo: "/tech/mongodb.svg", role: "Database" },
    { name: "Vercel", logo: "/tech/vercel.svg", role: "Deployment" },
    { name: "Github", logo: "/tech/github.svg", role: "Deployment" },
    { name: "Git", logo: "/tech/git.svg", role: "Version" },
    { name: "Azure", logo: "/tech/azure.svg", role: "Cloud" },
    { name: "Notion", logo: "/tech/notion.svg", role: "Organization" },
    { name: "Stocker", logo: "/tech/stocker.webp", role: "Administration" },
  ];

  return (
    <section className="carousel-wrapper">
      {/* Fila superior - izquierda a derecha */}
      <div className="carousel carousel-top">
        <div className="track">
          {[...techStack, ...techStack, ...techStack].map((tech, i) => (
            <div className="item" key={`top-${i}`}>
              <div className="icon-wrapper">
                <img src={tech.logo} alt={tech.name} />
              </div>
              <span>{tech.role}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .carousel-wrapper {
          width: 100%;
          padding: 3rem 0;
          overflow: hidden;
          position: relative;
          background: linear-gradient(180deg, #0a0e27 0%, #1a1040 30%, #0d1233 70%, #0a0e27 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .carousel-wrapper::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(ellipse at 20% 80%, rgba(212, 163, 115, 0.03) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(76, 175, 80, 0.03) 0%, transparent 50%);
          pointer-events: none;
        }

        .carousel {
          width: 100%;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        .carousel-top {
          margin-bottom: 0.5rem;
        }

        .track {
          display: flex;
          width: max-content;
        }

        .carousel-top .track {
          animation: scrollLeft 50s linear infinite;
        }

        .item {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 160px;
          gap: 0.6rem;
          padding: 0.8rem 1rem;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border-radius: 12px;
          position: relative;
        }

        .item:hover {
          transform: translateY(-4px) scale(1.02);
          background: rgba(255, 255, 255, 0.03);
          cursor: pointer;
        }

        .item::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0%;
          height: 2px;
          background: linear-gradient(90deg, #d4a373, #4caf50);
          transition: width 0.4s ease;
          border-radius: 2px;
        }

        .item:hover::after {
          width: 60%;
        }

        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.4s ease;
          padding: 12px;
        }

        .item:hover .icon-wrapper {
          background: rgba(212, 163, 115, 0.05);
          border-color: rgba(212, 163, 115, 0.15);
          transform: rotate(-3deg);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: brightness(0) invert(0.8) sepia(0.2) saturate(0.5);
          transition: all 0.4s ease;
        }

        /* Efecto hover con colores naturales */
        .item:hover img {
          filter: brightness(0) invert(0.9) sepia(0.3) saturate(0.8) hue-rotate(30deg);
        }

        /* Colores específicos para cada icono en hover */
        .item:nth-child(3n+1):hover img {
          filter: brightness(0) invert(0.7) sepia(0.6) saturate(1.5) hue-rotate(330deg);
        }

        .item:nth-child(3n+2):hover img {
          filter: brightness(0) invert(0.6) sepia(0.8) saturate(2) hue-rotate(90deg);
        }

        .item:nth-child(3n+3):hover img {
          filter: brightness(0) invert(0.7) sepia(0.5) saturate(1.8) hue-rotate(180deg);
        }

        span {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.3);
          font-weight: 500;
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .item:hover span {
          color: #d4a373;
        }

        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-160px * ${techStack.length}));
          }
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .carousel-wrapper {
            padding: 2rem 0;
          }

          .item {
            min-width: 120px;
            gap: 0.4rem;
            padding: 0.5rem 0.8rem;
          }

          .icon-wrapper {
            width: 50px;
            height: 50px;
            padding: 10px;
            border-radius: 10px;
          }

          img {
            filter: brightness(0) invert(0.7) sepia(0.2) saturate(0.5);
          }

          span {
            font-size: 0.7rem;
          }

          .carousel-top .track {
            animation: scrollLeftMobile 40s linear infinite;
          }

          @keyframes scrollLeftMobile {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-120px * ${techStack.length}));
            }
          }
        }

        @media (max-width: 480px) {
          .carousel-wrapper {
            padding: 1.5rem 0;
          }

          .item {
            min-width: 100px;
            gap: 0.3rem;
            padding: 0.4rem 0.6rem;
          }

          .icon-wrapper {
            width: 42px;
            height: 42px;
            padding: 8px;
            border-radius: 8px;
          }

          img {
            filter: brightness(0) invert(0.6) sepia(0.2) saturate(0.4);
          }

          span {
            font-size: 0.6rem;
          }

          .carousel-top .track {
            animation: scrollLeftMobileSmall 35s linear infinite;
          }

          @keyframes scrollLeftMobileSmall {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-100px * ${techStack.length}));
            }
          }
        }
      `}</style>
    </section>
  );
}