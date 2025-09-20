// src/pages/About.jsx
import "../assets/About.css";

export default function About() {
  return (
    <div className="about">
      <h1>About Us</h1>
      <p>
        Welcome to <strong>MyShop</strong>! We are passionate about bringing
        you the best products at the best prices. From electronics and fashion
        to home essentials, we’ve got something for everyone.
      </p>

      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          To make shopping simple, affordable, and enjoyable by offering a wide
          range of quality products and outstanding customer service.
        </p>
      </section>

      <section className="about-section">
        <h2>Our Values</h2>
        <ul>
          <li>✔️ Customer satisfaction</li>
          <li>✔️ Affordable pricing</li>
          <li>✔️ Quality assurance</li>
          <li>✔️ Fast and reliable delivery</li>
        </ul>
      </section>
    </div>
  );
}
