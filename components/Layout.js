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
		width: 100%;
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