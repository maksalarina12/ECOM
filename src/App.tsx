import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ClipboardList,
  Layers,
  Leaf,
  Mail,
  Menu,
  Minus,
  Plus,
  QrCode,
  RotateCcw,
  Ruler,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TrendingUp,
  Truck,
  Wallet,
  X,
  AlertTriangle,
  Eye,
  EyeOff,
  UserRound,
  LogOut,
} from 'lucide-react';
import { formatIDR, productPrice, seedProducts, variants, type Product, type ProductModel } from './data/catalog';
import { useShop, total, type Order } from './store/shop';
import type { Mode } from './scenes/Scene';
import { AuthProvider, RoleGuard, useAuth, type AuthUser, type Role } from './auth';

const Scene = lazy(() => import('./scenes/Scene'));

const modes: { id: Mode; label: string }[] = [
  { id: 'inspect', label: 'Inspect' },
  { id: 'explode', label: 'Exploded view' },
  { id: 'xray', label: 'X-ray' },
  { id: 'dimensions', label: 'Dimensions' },
  { id: 'materials', label: 'Materials' },
];

const layerInfo = [
  {
    id: 'cover',
    name: 'Quilted textile',
    thickness: 2,
    detail: 'Permukaan tekstil berpola quilting dengan detail anyaman dan jahitan.',
  },
  {
    id: 'comfort',
    name: 'Comfort foam',
    thickness: 4,
    detail: 'Lapisan kenyamanan untuk meredam tekanan di permukaan.',
  },
  {
    id: 'transition',
    name: 'Transition foam',
    thickness: 3,
    detail: 'Lapisan transisi pendukung sebelum inti pegas.',
  },
  {
    id: 'springs',
    name: 'Pocket springs',
    thickness: 16,
    detail: 'Pegas individual yang disusun dalam kantong kain terpisah.',
  },
  {
    id: 'base',
    name: 'High-density base',
    thickness: 3,
    detail: 'Fondasi stabil untuk menjaga struktur kasur.',
  },
];

const fabrics = [
  { c: '#e9e2d7', l: 'Natural ivory' },
  { c: '#c8bba6', l: 'Warm sand' },
  { c: '#a3a293', l: 'Stone grey' },
];

function Model({
  studio = false,
  mode = 'inspect',
  explode = 0,
  width = 1.6,
  length = 2,
  selected = null,
  onSelect = () => {},
  fabric = '#e9e2d7',
  product = 'mattress',
  showTracking = false,
  onDetail = () => {},
}: {
  studio?: boolean;
  mode?: Mode;
  explode?: number;
  width?: number;
  length?: number;
  selected?: string | null;
  onSelect?: (s: string) => void;
  fabric?: string;
  product?: ProductModel;
  showTracking?: boolean;
  onDetail?: (id: string) => void;
}) {
  return (
    <Suspense fallback={<div className="scene-fallback">Memuat pengalaman 3D...</div>}>
      <Scene {...{ studio, mode, explode, width, length, selected, onSelect, fabric, product, showTracking, onDetail }} />
    </Suspense>
  );
}

/* ------------------------------------------------------------------ */
/*  Product line art — replaces the old typographic placeholder glyphs */
/* ------------------------------------------------------------------ */

const productArt: Record<string, ReactNode> = {
  rest: (
    <>
      <path
        d="M68 172 L328 172 L354 152 L94 152 Z"
        fill="#f1e9db"
        stroke="#7a6248"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M68 172 L328 172 L328 236 L68 236 Z"
        fill="#ded1be"
        stroke="#7a6248"
        strokeWidth="1.4"
      />
      <path d="M68 236 L354 214 L354 236 L68 236 Z" fill="#c9b79f" opacity=".7" />
      <path d="M94 152 L354 152" stroke="#7a6248" strokeWidth="1.4" />
      <path
        d="M68 196 L328 196 M68 214 L328 214"
        stroke="#8b7154"
        strokeWidth=".8"
        opacity=".45"
      />
      {Array.from({ length: 9 }).map((_, i) => (
        <path
          key={i}
          d={`M${88 + i * 26} 154 L${88 + i * 26} 172`}
          stroke="#8b7154"
          strokeWidth=".7"
          opacity=".35"
        />
      ))}
      <path d="M110 154 L150 172 M178 154 L218 172 M246 154 L286 172" stroke="#8b7154" strokeWidth=".7" opacity=".3" />
      <path d="M84 246 L344 224" stroke="#7a6248" strokeWidth="1" strokeDasharray="4 5" opacity=".45" />
      <path d="M84 240 L84 252 M344 218 L344 230" stroke="#7a6248" strokeWidth="1" opacity=".6" />
    </>
  ),
  frame: (
    <>
      <rect x="86" y="94" width="24" height="156" rx="4" fill="#b1885f" stroke="#7a5636" strokeWidth="1.4" />
      <path d="M86 108 L110 108 M86 226 L110 226" stroke="#7a5636" strokeWidth=".8" opacity=".5" />
      <rect x="108" y="204" width="216" height="30" rx="3" fill="#a97f57" stroke="#7a5636" strokeWidth="1.4" />
      <rect x="108" y="176" width="216" height="34" rx="5" fill="#efe7d9" stroke="#7a6248" strokeWidth="1.4" />
      <path d="M124 176 L124 210 M308 176 L308 210" stroke="#c3b39d" strokeWidth=".9" />
      <rect x="132" y="152" width="76" height="28" rx="12" fill="#f6f0e4" stroke="#7a6248" strokeWidth="1.2" transform="rotate(-4 170 166)" />
      <rect x="222" y="149" width="76" height="28" rx="12" fill="#f6f0e4" stroke="#7a6248" strokeWidth="1.2" transform="rotate(3 260 163)" />
      <path d="M118 234 L118 258 M314 234 L314 258" stroke="#6d4f34" strokeWidth="4" />
      <path d="M100 262 L136 262 M300 262 L336 262" stroke="#7a5636" strokeWidth="1" strokeDasharray="3 4" opacity=".35" />
    </>
  ),
  side: (
    <>
      <rect x="132" y="164" width="136" height="13" rx="2" fill="#b1885f" stroke="#7a5636" strokeWidth="1.4" />
      <rect x="142" y="177" width="116" height="66" rx="2" fill="#cba77b" stroke="#7a5636" strokeWidth="1.4" />
      <path d="M142 208 L258 208" stroke="#7a5636" strokeWidth="1" />
      <circle cx="200" cy="193" r="3" fill="#6d4f34" />
      <path d="M150 243 L150 264 M250 243 L250 264" stroke="#6d4f34" strokeWidth="3" />
      <ellipse cx="200" cy="268" rx="72" ry="7" fill="#7a6248" opacity=".08" />
      <path d="M276 168 C296 168 300 140 284 132" stroke="#7a6248" strokeWidth="1.2" fill="none" />
      <circle cx="282" cy="129" r="10" fill="#c98d6b" opacity=".55" stroke="#7a6248" strokeWidth="1" />
    </>
  ),
  glow: (
    <>
      <circle cx="252" cy="154" r="64" fill="#f2c98d" opacity=".22" />
      <circle cx="252" cy="154" r="44" fill="#f2c98d" opacity=".18" />
      <ellipse cx="196" cy="258" rx="50" ry="10" fill="#b1885f" stroke="#7a5636" strokeWidth="1.4" />
      <path d="M196 196 L196 250" stroke="#7a5636" strokeWidth="3" />
      <path d="M148 192 L244 192 L268 130 L124 130 Z" fill="#f0e5d1" stroke="#7a6248" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M134 138 L258 138" stroke="#c9b79f" strokeWidth=".9" />
      <path d="M124 130 L268 130" stroke="#7a6248" strokeWidth="1.4" />
      <path d="M148 192 L244 192" stroke="#7a6248" strokeWidth="1" opacity=".5" />
      <path d="M300 96 L312 84 M318 122 L334 118 M288 66 L292 52" stroke="#b1885f" strokeWidth="1.1" opacity=".6" />
    </>
  ),
  sofa: (
    <>
      <rect x="64" y="166" width="272" height="62" rx="12" fill="#cfc6b6" stroke="#6f6656" strokeWidth="1.4" />
      <rect x="82" y="188" width="116" height="50" rx="10" fill="#ded6c8" stroke="#6f6656" strokeWidth="1.3" />
      <rect x="202" y="188" width="116" height="50" rx="10" fill="#ded6c8" stroke="#6f6656" strokeWidth="1.3" />
      <path d="M200 190 L200 236" stroke="#6f6656" strokeWidth="1" opacity=".45" />
      <rect x="52" y="178" width="22" height="74" rx="9" fill="#bdb3a2" stroke="#6f6656" strokeWidth="1.3" />
      <rect x="326" y="178" width="22" height="74" rx="9" fill="#bdb3a2" stroke="#6f6656" strokeWidth="1.3" />
      <path d="M90 252 L90 266 M310 252 L310 266" stroke="#5f5749" strokeWidth="4" />
      <path d="M112 158 L148 158" stroke="#8b8272" strokeWidth="1" strokeDasharray="3 4" opacity=".5" />
    </>
  ),
  chair: (
    <>
      <path d="M152 246 L168 168 L262 168 L252 246" fill="none" stroke="#7a5636" strokeWidth="1.4" />
      <path d="M150 190 L268 190 L262 218 L156 218 Z" fill="#d3b18a" stroke="#7a5636" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M166 168 L182 96 L222 92 L236 164" fill="none" stroke="#7a5636" strokeWidth="1.4" />
      <path d="M182 96 L232 96 L236 130 L180 132 Z" fill="#c79c70" stroke="#7a5636" strokeWidth="1.3" />
      <path d="M168 168 L160 246 M252 246 L262 168" stroke="#7a5636" strokeWidth="2.6" />
      <path d="M146 246 L176 246 M240 246 L270 246" stroke="#6d4f34" strokeWidth="3" />
      <path d="M152 232 L262 232" stroke="#7a5636" strokeWidth="1" opacity=".4" />
    </>
  ),
  coffee: (
    <>
      <path d="M92 166 L282 166 L322 146 L132 146 Z" fill="#cba77b" stroke="#7a5636" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M92 166 L282 166 L282 180 L92 180 Z" fill="#a97f57" stroke="#7a5636" strokeWidth="1.4" />
      <path d="M106 180 L118 252 M268 180 L256 252 M136 166 L126 252" stroke="#7a5636" strokeWidth="2.6" />
      <path d="M110 252 L134 252 M248 252 L272 252 M120 252 L142 252" stroke="#6d4f34" strokeWidth="3" />
      <ellipse cx="206" cy="262" rx="96" ry="8" fill="#7a6248" opacity=".08" />
      <path d="M196 118 L236 118 L232 146 L200 146 Z" fill="#e6d9c7" stroke="#7a6248" strokeWidth="1.1" />
    </>
  ),
  wardrobe: (
    <>
      <rect x="128" y="74" width="144" height="188" rx="3" fill="#b1885f" stroke="#6d4f34" strokeWidth="1.5" />
      <rect x="136" y="82" width="128" height="172" fill="#d3b18a" stroke="#6d4f34" strokeWidth="1.1" />
      <path d="M200 82 L200 254" stroke="#6d4f34" strokeWidth="1.4" />
      <path d="M192 160 L192 186 M208 160 L208 186" stroke="#6d4f34" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M136 236 L264 236" stroke="#6d4f34" strokeWidth="1" opacity=".5" />
      <path d="M140 262 L140 272 M260 262 L260 272" stroke="#5f4329" strokeWidth="3" />
      <ellipse cx="200" cy="274" rx="82" ry="7" fill="#7a6248" opacity=".08" />
      <path d="M292 110 L312 110 M292 124 L304 124" stroke="#8b7154" strokeWidth="1" strokeDasharray="3 4" opacity=".5" />
    </>
  ),
  rattan: (
    <>
      <path d="M200 34 L200 108" stroke="#7a5636" strokeWidth="1.4" />
      <path d="M140 188 Q200 88 260 188 Z" fill="#e3c9a2" stroke="#7a5636" strokeWidth="1.4" />
      <path d="M150 174 Q200 148 250 174 M156 160 Q200 138 244 160 M164 146 Q200 128 236 146" stroke="#a97f57" strokeWidth="1" fill="none" opacity=".7" />
      <path d="M140 188 L260 188" stroke="#7a5636" strokeWidth="1.4" />
      <path d="M200 188 L200 206" stroke="#7a5636" strokeWidth="1.2" />
      <circle cx="200" cy="212" r="9" fill="#f2c98d" opacity=".8" />
      <circle cx="200" cy="212" r="22" fill="#f2c98d" opacity=".18" />
      <path d="M142 96 L158 82 M258 84 L272 70" stroke="#b1885f" strokeWidth="1" opacity=".5" />
    </>
  ),
  vase: (
    <>
      <path
        d="M182 250 C158 224 160 192 176 176 L176 160 L224 160 L224 176 C240 192 242 224 218 250 Z"
        fill="#e6d9c7"
        stroke="#7a6248"
        strokeWidth="1.4"
      />
      <path d="M182 250 L218 250" stroke="#7a6248" strokeWidth="1.4" />
      <path d="M200 160 L200 96 M200 128 L176 106 M200 140 L226 116" stroke="#7a6248" strokeWidth="1.2" fill="none" />
      <ellipse cx="176" cy="106" rx="12" ry="5" fill="#a3a293" stroke="#6f6656" strokeWidth=".9" transform="rotate(-35 176 106)" />
      <ellipse cx="226" cy="116" rx="12" ry="5" fill="#a3a293" stroke="#6f6656" strokeWidth=".9" transform="rotate(35 226 116)" />
      <path d="M186 190 C196 186 204 194 214 188" stroke="#b9a78f" strokeWidth="1" fill="none" />
      <path d="M160 258 L242 258" stroke="#7a6248" strokeWidth="1" strokeDasharray="4 4" opacity=".4" />
      <ellipse cx="200" cy="264" rx="58" ry="7" fill="#7a6248" opacity=".08" />
    </>
  ),
  craft: (
    <>
      <path d="M88 214 Q88 254 132 254 Q176 254 176 214 Z" fill="#cba77b" stroke="#7a5636" strokeWidth="1.4" />
      <ellipse cx="132" cy="214" rx="44" ry="9" fill="#e6d9c7" stroke="#7a5636" strokeWidth="1.2" />
      <path d="M196 266 C184 240 190 214 200 198 C210 214 216 240 204 266 Z" fill="#d8c4a7" stroke="#7a6248" strokeWidth="1.3" />
      <path d="M200 198 L200 172" stroke="#7a6248" strokeWidth="1.2" />
      <circle cx="262" cy="232" r="30" fill="#b49a7c" stroke="#7a5636" strokeWidth="1.3" />
      <path d="M240 218 Q262 206 284 220 M238 236 Q262 226 286 238" stroke="#8b7154" strokeWidth=".9" fill="none" opacity=".7" />
      <ellipse cx="132" cy="264" rx="48" ry="7" fill="#7a6248" opacity=".08" />
      <ellipse cx="262" cy="266" rx="34" ry="7" fill="#7a6248" opacity=".08" />
    </>
  ),
};

function ProductVisual({ product }: { product: Product }) {
  const rendered = Boolean(product.model);
  return (
    <div className={`product-visual product-${product.image} ${rendered ? 'rendered-product' : ''}`}>
      {rendered && (
        <img
          className="product-render"
          src={`/products/${product.image}.webp`}
          alt={`${product.name} — 3D product render`}
          loading="lazy"
          onLoad={(e) => e.currentTarget.parentElement?.classList.add('render-ready')}
        />
      )}
      <span className="visual-orbit" aria-hidden="true" />
      <svg viewBox="0 0 400 320" className="product-art" aria-hidden="true">
        {productArt[product.image] ?? productArt.craft}
      </svg>
    </div>
  );
}

function ProductCard({ product }: { product: Product; index?: number }) {
  return (
    <Link to={'/product/' + product.id} className="product-card">
      <ProductVisual product={product} />
      <div className="product-card-info">
        <div>
          <span className="product-index">{product.category.toUpperCase()}</span>
          <h3>{product.name}</h3>
          <p>{product.subtitle}</p>
        </div>
        <div className="product-price">
          {formatIDR(product.price)} <ArrowUpRight size={16} />
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Chrome                                                             */
/* ------------------------------------------------------------------ */

function Header() {
  const cart = useShop((s) => s.cart);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const { user } = useAuth();
  const count = cart.reduce((n, x) => n + x.qty, 0);

  return (
    <header className="header">
      <Link className="brand" to="/" aria-label="ECOM beranda">
        <img
          src="/logos/ECOM-Black.png"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hide');
          }}
          alt="ECOM"
        />
        <span className="hide logo-fallback">ECOM</span>
      </Link>
      <nav className={menu ? 'nav active' : 'nav'}>
        <NavLink onClick={() => setMenu(false)} to="/">
          Home
        </NavLink>
        <NavLink onClick={() => setMenu(false)} to="/collection">
          Collection
        </NavLink>
        <NavLink onClick={() => setMenu(false)} to="/about">
          About
        </NavLink>
        <NavLink onClick={() => setMenu(false)} to="/admin/demo">
          Demo dashboard
        </NavLink>
      </nav>
      <div className="header-actions">
        <button className="icon-button" aria-label="Cari produk" onClick={() => setSearch((x) => !x)}>
          <Search size={19} />
        </button>
        <Link to="/cart" className="bag" aria-label={`Keranjang ${count} produk`}>
          <ShoppingBag size={19} />
          <sup>{count}</sup>
        </Link>
        <Link to={user ? '/account' : '/login'} className="icon-button" aria-label={user ? 'Akun' : 'Masuk'}>
          <UserRound size={19} />
        </Link>
        <button className="icon-button mobile-menu" aria-label="Menu" onClick={() => setMenu((v) => !v)}>
          {menu ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {search && (
        <form
          className="search-overlay"
          onSubmit={(e) => {
            e.preventDefault();
            nav('/collection?q=' + encodeURIComponent(q));
            setSearch(false);
          }}
        >
          <Search size={20} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kursi, kasur, material..."
          />
          <button type="submit">
            Search <ArrowRight size={17} />
          </button>
        </form>
      )}
    </header>
  );
}

function Footer() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <footer className="footer">
      <div>
        <img className="footer-logo" src="/logos/ECOM-White.png" alt="ECOM" />
        <p>
          Commerce, Reimagined.
          <br />
          Experience Before You Buy.
        </p>
        <div className="footer-social">
          <span>BANDA ACEH · INDONESIA</span>
          <span>EST. 2026</span>
        </div>
      </div>
      <div>
        <span>EXPLORE</span>
        <Link to="/collection">All collections</Link>
        <Link to="/studio/rest">3D product studio</Link>
        <Link to="/admin/demo">Demo dashboard</Link>
      </div>
      <div className="footer-news">
        <span>STAY IN THE LOOP</span>
        <p>Catatan produk, material, dan cerita dari workshop. Tanpa spam.</p>
        {sent ? (
          <p className="news-done">
            <Check size={15} /> Terima kasih telah bergabung.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.includes('@')) setSent(true);
            }}
          >
            <Mail size={16} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              aria-label="Alamat email"
            />
            <button type="submit" aria-label="Berlangganan">
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
      <small>
        © 2026 ECOM — Commerce, Reimagined.
      </small>
    </footer>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

/* ------------------------------------------------------------------ */
/*  Home                                                               */
/* ------------------------------------------------------------------ */

function Home() {
  const navigate = useNavigate();
  const allProducts = useShop((s) => s.products);
  const featured = useMemo(() => allProducts.slice(0, 4), [allProducts]);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            THE SLEEP COLLECTION
          </span>
          <h1>
            Rest well.
            <br />
            Know what
            <br />
            <em>lies beneath.</em>
          </h1>
          <p>
            Discover the craftsmanship, materials, and construction behind products designed for
            better living.
          </p>
          <div className="hero-cta">
            <button className="btn dark" onClick={() => navigate('/studio/rest')}>
              Explore in 3D <ArrowRight size={17} />
            </button>
            <Link className="text-link" to="/collection">
              Shop collection <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-facts">
            <div>
              <b>05</b>
              <span>engineered layers</span>
            </div>
            <div>
              <b>04</b>
              <span>size variants</span>
            </div>
            <div>
              <b>3D</b>
              <span>inspect before buy</span>
            </div>
          </div>
          <span className="hero-bottom">
            AN OBJECT OF COMFORT, MADE UNDERSTANDABLE. <ArrowDown size={15} />
          </span>
        </div>
        <div className="hero-scene">
          <span className="scene-corner tl" />
          <span className="scene-corner tr" />
          <span className="scene-corner bl" />
          <span className="scene-corner br" />
          <Model />
          <div className="hero-scene-top">
            ECOM REST <span> / </span> HYBRID MATTRESS
          </div>
          <button className="scene-hotspot" onClick={() => navigate('/studio/rest')}>
            INSPECT PRODUCT <ArrowRight size={16} />
          </button>
          <div className="hero-scene-bottom">DRAG TO ROTATE &nbsp; · &nbsp; SCROLL TO ZOOM</div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i}>
              POCKET SPRING CORE <i>✦</i> QUILTED TEXTILE <i>✦</i> MADE IN INDONESIA <i>✦</i>{' '}
              FIVE ENGINEERED LAYERS <i>✦</i> SEE BEFORE YOU BUY <i>✦</i>
            </span>
          ))}
        </div>
      </div>

      <section className="editorial">
        <div className="editorial-label">THE APPROACH</div>
        <div>
          <h2>
            See beyond
            <br />
            <em>the surface.</em>
          </h2>
          <p>
            Belanja yang lebih baik dimulai dari pemahaman yang lebih baik. Jelajahi detail, bahan,
            konstruksi, dan ukuran sebelum memutuskan.
          </p>
          <Link className="text-link" to="/studio/rest">
            Enter the product studio <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="values">
        <div>
          <Layers size={22} />
          <h3>Construction, shown.</h3>
          <p>Setiap lapisan dapat dibuka, dipisah, dan dipelajari lewat model 3D.</p>
        </div>
        <div>
          <Ruler size={22} />
          <h3>Measurements, real.</h3>
          <p>Ukuran centimeter ditampilkan langsung pada objek — tanpa menebak.</p>
        </div>
        <div>
          <Leaf size={22} />
          <h3>Materials, honest.</h3>
          <p>Bahan dan status verifikasi ditulis apa adanya, bukan sekadar klaim.</p>
        </div>
      </section>

      <section className="home-collection">
        <div className="section-header">
          <div>
            <span className="eyebrow">THE CURATED EDIT</span>
            <h2>Objects for living.</h2>
          </div>
          <Link to="/collection" className="text-link">
            View all products <ArrowRight size={17} />
          </Link>
        </div>
        <div className="featured-grid">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      <section className="statement">
        <span>CRAFT MEETS CLARITY</span>
        <h2>
          Not just a product image.
          <br />
          <em>A better way to decide.</em>
        </h2>
        <Link to="/about">
          Discover ECOM <ArrowRight size={18} />
        </Link>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Catalog                                                            */
/* ------------------------------------------------------------------ */

function Collection() {
  const products = useShop((s) => s.products);
  const query = new URLSearchParams(useLocation().search).get('q') ?? '';
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const [q, setQ] = useState(query);

  useEffect(() => setQ(query), [query]);

  const filtered = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (category === 'All' || p.category === category) &&
            `${p.name} ${p.subtitle} ${p.material}`.toLowerCase().includes(q.toLowerCase()),
        )
        .sort((a, b) =>
          sort === 'low'
            ? a.price - b.price
            : sort === 'high'
              ? b.price - a.price
              : a.name.localeCompare(b.name),
        ),
    [products, category, sort, q],
  );

  const reset = () => {
    setCategory('All');
    setQ('');
    setSort('featured');
  };

  return (
    <main className="catalog page">
      <div className="page-intro">
        <span className="eyebrow">A CONSIDERED COLLECTION / 2026</span>
        <h1>
          Made to <em>be understood.</em>
        </h1>
        <p>
          Produk untuk ruang yang Anda huni. Telusuri bahan, proporsi, dan opsi pembelian dengan
          mudah.
        </p>
      </div>
      <div className="collection-controls">
        <div className="category-tabs">
          {['All', 'Sleep', 'Living', 'Craft'].map((c) => (
            <button className={c === category ? 'active' : ''} onClick={() => setCategory(c)} key={c}>
              {c}
            </button>
          ))}
        </div>
        <div className="filter-right">
          <label>
            <Search size={17} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search collection" />
          </label>
          <label>
            <SlidersHorizontal size={17} />
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Name A–Z</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>
      <div className="result-bar">
        <p className="result-count">
          {filtered.length} PRODUCTS {category !== 'All' && <span>· {category}</span>}
        </p>
        {(q || category !== 'All') && (
          <button className="clear-filters" onClick={reset}>
            Clear filters <X size={13} />
          </button>
        )}
      </div>
      {filtered.length ? (
        <div className="catalog-grid">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="empty-state compact">
          <Search size={30} />
          <h2>No matches.</h2>
          <p>Coba kata kunci lain atau lihat seluruh koleksi.</p>
          <button className="btn dark" onClick={reset}>
            Reset filters
          </button>
        </div>
      )}
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Product detail                                                     */
/* ------------------------------------------------------------------ */

function ProductDetail() {
  const { id } = useParams();
  const p = useShop((s) => s.products.find((x) => x.id === id));
  const variantStock = useShop((s) => s.variantStock);
  const add = useShop((s) => s.add);
  const [variant, setVariant] = useState('queen');
  const navigate = useNavigate();

  if (!p)
    return (
      <main className="page">
        <h1>Produk tidak ditemukan.</h1>
        <Link to="/collection">Back to collection</Link>
      </main>
    );

  const mattress = p.id === 'rest';
  const available = mattress ? variantStock[variant] : p.stock;
  const selectedVariant = mattress ? variant : 'standard';

  return (
    <main className="product-detail page">
      <Link className="back-link" to="/collection">
        <ArrowLeft size={16} /> Back to collection
      </Link>
      <div className="detail-grid">
        <div className="detail-showcase">
          {p.model ? (
            <Model studio={p.model !== 'mattress'} product={p.model} />
          ) : (
            <ProductVisual product={p} />
          )}
          <span className="detail-notation">ECOM / OBJECT STUDY / {p.id.toUpperCase()}</span>
        </div>
        <div className="detail-info">
          <span className="eyebrow">
            {p.category.toUpperCase()} COLLECTION / OBJECT 001
          </span>
          <h1>{p.name}</h1>
          <h2>{p.subtitle}</h2>
          <p className="detail-price">{formatIDR(productPrice(p, selectedVariant))}</p>
          <p>{p.description}</p>
          {mattress && (
            <>
              <span className="field-label">SELECT SIZE</span>
              <div className="size-grid">
                {variants.map((v) => (
                  <button
                    className={variant === v.id ? 'selected' : ''}
                    key={v.id}
                    onClick={() => setVariant(v.id)}
                  >
                    <b>{v.label}</b>
                    <small>
                      {v.width} × {v.length} cm
                    </small>
                  </button>
                ))}
              </div>
            </>
          )}
          <p className="stock-label">
            {available > 0 ? `${available} tersedia` : 'Stok habis'}
          </p>
          <button
            className="btn dark wide"
            disabled={available <= 0}
            onClick={() => {
              add(p.id, selectedVariant);
              navigate('/cart');
            }}
          >
            Add to bag <ShoppingBag size={18} />
          </button>
          {p.model && (
            <Link className="btn outline wide" to={'/studio/' + p.id}>
              Explore in 3D <ArrowRight size={18} />
            </Link>
          )}
          <div className="assurance">
            <span>
              <Truck size={16} /> Pengiriman dihitung saat checkout
            </span>
            <span>
              <ShieldCheck size={16} /> Data produk bersifat ilustratif
            </span>
          </div>
          <div className="spec-list">
            <div>
              <span>Materials</span>
              <p>{p.material}</p>
            </div>
            <div>
              <span>Dimensions</span>
              <p>{p.dimensions}</p>
            </div>
            <div>
              <span>Origin</span>
              <p>Indonesia</p>
            </div>
            <div>
              <span>Care</span>
              <p>Rawat sesuai petunjuk bahan; detail aktual memerlukan verifikasi produsen.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Studio                                                             */
/* ------------------------------------------------------------------ */

function LayerStack({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const max = Math.max(...layerInfo.map((l) => l.thickness));
  return (
    <div className="layer-stack">
      {layerInfo.map((l) => (
        <button
          key={l.id}
          className={selected === l.id ? 'active' : ''}
          onClick={() => onSelect(l.id)}
          style={{ flexGrow: l.thickness / max }}
        >
          <span>{l.name}</span>
          <b>{l.thickness} cm</b>
        </button>
      ))}
    </div>
  );
}

function Meter({ label, value, caption }: { label: string; value: number; caption: string }) {
  return (
    <div className="meter">
      <div>
        <span>{label}</span>
        <em>{caption}</em>
      </div>
      <i>
        <b style={{ width: `${value}%` }} />
      </i>
    </div>
  );
}

function MaterialDetailVisual({ id }: { id: string }) {
  return (
    <svg className={`material-detail-visual detail-${id}`} viewBox="0 0 520 260" aria-hidden="true">
      <defs>
        <pattern id={`grid-${id}`} width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M0 11H22M11 0V22" fill="none" stroke="currentColor" strokeWidth=".7" opacity=".28" />
        </pattern>
      </defs>
      <rect width="520" height="260" fill="currentColor" opacity=".08" />
      {id === 'cover' && (
        <>
          <path d="M0 42L42 0M0 86L86 0M0 130L130 0M0 174L174 0M0 218L218 0M0 260L260 0M44 260L304 0M88 260L348 0M132 260L392 0M176 260L436 0M220 260L480 0M264 260L520 4M308 260L520 48M352 260L520 92M396 260L520 136" stroke="currentColor" strokeWidth="2" opacity=".38" />
          <path d="M0 0L260 260M44 0L304 260M88 0L348 260M132 0L392 260M176 0L436 260M220 0L480 260M264 0L520 256" stroke="currentColor" strokeWidth="1.4" opacity=".24" />
          <circle cx="260" cy="130" r="52" fill="none" stroke="currentColor" strokeWidth="2" opacity=".58" />
          <circle cx="260" cy="130" r="7" fill="currentColor" opacity=".64" />
        </>
      )}
      {(id === 'comfort' || id === 'transition' || id === 'base') && (
        <>
          <rect x="22" y="22" width="476" height="216" fill={`url(#grid-${id})`} />
          {Array.from({ length: 32 }).map((_, i) => (
            <circle key={i} cx={35 + ((i * 73) % 450)} cy={34 + ((i * 47) % 190)} r={3 + (i % 5)} fill="currentColor" opacity={.12 + (i % 4) * .06} />
          ))}
          <path d="M40 184C120 108 178 205 254 128S390 81 482 145" fill="none" stroke="currentColor" strokeWidth="3" opacity=".45" />
        </>
      )}
      {id === 'springs' && (
        <>
          {Array.from({ length: 8 }).map((_, col) => (
            <path key={col} d={`M${42 + col * 62} 222 C${12 + col * 62} 202 ${72 + col * 62} 182 ${42 + col * 62} 162 S${72 + col * 62} 122 ${42 + col * 62} 102 S${72 + col * 62} 62 ${42 + col * 62} 42`} fill="none" stroke="currentColor" strokeWidth="4" opacity=".62" />
          ))}
          <path d="M20 226H500M20 38H500" stroke="currentColor" strokeWidth="2" opacity=".3" />
        </>
      )}
      <path d="M18 18H78M18 18V64M502 242H442M502 242V196" stroke="currentColor" strokeWidth="1.5" opacity=".7" />
    </svg>
  );
}

function Studio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = useShop((s) => s.products.find((p) => p.id === id));
  const add = useShop((s) => s.add);
  const variantStock = useShop((s) => s.variantStock);
  const [mode, setMode] = useState<Mode>('inspect');
  const [explode, setExplode] = useState(0);
  const [selected, setSelected] = useState<string | null>('cover');
  const [variant, setVariant] = useState('queen');
  const [fabric, setFabric] = useState('#e9e2d7');
  const [passport, setPassport] = useState(false);
  const [info, setInfo] = useState(true);
  const [detailLayer, setDetailLayer] = useState<string | null>(null);
  const [showTracking, setShowTracking] = useState(true);

  if (!product?.model)
    return (
      <main className="page">
        <h1>3D studio not available</h1>
        <Link to="/collection">Back to collection</Link>
      </main>
    );

  const v = variants.find((x) => x.id === variant)!;
  const mattress = product.model === 'mattress';
  const stockCount = mattress ? variantStock[variant] : product.stock;
  const selectedLayer = layerInfo.find((x) => x.id === selected);

  return (
    <main className="studio">
      <div className="studio-main">
        <div className="studio-toolbar">
          <button onClick={() => navigate('/collection')}>
            <ArrowLeft size={17} /> Collection
          </button>
          <span>ECOM / PRODUCT STUDIO</span>
          <button
            onClick={() => {
              setMode('inspect');
              setExplode(0);
              setSelected(null);
            }}
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
        <Model
          studio
          mode={mattress ? mode : 'inspect'}
          explode={explode}
          width={v.width / 100}
          length={v.length / 100}
          selected={selected}
          onSelect={setSelected}
          fabric={fabric}
          product={product.model}
          showTracking={mattress && showTracking && !detailLayer && (mode === 'explode' || mode === 'xray')}
          onDetail={(layer) => {
            setSelected(layer);
            setDetailLayer(layer);
          }}
        />
        {detailLayer && (() => {
          const layer = layerInfo.find((item) => item.id === detailLayer);
          if (!layer) return null;
          return (
            <div className="material-modal" role="dialog" aria-modal="true" aria-label={`${layer.name} material details`}>
              <button className="material-modal-close" onClick={() => setDetailLayer(null)} aria-label="Close material details"><X size={18} /></button>
              <div className="material-modal-art">
                <MaterialDetailVisual id={layer.id} />
                <span>MACRO MATERIAL STUDY</span>
              </div>
              <div className="material-modal-copy">
                <span className="eyebrow">LAYER {String(layerInfo.indexOf(layer) + 1).padStart(2, '0')} / CONSTRUCTION DETAIL</span>
                <h2>{layer.name}</h2>
                <p>{layer.detail}</p>
                <div className="material-facts">
                  <div><span>THICKNESS</span><b>{layer.thickness} cm</b></div>
                  <div><span>ROLE</span><b>{layer.id === 'cover' ? 'Surface comfort' : layer.id === 'springs' ? 'Core support' : layer.id === 'base' ? 'Foundation' : 'Pressure relief'}</b></div>
                  
                </div>
                <small>Visualisasi ini membantu menjelaskan struktur produk dan bukan foto mikroskopis atau klaim material yang telah diverifikasi produsen.</small>
              </div>
            </div>
          );
        })()}
        <div className="studio-controls">
          {mattress ? (
            modes.map((m) => (
              <button
                key={m.id}
                className={mode === m.id ? 'active' : ''}
                onClick={() => {
                  setMode(m.id);
                  setExplode(m.id === 'explode' ? 1 : 0);
                }}
              >
                {m.label}
              </button>
            ))
          ) : (
            <span>Click the product to interact · Drag to rotate</span>
          )}
        </div>
        {mattress && (mode === 'explode' || mode === 'xray') && (
          <button className="tracking-toggle" onClick={() => setShowTracking((value) => !value)}>
            {showTracking ? <EyeOff size={15} /> : <Eye size={15} />}
            {showTracking ? 'Hide labels' : 'Show labels'}
          </button>
        )}
        <div className="studio-footnote">
          <span>3D PRODUCT VISUALIZATION</span>
          <span>DRAG · ROTATE &nbsp; / &nbsp; SCROLL · ZOOM</span>
        </div>
      </div>

      <aside className="studio-side">
        <div className="studio-side-top">
          <span className="eyebrow">{product.category.toUpperCase()} / THE OBJECT STUDY</span>
          <h1>{product.name}</h1>
          <p>{product.subtitle}</p>
          <div className="side-price">{formatIDR(productPrice(product, variant))}</div>
        </div>
        <div className="studio-side-content">
          {mattress && (
            <>
              <div className="field-group">
                <div className="field-heading">
                  <span>01 / SIZE</span>
                  <small>
                    {v.width} × {v.length} × 28 CM
                  </small>
                </div>
                <div className="size-grid compact">
                  {variants.map((x) => (
                    <button
                      key={x.id}
                      className={variant === x.id ? 'selected' : ''}
                      onClick={() => setVariant(x.id)}
                    >
                      {x.label}
                    </button>
                  ))}
                </div>
              </div>

              {mode === 'explode' && (
                <div className="field-group">
                  <div className="field-heading">
                    <span>02 / EXPLODED ASSEMBLY</span>
                    <small>{Math.round(explode * 100)}%</small>
                  </div>
                  <input
                    aria-label="Exploded view separation"
                    className="range"
                    type="range"
                    min="0"
                    max="100"
                    value={exploreInt(explode)}
                    onChange={(e) => setExplode(Number(e.target.value) / 100)}
                  />
                  <div className="button-pair">
                    <button onClick={() => setExplode(0)}>Assemble</button>
                    <button onClick={() => setExplode(1)}>Disassemble</button>
                  </div>
                </div>
              )}

              {mode === 'materials' && (
                <div className="field-group">
                  <span className="field-heading">02 / TEXTILE COLOR</span>
                  <div className="swatches">
                    {fabrics.map((x) => (
                      <button
                        key={x.c}
                        title={x.l}
                        aria-label={x.l}
                        className={fabric === x.c ? 'selected' : ''}
                        onClick={() => setFabric(x.c)}
                        style={{ background: x.c }}
                      />
                    ))}
                  </div>
                  <small>Selected textile color.</small>
                </div>
              )}

              {mode === 'dimensions' ? (
                <div className="field-group">
                  <span className="field-heading">MEASURED PROFILE</span>
                  <div className="measure-grid">
                    <div>
                      <span>WIDTH</span>
                      <b>{v.width}</b>
                      <small>cm</small>
                    </div>
                    <div>
                      <span>LENGTH</span>
                      <b>{v.length}</b>
                      <small>cm</small>
                    </div>
                    <div>
                      <span>HEIGHT</span>
                      <b>28</b>
                      <small>cm</small>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="field-group">
                    <div className="field-heading">
                      <span>02 / INTERNAL CONSTRUCTION</span>
                      <small>5 LAYERS</small>
                    </div>
                    <LayerStack selected={selected} onSelect={setSelected} />
                    {selectedLayer && (
                      <div className="layer-detail">
                        <span>COMPONENT DETAILS</span>
                        <h3>{selectedLayer.name}</h3>
                        <p>{selectedLayer.detail}</p>
                      </div>
                    )}
                  </div>

                  <div className="field-group">
                    <span className="field-heading">03 / COMFORT PROFILE</span>
                    <Meter label="Support" value={78} caption="Medium-firm" />
                    <Meter label="Pressure relief" value={66} caption="Balanced" />
                    <Meter label="Motion isolation" value={84} caption="High" />
                    <small className="fineprint">Comfort profile</small>
                  </div>
                </>
              )}

            </>
          )}

          {!mattress && (
            <>
              <p className="interaction-info">
                {product.model === 'wardrobe'
                  ? 'Click the doors to open or close the cabinet.'
                  : product.model === 'lamp'
                    ? 'Click the lamp to switch the illumination on or off.'
                    : 'Drag to rotate and inspect the object from every angle.'}
              </p>
              <div className="field-group">
                <span className="field-heading">01 / SPECIFICATION</span>
                <div className="mini-spec">
                  <p>
                    <span>Materials</span>
                    <b>{product.material}</b>
                  </p>
                  <p>
                    <span>Dimensions</span>
                    <b>{product.dimensions}</b>
                  </p>
                  <p>
                    <span>Category</span>
                    <b>{product.category}</b>
                  </p>
                </div>
              </div>
            </>
          )}

          <button className="passport-toggle" onClick={() => setPassport((x) => !x)}>
            <ClipboardList size={17} /> Product passport
            <ChevronDown size={16} />
          </button>
          {passport && (
            <div className="passport">
              <p>
                <strong>Identifier</strong> {product.id.toUpperCase()}
              </p>
              <p>
                <strong>Maker</strong> ECOM artisan partner
              </p>
              <p>
                <strong>Region</strong> Indonesia
              </p>
              <p>
                <strong>Materials</strong> {product.material}
              </p>
              <p>
                <strong>Dimensions</strong> {product.dimensions}
              </p>
              <p>
                <strong>Care</strong> General dry-clean maintenance
              </p>
              <p>
                <strong>Certification</strong> Not verified
              </p>
              <p>
                <strong>Warranty</strong> Not supplied
              </p>
              <small>Passport entries are sample data, not verified claims.</small>
            </div>
          )}
        </div>
        <div className="studio-purchase">
          <div className="stock-label">
            {stockCount} in stock
          </div>
          <button
            className="btn dark wide"
            disabled={stockCount <= 0}
            onClick={() => {
              add(product.id, mattress ? variant : 'standard');
              setInfo(true);
            }}
          >
            Add to bag <ShoppingBag size={18} />
          </button>
          {info && (
            <Link to="/cart" className="small-cart-link">
              View your bag <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </aside>
    </main>
  );
}

const exploreInt = (n: number) => Math.round(n * 100);

/* ------------------------------------------------------------------ */
/*  Cart & checkout                                                    */
/* ------------------------------------------------------------------ */

function Cart() {
  const cart = useShop((s) => s.cart);
  const products = useShop((s) => s.products);
  const change = useShop((s) => s.change);
  const remove = useShop((s) => s.remove);
  const subtotal = total(cart, products);
  const freeAt = 3000000;
  const remaining = Math.max(0, freeAt - subtotal);
  const suggestions = products.filter((p) => !cart.some((c) => c.id === p.id)).slice(0, 4);

  return (
    <main className="page commerce-page">
      <span className="eyebrow">YOUR SELECTION</span>
      <h1>
        Shopping <em>bag.</em>
      </h1>
      {cart.length ? (
        <div className="cart-layout">
          <div>
            <div className="shipping-meter">
              <span>
                {remaining > 0 ? (
                  <>
                    Tambah <b>{formatIDR(remaining)}</b> lagi untuk gratis pengiriman.
                  </>
                ) : (
                  <>
                    <Check size={15} /> Gratis pengiriman sudah aktif.
                  </>
                )}
              </span>
              <i>
                <b style={{ width: `${Math.min(100, (subtotal / freeAt) * 100)}%` }} />
              </i>
            </div>
            {cart.map((item) => {
              const p = products.find((x) => x.id === item.id);
              if (!p) return null;
              return (
                <div className="cart-line" key={item.id + item.variant}>
                  <div className="mini-visual">
                    <img src={`/products/${p.image}.webp`} alt={`${p.name} 3D render`} />
                    <svg viewBox="0 0 400 320" aria-hidden="true">
                      {productArt[p.image] ?? productArt.craft}
                    </svg>
                  </div>
                  <div className="cart-line-text">
                    <h3>{p.name}</h3>
                    <p>
                      {p.subtitle} {p.id === 'rest' ? ' / ' + item.variant : ''}
                    </p>
                    <strong>{formatIDR(productPrice(p, item.variant))}</strong>
                  </div>
                  <div className="qty">
                    <button aria-label="Kurangi" onClick={() => change(item.id, item.variant, -1)}>
                      <Minus size={14} />
                    </button>
                    <span>{item.qty}</span>
                    <button aria-label="Tambah" onClick={() => change(item.id, item.variant, 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    aria-label="Hapus"
                    className="icon-button"
                    onClick={() => remove(item.id, item.variant)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              );
            })}

            {suggestions.length > 0 && (
              <section className="cart-suggest">
                <div className="section-header small">
                  <h2>Complete the room.</h2>
                  <Link className="text-link" to="/collection">
                    View all <ArrowRight size={15} />
                  </Link>
                </div>
                <div className="suggest-grid">
                  {suggestions.map((p) => (
                    <Link key={p.id} to={'/product/' + p.id} className="suggest-card">
                      <ProductVisual product={p} />
                      <div>
                        <h3>{p.name}</h3>
                        <span>{formatIDR(p.price)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
          <aside className="order-summary">
            <span className="eyebrow">ORDER SUMMARY</span>
            <div>
              <span>Subtotal</span>
              <strong>{formatIDR(subtotal)}</strong>
            </div>
            <div>
              <span>Shipping</span>
              <span>{remaining > 0 ? 'Calculated separately' : 'Free'}</span>
            </div>
            <div className="summary-total">
              <span>Estimated total</span>
              <strong>{formatIDR(subtotal)}</strong>
            </div>
            <Link className="btn dark wide" to="/checkout">
              Proceed to checkout <ArrowRight size={17} />
            </Link>
            <small>Checkout simulasi. Tidak ada transaksi pembayaran sungguhan.</small>
          </aside>
        </div>
      ) : (
        <div className="empty-state">
          <ShoppingBag size={36} />
          <h2>Your bag is empty.</h2>
          <p>Temukan koleksi kami dan pilih produk yang sesuai.</p>
          <Link className="btn dark" to="/collection">
            Explore collection <ArrowRight size={17} />
          </Link>
        </div>
      )}
    </main>
  );
}

const paymentMethods = [
  { id: 'transfer', label: 'Bank transfer', note: 'Virtual account', icon: Wallet },
  { id: 'qris', label: 'QRIS', note: 'Scan to pay', icon: QrCode },
  { id: 'cod', label: 'Cash on delivery', note: 'Bayar di tempat', icon: Truck },
];

function Checkout() {
  const cart = useShop((s) => s.cart);
  const products = useShop((s) => s.products);
  const setProducts = useShop((s) => s.setProducts);
  const clearCart = useShop((s) => s.clearCart);
  const { user } = useAuth();
  const [done, setDone] = useState('');
  const [error, setError] = useState('');
  const [method, setMethod] = useState('transfer');
  const totalDue = total(cart, products);

  return (
    <main className="page commerce-page">
      <span className="eyebrow">SECURE CHECKOUT</span>
      <h1>
        Almost <em>yours.</em>
      </h1>
      {done ? (
        <div className="checkout-success">
          <div className="success-mark">
            <Check size={30} />
          </div>
          <span className="eyebrow">ORDER CONFIRMED</span>
          <h2>Pesanan berhasil dibuat.</h2>
          <p>
            Nomor pesanan <strong>{done}</strong> · metode{' '}
            <strong>{paymentMethods.find((m) => m.id === method)?.label}</strong>
          </p>
          <p>Belum ada pembayaran, pengiriman, atau email yang diproses.</p>
          <div className="success-actions">
            <Link to="/collection" className="btn dark">
              Continue shopping <ArrowRight size={17} />
            </Link>
            <Link to="/account" className="text-link">
              See my orders
            </Link>
          </div>
        </div>
      ) : cart.length ? (
        <div className="checkout-layout">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setError('');
              try {
                const response = await fetch('/api/orders', {
                  method: 'POST',
                  credentials: 'same-origin',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    items: cart,
                    customer: fd.get('name'),
                    email: user?.email,
                    address: fd.get('address'),
                    payment: method,
                  }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Pesanan gagal dibuat');
                setDone(data.order.id);
                if (data.products) setProducts(data.products);
                clearCart();
              } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
              }
            }}
          >
            <div className="form-block">
              <h2>Contact & delivery</h2>
              <div className="form-grid">
                <label>
                  Full name
                  <input name="name" minLength={2} required placeholder="Nama lengkap" />
                </label>
                <label>
                  Email
                  <input type="email" name="email" required placeholder="name@example.com" />
                </label>
                <label className="span2">
                  Delivery address
                  <textarea
                    name="address"
                    required
                    minLength={12}
                    placeholder="Alamat lengkap, kota, kode pos"
                    rows={4}
                  />
                </label>
              </div>
            </div>

            <div className="form-block">
              <h2>Payment</h2>
              <div className="payment-options">
                {paymentMethods.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={method === m.id ? 'selected' : ''}
                      onClick={() => setMethod(m.id)}
                    >
                      <Icon size={19} />
                      <span>
                        <b>{m.label}</b>
                        <small>{m.note}</small>
                      </span>
                      <i className="radio-dot" />
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <p role="alert">{error}</p>}
            <button className="btn dark wide" type="submit">
              Place order <ArrowRight size={17} />
            </button>
            <small className="checkout-note">
              No payment collected. Your order is saved to your account.
            </small>
          </form>
          <aside className="order-summary">
            <span className="eyebrow">YOUR ORDER</span>
            {cart.map((i) => {
              const p = products.find((x) => x.id === i.id);
              if (!p) return null;
              return (
                <div key={i.id + i.variant} className="summary-item">
                  <div className="thumb">
                    <img src={`/products/${p.image}.webp`} alt="" />
                    <svg viewBox="0 0 400 320" aria-hidden="true">
                      {productArt[p.image] ?? productArt.craft}
                    </svg>
                  </div>
                  <span>
                    {p.name} {i.id === 'rest' ? `(${i.variant})` : ''} × {i.qty}
                  </span>
                  <strong>{formatIDR(productPrice(p, i.variant) * i.qty)}</strong>
                </div>
              );
            })}
            <div>
              <span>Subtotal</span>
              <strong>{formatIDR(totalDue)}</strong>
            </div>
            <div>
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>{formatIDR(totalDue)}</strong>
            </div>
            <small>
              <ShieldCheck size={14} /> Pesanan disimpan aman di akun Anda.
            </small>
          </aside>
        </div>
      ) : (
        <div className="empty-state">
          <h2>Cart is empty.</h2>
          <Link to="/collection">Browse products</Link>
        </div>
      )}
    </main>
  );
}

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (user) navigate(user.role === 'customer' ? '/account' : '/admin', { replace: true });
  }, [user, navigate]);
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <span className="eyebrow">ECOM ACCOUNT</span>
        <h1>Welcome <em>back.</em></h1>
        <p>Masuk untuk mengakses akun dan workspace sesuai role Anda.</p>
        <form onSubmit={async (event) => {
          event.preventDefault();
          setSubmitting(true);
          setError('');
          const form = new FormData(event.currentTarget);
          try {
            const next = await login(String(form.get('email')), String(form.get('password')));
            const from = (location.state as { from?: string } | null)?.from;
            navigate(from || (next.role === 'customer' ? '/account' : '/admin'), { replace: true });
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Tidak dapat masuk');
          } finally {
            setSubmitting(false);
          }
        }}>
          <label>Email<input name="email" type="email" autoComplete="username" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="btn dark wide" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'} <ArrowRight size={16} /></button>
        </form>
        <div className="demo-access" aria-label="Demo credentials">
          <span>JURY DEMO ACCESS</span>
          <p>Gunakan akun sesuai role untuk menguji akses workspace.</p>
          <div><b>Customer</b><code>customer@ecom.local</code><code>xhUUKNEVmPQGeZNm</code></div>
          <div><b>Merchant</b><code>merchant@ecom.local</code><code>Nz3Rd9V9BlM7Jevg</code></div>
          <div><b>Admin</b><code>admin@ecom.local</code><code>q5Tk_HYnfYnJDYMN</code></div>
        </div>
      </section>
      <aside className="auth-visual"><div><span>ROLE-BASED ACCESS</span><h2>One account.<br/>The right workspace.</h2><p>Customer, merchant, dan administrator memiliki hak akses terpisah yang divalidasi server.</p></div></aside>
    </main>
  );
}

function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Array<{ id: string; date: string; total: number; status: string }>>([]);
  useEffect(() => {
    if (!user) return;
    fetch('/api/orders', { credentials: 'same-origin' })
      .then((response) => response.ok ? response.json() : { orders: [] })
      .then((data) => setOrders(data.orders || []))
      .catch(() => undefined);
  }, [user]);
  if (!user) return null;
  return (
    <main className="page account-page">
      <span className="eyebrow">MY ECOM</span>
      <h1>Hello, <em>{user.name}.</em></h1>
      <div className="account-grid">
        <section><span>ACCOUNT</span><h2>{user.email}</h2><p>Role: {user.role}</p></section>
        <section><span>ACCESS</span><h2>{user.role === 'customer' ? 'Customer account' : 'Merchant workspace'}</h2>{user.role !== 'customer' && <Link className="text-link" to="/admin">Open workspace <ArrowRight size={15}/></Link>}</section>
      </div>
      <div className="account-orders">
        <span className="eyebrow">MY ORDERS · {orders.length}</span>
        {orders.length ? orders.map((order) => (
          <div key={order.id} className="account-order">
            <strong>{order.id}</strong>
            <small>{new Date(order.date).toLocaleDateString('id-ID')}</small>
            <span>{formatIDR(order.total)}</span>
            <span className="status-pill">{order.status}</span>
          </div>
        )) : <p>Belum ada pesanan.</p>}
      </div>
      <button className="text-link" onClick={async () => { await logout(); navigate('/'); }}>Sign out <LogOut size={15}/></button>
    </main>
  );
}

const demoUsers: AuthUser[] = [
  { id: 'demo-customer', name: 'Rina Demo', email: 'rina@example.com', role: 'customer' },
  { id: 'demo-merchant', name: 'Ari Demo', email: 'ari@example.com', role: 'merchant' },
  { id: 'demo-admin', name: 'Admin Demo', email: 'admin@example.com', role: 'admin' },
];

const demoOrders: Order[] = [
  {
    id: 'DEMO-001', date: '2026-11-25T03:00:00.000Z', customer: 'Rina Demo',
    email: 'rina@example.com', address: 'Alamat contoh, Banda Aceh',
    items: [{ id: seedProducts[0].id, variant: '', qty: 1 }],
    total: seedProducts[0].price, status: 'Pending',
  },
];

function UserManagement({ demo }: { demo: boolean }) {
  const [users, setUsers] = useState<AuthUser[]>(demo ? demoUsers : []);
  const [error, setError] = useState('');
  const load = async () => {
    const response = await fetch('/api/admin/users', { credentials: 'same-origin' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Tidak dapat memuat user');
    setUsers(data.users);
  };
  useEffect(() => {
    if (!demo) void load().catch((reason) => setError(String(reason)));
  }, [demo]);
  const updateRole = async (id: string, role: Role) => {
    if (demo) {
      setUsers((current) => current.map((item) => item.id === id ? { ...item, role } : item));
      return;
    }
    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error || 'Tidak dapat mengubah role');
    setUsers(data.users);
  };
  return <div className="data-table">
    <div className="data-row users-row table-titles"><span>USER</span><span>ROLE</span><span>STATUS</span></div>
    {users.map((item) => <div className="data-row users-row" key={item.id}><span><strong>{item.name}</strong><small>{item.email}</small></span><select value={item.role} onChange={(event) => void updateRole(item.id, event.target.value as Role)}>{['customer','merchant','admin'].map((role) => <option key={role}>{role}</option>)}</select><span className="status-pill completed">Active</span></div>)}
    {error && <p className="admin-empty" role="alert">{error}</p>}
  </div>;
}

/* ------------------------------------------------------------------ */
/*  About                                                              */
/* ------------------------------------------------------------------ */

function About() {
  return (
    <main className="page about-page">
      <span className="eyebrow">THE IDEA BEHIND ECOM</span>
      <h1>
        Understanding changes <em>everything.</em>
      </h1>
      <p>
        ECOM menggabungkan pengalaman belanja yang sederhana dengan studio produk interaktif. Tujuan
        kami adalah membantu UMKM kreatif mengomunikasikan nilai bahan, struktur, dan kualitas
        karyanya.
      </p>
      <div className="about-grid">
        <div>
          <span>01 / DISCOVER</span>
          <h2>Browse without friction.</h2>
          <p>Katalog tetap bisa digunakan tanpa perangkat 3D.</p>
        </div>
        <div>
          <span>02 / INTERACT</span>
          <h2>Look a little closer.</h2>
          <p>Rotasi, pilihan ukuran, dan interaksi produk yang relevan.</p>
        </div>
        <div>
          <span>03 / UNDERSTAND</span>
          <h2>Evidence over claims.</h2>
          <p>Informasi konstruksi, bahan, dan status verifikasi.</p>
        </div>
        <div>
          <span>04 / PURCHASE</span>
          <h2>Make it yours.</h2>
          <p>Alur keranjang dan checkout jelas, tanpa mengharuskan pengalaman 3D.</p>
        </div>
      </div>
      <section className="about-note">
        <Sparkles size={22} />
        <div>
          <h2>Built for modern commerce.</h2>
          <p>
            Informasi produk disimpan
            hanya di browser ini. Sebelum dipakai untuk penjualan sungguhan, dibutuhkan backend,
            autentikasi merchant, dan verifikasi pemasok.
          </p>
        </div>
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Merchant dashboard                                                 */
/* ------------------------------------------------------------------ */

function Admin({ demo = false }: { demo?: boolean }) {
  const { user, logout } = useAuth();
  const storedProducts = useShop((s) => s.products);
  const storedOrders = useShop((s) => s.orders);
  const [sampleProducts, setSampleProducts] = useState(seedProducts);
  const [sampleOrders, setSampleOrders] = useState(demoOrders);
  const [demoReset, setDemoReset] = useState(0);
  const products = demo ? sampleProducts : storedProducts;
  const orders = demo ? sampleOrders : storedOrders;
  const showUsers = demo || user?.role === 'admin';
  const save = useShop((s) => s.save);
  const del = useShop((s) => s.del);
  const setProducts = useShop((s) => s.setProducts);
  const reset = useShop((s) => s.reset);
  const [tab, setTab] = useState<'overview' | 'products' | 'orders' | 'users'>('overview');
  const [editing, setEditing] = useState<Product | null>(null);
  const [newMode, setNewMode] = useState(false);
  const [filter, setFilter] = useState('');
  const [productError, setProductError] = useState('');
  const setOrders = useShop((s) => s.setOrders);
  const updateStatus = async (id: string, next: Order['status']) => {
    if (demo) {
      setSampleOrders((current) => current.map((order) => order.id === id ? { ...order, status: next } : order));
      return;
    }
    const response = await fetch('/api/orders', {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: next }),
    });
    const data = await response.json();
    if (response.ok) {
      setOrders(orders.map((order) => order.id === id ? data.order : order));
      if (data.products) setProducts(data.products);
    }
  };
  useEffect(() => {
    if (demo) return;
    fetch('/api/products')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Tidak dapat memuat katalog')))
      .then((data) => setProducts(data.products || []))
      .catch((reason) => setProductError(reason instanceof Error ? reason.message : 'Tidak dapat memuat katalog'));
  }, [demo, setProducts]);
  useEffect(() => {
    if (demo) return;
    fetch('/api/orders', { credentials: 'same-origin' })
      .then((response) => response.ok ? response.json() : { orders: [] })
      .then((data) => setOrders(data.orders || []))
      .catch(() => undefined);
  }, [demo, setOrders]);
  const revenue = orders.filter((x) => x.status !== 'Cancelled').reduce((n, x) => n + x.total, 0);
  const lowStock = products.filter((p) => p.stock <= 5);
  const pending = orders.filter((o) => o.status === 'Pending').length;
  const visibleProducts = products.filter((p) =>
    `${p.name} ${p.subtitle} ${p.category}`.toLowerCase().includes(filter.toLowerCase()),
  );
  const persistProduct = async (product: Product) => {
    setProductError('');
    try {
      const existing = products.some((item) => item.id === product.id);
      if (demo) {
        setSampleProducts(existing ? products.map((item) => item.id === product.id ? product : item) : [product, ...products]);
        setEditing(null);
        setNewMode(false);
        return;
      }
      const response = await fetch('/api/products', {
        method: existing ? 'PATCH' : 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Tidak dapat menyimpan produk');
      setProducts(data.products);
      save(product);
      setEditing(null);
      setNewMode(false);
    } catch (reason) {
      setProductError(reason instanceof Error ? reason.message : 'Tidak dapat menyimpan produk');
    }
  };
  const deleteProduct = async (id: string) => {
    setProductError('');
    if (demo) {
      setSampleProducts((current) => current.filter((item) => item.id !== id));
      return;
    }
    try {
      const response = await fetch('/api/products', {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Tidak dapat menghapus produk');
      setProducts(data.products);
      del(id);
    } catch (reason) {
      setProductError(reason instanceof Error ? reason.message : 'Tidak dapat menghapus produk');
    }
  };

  const pipeline = (['Pending', 'Confirmed', 'Processing', 'Completed'] as const).map((s) => ({
    s,
    n: orders.filter((o) => o.status === s).length,
  }));

  return (
    <main className="admin">
      <aside className="admin-nav">
        <Link className="brand" to="/">
          <img className="admin-logo" src="/logos/ECOM-White.png" alt="ECOM" />
        </Link>
        <small>MERCHANT WORKSPACE</small>
        {(['overview', 'products', 'orders', ...(showUsers ? ['users' as const] : [])] as const).map((t) => (
          <button
            key={t}
            className={tab === t ? 'active' : ''}
            onClick={() => {
              setTab(t);
              setEditing(null);
              setNewMode(false);
            }}
          >
            {t === 'overview' ? 'Overview' : t === 'products' ? 'Products' : t === 'orders' ? 'Orders' : 'Users'}
            {t === 'orders' && orders.length > 0 && <sup>{orders.length}</sup>}
          </button>
        ))}
        <div className="admin-nav-bottom">
          <Link to="/collection">← Back to storefront</Link>
          {!demo && <button onClick={() => void logout()}><LogOut size={14}/> Sign out</button>}
        </div>
      </aside>

      <section className="admin-content">
        <div className="admin-head">
          <div>
            <span className="eyebrow">ECOM / MERCHANT STUDIO</span>
            <h1>
              {tab === 'overview'
                ? 'Overview'
                : tab === 'products'
                  ? 'Product management'
                  : tab === 'orders' ? 'Order management' : 'User management'}
            </h1>
          </div>
          <span className="demo-tag">{demo ? 'DEMO' : user?.role.toUpperCase()} WORKSPACE</span>
        </div>

        {tab === 'overview' && (
          <>
            <div className="metric-grid">
              <div>
                <span>TOTAL PRODUCTS</span>
                <strong>{products.length}</strong>
                <small>Across three collections</small>
              </div>
              <div>
                <span>AVAILABLE UNITS</span>
                <strong>{products.reduce((n, p) => n + p.stock, 0)}</strong>
                <small>{lowStock.length} products low on stock</small>
              </div>
              <div>
                <span>TOTAL ORDERS</span>
                <strong>{orders.length}</strong>
                <small>{pending} awaiting confirmation</small>
              </div>
              <div>
                <span>RECORDED SALES</span>
                <strong>{formatIDR(revenue)}</strong>
                <small>Local orders</small>
              </div>
            </div>

            <div className="admin-columns">
              <div className="admin-panel">
                <span className="eyebrow">ORDER PIPELINE</span>
                <h2>Fulfilment</h2>
                <div className="pipeline">
                  {pipeline.map((x) => (
                    <div key={x.s}>
                      <span>{x.s}</span>
                      <i>
                        <b style={{ width: `${orders.length ? (x.n / orders.length) * 100 : 0}%` }} />
                      </i>
                      <strong>{x.n}</strong>
                    </div>
                  ))}
                </div>
                <p>Status pesanan tersinkron dengan database.</p>
              </div>

              <div className="admin-panel">
                <span className="eyebrow">STOCK WATCH</span>
                <h2>Low stock</h2>
                {lowStock.length ? (
                  <ul className="stock-list">
                    {lowStock.map((p) => (
                      <li key={p.id}>
                        <span>{p.name}</span>
                        <b>
                          <AlertTriangle size={13} /> {p.stock} left
                        </b>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="admin-empty">Semua produk memiliki stok di atas 5 unit.</p>
                )}
              </div>
            </div>

            <div className="admin-panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">RECENT ACTIVITY</span>
                  <h2>Latest orders</h2>
                </div>
                <button className="text-link" onClick={() => setTab('orders')}>
                  View all <ArrowRight size={15} />
                </button>
              </div>
              {orders.length ? (
                <div className="data-table">
                  <div className="data-row orders-row table-titles">
                    <span>ORDER / CUSTOMER</span>
                    <span>DATE</span>
                    <span>TOTAL</span>
                    <span>STATUS</span>
                  </div>
                  {orders.slice(0, 4).map((o) => (
                    <div key={o.id} className="data-row orders-row">
                      <span>
                        <strong>{o.id}</strong>
                        <small>{o.customer}</small>
                      </span>
                      <span>{new Date(o.date).toLocaleDateString('id-ID')}</span>
                      <span>{formatIDR(o.total)}</span>
                      <span className={`status-pill ${o.status.toLowerCase()}`}>{o.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="admin-empty">
                  Belum ada pesanan. Buat pesanan melalui checkout.
                </p>
              )}
            </div>

            <div className="admin-foot">
              <button
                className="text-link"
                onClick={() => {
                  if (!confirm('Pulihkan data contoh?')) return;
                  if (demo) {
                    setSampleProducts(seedProducts);
                    setSampleOrders(demoOrders);
                    setDemoReset((current) => current + 1);
                  } else {
                    reset();
                  }
                }}
              >
                Reset all local data <RotateCcw size={16} />
              </button>
              <span>
                <TrendingUp size={14} /> Sales figures are stored locally.
              </span>
            </div>
          </>
        )}

        {tab === 'products' && (
          <>
            <div className="table-head">
              <div className="table-filter">
                <Search size={15} />
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter products"
                  aria-label="Filter products"
                />
              </div>
              <button
                className="btn dark"
                onClick={() => {
                  setNewMode(true);
                  setEditing(null);
                }}
              >
                <Plus size={16} /> Add product
              </button>
            </div>
            {(editing || newMode) && (
              <ProductForm
                initial={editing}
                onCancel={() => {
                  setEditing(null);
                  setNewMode(false);
                }}
                onSave={(p) => void persistProduct(p)}
              />
            )}
            {productError && <p className="admin-empty" role="alert">{productError}</p>}
            <div className="data-table">
              <div className="data-row table-titles table-products">
                <span>PRODUCT</span>
                <span>CATEGORY</span>
                <span>PRICE</span>
                <span>STOCK</span>
                <span>ACTIONS</span>
              </div>
              {visibleProducts.map((p) => (
                <div className="data-row table-products" key={p.id}>
                  <span>
                    <strong>{p.name}</strong>
                    <small>{p.subtitle}</small>
                  </span>
                  <span>{p.category}</span>
                  <span>{formatIDR(p.price)}</span>
                  <span className={p.stock <= 5 ? 'stock-low' : ''}>{p.stock}</span>
                  <span className="table-actions">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setNewMode(false);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus produk ${p.name}?`)) void deleteProduct(p.id);
                      }}
                    >
                      Delete
                    </button>
                  </span>
                </div>
              ))}
              {!visibleProducts.length && <p className="admin-empty">Tidak ada produk yang cocok.</p>}
            </div>
          </>
        )}

        {tab === 'orders' && (
          <div className="data-table">
            <div className="data-row orders-row table-titles">
              <span>ORDER / CUSTOMER</span>
              <span>DATE</span>
              <span>TOTAL</span>
              <span>STATUS</span>
            </div>
            {orders.map((o) => (
              <div key={o.id} className="data-row orders-row">
                <span>
                  <strong>{o.id}</strong>
                  <small>
                    {o.customer} / {o.email}
                  </small>
                  <small>
                    {o.items
                      .map((i) => `${products.find((p) => p.id === i.id)?.name ?? i.id} × ${i.qty}`)
                      .join(', ')}
                  </small>
                </span>
                <span>{new Date(o.date).toLocaleDateString('id-ID')}</span>
                <span>{formatIDR(o.total)}</span>
                <select
                  aria-label={'Order status ' + o.id}
                  value={o.status}
                  onChange={(e) => void updateStatus(o.id, e.target.value as Order['status'])}
                >
                  {['Pending', 'Confirmed', 'Processing', 'Completed', 'Cancelled'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="admin-empty">
                Belum ada pesanan. Buat pesanan melalui checkout.
              </p>
            )}
          </div>
        )}
        {showUsers && <div hidden={tab !== 'users'}>{(demo || tab === 'users') && <UserManagement key={demoReset} demo={demo} />}</div>}
      </section>
    </main>
  );
}

function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Product | null;
  onSave: (p: Product) => void;
  onCancel: () => void;
}) {
  return (
    <form
      className="product-form"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        onSave({
          id: initial?.id ?? 'product-' + Date.now().toString(36),
          name: String(f.get('name')).trim(),
          subtitle: String(f.get('subtitle')),
          category: String(f.get('category')) as Product['category'],
          price: Number(f.get('price')),
          stock: Number(f.get('stock')),
          description: String(f.get('description')),
          material: String(f.get('material')),
          dimensions: String(f.get('dimensions')),
          image: initial?.image ?? 'craft',
          model: initial?.model,
        });
      }}
    >
      <h2>{initial ? 'Edit product' : 'Add product'}</h2>
      <div className="form-grid">
        <label>
          Product name
          <input name="name" required defaultValue={initial?.name} />
        </label>
        <label>
          Subtitle
          <input name="subtitle" required defaultValue={initial?.subtitle} />
        </label>
        <label>
          Category
          <select name="category" defaultValue={initial?.category ?? 'Craft'}>
            <option>Sleep</option>
            <option>Living</option>
            <option>Craft</option>
          </select>
        </label>
        <label>
          Price (IDR)
          <input name="price" type="number" min="0" required defaultValue={initial?.price ?? 100000} />
        </label>
        <label>
          Stock
          <input name="stock" type="number" min="0" required defaultValue={initial?.stock ?? 1} />
        </label>
        <label>
          Dimensions
          <input name="dimensions" required defaultValue={initial?.dimensions ?? '30 × 30 × 30 cm'} />
        </label>
        <label>
          Materials
          <input name="material" required defaultValue={initial?.material ?? ''} />
        </label>
        <label className="span2">
          Description
          <textarea name="description" rows={3} required defaultValue={initial?.description} />
        </label>
      </div>
      <p>3D modes are available for supported product models.</p>
      <div className="form-actions">
        <button className="btn outline" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn dark" type="submit">
          Save product <Check size={16} />
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Shell                                                              */
/* ------------------------------------------------------------------ */

function AppShell() {
  const location = useLocation();
  const setProducts = useShop((s) => s.setProducts);
  const admin = location.pathname.startsWith('/admin');
  useEffect(() => {
    fetch('/api/products')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data?.products) setProducts(data.products); })
      .catch(() => undefined);
  }, [setProducts]);
  return (
    <>
      <ScrollToTop />
      <a className="skip-link" href="#main-content">Skip to content</a>
      {!admin && <Header />}
      <div className="route-fade" id="main-content" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/studio/:id" element={<Studio />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<RoleGuard roles={['customer','merchant','admin']}><Checkout /></RoleGuard>} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<RoleGuard roles={['customer','merchant','admin']}><Account /></RoleGuard>} />
          <Route path="/about" element={<About />} />
          <Route path="/admin/demo" element={<Admin demo />} />
          <Route path="/admin" element={<RoleGuard roles={['merchant','admin']}><Admin /></RoleGuard>} />
          <Route
            path="*"
            element={
              <main className="page">
                <h1>Page not found</h1>
                <Link to="/">Back home</Link>
              </main>
            }
          />
        </Routes>
      </div>
      {!admin && !location.pathname.startsWith('/studio') && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider><AppShell /></AuthProvider>
    </BrowserRouter>
  );
}
