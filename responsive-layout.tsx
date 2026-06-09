import React from 'react';

export function links() {
  return [
    { rel: 'stylesheet', href: '/styles/responsive-layout.css' },
  ];
}

const quickItems = [
  { name: 'Dispenser Refill 20L', tag: 'Most Popular', price: 'Ksh 350' },
  { name: 'Bulk Tanker 5,000L', tag: 'Best Value', price: 'Ksh 4,500' },
  { name: 'Bottled Water 1L x 12', tag: 'Catalog Item', price: 'Ksh 720' },
];

export default function ResponsiveLayout() {
  return (
    <main className="kitayi-layout">
      <section className="kitayi-quick-card">
        <div className="kitayi-card-head">
          <div className="kitayi-logo-mark">K</div>
          <div>
            <p>Quick Order</p>
            <h1>Kitayi Solutions Limited</h1>
          </div>
        </div>

        <div className="kitayi-list">
          {quickItems.map(item => (
            <a href="/shop" className="kitayi-list-item" key={item.name}>
              <span>
                <strong>{item.name}</strong>
                <em>{item.tag}</em>
              </span>
              <b>{item.price}</b>
              <i aria-hidden="true">→</i>
            </a>
          ))}
        </div>

        <a href="/shop" className="kitayi-catalog-link">
          View Full Catalog <span aria-hidden="true">→</span>
        </a>
      </section>

      <section className="kitayi-product-card">
        <div className="kitayi-product-image">
          <span className="kitayi-bottle" aria-hidden="true" />
        </div>
        <div className="kitayi-product-meta">
          <h2>OMI 75cl</h2>
          <strong>$2.49</strong>
        </div>
        <p>Pure hydration, anytime, anywhere</p>
        <button type="button">Add to Cart</button>
      </section>
    </main>
  );
}
