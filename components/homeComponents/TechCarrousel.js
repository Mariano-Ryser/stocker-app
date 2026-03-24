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
              <img src={tech.logo} alt={tech.name} />
              <span>{tech.role}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .carousel-wrapper {
          width: 100%;
          padding: 0rem 0;
          overflow: hidden;
          position: relative;
          background: linear-gradient(180deg, #f8fcff 0%, #ffffff 100%);
          padding-top: 2rem;
        } 

        .carousel {
          width: 100%;
          overflow: hidden;
          position: relative;
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
          gap: 0.4rem;
          opacity: 0.7;
          transform: scale(1);
          transition: all 0.3s ease;
          padding: 0.5rem;
        }
        
        .item:hover {
          transform: scale(1.05);
          opacity: 1;
          cursor: pointer;
          border-radius: 8px;
        }

        img {
          height: 60px;
          filter: grayscale(100%);
          transition: all 0.3s ease;
        }
        
        .item:hover img {
          filter: grayscale(0%);
          transform: translateY(-2px);
        }

        span {
          font-size: 0.8rem;
          color: #666;
          font-weight: 500;
          transition: color 0.3s ease;
        }
        
        .item:hover span {
          color: #000;
        }

        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-160px * ${techStack.length}));
          }
        }

        /* Estilos específicos para móvil */
        @media (max-width: 768px) {
          .carousel-wrapper {
            padding-top: 1.5rem;
          }

          .item {
            min-width: 100px; /* Reducido de 160px a 100px */
            gap: 0.25rem; /* Espacio más pequeño entre icono y texto */
            padding: 0.25rem; /* Menos padding interno */
          }

          img {
            height: 40px; /* Reducido de 60px a 40px */
          }

          span {
            font-size: 0.7rem; /* Texto más pequeño */
          }

          .carousel-top .track {
            animation: scrollLeftMobile 40s linear infinite; /* Animación más rápida para móvil */
          }

          @keyframes scrollLeftMobile {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-100px * ${techStack.length}));
            }
          }
        }

        /* Para móviles muy pequeños */
        @media (max-width: 480px) {
          .item {
            min-width: 85px; /* Aún más reducido para pantallas muy pequeñas */
            gap: 0.2rem;
          }

          img {
            height: 35px; /* Iconos más pequeños */
          }

          span {
            font-size: 0.65rem;
          }

          .carousel-top .track {
            animation: scrollLeftMobileSmall 35s linear infinite;
          }

          @keyframes scrollLeftMobileSmall {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-85px * ${techStack.length}));
            }
          }
        }
      `}</style>
    </section>
  );
}