import Header from "../components/header/Header"
const Layout = ({ children}) => {
    return (
<>
      <Header /> 
        <div className="content">    
             { children }
        </div>
  
<style jsx>{`    
  .content {
    margin: auto ;
		width: 100%;
		max-width: calc(100% - 0.4rem);
		color: white;
		font-size: 20px;
		line-height: 1.6;
    padding:0px;
	} 
  `}</style>
</>
    );
}
export default Layout;