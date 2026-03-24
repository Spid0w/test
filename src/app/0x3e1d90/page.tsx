"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LISTINGS = [
  { id: "0xA1", name: "Mémoire d'Inconnu #447", category: "ORGANIQUE", price: "3.2 ₿TC", seller: "void_merchant", rating: 4.8, reviews: 12, desc: "Fragment de souvenir extrait. Contenu : un anniversaire, possiblement 1987. Non vérifié.", status: "EN STOCK", tag: "POPULAIRE", locked: false },
  { id: "0xA2", name: "██ USB — ████████ ██████", category: "DONNÉES", price: "0.8 ₿TC", seller: "datacorpse", rating: 3.2, reviews: 87, desc: "Trouvée dans un mur lors d'une démolition. 128GB. Encryptée. Bruits détectés à l'ouverture.", status: "EN STOCK", tag: "⚠️ RISQUÉ", locked: false },
  { id: "0xA3", name: "Ombre en Bocal (Grade A)", category: "ORGANIQUE", price: "12.0 ₿TC", seller: "nightcollector", rating: 5.0, reviews: 3, desc: "Ombre humaine capturée in situ. Conservation garantie 200 ans. Le donneur ne sait pas.", status: "DERNIÈRE UNITÉ", tag: "RARE", locked: false },
  { id: "0xA4", name: "48.8566°N 2.3522°E — \"██ ████\"", category: "INFORMATION", price: "0.1 ₿TC", seller: "gps_dealer", rating: 1.5, reviews: 341, desc: "Lieu où 14 personnes ont disparu. Pas de corps retrouvés. Pas de retour signalé.", status: "EN STOCK", tag: "", locked: false },
  { id: "0xA5", name: "SVC_PRECOG_24H.exe", category: "SERVICE", price: "7.5 ₿TC", seller: "precog_ink", rating: 4.9, reviews: 6, desc: "Portrait dessiné à la main de votre visage tel qu'il sera dans exactement 24h. Précision : troublante.", status: "SUR COMMANDE", tag: "VÉRIFIÉ", locked: false },
  { id: "0xA6", name: "Bruit Blanc Vivant", category: "AUDIO", price: "0.3 ₿TC", seller: "freq_ghost", rating: 4.1, reviews: 29, desc: "Fichier .wav de 3h. Le bruit blanc répond si vous parlez. Ne pas écouter seul.", status: "EN STOCK", tag: "", locked: false },
  { id: "0xA7", name: "OBJ_CHRONO_INV [lot #7]", category: "OBJET", price: "5.0 ₿TC", seller: "temporal_junk", rating: 3.8, reviews: 15, desc: "Montre mécanique. Fonctionne à l'envers. Le temps autour de l'objet semble... différent.", status: "EN STOCK", tag: "ANOMALIE", locked: false },
  { id: "0xA8", name: "Rêve Lucide (Injection)", category: "SERVICE", price: "2.1 ₿TC", seller: "dreamweaver_x", rating: 4.5, reviews: 44, desc: "On vous injecte le rêve de quelqu'un d'autre. Durée : 1 nuit. Effets secondaires : nostalgie intense.", status: "EN STOCK", tag: "", locked: false },
  { id: "0xA9", name: "SPÉCIMEN_ORG_003 (non-id.)", category: "ORGANIQUE", price: "0.05 ₿TC", seller: "bone_yard", rating: 2.0, reviews: 203, desc: "Origine inconnue. Datation carbone : impossible. L'objet est tiède au toucher.", status: "EN STOCK", tag: "PROMO", locked: false },
  { id: "0xB1", name: "VPN_RETRO://2007.cache", category: "DONNÉES", price: "1.2 ₿TC", seller: "retro_pipe", rating: 4.7, reviews: 31, desc: "Naviguez sur un snapshot complet d'Internet tel qu'il était en 2007. Certaines pages... n'ont jamais existé.", status: "EN STOCK", tag: "", locked: false },
  { id: "0xB2", name: "███████ ██ ████-████ (██████)", category: "INFORMATION", price: "15.0 ₿TC", seller: "echo_mail", rating: 5.0, reviews: 1, desc: "Une lettre manuscrite que vous n'avez pas encore écrite. L'écriture est la vôtre. Le contenu est... personnel.", status: "SUR COMMANDE", tag: "EXCLUSIF", locked: true },
  { id: "0xB3", name: "Miroir Qui Retarde", category: "OBJET", price: "8.0 ₿TC", seller: "glass_anomaly", rating: 3.5, reviews: 8, desc: "Votre reflet a 3 secondes de retard. Parfois il sourit quand vous ne souriez pas.", status: "EN STOCK", tag: "ANOMALIE", locked: false },
  { id: "0xB4", name: "SVC_MEM_WIPE.onion", category: "SERVICE", price: "20.0 ₿TC", seller: "mem_wipe", rating: 4.2, reviews: 0, desc: "Choisissez un souvenir. Nous l'effaçons. Irréversible. Les 0 avis sont intentionnels.", status: "DISPONIBLE", tag: "PREMIUM", locked: false },
  { id: "0xB5", name: "IMG_NULL_ROOM.raw", category: "ART", price: "0.02 ₿TC", seller: "empty_room", rating: 1.0, reviews: 512, desc: "Photo d'une pièce vide. Chaque acheteur voit quelque chose de différent dans le coin gauche.", status: "∞ EN STOCK", tag: "", locked: false },
  { id: "0xB6", name: "☎ DEAD_SIGNAL_0x3F", category: "INFORMATION", price: "0.5 ₿TC", seller: "dead_signal", rating: 3.9, reviews: 67, desc: "Numéro qui ne devrait plus fonctionner. Quelqu'un décroche toujours à la 3ème sonnerie.", status: "EN STOCK", tag: "", locked: false },
];

const CATEGORIES = ["TOUT", "ORGANIQUE", "DONNÉES", "INFORMATION", "SERVICE", "OBJET", "AUDIO", "ART"];

export default function MarketPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("TOUT");
  const [searchQuery, setSearchQuery] = useState("");
  const [visitors, setVisitors] = useState(0);
  const [glitchId, setGlitchId] = useState<string | null>(null);
  const [passwordModal, setPasswordModal] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [cameraPrompt, setCameraPrompt] = useState(false);
  const [cameraRefused, setCameraRefused] = useState(false);

  useEffect(() => {
    setVisitors(Math.floor(Math.random() * 40) + 3);
    const interval = setInterval(() => {
      setVisitors(v => v + (Math.random() > 0.5 ? 1 : -1));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const filtered = LISTINGS.filter(l => {
    const matchCat = filter === "TOUT" || l.category === filter;
    const matchSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleBuy = (item: typeof LISTINGS[0]) => {
    if (item.locked) {
      setPasswordModal(item.id);
      setPasswordInput("");
      setPasswordError(false);
      return;
    }
    setGlitchId(item.id);
    setTimeout(() => setGlitchId(null), 2000);
  };

  const handlePasswordSubmit = () => {
    const inputClean = passwordInput.toLowerCase().replace(/\s/g, "");
    if (inputClean === "password") {
      setPasswordModal(null);
      router.push("/");
    } else if (inputClean === "zevann") {
      setPasswordModal(null);
      window.location.href = "https://mega-hub-seven.vercel.app/dashboard";
    } else if (inputClean === "boulbix") {
      setPasswordModal(null);
      router.push("/0x0d1f2e");
    } else if (inputClean === "blackmarket" || inputClean === "darknet" || inputClean === "weapons") {
      setPasswordModal(null);
      router.push("/0x2d7f1a");
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 1500);
    }
  };

  return (
    <main className="min-h-screen bg-[#030303] text-zinc-400 font-mono">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 w-full bg-black/95 backdrop-blur-xl z-50 border-b border-zinc-900/80 shadow-[0_0_30px_rgba(0,0,0,1)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-red-800 font-bold text-sm tracking-wider">⬡ VOID_MARKET</span>
            <span className="text-[8px] text-zinc-700 hidden sm:block">v3.1.7 // TOR VERIFIED</span>
          </div>
          <div className="flex items-center gap-6 text-[9px] uppercase tracking-widest">
            <button 
                onClick={() => setCameraPrompt(true)} 
                className="border border-red-900/50 px-2 py-1 text-red-700 hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-1 focus:ring-red-500"
            >
                [ VERIFY HUMANITY ]
            </button>
            <span className="text-green-900 hidden md:inline">● {visitors} en ligne</span>
            <span className="text-zinc-700 hidden lg:inline">PGP: 4A2F...8C1D</span>
            <Link href="/" className="text-zinc-600 hover:text-red-600 transition-colors">[ SORTIR ]</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-20 pb-32">
        {/* Search */}
        <div className="mt-4 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un article, un service..."
            className="w-full bg-zinc-950 border border-zinc-900/60 text-zinc-400 text-xs px-4 py-3 focus:outline-none focus:border-red-900/50 placeholder:text-zinc-800 transition-colors"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-[9px] uppercase tracking-widest px-3 py-1.5 border transition-all duration-300 ${
                filter === cat
                  ? "border-red-900/60 text-red-700 bg-red-950/20"
                  : "border-zinc-900/40 text-zinc-700 hover:border-zinc-700 hover:text-zinc-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Listings */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`border border-zinc-900/50 bg-zinc-950/40 hover:border-zinc-800/60 transition-all duration-500 group ${
                  glitchId === item.id ? "animate-pulse border-red-900/80 bg-red-950/10" : ""
                }`}
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-[8px] text-zinc-700 bg-zinc-900/50 px-2 py-0.5">{item.category}</span>
                      {item.tag && (
                        <span className={`text-[8px] px-2 py-0.5 ${
                          item.tag === "RARE" ? "bg-purple-950/30 text-purple-700" :
                          item.tag === "⚠️ RISQUÉ" ? "bg-yellow-950/30 text-yellow-700" :
                          item.tag === "ANOMALIE" ? "bg-cyan-950/30 text-cyan-600" :
                          item.tag === "PREMIUM" || item.tag === "EXCLUSIF" ? "bg-amber-950/30 text-amber-600" :
                          "bg-zinc-900/50 text-zinc-600"
                        }`}>
                          {item.tag}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors font-medium mb-1">
                      {glitchId === item.id ? "ERR0R_TRANSACT10N_FA1LED" : item.name}
                    </h3>

                    <p className="text-[10px] text-zinc-600 leading-relaxed mb-3 max-w-xl">
                      {item.desc}
                    </p>

                    <div className="flex items-center gap-4 text-[8px] text-zinc-700">
                      <span>Vendeur: <span className="text-zinc-500">{item.seller}</span></span>
                      <span>★ {item.rating}/5 <span className="text-zinc-800">({item.reviews} avis)</span></span>
                      <span className={`${item.status === "DERNIÈRE UNITÉ" ? "text-red-700" : item.status === "∞ EN STOCK" ? "text-zinc-600" : "text-green-900"}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Right: Price + Buy */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-3 sm:min-w-[140px]">
                    <span className="text-lg text-zinc-300 font-bold tracking-tight">{item.price}</span>
                    <button
                      onClick={() => handleBuy(item)}
                      className="text-[9px] uppercase tracking-widest px-5 py-2 border border-red-950/50 text-red-900 hover:bg-red-950/20 hover:border-red-800/60 hover:text-red-600 transition-all duration-300"
                    >
                      {glitchId === item.id ? "[ ERREUR ]" : "[ ACQUÉRIR ]"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-zinc-800 text-xs uppercase tracking-widest">
            Aucun résultat. Cherchez ailleurs. Ou nulle part.
          </div>
        )}

        {/* Footer disclaimer */}
        <div className="mt-20 border-t border-zinc-900/30 pt-8 text-[7px] text-zinc-800 space-y-2 uppercase tracking-wider">
          <p>VOID_MARKET ne garantit ni l&apos;existence, ni la légalité, ni la réalité des articles listés.</p>
          <p>En naviguant, vous acceptez que vos données soient collectées par des entités non identifiées.</p>
          <p>Transactions irreversibles. Aucun remboursement. Aucun support. Aucune trace.</p>
          <p className="text-red-950">Vous n&apos;étiez jamais ici.</p>
        </div>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {passwordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center"
            onClick={() => setPasswordModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`border p-8 max-w-sm w-full mx-4 space-y-6 bg-[#050505] ${
                passwordError ? "border-red-800 animate-pulse" : "border-zinc-800"
              }`}
            >
              <div className="text-center space-y-2">
                <div className="text-red-900 text-lg">🔒</div>
                <h3 className="text-xs uppercase tracking-[0.5em] text-zinc-500">Accès Restreint</h3>
                <p className="text-[8px] text-zinc-700">Cet article nécessite une autorisation vendeur.</p>
              </div>
              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                  placeholder="Mot de passe vendeur..."
                  autoFocus
                  className={`w-full bg-black border text-xs px-4 py-3 focus:outline-none placeholder:text-zinc-800 transition-colors ${
                    passwordError ? "border-red-800 text-red-600" : "border-zinc-900 text-zinc-400 focus:border-red-900/50"
                  }`}
                />
                {passwordError && (
                  <p className="text-[8px] text-red-800 mt-2 uppercase tracking-widest">ACCÈS REFUSÉ — Tentative enregistrée.</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPasswordModal(null)}
                  className="flex-1 text-[9px] uppercase tracking-widest py-2 border border-zinc-900 text-zinc-700 hover:text-zinc-400 transition-colors"
                >
                  [ ANNULER ]
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="flex-1 text-[9px] uppercase tracking-widest py-2 border border-red-950/50 text-red-900 hover:bg-red-950/20 transition-colors"
                >
                  [ CONFIRMER ]
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fake Camera Prompt */}
      <AnimatePresence>
        {cameraPrompt && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#1c1c1e] border border-zinc-700/50 rounded-lg shadow-2xl p-4 w-[320px] z-[9999] font-sans text-[13px] text-zinc-200"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">📷</div>
              <div>
                <div className="font-semibold text-zinc-100">VOID_MARKET.onion</div>
                <div className="text-zinc-400 mt-1 leading-snug">Souhaite utiliser votre appareil photo.</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 font-medium">
              <button 
                onClick={() => { setCameraRefused(true); setCameraPrompt(false); setTimeout(() => setCameraRefused(false), 8000); }} 
                className="px-4 py-1.5 rounded-full border border-zinc-600 hover:bg-zinc-700 transition-colors text-zinc-200"
              >
                Refuser
              </button>
              <button 
                onClick={() => setCameraPrompt(false)} 
                className="px-4 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              >
                Autoriser
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Refused Message */}
      <AnimatePresence>
        {cameraRefused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 2 } }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] text-red-600 bg-black/90 px-6 py-3 font-mono text-xs uppercase tracking-[0.3em] border border-red-900 pointer-events-none"
          >
            <span className="animate-pulse">Peu importe, je te vois déjà.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
