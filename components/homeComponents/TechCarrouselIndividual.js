export default function TechCarousel() {
  const techStack = [
    { name: "Next.js", logo: "/tech/nextjs.svg", role: "Frontend" },
    { name: "VisualStudioCode", logo: "/tech/visualStudioCode.png", role: "Design" },
    { name: "Node.js", logo: "/tech/nodejs.svg", role: "Backend" },
    { name: "MongoDB", logo: "/tech/mongodb.svg", role: "Database" },
    { name: "Vercel", logo: "/tech/vercel.svg", role: "Deployment" },
    { name: "Github", logo: "/tech/github.svg", role: "Deployment" },
    { name: "Git", logo: "/tech/git.svg", role: "Version" },
    { name: "Azure", logo: "/tech/azure.svg", role: "Cloud" },
    { name: "Notion", logo: "/tech/notion.svg", role: "Organization" },
  ];
  

  return (
    <section className="carousel-wrapper">
      <div className="carousel">
        <div className="track">
          {/* Duplica el array 3 veces para mejor continuidad */}
          {[...techStack, ...techStack, ...techStack].map((tech, i) => (
            <div className="item" key={i}>
              <img src={tech.logo} alt={tech.name} />
              <span>{tech.role}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .carousel-wrapper {
          width: 100%;
          padding: 3rem 0;
          background: #ffffff;
          overflow: hidden;
          position: relative;
        }

        .carousel {
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        .track {
          display: flex;
          width: max-content;
          animation: scroll 50s linear infinite;
        }

        .item {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 160px;
          gap: 0.4rem;
          opacity: 0.7;
          transform: scale(1);
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .item:hover {
          transform: scale(1.02) translateY(4px);
          opacity: 1;
          cursor: pointer;
        }

        img {
          height: 68px;
          filter: grayscale(100%);
          transition: filter 0.3s ease;
        }
        
        .item:hover img {
          filter: grayscale(0%);
        }

        span {
          font-size: 0.8rem;
          color: #aaa;
          transition: color 0.3s ease;
        }
        
        .item:hover span {
          color: #333;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            /* Mueve exactamente el ancho de un conjunto original */
            transform: translateX(calc(-160px * ${techStack.length}));
          }
        }
      `}</style>
    </section>
  );
}