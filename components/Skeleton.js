const Skeleton = ({ width = "100%", height = "100%" }) => {
    return (
      <div className="skeleton" style={{ width, height }}>

        
        <style jsx>{`
          .skeleton {
            position: relative;
            overflow: hidden;
            background-color: rgba(145, 131, 131, 0.07); /* Color de fondo del skeleton */
            border-radius: 8px; /* Bordes redondeados */
          }
  
          .skeleton::before {
            content: '';
            position: absolute;
            inset: 0;
            transform: translateX(-100%);
            animation: shimmer 2s infinite;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.15),
              transparent
            );
          }
  
          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );
  };
  
  export default Skeleton;