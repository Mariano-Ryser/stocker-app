export default function TechCarousel() {
  const techStack = [
    { name: "Next.js", logo: "/tech/nextjs.svg", role: "Frontend" },
    { name: "VisualStudioCode", logo: "/tech/visualStudioCode.svg", role: "Design" },
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

      {/* Fila inferior - derecha a izquierda (invertida) */}
      
      {/* <div className="carousel carousel-bottom">
        <div className="track">
          {[...techStack].reverse()
            .concat([...techStack].reverse())
            .concat([...techStack].reverse())
            .map((tech, i) => (
            <div className="item" key={`bottom-${i}`}>
              <img src={tech.logo} alt={tech.name} />
              <span>{tech.role}</span>
            </div>
          ))}
        </div>
      </div> */}

     
      

      <style jsx>{`
        .carousel-wrapper {
          width: 100%;
          padding: 0rem 0;
          overflow: hidden;
          position: relative;
        }

        .carousel {
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        .carousel-top {
          margin-bottom: 0.5rem;
        }

        .carousel-bottom {
          margin-top: 0.5rem;
        }

        .track {
          display: flex;
          width: max-content;
        }

        .carousel-top .track {
          animation: scrollLeft 50s linear infinite;
        }

        .carousel-bottom .track {
          animation: scrollRight 50s linear infinite;
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

        @keyframes scrollRight {
          0% {
            transform: translateX(calc(-160px * ${techStack.length}));
          }
          100% {
            transform: translateX(0);
          }
        }
             /* Opcional: Añadir un gradiente para suavizar los bordes */
        .carousel-wrapper::before,
        .carousel-wrapper::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 100px;
          z-index: 2;
          pointer-events: none;
        }

        .carousel-wrapper::before {
          left: 0;
          background: linear-gradient(to right, white, transparent);
        }

        .carousel-wrapper::after {
          right: 0;
          background: linear-gradient(to left, white, transparent);
        }
      `}</style>
    </section>
  );
}