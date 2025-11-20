
export const refrigeratedData: Record<string, { source_term: string; image: string; gender_pt: 'm' | 'f'; translations: Record<string, string>; phonetics?: Record<string, string> }[]> = {
  cheeses: [
      { 
        source_term: "Queijo Mussarela", image: "", gender_pt: "m", 
        translations: { cl: "Queso Mozzarella", ar: "Queso Muzzarella", gb: "Mozzarella", us: "Mozzarella", pt: "Queijo Mozzarella", es: "Queso Mozzarella", fr: "Mozzarella", it: "Mozzarella" }, 
        phonetics: { us: "/ˌmɑːt.səˈrɛl.ə/", gb: "/ˌmɒt.səˈrɛl.ə/", br: "/mu.saˈɾɛ.lɐ/", pt: "/mɔ.zɐˈɾɛ.lɐ/", es: "/moθaˈɾela/", cl: "/mosaˈɾela/", ar: "/musaˈɾela/", fr: "/mɔt.za.ʁɛ.la/", it: "/mottsaˈrɛl.la/" } 
      },
      { 
        source_term: "Queijo Prato", image: "", gender_pt: "m", 
        translations: { cl: "Queso Gauda", ar: "Queso de máquina", gb: "Edam", us: "Gouda", pt: "Queijo Flamengo", es: "Queso Gouda", fr: "Gouda", it: "Edam" }, 
        phonetics: { us: "/ˈɡuː.də/", gb: "/ˈiː.dæm/", br: "/ˈkej.ʒu ˈpɾa.tu/", pt: "/ˈkɐj.ʒu flɐˈmẽ.ɡu/", es: "/ˈɡawða/", cl: "/ˈɡawða/", ar: "/ˈkeso ðe ˈmakina/", fr: "/ɡu.da/", it: "/ˈe.dam/" } 
      },
      { 
        source_term: "Queijo Parmesão", image: "", gender_pt: "m", 
        translations: { cl: "Queso Parmesano", ar: "Queso Parmesano", gb: "Parmesan", us: "Parmesan", pt: "Queijo Parmesão", es: "Queso Parmesano", fr: "Parmesan", it: "Parmigiano" }, 
        phonetics: { us: "/ˈpɑːr.mə.ˌzɑːn/", gb: "/ˈpɑː.mɪ.zæn/", br: "/paʁ.meˈzɐ̃w/", pt: "/pɐɾ.mɨˈzɐ̃w/", es: "/paɾmeˈsano/", cl: "/paɾmeˈsano/", ar: "/paɾmeˈsano/", fr: "/paʁ.mə.zɑ̃/", it: "/parmiˈdʒa.no/" } 
      },
      { 
        source_term: "Requeijão", image: "", gender_pt: "m", 
        translations: { cl: "Queso crema", ar: "Queso crema", gb: "Cream Cheese", us: "Cream Cheese", pt: "Requeijão", es: "Queso crema", fr: "Fromage à tartiner", it: "Formaggio spalmabile" }, 
        phonetics: { us: "/kriːm tʃiːz/", gb: "/kriːm tʃiːz/", br: "/he.kejˈʒɐ̃w/", pt: "/ʁɨ.kɐjˈʒɐ̃w/", es: "/ˈkeso ˈkɾema/", cl: "/ˈkeso ˈkɾema/", ar: "/ˈkeso ˈkɾema/", fr: "/fʁɔ.maʒ a taʁ.ti.ne/", it: "/forˈmad.dʒo spalˈma.bi.le/" } 
      },
      { 
        source_term: "Queijo Minas", image: "", gender_pt: "m", 
        translations: { cl: "Queso fresco", ar: "Queso fresco", gb: "Fresh Cheese", us: "Fresh Cheese", pt: "Queijo fresco", es: "Queso fresco", fr: "Fromage frais", it: "Formaggio fresco" }, 
        phonetics: { us: "/frɛʃ tʃiːz/", gb: "/frɛʃ tʃiːz/", br: "/ˈkej.ʒu ˈmĩ.nɐs/", pt: "/ˈkɐj.ʒu ˈfɾeʃ.ku/", es: "/ˈkeso ˈfɾesko/", cl: "/ˈkeso ˈfɾesko/", ar: "/ˈkeso ˈfɾesko/", fr: "/fʁɔ.maʒ fʁɛ/", it: "/forˈmad.dʒo ˈfres.ko/" } 
      },
      { 
        source_term: "Queijo Cheddar", image: "", gender_pt: "m", 
        translations: { cl: "Queso Cheddar", ar: "Queso Cheddar", gb: "Cheddar", us: "Cheddar", pt: "Queijo Cheddar", es: "Queso Cheddar", fr: "Cheddar", it: "Cheddar" }, 
        phonetics: { us: "/ˈtʃɛd.ər/", gb: "/ˈtʃɛd.ə/", br: "/ˈʃɛ.daʁ/", pt: "/ˈʃɛ.dɐɾ/", es: "/ˈtʃedaɾ/", cl: "/ˈtʃedaɾ/", ar: "/ˈtʃedaɾ/", fr: "/tʃɛ.daʁ/", it: "/ˈtʃɛd.dar/" } 
      },
      { 
        source_term: "Queijo Gorgonzola", image: "", gender_pt: "m", 
        translations: { cl: "Queso azul", ar: "Queso azul", gb: "Blue Cheese", us: "Blue Cheese", pt: "Queijo azul", es: "Queso azul", fr: "Roquefort", it: "Gorgonzola" }, 
        phonetics: { us: "/bluː tʃiːz/", gb: "/bluː tʃiːz/", br: "/ɡoʁ.ɡõˈzɔ.lɐ/", pt: "/ɡɔɾ.ɡõˈzɔ.lɐ/", es: "/ˈkeso aˈθul/", cl: "/ˈkeso aˈsul/", ar: "/ˈkeso aˈsul/", fr: "/ʁɔk.fɔʁ/", it: "/ɡorɡonˈdzɔ.la/" } 
      },
      { 
        source_term: "Queijo Provolone", image: "", gender_pt: "m", 
        translations: { cl: "Provolone", ar: "Provolone", gb: "Provolone", us: "Provolone", pt: "Provolone", es: "Provolone", fr: "Provolone", it: "Provolone" }, 
        phonetics: { us: "/ˌproʊ.vəˈloʊn/", gb: "/ˌprəʊ.vəˈləʊn/", br: "/pɾo.voˈlo.ni/", pt: "/pɾɔ.vɔˈlɔ.nɨ/", es: "/pɾoβoˈlone/", cl: "/pɾoβoˈlone/", ar: "/pɾoβoˈlone/", fr: "/pʁɔ.vɔ.lɔn/", it: "/provoˈlo.ne/" } 
      },
      { 
        source_term: "Queijo Brie", image: "", gender_pt: "m", 
        translations: { cl: "Queso Brie", ar: "Queso Brie", gb: "Brie", us: "Brie", pt: "Queijo Brie", es: "Queso Brie", fr: "Brie", it: "Brie" }, 
        phonetics: { us: "/briː/", gb: "/briː/", br: "/bɾi/", pt: "/bɾi/", es: "/bɾi/", cl: "/bɾi/", ar: "/bɾi/", fr: "/bʁi/", it: "/bri/" } 
      },
      { 
        source_term: "Queijo de Cabra", image: "", gender_pt: "m", 
        translations: { cl: "Queso de cabra", ar: "Queso de cabra", gb: "Goat's Cheese", us: "Goat Cheese", pt: "Queijo de cabra", es: "Queso de cabra", fr: "Chèvre", it: "Formaggio di capra" }, 
        phonetics: { us: "/ɡoʊt tʃiːz/", gb: "/ɡəʊt tʃiːz/", br: "/ˈkej.ʒu dʒi ˈka.bɾɐ/", pt: "/ˈkɐj.ʒu dɨ ˈka.bɾɐ/", es: "/ˈkeso ðe ˈkaβɾa/", cl: "/ˈkeso ðe ˈkaβɾa/", ar: "/ˈkeso ðe ˈkaβɾa/", fr: "/ʃɛvʁ/", it: "/forˈmad.dʒo di ˈka.pra/" } 
      },
      { 
        source_term: "Ricota", image: "", gender_pt: "f", 
        translations: { cl: "Ricotta", ar: "Ricota", gb: "Ricotta", us: "Ricotta", pt: "Ricota", es: "Requesón", fr: "Ricotta", it: "Ricotta" }, 
        phonetics: { us: "/rɪˈkɒt.ə/", gb: "/rɪˈkɒt.ə/", br: "/hiˈkɔ.tɐ/", pt: "/ʁiˈkɔ.tɐ/", es: "/rekeˈson/", cl: "/riˈkota/", ar: "/riˈkota/", fr: "/ʁi.kɔ.ta/", it: "/riˈkɔt.ta/" } 
      },
      { 
        source_term: "Queijo Suíço", image: "", gender_pt: "m", 
        translations: { cl: "Queso suizo", ar: "Queso suizo", gb: "Swiss Cheese", us: "Swiss Cheese", pt: "Queijo suíço", es: "Queso Emmental", fr: "Emmental", it: "Emmentaler" }, 
        phonetics: { us: "/swɪs tʃiːz/", gb: "/swɪs tʃiːz/", br: "/ˈkej.ʒu suˈi.su/", pt: "/ˈkɐj.ʒu suˈi.su/", es: "/emenˈtal/", cl: "/ˈkeso ˈswiso/", ar: "/ˈkeso ˈswiso/", fr: "/ɛm.mɛn.tal/", it: "/ˈɛm.men.tal/" } 
      },
      { 
        source_term: "Queijo Ralado", image: "", gender_pt: "m", 
        translations: { cl: "Queso rallado", ar: "Queso rallado", gb: "Grated Cheese", us: "Grated Cheese", pt: "Queijo ralado", es: "Queso rallado", fr: "Fromage râpé", it: "Formaggio grattugiato" }, 
        phonetics: { us: "/ˈɡreɪ.tɪd tʃiːz/", gb: "/ˈɡreɪ.tɪd tʃiːz/", br: "/ˈkej.ʒu haˈla.du/", pt: "/ˈkɐj.ʒu ʁɐˈla.du/", es: "/ˈkeso raˈʎaðo/", cl: "/ˈkeso raˈʎaðo/", ar: "/ˈkeso raˈʃaðo/", fr: "/fʁɔ.maʒ ʁa.pe/", it: "/forˈmad.dʒo ɡrattudˈdʒa.to/" } 
      },
      { 
        source_term: "Queijo Fatiado", image: "", gender_pt: "m", 
        translations: { cl: "Queso laminado", ar: "Queso en fetas", gb: "Sliced Cheese", us: "Sliced Cheese", pt: "Queijo fatiado", es: "Queso en lonchas", fr: "Fromage en tranches", it: "Formaggio a fette" }, 
        phonetics: { us: "/slaɪst tʃiːz/", gb: "/slaɪst tʃiːz/", br: "/ˈkej.ʒu fa.tʃiˈa.du/", pt: "/ˈkɐj.ʒu fɐˈtja.du/", es: "/ˈkeso en ˈlontʃas/", cl: "/ˈkeso lamiˈnaðo/", ar: "/ˈkeso em ˈfetas/", fr: "/fʁɔ.maʒ ɑ̃ tʁɑ̃ʃ/", it: "/forˈmad.dʒo a ˈfet.te/" } 
      },
      { 
        source_term: "Cottage", image: "", gender_pt: "m", 
        translations: { cl: "Queso cottage", ar: "Queso cottage", gb: "Cottage Cheese", us: "Cottage Cheese", pt: "Queijo cottage", es: "Requesón", fr: "Cottage cheese", it: "Fiocchi di latte" }, 
        phonetics: { us: "/ˈkɑː.tɪdʒ tʃiːz/", gb: "/ˈkɒt.ɪdʒ tʃiːz/", br: "/kɔˈta.ʒi/", pt: "/kɔˈtaʒ/", es: "/rekeˈson/", cl: "/ˈkeso ˈkotedʒ/", ar: "/ˈkeso ˈkotedʒ/", fr: "/kɔ.taʒ tʃiz/", it: "/ˈfjɔk.ki di ˈlat.te/" } 
      },
      { 
        source_term: "Queijo Camembert", image: "", gender_pt: "m", 
        translations: { cl: "Queso Camembert", ar: "Queso Camembert", gb: "Camembert", us: "Camembert", pt: "Queijo Camembert", es: "Queso Camembert", fr: "Camembert", it: "Camembert" }, 
        phonetics: { us: "/ˈkæm.əm.bɛr/", gb: "/ˈkæm.əm.bɛə/", br: "/ka.mẽˈbɛʁ/", pt: "/kɐ.mẽˈbɛɾ/", es: "/kamemˈbeɾ/", cl: "/kamemˈbeɾ/", ar: "/kamemˈbeɾ/", fr: "/ka.mɑ̃.bɛʁ/", it: "/kamemˈbɛr/" } 
      },
      { 
        source_term: "Queijo Roquefort", image: "", gender_pt: "m", 
        translations: { cl: "Queso Roquefort", ar: "Queso Roquefort", gb: "Roquefort", us: "Roquefort", pt: "Queijo Roquefort", es: "Queso Roquefort", fr: "Roquefort", it: "Roquefort" }, 
        phonetics: { us: "/ˈroʊk.fərt/", gb: "/ˈrɒk.fɔː/", br: "/ho.keˈfɔʁ/", pt: "/ʁɔ.kɨˈfɔɾ/", es: "/rokˈfoɾ/", cl: "/rokˈfoɾ/", ar: "/rokˈfoɾ/", fr: "/ʁɔk.fɔʁ/", it: "/rokˈfɔr/" } 
      },
      { 
        source_term: "Queijo Mascarpone", image: "", gender_pt: "m", 
        translations: { cl: "Queso Mascarpone", ar: "Queso Mascarpone", gb: "Mascarpone", us: "Mascarpone", pt: "Queijo Mascarpone", es: "Queso Mascarpone", fr: "Mascarpone", it: "Mascarpone" }, 
        phonetics: { us: "/ˌmæs.kɑːrˈpoʊ.ni/", gb: "/ˌmæs.kəˈpəʊ.ni/", br: "/mas.kaʁˈpo.ni/", pt: "/mɐʃ.kɐɾˈpɔ.nɨ/", es: "/maskaɾˈpone/", cl: "/maskaɾˈpone/", ar: "/maskaɾˈpone/", fr: "/mas.kaʁ.pɔn/", it: "/maskarˈpo.ne/" } 
      },
      { 
        source_term: "Queijo Coalho", image: "", gender_pt: "m", 
        translations: { cl: "Queso para asar", ar: "Queso parrillero", gb: "Grilling Cheese", us: "Grilling Cheese", pt: "Queijo de coalho", es: "Queso para asar", fr: "Fromage à griller", it: "Formaggio da grigliare" }, 
        phonetics: { us: "/ˈɡrɪl.ɪŋ tʃiːz/", gb: "/ˈɡrɪl.ɪŋ tʃiːz/", br: "/ˈkej.ʒu ˈkwa.ʎu/", pt: "/ˈkɐj.ʒu dɨ ˈkwa.ʎu/", es: "/ˈkeso paɾa aˈsaɾ/", cl: "/ˈkeso paɾa aˈsaɾ/", ar: "/ˈkeso pariˈʃeɾo/", fr: "/fʁɔ.maʒ a ɡʁi.je/", it: "/forˈmad.dʒo da ɡriʎˈʎa.re/" } 
      },
      { 
        source_term: "Queijo Reino", image: "", gender_pt: "m", 
        translations: { cl: "Queso Edam", ar: "Queso de bola", gb: "Edam Ball", us: "Edam Cheese", pt: "Queijo bola", es: "Queso de bola", fr: "Edam boule", it: "Formaggio Edam" }, 
        phonetics: { us: "/ˈiː.dæm tʃiːz/", gb: "/ˈiː.dæm bɔːl/", br: "/ˈkej.ʒu ˈhej.nu/", pt: "/ˈkɐj.ʒu ˈbo.lɐ/", es: "/ˈkeso ðe ˈβola/", cl: "/ˈkeso ˈeðam/", ar: "/ˈkeso ðe ˈβola/", fr: "/e.dam bul/", it: "/forˈmad.dʒo ˈe.dam/" } 
      },
      { 
        source_term: "Fondue de Queijo", image: "", gender_pt: "m", 
        translations: { cl: "Fondue de queso", ar: "Fondue de queso", gb: "Cheese Fondue", us: "Cheese Fondue", pt: "Fondue de queijo", es: "Fondue de queso", fr: "Fondue au fromage", it: "Fonduta di formaggio" }, 
        phonetics: { us: "/tʃiːz fɑːnˈduː/", gb: "/tʃiːz ˈfɒn.duː/", br: "/fõˈdʒi dʒi ˈkej.ʒu/", pt: "/fõˈdu dɨ ˈkɐj.ʒu/", es: "/fonˈdju ðe ˈkeso/", cl: "/fonˈdju ðe ˈkeso/", ar: "/fonˈdju ðe ˈkeso/", fr: "/fɔ̃.dy o fʁɔ.maʒ/", it: "/fonˈdu.ta di forˈmad.dʒo/" } 
      },
      { 
        source_term: "Queijo Branco", image: "", gender_pt: "m", 
        translations: { cl: "Quesillo", ar: "Queso blanco", gb: "White Cheese", us: "White Cheese", pt: "Queijo branco", es: "Queso blanco", fr: "Fromage blanc", it: "Formaggio bianco" }, 
        phonetics: { us: "/waɪt tʃiːz/", gb: "/waɪt tʃiːz/", br: "/ˈkej.ʒu ˈbɾɐ̃.ku/", pt: "/ˈkɐj.ʒu ˈbɾɐ̃.ku/", es: "/ˈkeso ˈβlaŋko/", cl: "/keˈsiʝo/", ar: "/ˈkeso ˈβlaŋko/", fr: "/fʁɔ.maʒ blɑ̃/", it: "/forˈmad.dʒo ˈbjaŋ.ko/" } 
      },
      { 
        source_term: "Queijo Vegano", image: "", gender_pt: "m", 
        translations: { cl: "Queso vegano", ar: "Queso vegano", gb: "Vegan Cheese", us: "Vegan Cheese", pt: "Queijo vegano", es: "Queso vegano", fr: "Fromage végétal", it: "Formaggio vegano" }, 
        phonetics: { us: "/ˈviː.ɡən tʃiːz/", gb: "/ˈviː.ɡən tʃiːz/", br: "/ˈkej.ʒu veˈɡa.nu/", pt: "/ˈkɐj.ʒu veˈɡa.nu/", es: "/ˈkeso beˈɣano/", cl: "/ˈkeso beˈɣano/", ar: "/ˈkeso beˈɣano/", fr: "/fʁɔ.maʒ ve.ʒe.tal/", it: "/forˈmad.dʒo veˈɡa.no/" } 
      },
      { 
        source_term: "Tofu", image: "", gender_pt: "m", 
        translations: { cl: "Tofu", ar: "Tofu", gb: "Tofu", us: "Tofu", pt: "Tofu", es: "Tofu", fr: "Tofu", it: "Tofu" }, 
        phonetics: { us: "/ˈtoʊ.fuː/", gb: "/ˈtəʊ.fuː/", br: "/toˈfu/", pt: "/toˈfu/", es: "/ˈtofu/", cl: "/ˈtofu/", ar: "/ˈtofu/", fr: "/tɔ.fy/", it: "/ˈtɔ.fu/" } 
      },
      { 
        source_term: "Creme de Ricota", image: "", gender_pt: "m", 
        translations: { cl: "Ricota cremosa", ar: "Ricota cremosa", gb: "Creamy Ricotta", us: "Creamy Ricotta", pt: "Creme de ricota", es: "Ricota cremosa", fr: "Ricotta crémeuse", it: "Crema di ricotta" }, 
        phonetics: { us: "/ˈkriː.mi rɪˈkɒt.ə/", gb: "/ˈkriː.mi rɪˈkɒt.ə/", br: "/ˈkɾe.mi dʒi hiˈkɔ.tɐ/", pt: "/ˈkɾe.mɨ dɨ ʁiˈkɔ.tɐ/", es: "/riˈkota kɾeˈmosa/", cl: "/riˈkota kɾeˈmosa/", ar: "/riˈkota kɾeˈmosa/", fr: "/ʁi.kɔ.ta kʁe.møz/", it: "/ˈkre.ma di riˈkɔt.ta/" } 
      },
  ],
  deli: [
      { 
        source_term: "Presunto Cozido", image: "", gender_pt: "m", 
        translations: { cl: "Jamón cocido", ar: "Jamón cocido", gb: "Cooked Ham", us: "Ham", pt: "Fiambre", es: "Jamón York", fr: "Jambon blanc", it: "Prosciutto cotto" }, 
        phonetics: { us: "/hæm/", gb: "/hæm/", br: "/pɾeˈzũ.tu koˈzi.du/", pt: "/fiˈɐ̃.bɾɨ/", es: "/xaˈmon ʝoɾk/", cl: "/xaˈmon koˈsiðo/", ar: "/xaˈmon koˈsiðo/", fr: "/ʒɑ̃.bɔ̃ blɑ̃/", it: "/proʃˈʃut.to ˈkɔt.to/" } 
      },
      { 
        source_term: "Peito de Peru", image: "", gender_pt: "m", 
        translations: { cl: "Pechuga de pavo", ar: "Pechuga de pavo", gb: "Turkey Breast", us: "Turkey Breast", pt: "Peito de peru", es: "Pechuga de pavo", fr: "Blanc de dinde", it: "Fesa di tacchino" }, 
        phonetics: { us: "/ˈtɜːr.ki brɛst/", gb: "/ˈtɜː.ki brɛst/", br: "/ˈpej.tu dʒi peˈɾu/", pt: "/ˈpɐj.tu dɨ pɨˈɾu/", es: "/peˈtʃuɣa ðe ˈpaβo/", cl: "/peˈtʃuɣa ðe ˈpaβo/", ar: "/peˈtʃuɣa ðe ˈpaβo/", fr: "/blɑ̃ də dɛ̃d/", it: "/ˈfe.za di takˈki.no/" } 
      },
      { 
        source_term: "Mortadela", image: "", gender_pt: "f", 
        translations: { cl: "Mortadela", ar: "Mortadela", gb: "Mortadella", us: "Bologna", pt: "Mortadela", es: "Mortadela", fr: "Mortadelle", it: "Mortadella" }, 
        phonetics: { us: "/bəˈloʊ.ni/", gb: "/ˌmɔː.təˈdɛl.ə/", br: "/moʁ.taˈdɛ.lɐ/", pt: "/muɾ.tɐˈdɛ.lɐ/", es: "/moɾtaˈðela/", cl: "/moɾtaˈðela/", ar: "/moɾtaˈðela/", fr: "/mɔʁ.ta.dɛl/", it: "/mortaˈdɛl.la/" } 
      },
      { 
        source_term: "Salame", image: "", gender_pt: "m", 
        translations: { cl: "Salame", ar: "Salamín", gb: "Salami", us: "Salami", pt: "Salame", es: "Salchichón", fr: "Saucisson", it: "Salame" }, 
        phonetics: { us: "/səˈlɑː.mi/", gb: "/səˈlɑː.mi/", br: "/saˈlɐ.mi/", pt: "/sɐˈlɐ.mɨ/", es: "/saltʃiˈtʃon/", cl: "/saˈlame/", ar: "/salaˈmin/", fr: "/so.si.sɔ̃/", it: "/saˈla.me/" } 
      },
      { 
        source_term: "Presunto Parma", image: "", gender_pt: "m", 
        translations: { cl: "Jamón serrano", ar: "Jamón crudo", gb: "Parma Ham", us: "Prosciutto", pt: "Presunto serrano", es: "Jamón serrano", fr: "Jambon cru", it: "Prosciutto crudo" }, 
        phonetics: { us: "/prəˈʃuː.toʊ/", gb: "/ˈpɑː.mə hæm/", br: "/pɾeˈzũ.tu ˈpaʁ.mɐ/", pt: "/pɾɨˈzũ.tu sɨˈʁɐ.nu/", es: "/xaˈmon seˈrano/", cl: "/xaˈmon seˈrano/", ar: "/xaˈmon ˈkɾuðo/", fr: "/ʒɑ̃.bɔ̃ kʁy/", it: "/proʃˈʃut.to ˈkru.do/" } 
      },
      { 
        source_term: "Bacon Fatiado", image: "", gender_pt: "m", 
        translations: { cl: "Tocino", ar: "Panceta ahumada", gb: "Rashers", us: "Sliced Bacon", pt: "Bacon fatiado", es: "Bacon en lonchas", fr: "Lardons", it: "Pancetta affumicata" }, 
        phonetics: { us: "/slaɪst ˈbeɪ.kən/", gb: "/ˈræʃ.əz/", br: "/ˈbej.kõ fa.tʃiˈa.du/", pt: "/ˈbej.kõ fɐˈtja.du/", es: "/ˈbeikon en ˈlontʃas/", cl: "/toˈsino/", ar: "/panˈseta/", fr: "/laʁ.dɔ̃/", it: "/panˈtʃet.ta affumiˈka.ta/" } 
      },
      { 
        source_term: "Salsicha", image: "", gender_pt: "f", 
        translations: { cl: "Vienesa", ar: "Salchicha", gb: "Sausage", us: "Hot Dog", pt: "Salsicha", es: "Salchicha Frankfurt", fr: "Saucisse de Strasbourg", it: "Wurstel" }, 
        phonetics: { us: "/hɑːt dɔːɡ/", gb: "/ˈsɒs.ɪdʒ/", br: "/sawˈsi.ʃɐ/", pt: "/saɫˈsi.ʃɐ/", es: "/salˈtʃitʃa/", cl: "/bjeˈnesa/", ar: "/salˈtʃitʃa/", fr: "/so.sis/", it: "/ˈvurs.tel/" } 
      },
      { 
        source_term: "Copa", image: "", gender_pt: "f", 
        translations: { cl: "Bondiola", ar: "Bondiola", gb: "Coppa", us: "Capicola", pt: "Copa", es: "Cabecero de lomo", fr: "Coppa", it: "Coppa" }, 
        phonetics: { us: "/ˌkæp.ɪˈkoʊ.lə/", gb: "/ˈkɒp.ə/", br: "/ˈkɔ.pɐ/", pt: "/ˈkɔ.pɐ/", es: "/kaβeˈθeɾo ðe ˈlomo/", cl: "/bonˈdjola/", ar: "/bonˈdjola/", fr: "/kɔ.pa/", it: "/ˈkɔp.pa/" } 
      },
      { 
        source_term: "Peperoni", image: "", gender_pt: "m", 
        translations: { cl: "Pepperoni", ar: "Longaniza", gb: "Pepperoni", us: "Pepperoni", pt: "Pepperoni", es: "Pepperoni", fr: "Pepperoni", it: "Salame piccante" }, 
        phonetics: { us: "/ˌpɛp.əˈroʊ.ni/", gb: "/ˌpɛp.əˈrəʊ.ni/", br: "/pe.peˈɾõ.ni/", pt: "/pe.pɨˈɾɔ.ni/", es: "/pepeˈɾoni/", cl: "/pepeˈɾoni/", ar: "/loŋɡaˈnisa/", fr: "/pe.pə.ʁɔ.ni/", it: "/saˈla.me pikˈkan.te/" } 
      },
      { 
        source_term: "Rosbife", image: "", gender_pt: "m", 
        translations: { cl: "Roast beef", ar: "Roast beef", gb: "Roast Beef", us: "Roast Beef", pt: "Rosbife", es: "Roast beef", fr: "Rosbif", it: "Roast beef" }, 
        phonetics: { us: "/roʊst biːf/", gb: "/rəʊst biːf/", br: "/hozˈbi.fi/", pt: "/ʁɔʒˈbi.fɨ/", es: "/rost bif/", cl: "/rost bif/", ar: "/rost bif/", fr: "/ʁɔs.bif/", it: "/ˈrɔst bif/" } 
      },
      { 
        source_term: "Patê", image: "", gender_pt: "m", 
        translations: { cl: "Paté", ar: "Paté", gb: "Pâté", us: "Pate", pt: "Patê", es: "Paté", fr: "Pâté", it: "Paté" }, 
        phonetics: { us: "/pæˈteɪ/", gb: "/ˈpæt.eɪ/", br: "/paˈte/", pt: "/pɐˈte/", es: "/paˈte/", cl: "/paˈte/", ar: "/paˈte/", fr: "/pa.te/", it: "/paˈte/" } 
      },
      { 
        source_term: "Presunto Royale", image: "", gender_pt: "m", 
        translations: { cl: "Jamón planchado", ar: "Jamón cocido natural", gb: "Honey Roast Ham", us: "Honey Ham", pt: "Fiambre da perna", es: "Jamón asado", fr: "Jambon braisé", it: "Prosciutto arrosto" }, 
        phonetics: { us: "/ˈhʌn.i hæm/", gb: "/ˈhʌn.i rəʊst hæm/", br: "/pɾeˈzũ.tu ʁojˈja.li/", pt: "/fiˈɐ̃.bɾɨ dɐ ˈpɛɾ.nɐ/", es: "/xaˈmon aˈsaðo/", cl: "/xaˈmon planˈtʃaðo/", ar: "/xaˈmon koˈsiðo natuˈɾal/", fr: "/ʒɑ̃.bɔ̃ bʁɛ.ze/", it: "/proʃˈʃut.to arˈrɔ.sto/" } 
      },
      { 
        source_term: "Lombo Canadense", image: "", gender_pt: "m", 
        translations: { cl: "Lomo canadiense", ar: "Lomo ahumado", gb: "Canadian Bacon", us: "Canadian Bacon", pt: "Lombo fumado", es: "Lomo embuchado", fr: "Bacon canadien", it: "Lonza stagionata" }, 
        phonetics: { us: "/kəˈneɪ.di.ən ˈbeɪ.kən/", gb: "/kəˈneɪ.di.ən ˈbeɪ.kən/", br: "/ˈlõ.bu ka.naˈdẽ.si/", pt: "/ˈlõ.bu fuˈma.du/", es: "/ˈlomo embuˈtʃaðo/", cl: "/ˈlomo kanaˈðjense/", ar: "/ˈlomo auˈmaðo/", fr: "/ba.kɔn ka.na.djɛ̃/", it: "/ˈlon.dza stadʒoˈna.ta/" } 
      },
      { 
        source_term: "Chouriço", image: "", gender_pt: "m", 
        translations: { cl: "Longaniza", ar: "Chorizo", gb: "Chorizo", us: "Chorizo", pt: "Chouriço", es: "Chorizo", fr: "Chorizo", it: "Chorizo" }, 
        phonetics: { us: "/tʃəˈriː.zoʊ/", gb: "/tʃəˈriː.zəʊ/", br: "/ʃowˈɾi.su/", pt: "/ʃoˈɾi.su/", es: "/tʃoˈɾiθo/", cl: "/loŋɡaˈnisa/", ar: "/tʃoˈɾiso/", fr: "/tʃɔ.ʁi.zo/", it: "/tʃoˈri.dzo/" } 
      },
      { 
        source_term: "Morcela", image: "", gender_pt: "f", 
        translations: { cl: "Prieta", ar: "Morcilla", gb: "Black Pudding", us: "Blood Sausage", pt: "Morcela", es: "Morcilla", fr: "Boudin noir", it: "Sanguinaccio" }, 
        phonetics: { us: "/blʌd ˈsɔː.sɪdʒ/", gb: "/blæk ˈpʊd.ɪŋ/", br: "/moʁˈsɛ.lɐ/", pt: "/muɾˈsɛ.lɐ/", es: "/moɾˈθiʎa/", cl: "/ˈpɾjeta/", ar: "/moɾˈsiʃa/", fr: "/bu.dɛ̃ nwaʁ/", it: "/sanɡwiˈnat.tʃo/" } 
      },
      { 
        source_term: "Pastrami", image: "", gender_pt: "m", 
        translations: { cl: "Pastrami", ar: "Pastrami", gb: "Pastrami", us: "Pastrami", pt: "Pastrami", es: "Pastrami", fr: "Pastrami", it: "Pastrami" }, 
        phonetics: { us: "/pəˈstrɑː.mi/", gb: "/pæˈstrɑː.mi/", br: "/pasˈtɾɐ̃.mi/", pt: "/pɐʃˈtɾa.mi/", es: "/pasˈtɾami/", cl: "/pasˈtɾami/", ar: "/pasˈtɾami/", fr: "/pas.tʁa.mi/", it: "/pasˈtra.mi/" } 
      },
      { 
        source_term: "Fiambre de Frango", image: "", gender_pt: "m", 
        translations: { cl: "Jamón de pollo", ar: "Fiambre de pollo", gb: "Chicken Roll", us: "Chicken Roll", pt: "Fiambre de frango", es: "Fiambre de pollo", fr: "Roulade de poulet", it: "Affettato di pollo" }, 
        phonetics: { us: "/ˈtʃɪk.ɪn roʊl/", gb: "/ˈtʃɪk.ɪn rəʊl/", br: "/fiˈɐ̃.bɾi dʒi ˈfɾɐ̃.ɡu/", pt: "/fiˈɐ̃.bɾɨ dɨ ˈfɾɐ̃.ɡu/", es: "/ˈfjam.bɾe ðe ˈpoʎo/", cl: "/xaˈmon de ˈpoʝo/", ar: "/ˈfjam.bɾe ðe ˈpoʃo/", fr: "/ʁu.lad də pu.lɛ/", it: "/affetˈta.to di ˈpol.lo/" } 
      },
      { 
        source_term: "Queijo de Porco", image: "", gender_pt: "m", 
        translations: { cl: "Queso de cabeza", ar: "Queso de cerdo", gb: "Head Cheese", us: "Head Cheese", pt: "Cabeça de xara", es: "Cabeza de jabalí", fr: "Fromage de tête", it: "Coppa di testa" }, 
        phonetics: { us: "/hɛd tʃiːz/", gb: "/hɛd tʃiːz/", br: "/ˈkej.ʒu dʒi ˈpoʁ.ku/", pt: "/kɐˈbe.sɐ dɨ ˈʃa.ɾɐ/", es: "/kaˈβeθa ðe xaβaˈli/", cl: "/ˈkeso ðe kaˈβesa/", ar: "/ˈkeso ðe ˈseɾðo/", fr: "/fʁɔ.maʒ də tɛt/", it: "/ˈkɔp.pa di ˈtɛ.sta/" } 
      },
      { 
        source_term: "Blanquet de Peru", image: "", gender_pt: "m", 
        translations: { cl: "Jamón de pavo", ar: "Blanquet", gb: "Turkey Ham", us: "Turkey Ham", pt: "Fiambre de peru", es: "Fiambre de pavo", fr: "Jambon de dinde", it: "Prosciutto di tacchino" }, 
        phonetics: { us: "/ˈtɜːr.ki hæm/", gb: "/ˈtɜː.ki hæm/", br: "/blɐ̃ˈkɛt dʒi peˈɾu/", pt: "/fiˈɐ̃.bɾɨ dɨ pɨˈɾu/", es: "/ˈfjam.bɾe ðe ˈpaβo/", cl: "/xaˈmon de ˈpaβo/", ar: "/blaŋˈket/", fr: "/ʒɑ̃.bɔ̃ də dɛ̃d/", it: "/proʃˈʃut.to di takˈki.no/" } 
      },
      { 
        source_term: "Apresuntado", image: "", gender_pt: "m", 
        translations: { cl: "Fiambre de jamón", ar: "Fiambre de cerdo", gb: "Luncheon Meat", us: "Luncheon Meat", pt: "Fiambre da pá", es: "Fiambre de magro", fr: "Viande de déjeuner", it: "Carne in scatola" }, 
        phonetics: { us: "/ˈlʌn.tʃən miːt/", gb: "/ˈlʌn.tʃən miːt/", br: "/a.pɾe.zũˈta.du/", pt: "/fiˈɐ̃.bɾɨ dɐ pa/", es: "/ˈfjam.bɾe ðe ˈmaɣɾo/", cl: "/ˈfjam.bɾe ðe xaˈmon/", ar: "/ˈfjam.bɾe ðe ˈseɾðo/", fr: "/vjɑ̃d də de.ʒœ.ne/", it: "/ˈkar.ne in ˈska.to.la/" } 
      },
      { 
        source_term: "Pepperoni Fatiado", image: "", gender_pt: "m", 
        translations: { cl: "Pepperoni laminado", ar: "Pepperoni en fetas", gb: "Sliced Pepperoni", us: "Sliced Pepperoni", pt: "Pepperoni fatiado", es: "Pepperoni en lonchas", fr: "Pepperoni en tranches", it: "Pepperoni a fette" }, 
        phonetics: { us: "/slaɪst ˌpɛp.əˈroʊ.ni/", gb: "/slaɪst ˌpɛp.əˈrəʊ.ni/", br: "/pe.peˈɾõ.ni fa.tʃiˈa.du/", pt: "/pe.pɨˈɾɔ.ni fɐˈtja.du/", es: "/pepeˈɾoni en ˈlontʃas/", cl: "/pepeˈɾoni lamiˈnaðo/", ar: "/pepeˈɾoni em ˈfetas/", fr: "/pe.pə.ʁɔ.ni ɑ̃ tʁɑ̃ʃ/", it: "/peppeˈro.ni a ˈfet.te/" } 
      },
      { 
        source_term: "Frios Variados", image: "", gender_pt: "m", 
        translations: { cl: "Surtido de fiambres", ar: "Picada", gb: "Cold Cuts", us: "Cold Cuts", pt: "Tábua de frios", es: "Tabla de embutidos", fr: "Charcuterie", it: "Affettati misti" }, 
        phonetics: { us: "/koʊld kʌts/", gb: "/kəʊld kʌts/", br: "/ˈfɾi.us va.ɾiˈa.dus/", pt: "/ˈta.bwɐ dɨ ˈfɾi.uʃ/", es: "/ˈtaβla ðe embuˈtiðos/", cl: "/suɾˈtiðo ðe ˈfjam.bɾes/", ar: "/piˈkaða/", fr: "/ʃaʁ.ky.tʁi/", it: "/affetˈta.ti ˈmi.sti/" } 
      },
      { 
        source_term: "Chorizo Espanhol", image: "", gender_pt: "m", 
        translations: { cl: "Chorizo español", ar: "Chorizo colorado", gb: "Spanish Chorizo", us: "Spanish Chorizo", pt: "Chouriço espanhol", es: "Chorizo español", fr: "Chorizo espagnol", it: "Chorizo spagnolo" }, 
        phonetics: { us: "/ˈspæn.ɪʃ tʃəˈriː.zoʊ/", gb: "/ˈspæn.ɪʃ tʃəˈriː.zəʊ/", br: "/ʃowˈɾi.su is.pɐ̃ˈɲɔw/", pt: "/ʃoˈɾi.su ɨʃ.pɐˈɲɔɫ/", es: "/tʃoˈɾiθo espaˈɲol/", cl: "/tʃoˈɾiso espaˈɲol/", ar: "/tʃoˈɾiso koloˈɾaðo/", fr: "/tʃɔ.ʁi.zo ɛs.pa.ɲɔl/", it: "/tʃoˈri.dzo spaɲˈɲɔ.lo/" } 
      },
      { 
        source_term: "Fuet", image: "", gender_pt: "m", 
        translations: { cl: "Fuet", ar: "Fuet", gb: "Fuet", us: "Fuet", pt: "Fuet", es: "Fuet", fr: "Fuet", it: "Fuet" }, 
        phonetics: { us: "/fuˈɛt/", gb: "/fuˈɛt/", br: "/fuˈɛt/", pt: "/fuˈɛt/", es: "/fuˈet/", cl: "/fuˈet/", ar: "/fuˈet/", fr: "/fɥɛt/", it: "/fuˈɛt/" } 
      },
      { 
        source_term: "Carpaccio", image: "", gender_pt: "m", 
        translations: { cl: "Carpaccio", ar: "Carpaccio", gb: "Carpaccio", us: "Carpaccio", pt: "Carpaccio", es: "Carpaccio", fr: "Carpaccio", it: "Carpaccio" }, 
        phonetics: { us: "/kɑːrˈpɑː.tʃioʊ/", gb: "/kɑːˈpæt.ʃi.əʊ/", br: "/kaʁˈpa.tʃu/", pt: "/kɐɾˈpa.tʃu/", es: "/kaɾˈpat.tʃo/", cl: "/kaɾˈpat.tʃo/", ar: "/kaɾˈpat.tʃo/", fr: "/kaʁ.pa.tʃjo/", it: "/karˈpat.tʃo/" } 
      },
  ],
  milkYogurt: [
      { 
        source_term: "Leite Integral", image: "", gender_pt: "m", 
        translations: { cl: "Leche entera", ar: "Leche entera", gb: "Whole Milk", us: "Whole Milk", pt: "Leite gordo", es: "Leche entera", fr: "Lait entier", it: "Latte intero" }, 
        phonetics: { us: "/hoʊl mɪlk/", gb: "/həʊl mɪlk/", br: "/ˈlej.tʃi ĩ.teˈɡɾaw/", pt: "/ˈlɐj.tɨ ˈɡoɾ.du/", es: "/ˈletʃe enˈteɾa/", cl: "/ˈletʃe enˈteɾa/", ar: "/ˈletʃe enˈteɾa/", fr: "/lɛ ɑ̃.tje/", it: "/ˈlat.te inˈtɛ.ro/" } 
      },
      { 
        source_term: "Leite Desnatado", image: "", gender_pt: "m", 
        translations: { cl: "Leche descremada", ar: "Leche descremada", gb: "Skimmed Milk", us: "Skim Milk", pt: "Leite magro", es: "Leche desnatada", fr: "Lait écrémé", it: "Latte scremato" }, 
        phonetics: { us: "/skɪm mɪlk/", gb: "/skɪmd mɪlk/", br: "/ˈlej.tʃi dez.naˈta.du/", pt: "/ˈlɐj.tɨ ˈma.ɡɾu/", es: "/ˈletʃe desnaˈtaða/", cl: "/ˈletʃe deskɾeˈmaða/", ar: "/ˈletʃe deskɾeˈmaða/", fr: "/lɛ e.kʁe.me/", it: "/ˈlat.te skreˈma.to/" } 
      },
      { 
        source_term: "Leite Semidesnatado", image: "", gender_pt: "m", 
        translations: { cl: "Leche semidescremada", ar: "Leche semidescremada", gb: "Semi-skimmed Milk", us: "Low-fat Milk", pt: "Leite meio-gordo", es: "Leche semidesnatada", fr: "Lait demi-écrémé", it: "Latte parzialmente scremato" }, 
        phonetics: { us: "/loʊ fæt mɪlk/", gb: "/ˈsɛm.i skɪmd mɪlk/", br: "/ˈlej.tʃi ˈsẽ.mi dez.naˈta.du/", pt: "/ˈlɐj.tɨ ˈmɐj.u ˈɡoɾ.du/", es: "/ˈletʃe semidesnaˈtaða/", cl: "/ˈletʃe semideskɾeˈmaða/", ar: "/ˈletʃe semideskɾeˈmaða/", fr: "/lɛ də.mi.e.kʁe.me/", it: "/ˈlat.te parttsjalˈmen.te skreˈma.to/" } 
      },
      { 
        source_term: "Iogurte Natural", image: "", gender_pt: "m", 
        translations: { cl: "Yogurt natural", ar: "Yogur natural", gb: "Natural Yoghurt", us: "Plain Yogurt", pt: "Iogurte natural", es: "Yogur natural", fr: "Yaourt nature", it: "Yogurt bianco" }, 
        phonetics: { us: "/pleɪn ˈjoʊ.ɡərt/", gb: "/ˈnætʃ.ər.əl ˈjɒɡ.ət/", br: "/joˈɡuʁ.tʃi na.tuˈɾaw/", pt: "/jɔˈɡuɾ.tɨ nɐ.tuˈɾaɫ/", es: "/ʝoˈɣuɾ natuˈɾal/", cl: "/joˈɣuɾt natuˈɾal/", ar: "/ʃoˈɣuɾ natuˈɾal/", fr: "/ja.uʁt na.tyʁ/", it: "/ˈjɔ.ɡurt ˈbjaŋ.ko/" } 
      },
      { 
        source_term: "Iogurte de Morango", image: "", gender_pt: "m", 
        translations: { cl: "Yogurt de frutilla", ar: "Yogur de frutilla", gb: "Strawberry Yoghurt", us: "Strawberry Yogurt", pt: "Iogurte de morango", es: "Yogur de fresa", fr: "Yaourt à la fraise", it: "Yogurt alla fragola" }, 
        phonetics: { us: "/ˈstrɔːˌbɛr.i ˈjoʊ.ɡərt/", gb: "/ˈstrɔː.bər.i ˈjɒɡ.ət/", br: "/joˈɡuʁ.tʃi dʒi moˈɾɐ̃.ɡu/", pt: "/jɔˈɡuɾ.tɨ dɨ muˈɾɐ̃.ɡu/", es: "/ʝoˈɣuɾ ðe ˈfɾesa/", cl: "/joˈɣuɾt ðe fɾuˈtiʝa/", ar: "/ʃoˈɣuɾ ðe fɾuˈtiʃa/", fr: "/ja.uʁt a la fʁɛz/", it: "/ˈjɔ.ɡurt alla ˈfra.ɡo.la/" } 
      },
      { 
        source_term: "Iogurte Grego", image: "", gender_pt: "m", 
        translations: { cl: "Yogurt griego", ar: "Yogur griego", gb: "Greek Yoghurt", us: "Greek Yogurt", pt: "Iogurte grego", es: "Yogur griego", fr: "Yaourt grec", it: "Yogurt greco" }, 
        phonetics: { us: "/ɡriːk ˈjoʊ.ɡərt/", gb: "/ɡriːk ˈjɒɡ.ət/", br: "/joˈɡuʁ.tʃi ˈɡɾe.ɡu/", pt: "/jɔˈɡuɾ.tɨ ˈɡɾe.ɡu/", es: "/ʝoˈɣuɾ ˈɡɾjeɣo/", cl: "/joˈɣuɾt ˈɡɾjeɣo/", ar: "/ʃoˈɣuɾ ˈɡɾjeɣo/", fr: "/ja.uʁt ɡʁɛk/", it: "/ˈjɔ.ɡurt ˈɡrɛ.ko/" } 
      },
      { 
        source_term: "Leite Sem Lactose", image: "", gender_pt: "m", 
        translations: { cl: "Leche sin lactosa", ar: "Leche deslactosada", gb: "Lactose-free Milk", us: "Lactose-free Milk", pt: "Leite sem lactose", es: "Leche sin lactosa", fr: "Lait sans lactose", it: "Latte senza lattosio" }, 
        phonetics: { us: "/ˈlæk.toʊs friː mɪlk/", gb: "/ˈlæk.təʊs friː mɪlk/", br: "/ˈlej.tʃi sẽj lakˈtɔ.zi/", pt: "/ˈlɐj.tɨ sɐ̃j lakˈtɔ.zɨ/", es: "/ˈletʃe sin lakˈtosa/", cl: "/ˈletʃe sin lakˈtosa/", ar: "/ˈletʃe dezlaktoˈsaða/", fr: "/lɛ sɑ̃ lak.toz/", it: "/ˈlat.te ˈsɛn.tsa latˈtɔ.zjo/" } 
      },
      { 
        source_term: "Leite de Soja", image: "", gender_pt: "m", 
        translations: { cl: "Leche de soya", ar: "Leche de soja", gb: "Soya Milk", us: "Soy Milk", pt: "Leite de soja", es: "Leche de soja", fr: "Lait de soja", it: "Latte di soia" }, 
        phonetics: { us: "/sɔɪ mɪlk/", gb: "/ˈsɔɪ.ə mɪlk/", br: "/ˈlej.tʃi dʒi ˈsɔ.ʒɐ/", pt: "/ˈlɐj.tɨ dɨ ˈsɔ.ʒɐ/", es: "/ˈletʃe ðe ˈsoxa/", cl: "/ˈletʃe ðe ˈsoʝa/", ar: "/ˈletʃe ðe ˈsoxa/", fr: "/lɛ də so.ʒa/", it: "/ˈlat.te di ˈsɔ.ja/" } 
      },
      { 
        source_term: "Leite de Amêndoa", image: "", gender_pt: "m", 
        translations: { cl: "Leche de almendras", ar: "Leche de almendras", gb: "Almond Milk", us: "Almond Milk", pt: "Leite de amêndoa", es: "Leche de almendras", fr: "Lait d'amande", it: "Latte di mandorla" }, 
        phonetics: { us: "/ˈɑːl.mənd mɪlk/", gb: "/ˈɑː.mənd mɪlk/", br: "/ˈlej.tʃi dʒi aˈmẽ.dwɐ/", pt: "/ˈlɐj.tɨ dɨ ɐˈmẽ.dwɐ/", es: "/ˈletʃe ðe alˈmendɾas/", cl: "/ˈletʃe ðe alˈmendɾas/", ar: "/ˈletʃe ðe alˈmendɾas/", fr: "/lɛ da.mɑ̃d/", it: "/ˈlat.te di manˈdɔr.la/" } 
      },
      { 
        source_term: "Yakult/Leite Fermentado", image: "", gender_pt: "m", 
        translations: { cl: "Chamito/Uno al día", ar: "Yogur bebible", gb: "Probiotic Drink", us: "Probiotic Drink", pt: "Leite fermentado", es: "Leche fermentada", fr: "Lait fermenté", it: "Latte fermentato" }, 
        phonetics: { us: "/ˌproʊ.baɪˈɒt.ɪk drɪŋk/", gb: "/ˌprəʊ.baɪˈɒt.ɪk drɪŋk/", br: "/lej.tʃi feʁ.mẽˈta.du/", pt: "/lɐj.tɨ fɨɾ.mẽˈta.du/", es: "/ˈletʃe feɾmenˈtaða/", cl: "/tʃaˈmito/", ar: "/ʃoˈɣuɾ beˈβiβle/", fr: "/lɛ fɛʁ.mɑ̃.te/", it: "/ˈlat.te fermenˈta.to/" } 
      },
      { 
        source_term: "Sobremesa Láctea", image: "", gender_pt: "f", 
        translations: { cl: "Postre de leche", ar: "Postrecito", gb: "Dairy Dessert", us: "Pudding cup", pt: "Sobremesa láctea", es: "Postre lácteo", fr: "Dessert lacté", it: "Dessert al latte" }, 
        phonetics: { us: "/ˈpʊd.ɪŋ kʌp/", gb: "/ˈdɛə.ri dɪˈzɜːt/", br: "/so.bɾiˈme.zɐ ˈlak.tʃjɐ/", pt: "/su.bɾɨˈme.zɐ ˈlak.tjɐ/", es: "/ˈpostɾe ˈlakteo/", cl: "/ˈpostɾe ðe ˈletʃe/", ar: "/postɾeˈsito/", fr: "/de.sɛʁ lak.te/", it: "/desˈsɛrt al ˈlat.te/" } 
      },
      { 
        source_term: "Kefir", image: "", gender_pt: "m", 
        translations: { cl: "Kéfir", ar: "Kéfir", gb: "Kefir", us: "Kefir", pt: "Kefir", es: "Kéfir", fr: "Kéfir", it: "Kefir" }, 
        phonetics: { us: "/kəˈfɪər/", gb: "/kəˈfɪə/", br: "/keˈfiʁ/", pt: "/keˈfiɾ/", es: "/ˈkefiɾ/", cl: "/ˈkefiɾ/", ar: "/ˈkefiɾ/", fr: "/ke.fiʁ/", it: "/keˈfir/" } 
      },
      { 
        source_term: "Leite de Cabra", image: "", gender_pt: "m", 
        translations: { cl: "Leche de cabra", ar: "Leche de cabra", gb: "Goat Milk", us: "Goat Milk", pt: "Leite de cabra", es: "Leche de cabra", fr: "Lait de chèvre", it: "Latte di capra" }, 
        phonetics: { us: "/ɡoʊt mɪlk/", gb: "/ɡəʊt mɪlk/", br: "/ˈlej.tʃi dʒi ˈka.bɾɐ/", pt: "/ˈlɐj.tɨ dɨ ˈka.bɾɐ/", es: "/ˈletʃe ðe ˈkaβɾa/", cl: "/ˈletʃe ðe ˈkaβɾa/", ar: "/ˈletʃe ðe ˈkaβɾa/", fr: "/lɛ də ʃɛvʁ/", it: "/ˈlat.te di ˈka.pra/" } 
      },
      { 
        source_term: "Leite de Aveia", image: "", gender_pt: "m", 
        translations: { cl: "Leche de avena", ar: "Leche de avena", gb: "Oat Milk", us: "Oat Milk", pt: "Leite de aveia", es: "Leche de avena", fr: "Lait d'avoine", it: "Latte di avena" }, 
        phonetics: { us: "/oʊt mɪlk/", gb: "/əʊt mɪlk/", br: "/ˈlej.tʃi dʒi aˈvej.ɐ/", pt: "/ˈlɐj.tɨ dɨ ɐˈvɐj.ɐ/", es: "/ˈletʃe ðe aˈβena/", cl: "/ˈletʃe ðe aˈβena/", ar: "/ˈletʃe ðe aˈβena/", fr: "/lɛ da.vwan/", it: "/ˈlat.te di aˈvɛ.na/" } 
      },
      { 
        source_term: "Leite de Arroz", image: "", gender_pt: "m", 
        translations: { cl: "Leche de arroz", ar: "Leche de arroz", gb: "Rice Milk", us: "Rice Milk", pt: "Leite de arroz", es: "Leche de arroz", fr: "Lait de riz", it: "Latte di riso" }, 
        phonetics: { us: "/raɪs mɪlk/", gb: "/raɪs mɪlk/", br: "/ˈlej.tʃi dʒi aˈhojs/", pt: "/ˈlɐj.tɨ dɨ ɐˈʁoʃ/", es: "/ˈletʃe ðe aˈroθ/", cl: "/ˈletʃe ðe aˈrros/", ar: "/ˈletʃe ðe aˈros/", fr: "/lɛ də ʁi/", it: "/ˈlat.te di ˈri.zo/" } 
      },
      { 
        source_term: "Leite em Pó", image: "", gender_pt: "m", 
        translations: { cl: "Leche en polvo", ar: "Leche en polvo", gb: "Powdered Milk", us: "Powdered Milk", pt: "Leite em pó", es: "Leche en polvo", fr: "Lait en poudre", it: "Latte in polvere" }, 
        phonetics: { us: "/ˈpaʊdərd mɪlk/", gb: "/ˈpaʊ.dəd mɪlk/", br: "/ˈlej.tʃi ẽ pɔ/", pt: "/ˈlɐj.tɨ ẽ pɔ/", es: "/ˈletʃe em ˈpolbo/", cl: "/ˈletʃe em ˈpolbo/", ar: "/ˈletʃe em ˈpolbo/", fr: "/lɛ ɑ̃ pudʁ/", it: "/ˈlat.te im ˈpol.ve.re/" } 
      },
      { 
        source_term: "Coalhada", image: "", gender_pt: "f", 
        translations: { cl: "Cuajada", ar: "Cuajada", gb: "Curd", us: "Curd", pt: "Coalhada", es: "Cuajada", fr: "Caillé", it: "Cagliata" }, 
        phonetics: { us: "/kɜːrd/", gb: "/kɜːd/", br: "/kwaˈʎa.dɐ/", pt: "/kwaˈʎa.dɐ/", es: "/kwaˈxaða/", cl: "/kwaˈxaða/", ar: "/kwaˈxaða/", fr: "/ka.je/", it: "/kaʎˈʎa.ta/" } 
      },
      { 
        source_term: "Iogurte de Baunilha", image: "", gender_pt: "m", 
        translations: { cl: "Yogurt de vainilla", ar: "Yogur de vainilla", gb: "Vanilla Yoghurt", us: "Vanilla Yogurt", pt: "Iogurte de baunilha", es: "Yogur de vainilla", fr: "Yaourt à la vanille", it: "Yogurt alla vaniglia" }, 
        phonetics: { us: "/vəˈnɪlə ˈjoʊ.ɡərt/", gb: "/vəˈnɪl.ə ˈjɒɡ.ət/", br: "/joˈɡuʁ.tʃi dʒi bawˈni.ʎɐ/", pt: "/jɔˈɡuɾ.tɨ dɨ bawˈni.ʎɐ/", es: "/ʝoˈɣuɾ ðe baiˈniʎa/", cl: "/joˈɣuɾt ðe baiˈniʎa/", ar: "/ʃoˈɣuɾ ðe baiˈniʃa/", fr: "/ja.uʁt a la va.nij/", it: "/ˈjɔ.ɡurt alla vaˈniʎ.ʎa/" } 
      },
      { 
        source_term: "Iogurte de Coco", image: "", gender_pt: "m", 
        translations: { cl: "Yogurt de coco", ar: "Yogur de coco", gb: "Coconut Yoghurt", us: "Coconut Yogurt", pt: "Iogurte de coco", es: "Yogur de coco", fr: "Yaourt à la noix de coco", it: "Yogurt al cocco" }, 
        phonetics: { us: "/ˈkoʊkənʌt ˈjoʊ.ɡərt/", gb: "/ˈkəʊ.kə.nʌt ˈjɒɡ.ət/", br: "/joˈɡuʁ.tʃi dʒi ˈko.ku/", pt: "/jɔˈɡuɾ.tɨ dɨ ˈko.ku/", es: "/ʝoˈɣuɾ ðe ˈkoko/", cl: "/joˈɣuɾt ðe ˈkoko/", ar: "/ʃoˈɣuɾ ðe ˈkoko/", fr: "/ja.uʁt a la nwa də kɔ.kɔ/", it: "/ˈjɔ.ɡurt al ˈkɔk.ko/" } 
      },
      { 
        source_term: "Iogurte com Granola", image: "", gender_pt: "m", 
        translations: { cl: "Yogurt con granola", ar: "Yogur con cereales", gb: "Yoghurt with Granola", us: "Yogurt with Granola", pt: "Iogurte com granola", es: "Yogur con granola", fr: "Yaourt au granola", it: "Yogurt con granola" }, 
        phonetics: { us: "/ˈjoʊ.ɡərt wɪð ɡrəˈnoʊlə/", gb: "/ˈjɒɡ.ət wɪð ɡrəˈnəʊ.lə/", br: "/joˈɡuʁ.tʃi kõ ɡɾaˈnɔ.lɐ/", pt: "/jɔˈɡuɾ.tɨ kõ ɡɾɐˈnɔ.lɐ/", es: "/ʝoˈɣuɾ koŋ ɡɾaˈnola/", cl: "/joˈɣuɾt koŋ ɡɾaˈnola/", ar: "/ʃoˈɣuɾ kon seɾeˈales/", fr: "/ja.uʁt o ɡʁa.no.la/", it: "/ˈjɔ.ɡurt kon ɡraˈnɔ.la/" } 
      },
  ],
  creamsButters: [
      { 
        source_term: "Manteiga", image: "", gender_pt: "f", 
        translations: { cl: "Mantequilla", ar: "Manteca", gb: "Butter", us: "Butter", pt: "Manteiga", es: "Mantequilla", fr: "Beurre", it: "Burro" }, 
        phonetics: { us: "/ˈbʌt.ər/", gb: "/ˈbʌt.ə/", br: "/mɐ̃ˈtej.ɡɐ/", pt: "/mɐ̃ˈtɐj.ɡɐ/", es: "/manteˈkiʎa/", cl: "/manteˈkiʎa/", ar: "/manˈteka/", fr: "/bœʁ/", it: "/ˈbur.ro/" } 
      },
      { 
        source_term: "Margarina", image: "", gender_pt: "f", 
        translations: { cl: "Margarina", ar: "Margarina", gb: "Margarine", us: "Margarine", pt: "Margarina", es: "Margarina", fr: "Margarine", it: "Margarina" }, 
        phonetics: { us: "/ˈmɑːr.dʒə.rɪn/", gb: "/ˌmɑː.dʒəˈriːn/", br: "/maʁ.ɡaˈɾĩ.nɐ/", pt: "/mɐɾ.ɡɐˈɾi.nɐ/", es: "/maɾɣaˈɾina/", cl: "/maɾɣaˈɾina/", ar: "/maɾɣaˈɾina/", fr: "/maʁ.ɡa.ʁin/", it: "/marɡaˈri.na/" } 
      },
      { 
        source_term: "Creme de Leite Fresco", image: "", gender_pt: "m", 
        translations: { cl: "Crema para batir", ar: "Crema de leche", gb: "Double Cream", us: "Heavy Cream", pt: "Natas frescas", es: "Nata para montar", fr: "Crème fraîche", it: "Panna fresca" }, 
        phonetics: { us: "/ˈhɛv.i kriːm/", gb: "/ˈdʌb.əl kriːm/", br: "/ˈkɾẽ.mi dʒi ˈlej.tʃi ˈfɾes.ku/", pt: "/ˈna.tɐʃ ˈfɾeʃ.kɐʃ/", es: "/ˈnata paɾa monˈtaɾ/", cl: "/ˈkɾema paɾa βaˈtiɾ/", ar: "/ˈkɾema ðe ˈletʃe/", fr: "/kʁɛm fʁɛʃ/", it: "/ˈpan.na ˈfres.ka/" } 
      },
      { 
        source_term: "Creme de Leite (Caixinha)", image: "", gender_pt: "m", 
        translations: { cl: "Crema de leche", ar: "Crema de leche", gb: "Single Cream", us: "Table Cream", pt: "Natas", es: "Nata para cocinar", fr: "Crème liquide", it: "Panna da cucina" }, 
        phonetics: { us: "/ˈteɪ.bəl kriːm/", gb: "/ˈsɪŋ.ɡəl kriːm/", br: "/ˈkɾẽ.mi dʒi ˈlej.tʃi/", pt: "/ˈna.tɐʃ/", es: "/ˈnata paɾa koθiˈnaɾ/", cl: "/ˈkɾema ðe ˈletʃe/", ar: "/ˈkɾema ðe ˈletʃe/", fr: "/kʁɛm li.kid/", it: "/ˈpan.na da kuˈtʃi.na/" } 
      },
      { 
        source_term: "Chantilly", image: "", gender_pt: "m", 
        translations: { cl: "Crema chantilly", ar: "Crema chantilly", gb: "Whipped Cream", us: "Whipped Cream", pt: "Chantilly", es: "Nata montada", fr: "Chantilly", it: "Panna montata" }, 
        phonetics: { us: "/wɪpt kriːm/", gb: "/wɪpt kriːm/", br: "/ʃɐ̃.tʃiˈli/", pt: "/ʃɐ̃.tiˈli/", es: "/ˈnata monˈtaða/", cl: "/ˈkɾema tʃantiˈʝi/", ar: "/ˈkɾema tʃantiˈʃi/", fr: "/ʃɑ̃.ti.ji/", it: "/ˈpan.na monˈta.ta/" } 
      },
      { 
        source_term: "Banha", image: "", gender_pt: "f", 
        translations: { cl: "Manteca", ar: "Grasa de cerdo", gb: "Lard", us: "Lard", pt: "Banha", es: "Manteca de cerdo", fr: "Saindoux", it: "Strutto" }, 
        phonetics: { us: "/lɑːrd/", gb: "/lɑːd/", br: "/ˈbɐ̃.ɲɐ/", pt: "/ˈbɐ.ɲɐ/", es: "/manˈteka ðe ˈθeɾðo/", cl: "/manˈteka/", ar: "/ˈɡɾasa ðe ˈseɾðo/", fr: "/sɛ̃.du/", it: "/ˈstrut.to/" } 
      },
      { 
        source_term: "Manteiga com Sal", image: "", gender_pt: "f", 
        translations: { cl: "Mantequilla con sal", ar: "Manteca con sal", gb: "Salted Butter", us: "Salted Butter", pt: "Manteiga com sal", es: "Mantequilla con sal", fr: "Beurre demi-sel", it: "Burro salato" }, 
        phonetics: { us: "/ˈsɔːl.tɪd ˈbʌt.ər/", gb: "/ˈsɔːl.tɪd ˈbʌt.ə/", br: "/mɐ̃ˈtej.ɡɐ kõ saw/", pt: "/mɐ̃ˈtɐj.ɡɐ kõ saɫ/", es: "/manteˈkiʎa kon sal/", cl: "/manteˈkiʎa kon sal/", ar: "/manˈteka kon sal/", fr: "/bœʁ də.mi.sɛl/", it: "/ˈbur.ro saˈla.to/" } 
      },
      { 
        source_term: "Manteiga sem Sal", image: "", gender_pt: "f", 
        translations: { cl: "Mantequilla sin sal", ar: "Manteca sin sal", gb: "Unsalted Butter", us: "Unsalted Butter", pt: "Manteiga sem sal", es: "Mantequilla sin sal", fr: "Beurre doux", it: "Burro senza sale" }, 
        phonetics: { us: "/ʌnˈsɔːl.tɪd ˈbʌt.ər/", gb: "/ʌnˈsɒl.tɪd ˈbʌt.ə/", br: "/mɐ̃ˈtej.ɡɐ sẽj saw/", pt: "/mɐ̃ˈtɐj.ɡɐ sɐ̃j saɫ/", es: "/manteˈkiʎa sin sal/", cl: "/manteˈkiʎa sin sal/", ar: "/manˈteka sin sal/", fr: "/bœʁ du/", it: "/ˈbur.ro ˈsɛn.tsa ˈsa.le/" } 
      },
      { 
        source_term: "Nata", image: "", gender_pt: "f", 
        translations: { cl: "Crema espesa", ar: "Nata", gb: "Clotted Cream", us: "Clotted Cream", pt: "Nata", es: "Nata", fr: "Crème caillée", it: "Panna rappresa" }, 
        phonetics: { us: "/ˈklɑː.tɪd kriːm/", gb: "/ˈklɒt.ɪd kriːm/", br: "/ˈna.tɐ/", pt: "/ˈna.tɐ/", es: "/ˈnata/", cl: "/ˈkɾema esˈpesa/", ar: "/ˈnata/", fr: "/kʁɛm ka.je/", it: "/ˈpan.na rapˈpre.za/" } 
      },
      { 
        source_term: "Creme Azedo", image: "", gender_pt: "m", 
        translations: { cl: "Crema ácida", ar: "Crema agria", gb: "Sour Cream", us: "Sour Cream", pt: "Natas azedas", es: "Crema agria", fr: "Crème sure", it: "Panna acida" }, 
        phonetics: { us: "/ˈsaʊ.ər kriːm/", gb: "/saʊə kriːm/", br: "/ˈkɾẽ.mi aˈze.du/", pt: "/ˈna.tɐʃ ɐˈze.dɐʃ/", es: "/ˈkɾema ˈaɣɾja/", cl: "/ˈkɾema ˈasiða/", ar: "/ˈkɾema ˈaɣɾja/", fr: "/kʁɛm syʁ/", it: "/ˈpan.na ˈa.tʃi.da/" } 
      },
      { 
        source_term: "Manteiga Clarificada/Ghee", image: "", gender_pt: "f", 
        translations: { cl: "Ghee", ar: "Ghee", gb: "Ghee", us: "Ghee", pt: "Ghee", es: "Ghee", fr: "Ghee", it: "Ghee" }, 
        phonetics: { us: "/ɡiː/", gb: "/ɡiː/", br: "/ɡi/", pt: "/ɡi/", es: "/ɡi/", cl: "/ɡi/", ar: "/ɡi/", fr: "/ɡi/", it: "/ɡi/" } 
      },
      { 
        source_term: "Manteiga de Amendoim", image: "", gender_pt: "f", 
        translations: { cl: "Mantequilla de maní", ar: "Mantequilla de maní", gb: "Peanut Butter", us: "Peanut Butter", pt: "Manteiga de amendoim", es: "Mantequilla de cacahuete", fr: "Beurre de cacahuète", it: "Burro di arachidi" }, 
        phonetics: { us: "/ˈpiːnʌt ˈbʌtər/", gb: "/ˈpiː.nʌt ˈbʌt.ə/", br: "/mɐ̃ˈtej.ɡɐ dʒi a.mẽ.doˈĩ/", pt: "/mɐ̃ˈtɐj.ɡɐ dɨ ɐ.mẽ.dwĩ/", es: "/manteˈkiʎa ðe kakaˈwete/", cl: "/manteˈkiʎa ðe maˈni/", ar: "/manteˈkiʃa ðe maˈni/", fr: "/bœʁ də ka.ka.wɛt/", it: "/ˈbur.ro di aˈra.ki.di/" } 
      },
  ]
};
