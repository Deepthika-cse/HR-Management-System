import Layout from '../components/Layout.jsx'
import '../styles/Home.css'

function HomePage() {
  return (
    <Layout>
      <div className="home-content">
        <h1 className="home-title">Welcome to hackathon</h1>
        <p className="home-subtitle">This is your starting point of your hackathon.</p>
        
        <div className="home-cards">
          <div className="home-card">
            <i className="bi bi-rocket-takeoff"></i>
            <h3>Quick Start</h3>
            <p>Get started with your hackathon project using our templates and guides.</p>
          </div>
          
          <div className="home-card">
            <i className="bi bi-people"></i>
            <h3>Team Collaboration</h3>
            <p>Connect with your team members and collaborate on projects efficiently.</p>
          </div>
          
          <div className="home-card">
            <i className="bi bi-trophy"></i>
            <h3>Submit Project</h3>
            <p>Submit your completed project and compete for exciting prizes.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default HomePage
