"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

const LISTINGS = [
  { id: "0xA1", name: "Mémoire d'Inconnu #447", category: "ORGANIQUE", price: "3.2 ₿TC", seller: "void_merchant", rating: 4.8, reviews: 12, desc: "Fragment de souvenir extrait. Contenu : un anniversaire, possiblement 1987. Non vérifié.", status: "EN STOCK", tag: "POPULAIRE" },
  { id: "0xA2", name: "Clé USB — CONTENU INCONNU", category: "DONNÉES", price: "0.8 ₿TC", seller: "datacorpse", rating: 3.2, reviews: 87, desc: "Trouvée dans un mur lors d'une démolition. 128GB. Encryptée. Bruits détectés à l'ouverture.", status: "EN STOCK", tag: "⚠️ RISQUÉ" },
  { id: "0xA3", name: "Ombre en Bocal (Grade A)", category: "ORGANIQUE", price: "12.0 ₿TC", seller: "nightcollector", rating: 5.0, reviews: 3, desc: "Ombre humaine capturée in situ. Conservation garantie 200 ans. Le donneur ne sait pas.", status: "DERNIÈRE UNITÉ", tag: "RARE" },
  { id: "0xA4", name: "Coordonnées GPS — \"La Porte\"", category: "INFORMATION", price: "0.1 ₿TC", seller: "gps_dealer", rating: 1.5, reviews: 341, desc: "Lieu où 14 personnes ont disparu. Pas de corps retrouvés. Pas de retour signalé.", status: "EN STOCK", tag: "" },
  { id: "0xA5", name: "Portrait de Vous (Demain)", category: "SERVICE", price: "7.5 ₿TC", seller: "precog_ink", rating: 4.9, reviews: 6, desc: "Portrait dessiné à la main de votre visage tel qu'il sera dans exactement 24h. Précision : troublante.", status: "SUR COMMANDE", tag: "VÉRIFIÉ" },
  { id: "0xA6", name: "Bruit Blanc Vivant", category: "AUDIO", price: "0.3 ₿TC", seller: "freq_ghost", rating: 4.1, reviews: 29, desc: "Fichier .wav de 3h. Le bruit blanc répond si vous parlez. Ne pas écouter seul.", status: "EN STOCK", tag: "" },
  { id: "0xA7", name: "Montre — Heure Inversée", category: "OBJET", price: "5.0 ₿TC", seller: "temporal_junk", rating: 3.8, reviews: 15, desc: "Montre mécanique. Fonctionne à l'envers. Le temps autour de l'objet semble... différent.", status: "EN STOCK", tag: "ANOMALIE" },
  { id: "0xA8", name: "Rêve Lucide (Injection)", category: "SERVICE", price: "2.1 ₿TC", seller: "dreamweaver_x", rating: 4.5, reviews: 44, desc: "On vous injecte le rêve de quelqu'un d'autre. Durée : 1 nuit. Effets secondaires : nostalgie intense.", status: "EN STOCK", tag: "" },
  { id: "0xA9", name: "Dent Humaine (Non Identifiée)", category: "ORGANIQUE", price: "0.05 ₿TC", seller: "bone_yard", rating: 2.0, reviews: 203, desc: "Origine inconnue. Datation carbone : impossible. La dent est tiède au toucher.", status: "EN STOCK", tag: "PROMO" },
  { id: "0xB1", name: "Accès VPN — Internet de 2007", category: "DONNÉES", price: "1.2 ₿TC", seller: "retro_pipe", rating: 4.7, reviews: 31, desc: "Naviguez sur un snapshot complet d'Internet tel qu'il était en 2007. Certaines pages... n'ont jamais existé.", status: "EN STOCK", tag: "" },
  { id: "0xB2", name: "Lettre de Vous-Même (Future)", category: "INFORMATION", price: "15.0 ₿TC", seller: "echo_mail", rating: 5.0, reviews: 1, desc: "Une lettre manuscrite que vous n'avez pas encore écrite. L'écriture est la vôtre. Le contenu est... personnel.", status: "SUR COMMANDE", tag: "EXCLUSIF" },
  { id: "0xB3", name: "Miroir Qui Retarde", category: "OBJET", price: "8.0 ₿TC", seller: "glass_anomaly", rating: 3.5, reviews: 8, desc: "Votre reflet a 3 secondes de retard. Parfois il sourit quand vous ne souriez pas.", status: "EN STOCK", tag: "ANOMALIE" },
  { id: "0xB4", name: "Service d'Oubli Sélectif", category: "SERVICE", price: "20.0 ₿TC", seller: "mem_wipe", rating: 4.2, reviews: 0, desc: "Choisissez un souvenir. Nous l'effaçons. Irréversible. Les 0 avis sont intentionnels.", status: "DISPONIBLE", tag: "PREMIUM" },
  { id: "0xB5", name: "Photographie de Pièce Vide", category: "ART", price: "0.02 ₿TC", seller: "empty_room", rating: 1.0, reviews: 512, desc: "Photo d'une pièce vide. Chaque acheteur voit quelque chose de différent dans le coin gauche.", status: "∞ EN STOCK", tag: "" },
  { id: "0xB6", name: "Numéro de Téléphone Mort", category: "INFORMATION", price: "0.5 ₿TC", seller: "dead_signal", rating: 3.9, reviews: 67, desc: "Numéro qui ne devrait plus fonctionner. Quelqu'un décroche toujours à la 3ème sonnerie.", status: "EN STOCK", tag: "" },
];

const CATEGORIES = ["TOUT", "ORGANIQUE", "DONNÉES", "INFORMATION", "SERVICE", "OBJET", "AUDIO", "ART"];

export default function MarketPage() {
  const [filter, setFilter] = useState("TOUT");
  const [searchQuery, setSearchQuery] = useState("");
  const [visitors, setVisitors] = useState(0);
  const [glitchId, setGlitchId] = useState<string | null>(null);

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

  const handleBuy = (id: string) => {
    setGlitchId(id);
    setTimeout(() => setGlitchId(null), 2000);
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
            <span className="text-green-900">● {visitors} en ligne</span>
            <span className="text-zinc-700">PGP: 4A2F...8C1D</span>
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
                      onClick={() => handleBuy(item.id)}
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
    </main>
  );
}
