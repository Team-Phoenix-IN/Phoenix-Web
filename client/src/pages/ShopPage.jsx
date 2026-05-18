export default function ShopPage() {
    return (
        <section id="shop" className="page active">
            <div className="shop-container">
                <div className="shop-icon">
                    <img src="/assets/images/phoenix-logo.png" alt="Phoenix" className="shop-watermark" />
                </div>
                <div className="shop-badge">PHOENIX SHOP</div>
                <h2 className="coming-soon-title">COMING SOON</h2>
                <p className="coming-soon-subtitle">
                    Our official merchandise is on its way.<br />
                    Stay tuned for exclusive Team Phoenix gear.
                </p>
                <div className="coming-soon-line"></div>
            </div>
        </section>
    );
}
