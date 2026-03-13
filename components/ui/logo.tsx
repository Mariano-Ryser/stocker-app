export default function ColorBlocks() {
  return (
    <div className="container">
      <div className="box1 blue"></div>
      <div className="box2 green"></div>
      <div className="box3 yellow"></div>
      <div className="box4 purple"></div>

      <style jsx>{`
        .container {
          display: grid;
          grid-template-columns: repeat(2, 35px);
          grid-template-rows: repeat(2, 35px);
          gap: 0px;
        }

        .box1, .box2, .box3, .box4 {
          border-radius: 4px;
          width: 30px;
          height: 30px;
        }

        .blue {
          background: #72C6F8;
        }
        .green {
          background: #83D060;
        }
        .yellow {
          background: #FFC32D;
        }
        .purple {
          background: #B283D2;
        }
      `}</style>
    </div>
  )
}