export default function Footer() {
    return (
        <footer id="site-footer">
            <div className="footer-content">
                <img src="/assets/images/phoenix-logo.png" alt="Phoenix" className="footer-logo" />
                <p className="footer-text">
                    &copy; 2026 Team Phoenix. All rights reserved. |{' '}
                    <a href="/riot.txt" target="_blank" style={{ color: 'inherit', textDecoration: 'underline' }}>
                        riot.txt
                    </a>
                </p>
            </div>
        </footer>
    );
}
