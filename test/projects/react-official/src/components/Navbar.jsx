export default function Navbar() {
  return (
    <nav id="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo-area">
          <div id="navbar-logo">A</div>
          <span id="navbar-brand">Atlas</span>
        </div>
        <ul className="navbar-menu">
          <li className="navbar-menu-item" id="nav-products">Products</li>
          <li className="navbar-menu-item" id="nav-solutions">Solutions</li>
          <li className="navbar-menu-item" id="nav-pricing">Pricing</li>
          <li className="navbar-menu-item" id="nav-company">Company</li>
          <li className="navbar-menu-item" id="nav-resources">Resources</li>
        </ul>
        <button id="navbar-cta-btn">Get Started</button>
      </div>
    </nav>
  );
}
