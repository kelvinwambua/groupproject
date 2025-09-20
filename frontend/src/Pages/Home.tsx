import "../assets/Home.css";

export default function HomePage() {
  return (
    <div className="home">
      <header className="home-header">
        <h1>Welcome to MyShop</h1>
        <p>Your one-stop shop for amazing products at unbeatable prices.</p>
        <a href="/shop" className="cta-btn">Start Shopping</a>
      </header>

      <section className="home-about">
        <h2>About Us</h2>
        <p>
          At <strong>MyShop</strong>, we believe shopping should be easy,
          affordable, and fun. Explore a wide variety of products ranging from
          electronics to fashion and home essentials—all in one place.
        </p>
      </section>

      <section className="home-features">
        <h2>Why Choose Us?</h2>
        <ul>
          <li>✅ High-quality products</li>
          <li>✅ Affordable prices</li>
          <li>✅ Fast delivery</li>
          <li>✅ 24/7 customer support</li>
        </ul>
      </section>
    </div>
  );
}
