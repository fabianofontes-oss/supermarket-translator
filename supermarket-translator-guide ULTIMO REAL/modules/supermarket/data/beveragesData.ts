
export const beveragesData: Record<string, { source_term: string; image: string; gender_pt: 'm' | 'f'; translations: Record<string, string>; phonetics?: Record<string, string> }[]> = {
  waterJuices: [
    { 
      source_term: "Água sem Gás", image: "", gender_pt: "f", 
      translations: { cl: "Agua sin gas", ar: "Agua sin gas", gb: "Still Water", us: "Still Water", pt: "Água sem gás", es: "Agua sin gas", fr: "Eau plate", it: "Acqua naturale" }, 
      phonetics: { us: "/stɪl ˈwɔːtər/", gb: "/stɪl ˈwɔː.tə/", br: "/ˈa.ɡwɐ sẽj ɡas/", pt: "/ˈa.ɡwɐ sɐ̃j ɡaʃ/", es: "/ˈaɣwa sin ɡas/", cl: "/ˈaɣwa sin ɡas/", ar: "/ˈaɣwa sin ɡas/", fr: "/o plat/", it: "/ˈakkwa natuˈrale/" } 
    },
    { 
      source_term: "Água com Gás", image: "", gender_pt: "f", 
      translations: { cl: "Agua con gas", ar: "Agua con gas", gb: "Sparkling Water", us: "Sparkling Water", pt: "Água com gás", es: "Agua con gas", fr: "Eau gazeuse", it: "Acqua frizzante" }, 
      phonetics: { us: "/ˈspɑːrklɪŋ ˈwɔːtər/", gb: "/ˈspɑː.klɪŋ ˈwɔː.tə/", br: "/ˈa.ɡwɐ kõ ɡas/", pt: "/ˈa.ɡwɐ kõ ɡaʃ/", es: "/ˈaɣwa koŋ ɡas/", cl: "/ˈaɣwa koŋ ɡas/", ar: "/ˈaɣwa koŋ ɡas/", fr: "/o ɡaˈzøz/", it: "/ˈakkwa fridˈdzante/" } 
    },
    { 
      source_term: "Água Mineral", image: "", gender_pt: "f", 
      translations: { cl: "Agua mineral", ar: "Agua mineral", gb: "Mineral Water", us: "Mineral Water", pt: "Água mineral", es: "Agua mineral", fr: "Eau minérale", it: "Acqua minerale" }, 
      phonetics: { us: "/ˈmɪnərəl ˈwɔːtər/", gb: "/ˈmɪn.ər.əl ˈwɔː.tə/", br: "/ˈa.ɡwɐ mi.neˈɾaw/", pt: "/ˈa.ɡwɐ mi.nɨˈɾaɫ/", es: "/ˈaɣwa mineˈɾal/", cl: "/ˈaɣwa mineˈɾal/", ar: "/ˈaɣwa mineˈɾal/", fr: "/o mineˈʁal/", it: "/ˈakkwa mineˈrale/" } 
    },
    { 
      source_term: "Água de Coco", image: "", gender_pt: "f", 
      translations: { cl: "Agua de coco", ar: "Agua de coco", gb: "Coconut Water", us: "Coconut Water", pt: "Água de coco", es: "Agua de coco", fr: "Eau de coco", it: "Acqua di cocco" }, 
      phonetics: { us: "/ˈkoʊkənʌt ˈwɔːtər/", gb: "/ˈkəʊ.kə.nʌt ˈwɔː.tə/", br: "/ˈa.ɡwɐ dʒi ˈko.ku/", pt: "/ˈa.ɡwɐ dɨ ˈko.ku/", es: "/ˈaɣwa ðe ˈkoko/", cl: "/ˈaɣwa ðe ˈkoko/", ar: "/ˈaɣwa ðe ˈkoko/", fr: "/o də kɔko/", it: "/ˈakkwa di ˈkɔkko/" } 
    },
    { 
      source_term: "Suco de Laranja", image: "", gender_pt: "m", 
      translations: { cl: "Jugo de naranja", ar: "Jugo de naranja", gb: "Orange Juice", us: "Orange Juice", pt: "Sumo de laranja", es: "Zumo de naranja", fr: "Jus d'orange", it: "Succo d'arancia" }, 
      phonetics: { us: "/ˈɔːrɪndʒ dʒuːs/", gb: "/ˈɒr.ɪndʒ dʒuːs/", br: "/ˈsu.ku dʒi laˈɾɐ̃.ʒɐ/", pt: "/ˈsu.mu dɨ lɐˈɾɐ̃.ʒɐ/", es: "/ˈθumo ðe naˈɾaŋxa/", cl: "/ˈxuɣo ðe naˈɾaŋxa/", ar: "/ˈxuɣo ðe naˈɾaŋxa/", fr: "/ʒy dɔˈʁɑ̃ʒ/", it: "/ˈsukko daˈrantʃa/" } 
    },
    { 
      source_term: "Suco de Maçã", image: "", gender_pt: "m", 
      translations: { cl: "Jugo de manzana", ar: "Jugo de manzana", gb: "Apple Juice", us: "Apple Juice", pt: "Sumo de maçã", es: "Zumo de manzana", fr: "Jus de pomme", it: "Succo di mela" }, 
      phonetics: { us: "/ˈæpəl dʒuːs/", gb: "/ˈæp.əl dʒuːs/", br: "/ˈsu.ku dʒi maˈsɐ̃/", pt: "/ˈsu.mu dɨ mɐˈsɐ̃/", es: "/ˈθumo ðe manˈθana/", cl: "/ˈxuɣo ðe manˈsana/", ar: "/ˈxuɣo ðe manˈsana/", fr: "/ʒy də pɔm/", it: "/ˈsukko di ˈmela/" } 
    },
    { 
      source_term: "Suco de Uva", image: "", gender_pt: "m", 
      translations: { cl: "Jugo de uva", ar: "Jugo de uva", gb: "Grape Juice", us: "Grape Juice", pt: "Sumo de uva", es: "Zumo de uva", fr: "Jus de raisin", it: "Succo d'uva" }, 
      phonetics: { us: "/ɡreɪp dʒuːs/", gb: "/ɡreɪp dʒuːs/", br: "/ˈsu.ku dʒi ˈu.vɐ/", pt: "/ˈsu.mu dɨ ˈu.vɐ/", es: "/ˈθumo ðe ˈuβa/", cl: "/ˈxuɣo ðe ˈuβa/", ar: "/ˈxuɣo ðe ˈuβa/", fr: "/ʒy də ʁɛˈzɛ̃/", it: "/ˈsukko ˈduva/" } 
    },
    { 
      source_term: "Suco de Abacaxi", image: "", gender_pt: "m", 
      translations: { cl: "Jugo de piña", ar: "Jugo de ananá", gb: "Pineapple Juice", us: "Pineapple Juice", pt: "Sumo de ananás", es: "Zumo de piña", fr: "Jus d'ananas", it: "Succo d'ananas" }, 
      phonetics: { us: "/ˈpaɪnˌæpəl dʒuːs/", gb: "/ˈpaɪnˌæp.əl dʒuːs/", br: "/ˈsu.ku dʒi a.ba.kaˈʃi/", pt: "/ˈsu.mu dɨ ɐ.nɐˈnaʃ/", es: "/ˈθumo ðe ˈpiɲa/", cl: "/ˈxuɣo ðe ˈpiɲa/", ar: "/ˈxuɣo ðe anaˈna/", fr: "/ʒy danaˈna/", it: "/ˈsukko ˈdananas/" } 
    },
    { 
      source_term: "Suco de Manga", image: "", gender_pt: "m", 
      translations: { cl: "Jugo de mango", ar: "Jugo de mango", gb: "Mango Juice", us: "Mango Juice", pt: "Sumo de manga", es: "Zumo de mango", fr: "Jus de mangue", it: "Succo di mango" }, 
      phonetics: { us: "/ˈmæŋɡoʊ dʒuːs/", gb: "/ˈmæŋ.ɡəʊ dʒuːs/", br: "/ˈsu.ku dʒi ˈmɐ̃.ɡɐ/", pt: "/ˈsu.mu dɨ ˈmɐ̃.ɡɐ/", es: "/ˈθumo ðe ˈmaŋɡo/", cl: "/ˈxuɣo ðe ˈmaŋɡo/", ar: "/ˈxuɣo ðe ˈmaŋɡo/", fr: "/ʒy də mɑ̃ɡ/", it: "/ˈsukko di ˈmaŋɡo/" } 
    },
    { 
      source_term: "Suco de Pêssego", image: "", gender_pt: "m", 
      translations: { cl: "Jugo de durazno", ar: "Jugo de durazno", gb: "Peach Juice", us: "Peach Juice", pt: "Sumo de pêssego", es: "Zumo de melocotón", fr: "Jus de pêche", it: "Succo di pesca" }, 
      phonetics: { us: "/piːtʃ dʒuːs/", gb: "/piːtʃ dʒuːs/", br: "/ˈsu.ku dʒi ˈpe.se.ɡu/", pt: "/ˈsu.mu dɨ ˈpe.sɨ.ɡu/", es: "/ˈθumo ðe melokoˈton/", cl: "/ˈxuɣo ðe duˈɾasno/", ar: "/ˈxuɣo ðe duˈɾasno/", fr: "/ʒy də pɛʃ/", it: "/ˈsukko di ˈpeska/" } 
    },
    { 
      source_term: "Suco de Tomate", image: "", gender_pt: "m", 
      translations: { cl: "Jugo de tomate", ar: "Jugo de tomate", gb: "Tomato Juice", us: "Tomato Juice", pt: "Sumo de tomate", es: "Zumo de tomate", fr: "Jus de tomate", it: "Succo di pomodoro" }, 
      phonetics: { us: "/təˈmeɪtoʊ dʒuːs/", gb: "/təˈmɑː.təʊ dʒuːs/", br: "/ˈsu.ku dʒi toˈma.tʃi/", pt: "/ˈsu.mu dɨ tuˈma.tɨ/", es: "/ˈθumo ðe toˈmate/", cl: "/ˈxuɣo ðe toˈmate/", ar: "/ˈxuɣo ðe toˈmate/", fr: "/ʒy də tɔˈmat/", it: "/ˈsukko di pomoˈdɔro/" } 
    },
    { 
      source_term: "Limonada", image: "", gender_pt: "f", 
      translations: { cl: "Limonada", ar: "Limonada", gb: "Lemonade (Homemade)", us: "Lemonade", pt: "Limonada", es: "Limonada", fr: "Citronnade", it: "Limonata" }, 
      phonetics: { us: "/ˌlɛməˈneɪd/", gb: "/ˌlem.əˈneɪd/", br: "/li.moˈna.dɐ/", pt: "/li.muˈna.dɐ/", es: "/limoˈnaða/", cl: "/limoˈnaða/", ar: "/limoˈnaða/", fr: "/sitʁɔˈnad/", it: "/limoˈnata/" } 
    },
    { 
      source_term: "Chá Gelado", image: "", gender_pt: "m", 
      translations: { cl: "Té helado", ar: "Té helado", gb: "Iced Tea", us: "Iced Tea", pt: "Chá gelado", es: "Té helado", fr: "Thé glacé", it: "Tè freddo" }, 
      phonetics: { us: "/aɪst tiː/", gb: "/ˌaɪst ˈtiː/", br: "/ʃa ʒeˈla.du/", pt: "/ʃa ʒɨˈla.du/", es: "/te eˈlaðo/", cl: "/te eˈlaðo/", ar: "/te eˈlaðo/", fr: "/te ɡlaˈse/", it: "/tɛ ˈfreddo/" } 
    },
    { 
      source_term: "Bebida Energética", image: "", gender_pt: "f", 
      translations: { cl: "Bebida energética", ar: "Bebida energizante", gb: "Energy Drink", us: "Energy Drink", pt: "Bebida energética", es: "Bebida energética", fr: "Boisson énergisante", it: "Bevanda energetica" }, 
      phonetics: { us: "/ˈɛnərdʒi drɪŋk/", gb: "/ˈen.ə.dʒi drɪŋk/", br: "/beˈbi.dɐ e.neʁˈʒɛ.tʃi.kɐ/", pt: "/bɨˈbi.dɐ i.nɨɾˈʒɛ.ti.kɐ/", es: "/beˈβiða eneɾˈxetika/", cl: "/beˈβiða eneɾˈxetika/", ar: "/beˈβiða eneɾxiˈsante/", fr: "/bwaˈsɔ̃ enɛʁʒiˈzɑ̃t/", it: "/beˈvanda enerˈdʒetika/" } 
    },
    { 
      source_term: "Bebida Isotônica", image: "", gender_pt: "f", 
      translations: { cl: "Bebida isotónica", ar: "Bebida isotónica", gb: "Sports Drink", us: "Sports Drink", pt: "Bebida isotónica", es: "Bebida isotónica", fr: "Boisson pour le sport", it: "Bevanda isotonica" }, 
      phonetics: { us: "/spɔːrts drɪŋk/", gb: "/spɔːts drɪŋk/", br: "/beˈbi.dɐ i.zoˈtõ.ni.kɐ/", pt: "/bɨˈbi.dɐ i.zɔˈtɔ.ni.kɐ/", es: "/beˈβiða isoˈtonika/", cl: "/beˈβiða isoˈtonika/", ar: "/beˈβiða isoˈtonika/", fr: "/bwa.sɔ̃ puʁ lə spɔʁ/", it: "/beˈvanda izoˈtɔnika/" } 
    },
    { 
      source_term: "Suco em Pó", image: "", gender_pt: "m", 
      translations: { cl: "Jugo en polvo", ar: "Jugo en polvo", gb: "Powdered Juice", us: "Powdered Drink Mix", pt: "Sumo em pó", es: "Zumo en polvo", fr: "Jus en poudre", it: "Succo in polvere" }, 
      phonetics: { us: "/ˈpaʊdərd dʒuːs/", gb: "/ˈpaʊ.dəd dʒuːs/", br: "/ˈsu.ku ẽ pɔ/", pt: "/ˈsu.mu ẽ pɔ/", es: "/ˈθumo em ˈpolbo/", cl: "/ˈxuɣo em ˈpolbo/", ar: "/ˈxuɣo em ˈpolbo/", fr: "/ʒy ɑ̃ pudʁ/", it: "/ˈsukko im ˈpolvere/" } 
    },
    { 
      source_term: "Néctar de Fruta", image: "", gender_pt: "m", 
      translations: { cl: "Néctar", ar: "Néctar", gb: "Fruit Nectar", us: "Fruit Nectar", pt: "Néctar", es: "Néctar", fr: "Nectar de fruits", it: "Nettare di frutta" }, 
      phonetics: { us: "/fruːt ˈnɛktər/", gb: "/fruːt ˈnek.tə/", br: "/ˈnɛk.taʁ dʒi ˈfɾu.tɐ/", pt: "/ˈnɛk.tɐɾ dɨ ˈfɾu.tɐ/", es: "/ˈnektaɾ/", cl: "/ˈnektaɾ/", ar: "/ˈnektaɾ/", fr: "/nɛkˈtaʁ/", it: "/ˈnɛttare di ˈfrutta/" } 
    },
    { 
      source_term: "Suco de Maracujá", image: "", gender_pt: "m", 
      translations: { cl: "Jugo de maracuyá", ar: "Jugo de maracuyá", gb: "Passion Fruit Juice", us: "Passion Fruit Juice", pt: "Sumo de maracujá", es: "Zumo de maracuyá", fr: "Jus de fruit de la passion", it: "Succo al frutto della passione" }, 
      phonetics: { us: "/ˈpæʃən fruːt dʒuːs/", gb: "/ˈpæʃ.ən fruːt dʒuːs/", br: "/ˈsu.ku dʒi ma.ɾa.kuˈʒa/", pt: "/ˈsu.mu dɨ mɐ.ɾɐ.kuˈʒa/", es: "/ˈθumo ðe maɾakuˈʝa/", cl: "/ˈxuɣo ðe maɾakuˈʝa/", ar: "/ˈxuɣo ðe maɾakuˈʃa/", fr: "/ʒy də fʁɥi də la paˈsjɔ̃/", it: "/ˈsukko al ˈfrutto della pasˈsjone/" } 
    },
    { 
      source_term: "Suco de Caju", image: "", gender_pt: "m", 
      translations: { cl: "Jugo de marañón", ar: "Jugo de castaña de cajú", gb: "Cashew Juice", us: "Cashew Juice", pt: "Sumo de caju", es: "Zumo de anacardo", fr: "Jus de cajou", it: "Succo di anacardi" }, 
      phonetics: { us: "/ˈkæʃuː dʒuːs/", gb: "/ˈkæʃ.uː dʒuːs/", br: "/ˈsu.ku dʒi kaˈʒu/", pt: "/ˈsu.mu dɨ kɐˈʒu/", es: "/ˈθumo ðe anaˈkaɾdo/", cl: "/ˈxuɣo ðe maɾaˈɲon/", ar: "/ˈxuɣo ðe kasˈtaɲa ðe kaˈxu/", fr: "/ʒy də kaˈʒu/", it: "/ˈsukko di anaˈkardi/" } 
    },
    { 
      source_term: "Suco Detox", image: "", gender_pt: "m", 
      translations: { cl: "Jugo detox", ar: "Jugo detox", gb: "Detox Juice", us: "Detox Juice", pt: "Sumo detox", es: "Zumo detox", fr: "Jus détox", it: "Succo detox" }, 
      phonetics: { us: "/ˈdiːtɑːks dʒuːs/", gb: "/ˈdiː.tɒks dʒuːs/", br: "/ˈsu.ku deˈtɔks/", pt: "/ˈsu.mu dɨˈtɔks/", es: "/ˈθumo deˈtoks/", cl: "/ˈxuɣo deˈtoks/", ar: "/ˈxuɣo deˈtoks/", fr: "/ʒy deˈtɔks/", it: "/ˈsukko deˈtɔks/" } 
    },
    { 
      source_term: "Água com Sabor", image: "", gender_pt: "f", 
      translations: { cl: "Agua saborizada", ar: "Agua saborizada", gb: "Flavoured Water", us: "Flavored Water", pt: "Água com sabor", es: "Agua con sabor", fr: "Eau aromatisée", it: "Acqua aromatizzata" }, 
      phonetics: { us: "/ˈfleɪvərd ˈwɔːtər/", gb: "/ˈfleɪ.vəd ˈwɔː.tə/", br: "/ˈa.ɡwɐ kõ saˈboʁ/", pt: "/ˈa.ɡwɐ kõ sɐˈboɾ/", es: "/ˈaɣwa kon saˈβoɾ/", cl: "/ˈaɣwa saβoɾiˈsaða/", ar: "/ˈaɣwa saβoɾiˈsaða/", fr: "/o aʁɔmatiˈze/", it: "/ˈakkwa aromatidˈdzata/" } 
    },
    { 
      source_term: "Água Tônica", image: "", gender_pt: "f", 
      translations: { cl: "Agua tónica", ar: "Agua tónica", gb: "Tonic Water", us: "Tonic Water", pt: "Água tónica", es: "Tónica", fr: "Tonic", it: "Acqua tonica" }, 
      phonetics: { us: "/ˈtɑːnɪk ˈwɔːtər/", gb: "/ˈtɒn.ɪk ˈwɔː.tə/", br: "/ˈa.ɡwɐ ˈtõ.ni.kɐ/", pt: "/ˈa.ɡwɐ ˈtɔ.ni.kɐ/", es: "/ˈtonika/", cl: "/ˈaɣwa ˈtonika/", ar: "/ˈaɣwa ˈtonika/", fr: "/tɔˈnik/", it: "/ˈakkwa ˈtɔnika/" } 
    },
    { 
      source_term: "Smoothie", image: "", gender_pt: "m", 
      translations: { cl: "Batido de frutas", ar: "Licuado", gb: "Smoothie", us: "Smoothie", pt: "Smoothie", es: "Batido", fr: "Smoothie", it: "Frullato" }, 
      phonetics: { us: "/ˈsmuːði/", gb: "/ˈsmuː.ði/", br: "/izˈmu.tʃi/", pt: "/ˈzmu.ði/", es: "/baˈtiðo/", cl: "/baˈtiðo/", ar: "/liˈkwaðo/", fr: "/smuːzi/", it: "/frulˈlato/" } 
    },
    { 
      source_term: "Café Gelado", image: "", gender_pt: "m", 
      translations: { cl: "Café helado", ar: "Café frío", gb: "Iced Coffee", us: "Iced Coffee", pt: "Café gelado", es: "Café con hielo", fr: "Café glacé", it: "Caffè freddo" }, 
      phonetics: { us: "/aɪst ˈkɔːfi/", gb: "/ˌaɪst ˈkɒf.i/", br: "/kaˈfɛ ʒeˈla.du/", pt: "/kɐˈfɛ ʒɨˈla.du/", es: "/kaˈfe kon ˈjelo/", cl: "/kaˈfe eˈlaðo/", ar: "/kaˈfe ˈfɾio/", fr: "/kafe ɡlaˈse/", it: "/kafˈfɛ ˈfreddo/" } 
    },
    { 
      source_term: "Suco de Goiaba", image: "", gender_pt: "m", 
      translations: { cl: "Jugo de guayaba", ar: "Jugo de guayaba", gb: "Guava Juice", us: "Guava Juice", pt: "Sumo de goiaba", es: "Zumo de guayaba", fr: "Jus de goyave", it: "Succo di guava" }, 
      phonetics: { us: "/ˈɡwɑːvə dʒuːs/", gb: "/ˈɡwɑː.və dʒuːs/", br: "/ˈsu.ku dʒi ɡojˈja.bɐ/", pt: "/ˈsu.mu dɨ ɡojˈja.bɐ/", es: "/ˈθumo ðe ɡwaˈʝaβa/", cl: "/ˈxuɣo ðe ɡwaˈʝaβa/", ar: "/ˈxuɣo ðe ɡwaˈʃaβa/", fr: "/ʒy də ɡɔˈjav/", it: "/ˈsukko di ˈɡwava/" } 
    },
  ],
  sodas: [
    { 
      source_term: "Coca-Cola", image: "", gender_pt: "f", 
      translations: { cl: "Coca-Cola", ar: "Coca-Cola", gb: "Coke", us: "Coke", pt: "Coca-Cola", es: "Coca-Cola", fr: "Coca-Cola", it: "Coca-Cola" }, 
      phonetics: { us: "/koʊk/", gb: "/kəʊk/", br: "/ˈkɔ.kɐ ˈkɔ.lɐ/", pt: "/ˈkɔ.kɐ ˈkɔ.lɐ/", es: "/kokaˈkola/", cl: "/kokaˈkola/", ar: "/kokaˈkola/", fr: "/kɔka kɔla/", it: "/kɔka ˈkɔla/" } 
    },
    { 
      source_term: "Refrigerante de Laranja", image: "", gender_pt: "m", 
      translations: { cl: "Bebida de naranja", ar: "Gaseosa de naranja", gb: "Orangeade/Fanta", us: "Orange Soda", pt: "Refrigerante de laranja", es: "Refresco de naranja", fr: "Soda à l'orange", it: "Aranciata" }, 
      phonetics: { us: "/ˈɔːrɪndʒ ˈsoʊdə/", gb: "/ˈɒr.ɪndʒ ˈsəʊ.də/", br: "/he.fɾi.ʒeˈɾɐ̃.tʃi dʒi laˈɾɐ̃.ʒɐ/", pt: "/ʁɨ.fɾi.ʒɨˈɾɐ̃.tɨ dɨ lɐˈɾɐ̃.ʒɐ/", es: "/reˈfɾesko ðe naˈɾaŋxa/", cl: "/beˈβiða ðe naˈɾaŋxa/", ar: "/ɡaseˈosa ðe naˈɾaŋxa/", fr: "/sɔda a lɔˈʁɑ̃ʒ/", it: "/arantˈʃata/" } 
    },
    { 
      source_term: "Refrigerante de Limão", image: "", gender_pt: "m", 
      translations: { cl: "Bebida de limón", ar: "Gaseosa de lima-limón", gb: "Lemonade/Sprite", us: "Lemon-Lime Soda", pt: "Refrigerante de limão", es: "Refresco de limón", fr: "Limonade", it: "Gassosa" }, 
      phonetics: { us: "/ˈlɛmən laɪm ˈsoʊdə/", gb: "/ˈlem.ən laɪm ˈsəʊ.də/", br: "/he.fɾi.ʒeˈɾɐ̃.tʃi dʒi liˈmɐ̃w/", pt: "/ʁɨ.fɾi.ʒɨˈɾɐ̃.tɨ dɨ liˈmɐ̃w/", es: "/reˈfɾesko ðe liˈmon/", cl: "/beˈβiða ðe liˈmon/", ar: "/ɡaseˈosa ðe ˈlima liˈmon/", fr: "/limɔˈnad/", it: "/ɡasˈsoza/" } 
    },
    { 
      source_term: "Refrigerante de Guaraná", image: "", gender_pt: "m", 
      translations: { cl: "Bebida de guaraná", ar: "Gaseosa de guaraná", gb: "Guarana Soda", us: "Guarana Soda", pt: "Guaraná", es: "Refresco de guaraná", fr: "Soda au guarana", it: "Bevanda al guaranà" }, 
      phonetics: { us: "/ɡwɑːrəˈnɑː ˈsoʊdə/", gb: "/ɡwɑː.rəˈnɑː ˈsəʊ.də/", br: "/ɡwa.ɾaˈna/", pt: "/ɡwɐ.ɾɐˈna/", es: "/reˈfɾesko ðe ɡwaɾaˈna/", cl: "/beˈβiða ðe ɡwaɾaˈna/", ar: "/ɡaseˈosa ðe ɡwaɾaˈna/", fr: "/sɔda o ɡwaʁaˈna/", it: "/beˈvanda al ɡwaraˈna/" } 
    },
    { 
      source_term: "Refrigerante de Uva", image: "", gender_pt: "m", 
      translations: { cl: "Bebida de uva", ar: "Gaseosa de uva", gb: "Grape Soda", us: "Grape Soda", pt: "Refrigerante de uva", es: "Refresco de uva", fr: "Soda au raisin", it: "Bevanda all'uva" }, 
      phonetics: { us: "/ɡreɪp ˈsoʊdə/", gb: "/ɡreɪp ˈsəʊ.də/", br: "/he.fɾi.ʒeˈɾɐ̃.tʃi dʒi ˈu.vɐ/", pt: "/ʁɨ.fɾi.ʒɨˈɾɐ̃.tɨ dɨ ˈu.vɐ/", es: "/reˈfɾesko ðe ˈuβa/", cl: "/beˈβiða ðe ˈuβa/", ar: "/ɡaseˈosa ðe ˈuβa/", fr: "/sɔda o ʁɛˈzɛ̃/", it: "/beˈvanda alˈluva/" } 
    },
    { 
      source_term: "Refrigerante Cola Zero", image: "", gender_pt: "m", 
      translations: { cl: "Cola Zero", ar: "Cola Zero", gb: "Diet Coke/Coke Zero", us: "Diet Coke/Coke Zero", pt: "Cola Zero", es: "Cola Zero", fr: "Coca Zéro", it: "Cola Zero" }, 
      phonetics: { us: "/koʊk ˈzɪroʊ/", gb: "/kəʊk ˈzɪə.rəʊ/", br: "/ˈkɔ.kɐ ˈzɛ.ɾu/", pt: "/ˈkɔ.kɐ ˈzɛ.ɾu/", es: "/kola ˈθeɾo/", cl: "/kola ˈseɾo/", ar: "/kola ˈseɾo/", fr: "/kɔka zeˈʁo/", it: "/kɔla ˈdzɛro/" } 
    },
    { 
      source_term: "Soda (Club Soda)", image: "", gender_pt: "f", 
      translations: { cl: "Soda", ar: "Soda", gb: "Soda Water/Club Soda", us: "Club Soda", pt: "Soda", es: "Gaseosa/Soda", fr: "Eau de seltz", it: "Seltz" }, 
      phonetics: { us: "/klʌb ˈsoʊdə/", gb: "/klʌb ˈsəʊ.də/", br: "/ˈsɔ.dɐ/", pt: "/ˈsɔ.dɐ/", es: "/ˈsoda/", cl: "/ˈsoda/", ar: "/ˈsoda/", fr: "/o də sɛlts/", it: "/sɛlts/" } 
    },
    { 
      source_term: "Ginger Ale", image: "", gender_pt: "m", 
      translations: { cl: "Ginger Ale", ar: "Ginger Ale", gb: "Ginger Beer/Ale", us: "Ginger Ale", pt: "Ginger Ale", es: "Ginger Ale", fr: "Ginger Ale", it: "Ginger Ale" }, 
      phonetics: { us: "/ˈdʒɪndʒər eɪl/", gb: "/ˈdʒɪn.dʒə eɪl/", br: "/ˈdʒĩ.dʒeʁ ejl/", pt: "/ˈʒĩ.ʒɛɾ ejl/", es: "/ˈdʒindʒeɾ eil/", cl: "/ˈjinjeɾ eil/", ar: "/ˈjinjeɾ eil/", fr: "/dʒin.dʒɛʁ ɛl/", it: "/ˈdʒin.dʒer eil/" } 
    },
    { 
      source_term: "Refrigerante Diet", image: "", gender_pt: "m", 
      translations: { cl: "Bebida light", ar: "Gaseosa light", gb: "Diet Drink", us: "Diet Soda", pt: "Refrigerante light", es: "Refresco light", fr: "Soda light", it: "Bevanda light" }, 
      phonetics: { us: "/ˈdaɪət ˈsoʊdə/", gb: "/ˈdaɪ.ət ˈsəʊ.də/", br: "/he.fɾi.ʒeˈɾɐ̃.tʃi dajt/", pt: "/ʁɨ.fɾi.ʒɨˈɾɐ̃.tɨ lajt/", es: "/reˈfɾesko lajt/", cl: "/beˈβiða lajt/", ar: "/ɡaseˈosa lajt/", fr: "/sɔda lajt/", it: "/beˈvanda lajt/" } 
    },
    { 
      source_term: "Refrigerante de Cola", image: "", gender_pt: "m", 
      translations: { cl: "Bebida cola", ar: "Gaseosa cola", gb: "Cola", us: "Cola", pt: "Cola", es: "Refresco de cola", fr: "Cola", it: "Cola" }, 
      phonetics: { us: "/ˈkoʊlə/", gb: "/ˈkəʊ.lə/", br: "/ˈkɔ.lɐ/", pt: "/ˈkɔ.lɐ/", es: "/reˈfɾesko ðe ˈkola/", cl: "/beˈβiða ˈkola/", ar: "/ɡaseˈosa ˈkola/", fr: "/kɔla/", it: "/kɔla/" } 
    },
    { 
      source_term: "Refrigerante de Limão (Baixa caloria)", image: "", gender_pt: "m", 
      translations: { cl: "Bebida de limón light", ar: "Gaseosa de lima light", gb: "Diet Lemonade", us: "Diet Lemon-Lime Soda", pt: "Refrigerante de limão zero", es: "Refresco de limón light", fr: "Limonade light", it: "Gassosa light" }, 
      phonetics: { us: "/daɪət ˈlɛməneɪd/", gb: "/ˈdaɪ.ət ˌlem.əˈneɪd/", br: "/he.fɾi.ʒeˈɾɐ̃.tʃi dʒi liˈmɐ̃w ˈzɛ.ɾu/", pt: "/ʁɨ.fɾi.ʒɨˈɾɐ̃.tɨ dɨ liˈmɐ̃w ˈzɛ.ɾu/", es: "/reˈfɾesko ðe liˈmon lajt/", cl: "/beˈβiða ðe liˈmon lajt/", ar: "/ɡaseˈosa ðe ˈlima lajt/", fr: "/limɔˈnad lajt/", it: "/ɡasˈsoza lajt/" } 
    },
    { 
      source_term: "Refrigerante de Pompelmo/Toranja", image: "", gender_pt: "m", 
      translations: { cl: "Bebida de pomelo", ar: "Gaseosa de pomelo", gb: "Grapefruit Soda", us: "Grapefruit Soda", pt: "Refrigerante de toranja", es: "Refresco de pomelo", fr: "Soda au pamplemousse", it: "Bevanda al pompelmo" }, 
      phonetics: { us: "/ˈɡreɪpfruːt ˈsoʊdə/", gb: "/ˈɡreɪp.fruːt ˈsəʊ.də/", br: "/he.fɾi.ʒeˈɾɐ̃.tʃi dʒi toˈɾɐ̃.ʒɐ/", pt: "/ʁɨ.fɾi.ʒɨˈɾɐ̃.tɨ dɨ tuˈɾɐ̃.ʒɐ/", es: "/reˈfɾesko ðe poˈmelo/", cl: "/beˈβiða ðe poˈmelo/", ar: "/ɡaseˈosa ðe poˈmelo/", fr: "/sɔda o pɑ̃pləˈmus/", it: "/beˈvanda al pomˈpɛlmo/" } 
    },
    { 
      source_term: "Refrigerante de Morango", image: "", gender_pt: "m", 
      translations: { cl: "Bebida de frutilla", ar: "Gaseosa de frutilla", gb: "Strawberry Soda", us: "Strawberry Soda", pt: "Refrigerante de morango", es: "Refresco de fresa", fr: "Soda à la fraise", it: "Bevanda alla fragola" }, 
      phonetics: { us: "/ˈstrɔːbɛri ˈsoʊdə/", gb: "/ˈstrɔː.bər.i ˈsəʊ.də/", br: "/he.fɾi.ʒeˈɾɐ̃.tʃi dʒi moˈɾɐ̃.ɡu/", pt: "/ʁɨ.fɾi.ʒɨˈɾɐ̃.tɨ dɨ muˈɾɐ̃.ɡu/", es: "/reˈfɾesko ðe ˈfɾesa/", cl: "/beˈβiða ðe fɾuˈtiʎa/", ar: "/ɡaseˈosa ðe fɾuˈtiʃa/", fr: "/sɔda a la fʁɛz/", it: "/beˈvanda alla ˈfraɡola/" } 
    },
    { 
      source_term: "Refrigerante de Maçã", image: "", gender_pt: "m", 
      translations: { cl: "Bebida de manzana", ar: "Gaseosa de manzana", gb: "Apple Soda", us: "Apple Soda", pt: "Refrigerante de maçã", es: "Refresco de manzana", fr: "Soda à la pomme", it: "Bevanda alla mela" }, 
      phonetics: { us: "/ˈæpəl ˈsoʊdə/", gb: "/ˈæp.əl ˈsəʊ.də/", br: "/he.fɾi.ʒeˈɾɐ̃.tʃi dʒi maˈsɐ̃/", pt: "/ʁɨ.fɾi.ʒɨˈɾɐ̃.tɨ dɨ mɐˈsɐ̃/", es: "/reˈfɾesko ðe manˈθana/", cl: "/beˈβiða ðe manˈsana/", ar: "/ɡaseˈosa ðe manˈsana/", fr: "/sɔda a la pɔm/", it: "/beˈvanda alla ˈmela/" } 
    },
    { 
      source_term: "Refrigerante de Framboesa", image: "", gender_pt: "m", 
      translations: { cl: "Bebida de frambuesa", ar: "Gaseosa de frambuesa", gb: "Raspberry Soda", us: "Raspberry Soda", pt: "Refrigerante de framboesa", es: "Refresco de frambuesa", fr: "Soda à la framboise", it: "Bevanda al lampone" }, 
      phonetics: { us: "/ˈræzbɛri ˈsoʊdə/", gb: "/ˈrɑːz.bər.i ˈsəʊ.də/", br: "/he.fɾi.ʒeˈɾɐ̃.tʃi dʒi fɾɐ̃.buˈe.zɐ/", pt: "/ʁɨ.fɾi.ʒɨˈɾɐ̃.tɨ dɨ fɾɐ̃.buˈe.zɐ/", es: "/reˈfɾesko ðe fɾamˈbwesa/", cl: "/beˈβiða ðe fɾamˈbwesa/", ar: "/ɡaseˈosa ðe fɾamˈbwesa/", fr: "/sɔda a la fʁɑ̃ˈbwaz/", it: "/beˈvanda al lamˈpone/" } 
    },
    { 
      source_term: "Refrigerante de Cereja", image: "", gender_pt: "m", 
      translations: { cl: "Bebida de cereza", ar: "Gaseosa de cereza", gb: "Cherry Soda", us: "Cherry Soda", pt: "Refrigerante de cereja", es: "Refresco de cereza", fr: "Soda à la cerise", it: "Bevanda alla ciliegia" }, 
      phonetics: { us: "/ˈtʃɛri ˈsoʊdə/", gb: "/ˈtʃer.i ˈsəʊ.də/", br: "/he.fɾi.ʒeˈɾɐ̃.tʃi dʒi seˈɾe.ʒɐ/", pt: "/ʁɨ.fɾi.ʒɨˈɾɐ̃.tɨ dɨ sɨˈɾɐj.ʒɐ/", es: "/reˈfɾesko ðe θeˈɾeθa/", cl: "/beˈβiða ðe seˈɾesa/", ar: "/ɡaseˈosa ðe seˈɾesa/", fr: "/sɔda a la səˈʁiz/", it: "/beˈvanda alla tʃiˈljeːdʒa/" } 
    },
    { 
      source_term: "Root Beer", image: "", gender_pt: "f", 
      translations: { cl: "Cerveza de raíz", ar: "Cerveza de raíz", gb: "Root Beer", us: "Root Beer", pt: "Cerveja de raiz", es: "Cerveza de raíz", fr: "Racine-bière", it: "Root Beer" }, 
      phonetics: { us: "/ruːt bɪr/", gb: "/ruːt bɪə/", br: "/hut biʁ/", pt: "/hut biʁ/", es: "/θeɾˈβeθa ðe raˈiθ/", cl: "/seɾˈβesa ðe raˈis/", ar: "/seɾˈβesa ðe raˈis/", fr: "/ʁa.sin bjɛʁ/", it: "/ruːt bɪər/" } 
    },
    { 
      source_term: "Cream Soda", image: "", gender_pt: "f", 
      translations: { cl: "Soda crema", ar: "Soda crema", gb: "Cream Soda", us: "Cream Soda", pt: "Cream Soda", es: "Cream Soda", fr: "Cream Soda", it: "Cream Soda" }, 
      phonetics: { us: "/kriːm ˈsoʊdə/", gb: "/kriːm ˈsəʊ.də/", br: "/kɾĩ ˈsɔ.dɐ/", pt: "/kɾim ˈsɔ.dɐ/", es: "/kɾim ˈsoða/", cl: "/ˈsoda ˈkɾema/", ar: "/ˈsoda ˈkɾema/", fr: "/kʁim sɔda/", it: "/kriːm ˈsɔda/" } 
    },
    { 
      source_term: "Refrigerante de Abacaxi", image: "", gender_pt: "m", 
      translations: { cl: "Bebida de piña", ar: "Gaseosa de ananá", gb: "Pineapple Soda", us: "Pineapple Soda", pt: "Refrigerante de ananás", es: "Refresco de piña", fr: "Soda à l'ananas", it: "Bevanda all'ananas" }, 
      phonetics: { us: "/ˈpaɪnˌæpəl ˈsoʊdə/", gb: "/ˈpaɪnˌæp.əl ˈsəʊ.də/", br: "/he.fɾi.ʒeˈɾɐ̃.tʃi dʒi a.ba.kaˈʃi/", pt: "/ʁɨ.fɾi.ʒɨˈɾɐ̃.tɨ dɨ ɐ.nɐˈnaʃ/", es: "/reˈfɾesko ðe ˈpiɲa/", cl: "/beˈβiða ðe ˈpiɲa/", ar: "/ɡaseˈosa ðe anaˈna/", fr: "/sɔda a laˈnanas/", it: "/beˈvanda alˈlananas/" } 
    },
  ],
  alcoholicDrinks: [
    { 
      source_term: "Cerveja", image: "", gender_pt: "f", 
      translations: { cl: "Cerveza", ar: "Cerveza", gb: "Beer/Lager", us: "Beer", pt: "Cerveja", es: "Cerveza", fr: "Bière", it: "Birra" }, 
      phonetics: { us: "/bɪr/", gb: "/bɪə/", br: "/seʁˈve.ʒɐ/", pt: "/sɨɾˈvɐj.ʒɐ/", es: "/θeɾˈβeθa/", cl: "/seɾˈβesa/", ar: "/seɾˈβesa/", fr: "/bjɛʁ/", it: "/ˈbirra/" } 
    },
    { 
      source_term: "Cerveja Preta/Escura", image: "", gender_pt: "f", 
      translations: { cl: "Cerveza negra", ar: "Cerveza negra", gb: "Stout/Dark Beer", us: "Dark Beer", pt: "Cerveja preta", es: "Cerveza negra", fr: "Bière brune", it: "Birra scura" }, 
      phonetics: { us: "/dɑːrk bɪr/", gb: "/dɑːk bɪə/", br: "/seʁˈve.ʒɐ ˈpɾe.tɐ/", pt: "/sɨɾˈvɐj.ʒɐ ˈpɾe.tɐ/", es: "/θeɾˈβeθa ˈneɣɾa/", cl: "/seɾˈβesa ˈneɣɾa/", ar: "/seɾˈβesa ˈneɣɾa/", fr: "/bjɛʁ bʁyn/", it: "/ˈbirra ˈskura/" } 
    },
    { 
      source_term: "Cerveja sem Álcool", image: "", gender_pt: "f", 
      translations: { cl: "Cerveza sin alcohol", ar: "Cerveza sin alcohol", gb: "Alcohol-free Beer", us: "Non-alcoholic Beer", pt: "Cerveja sem álcool", es: "Cerveza sin alcohol", fr: "Bière sans alcool", it: "Birra analcolica" }, 
      phonetics: { us: "/nɑːn ælkəˈhɔːlɪk bɪr/", gb: "/ˈæl.kə.hɒl friː bɪə/", br: "/seʁˈve.ʒɐ sẽj ˈaw.kow/", pt: "/sɨɾˈvɐj.ʒɐ sɐ̃j ˈaɫ.koɫ/", es: "/θeɾˈβeθa sin alˈko(o)l/", cl: "/seɾˈβesa sin alˈko(o)l/", ar: "/seɾˈβesa sin alˈko(o)l/", fr: "/bjɛʁ sɑ̃.zalˈkɔl/", it: "/ˈbirra analˈkɔlika/" } 
    },
    { 
      source_term: "Vinho Tinto", image: "", gender_pt: "m", 
      translations: { cl: "Vino tinto", ar: "Vino tinto", gb: "Red Wine", us: "Red Wine", pt: "Vinho tinto", es: "Vino tinto", fr: "Vin rouge", it: "Vino rosso" }, 
      phonetics: { us: "/rɛd waɪn/", gb: "/red waɪn/", br: "/ˈvĩ.ɲu ˈtʃĩ.tu/", pt: "/ˈvi.ɲu ˈtĩ.tu/", es: "/ˈbino ˈtinto/", cl: "/ˈbino ˈtinto/", ar: "/ˈbino ˈtinto/", fr: "/vɛ̃ ʁuʒ/", it: "/ˈvino ˈrosso/" } 
    },
    { 
      source_term: "Vinho Branco", image: "", gender_pt: "m", 
      translations: { cl: "Vino blanco", ar: "Vino blanco", gb: "White Wine", us: "White Wine", pt: "Vinho branco", es: "Vino blanco", fr: "Vin blanc", it: "Vino bianco" }, 
      phonetics: { us: "/waɪt waɪn/", gb: "/waɪt waɪn/", br: "/ˈvĩ.ɲu ˈbɾɐ̃.ku/", pt: "/ˈvi.ɲu ˈbɾɐ̃.ku/", es: "/ˈbino ˈblaŋko/", cl: "/ˈbino ˈblaŋko/", ar: "/ˈbino ˈblaŋko/", fr: "/vɛ̃ blɑ̃/", it: "/ˈvino ˈbjanko/" } 
    },
    { 
      source_term: "Vinho Rosé", image: "", gender_pt: "m", 
      translations: { cl: "Vino rosé", ar: "Vino rosado", gb: "Rosé Wine", us: "Rosé Wine", pt: "Vinho rosé", es: "Vino rosado", fr: "Vin rosé", it: "Vino rosato" }, 
      phonetics: { us: "/roʊˈzeɪ waɪn/", gb: "/ˈrəʊ.zeɪ waɪn/", br: "/ˈvĩ.ɲu ʁoˈze/", pt: "/ˈvi.ɲu ʁoˈze/", es: "/ˈbino roˈsaðo/", cl: "/ˈbino roˈse/", ar: "/ˈbino roˈsaðo/", fr: "/vɛ̃ ʁoze/", it: "/ˈvino roˈzato/" } 
    },
    { 
      source_term: "Espumante", image: "", gender_pt: "m", 
      translations: { cl: "Espumante", ar: "Champagne/Espumante", gb: "Sparkling Wine", us: "Sparkling Wine/Champagne", pt: "Espumante", es: "Cava", fr: "Vin mousseux", it: "Spumante" }, 
      phonetics: { us: "/ˈspɑːrklɪŋ waɪn/", gb: "/ˈspɑː.klɪŋ waɪn/", br: "/es.puˈmɐ̃.tʃi/", pt: "/ɨʃ.puˈmɐ̃.tɨ/", es: "/ˈkaβa/", cl: "/espuˈmante/", ar: "/espuˈmante/", fr: "/vɛ̃ muˈsø/", it: "/spuˈmante/" } 
    },
    { 
      source_term: "Vodka", image: "", gender_pt: "f", 
      translations: { cl: "Vodka", ar: "Vodka", gb: "Vodka", us: "Vodka", pt: "Vodka", es: "Vodka", fr: "Vodka", it: "Vodka" }, 
      phonetics: { us: "/ˈvɑːdkə/", gb: "/ˈvɒd.kə/", br: "/ˈvɔd.kɐ/", pt: "/ˈvɔd.kɐ/", es: "/ˈbodka/", cl: "/ˈbodka/", ar: "/ˈbodka/", fr: "/vɔdka/", it: "/ˈvɔdka/" } 
    },
    { 
      source_term: "Whisky", image: "", gender_pt: "m", 
      translations: { cl: "Whisky", ar: "Whisky", gb: "Whisky", us: "Whiskey", pt: "Whisky", es: "Whisky", fr: "Whisky", it: "Whisky" }, 
      phonetics: { us: "/ˈwɪski/", gb: "/ˈwɪs.ki/", br: "/ˈwis.ki/", pt: "/ˈwiʃ.ki/", es: "/ˈwiski/", cl: "/ˈwiski/", ar: "/ˈwiski/", fr: "/wiski/", it: "/ˈwiski/" } 
    },
    { 
      source_term: "Rum", image: "", gender_pt: "m", 
      translations: { cl: "Ron", ar: "Ron", gb: "Rum", us: "Rum", pt: "Rum", es: "Ron", fr: "Rhum", it: "Rum" }, 
      phonetics: { us: "/rʌm/", gb: "/rʌm/", br: "/ʁũ/", pt: "/ʁũ/", es: "/ron/", cl: "/ron/", ar: "/ron/", fr: "/ʁɔm/", it: "/rum/" } 
    },
    { 
      source_term: "Gin", image: "", gender_pt: "m", 
      translations: { cl: "Gin", ar: "Gin", gb: "Gin", us: "Gin", pt: "Gin", es: "Ginebra", fr: "Gin", it: "Gin" }, 
      phonetics: { us: "/dʒɪn/", gb: "/dʒɪn/", br: "/dʒĩ/", pt: "/dʒĩ/", es: "/xiˈneβɾa/", cl: "/ʝin/", ar: "/ʃin/", fr: "/dʒin/", it: "/dʒin/" } 
    },
    { 
      source_term: "Tequila", image: "", gender_pt: "f", 
      translations: { cl: "Tequila", ar: "Tequila", gb: "Tequila", us: "Tequila", pt: "Tequila", es: "Tequila", fr: "Tequila", it: "Tequila" }, 
      phonetics: { us: "/təˈkiːlə/", gb: "/təˈkiː.lə/", br: "/teˈki.lɐ/", pt: "/tɨˈki.lɐ/", es: "/teˈkila/", cl: "/teˈkila/", ar: "/teˈkila/", fr: "/tekila/", it: "/teˈkila/" } 
    },
    { 
      source_term: "Pisco", image: "", gender_pt: "m", 
      translations: { cl: "Pisco", ar: "Pisco", gb: "Pisco", us: "Pisco", pt: "Pisco", es: "Pisco", fr: "Pisco", it: "Pisco" }, 
      phonetics: { us: "/ˈpɪskoʊ/", gb: "/ˈpɪs.kəʊ/", br: "/ˈpis.ku/", pt: "/ˈpiʃ.ku/", es: "/ˈpisko/", cl: "/ˈpisko/", ar: "/ˈpisko/", fr: "/pisko/", it: "/ˈpisko/" } 
    },
    { 
      source_term: "Cachaça", image: "", gender_pt: "f", 
      translations: { cl: "Cachaça", ar: "Cachaça", gb: "Cachaça", us: "Cachaça", pt: "Cachaça", es: "Cachaça", fr: "Cachaça", it: "Cachaça" }, 
      phonetics: { us: "/kəˈʃɑːsə/", gb: "/kəˈʃɑː.sə/", br: "/kaˈʃa.sɐ/", pt: "/kɐˈʃa.sɐ/", es: "/kaˈtʃaθa/", cl: "/kaˈtʃasa/", ar: "/kaˈtʃasa/", fr: "/kaʃasa/", it: "/kaˈtʃa.sa/" } 
    },
    { 
      source_term: "Sidra", image: "", gender_pt: "f", 
      translations: { cl: "Sidra", ar: "Sidra", gb: "Cider", us: "Hard Cider", pt: "Sidra", es: "Sidra", fr: "Cidre", it: "Sidro" }, 
      phonetics: { us: "/ˈsaɪdər/", gb: "/ˈsaɪ.də/", br: "/ˈsi.dɾɐ/", pt: "/ˈsi.dɾɐ/", es: "/ˈsidɾa/", cl: "/ˈsidɾa/", ar: "/ˈsidɾa/", fr: "/sidʁ/", it: "/ˈsidro/" } 
    },
    { 
      source_term: "Licor", image: "", gender_pt: "m", 
      translations: { cl: "Licor", ar: "Licor", gb: "Liqueur", us: "Liqueur", pt: "Licor", es: "Licor", fr: "Liqueur", it: "Liquore" }, 
      phonetics: { us: "/lɪˈkɜːr/", gb: "/lɪˈkjʊə/", br: "/liˈkoʁ/", pt: "/liˈkoɾ/", es: "/liˈkoɾ/", cl: "/liˈkoɾ/", ar: "/liˈkoɾ/", fr: "/liˈkœʁ/", it: "/liˈkwore/" } 
    },
    { 
      source_term: "Vinho do Porto", image: "", gender_pt: "m", 
      translations: { cl: "Oporto", ar: "Oporto", gb: "Port Wine", us: "Port Wine", pt: "Vinho do Porto", es: "Oporto", fr: "Porto", it: "Porto" }, 
      phonetics: { us: "/pɔːrt waɪn/", gb: "/pɔːt waɪn/", br: "/ˈvĩ.ɲu du ˈpoʁ.tu/", pt: "/ˈvi.ɲu du ˈpoɾ.tu/", es: "/oˈpoɾto/", cl: "/oˈpoɾto/", ar: "/oˈpoɾto/", fr: "/pɔʁto/", it: "/ˈpɔrto/" } 
    },
    { 
      source_term: "Vinho Verde", image: "", gender_pt: "m", 
      translations: { cl: "Vino verde", ar: "Vino verde", gb: "Vinho Verde", us: "Vinho Verde", pt: "Vinho Verde", es: "Vino verde", fr: "Vinho Verde", it: "Vinho Verde" }, 
      phonetics: { us: "/viːnjoʊ vɛrd/", gb: "/viːnjoʊ vɛrd/", br: "/ˈvĩ.ɲu ˈveʁ.dʒi/", pt: "/ˈvi.ɲu ˈveɾ.dɨ/", es: "/ˈbino ˈβeɾðe/", cl: "/ˈbino ˈβeɾðe/", ar: "/ˈbino ˈβeɾðe/", fr: "/viɲo vɛʁd/", it: "/ˈvino ˈverde/" } 
    },
    { 
      source_term: "Conhaque", image: "", gender_pt: "m", 
      translations: { cl: "Coñac", ar: "Coñac", gb: "Brandy", us: "Brandy/Cognac", pt: "Conhaque", es: "Coñac", fr: "Cognac", it: "Cognac" }, 
      phonetics: { us: "/ˈkɒnjæk/", gb: "/ˈkɒn.jæk/", br: "/koˈɲa.ki/", pt: "/kuˈɲa.kɨ/", es: "/koˈɲak/", cl: "/koˈɲak/", ar: "/koˈɲak/", fr: "/kɔˈɲak/", it: "/ˈkɔɲɲak/" } 
    },
    { 
      source_term: "Vermute", image: "", gender_pt: "m", 
      translations: { cl: "Vermut", ar: "Vermut", gb: "Vermouth", us: "Vermouth", pt: "Vermute", es: "Vermú", fr: "Vermouth", it: "Vermouth" }, 
      phonetics: { us: "/vərˈmuːθ/", gb: "/ˈvɜː.məθ/", br: "/veʁˈmu.tʃi/", pt: "/vɨɾˈmu.tɨ/", es: "/beɾˈmu/", cl: "/beɾˈmut/", ar: "/beɾˈmut/", fr: "/vɛʁmut/", it: "/ˈvɛrmut/" } 
    },
    { 
      source_term: "Saquê", image: "", gender_pt: "m", 
      translations: { cl: "Sake", ar: "Sake", gb: "Sake", us: "Sake", pt: "Saquê", es: "Sake", fr: "Saké", it: "Sake" }, 
      phonetics: { us: "/ˈsɑːki/", gb: "/ˈsɑː.ki/", br: "/saˈke/", pt: "/sɐˈke/", es: "/ˈsake/", cl: "/ˈsake/", ar: "/ˈsake/", fr: "/sake/", it: "/ˈsake/" } 
    },
    { 
      source_term: "Caipirinha (Ingredientes)", image: "", gender_pt: "f", 
      translations: { cl: "Caipirinha", ar: "Caipirinha", gb: "Caipirinha", us: "Caipirinha", pt: "Caipirinha", es: "Caipirinha", fr: "Caipirinha", it: "Caipirinha" }, 
      phonetics: { us: "/kaɪpɪˈriːnjə/", gb: "/kaɪpɪˈriːnjə/", br: "/kaj.piˈɾĩ.ɲɐ/", pt: "/kɐj.piˈɾi.ɲɐ/", es: "/kaipiˈɾiɲa/", cl: "/kaipiˈɾiɲa/", ar: "/kaipiˈɾiɲa/", fr: "/kaipiˈɾiɲa/", it: "/kaipiˈrin.ja/" } 
    },
    { 
      source_term: "Sangria", image: "", gender_pt: "f", 
      translations: { cl: "Sangría", ar: "Sangría", gb: "Sangria", us: "Sangria", pt: "Sangria", es: "Sangría", fr: "Sangria", it: "Sangria" }, 
      phonetics: { us: "/sæŋˈɡriːə/", gb: "/sæŋˈɡriː.ə/", br: "/sɐ̃ˈɡɾi.ɐ/", pt: "/sɐ̃ˈɡɾi.ɐ/", es: "/saŋˈɡɾia/", cl: "/saŋˈɡɾia/", ar: "/saŋˈɡɾia/", fr: "/sɑ̃ɡʁia/", it: "/saŋˈɡria/" } 
    },
    { 
      source_term: "Água com Gás e Limão", image: "", gender_pt: "f", 
      translations: { cl: "Agua con gas y limón", ar: "Soda con limón", gb: "Sparkling Water with Lime", us: "Sparkling Water with Lime", pt: "Água com gás e limão", es: "Agua con gas y limón", fr: "Eau gazeuse au citron", it: "Acqua frizzante al limone" }, 
      phonetics: { us: "/ˈspɑːrklɪŋ ˈwɔːtər wɪð laɪm/", gb: "/ˈspɑː.klɪŋ ˈwɔː.tə wɪð laɪm/", br: "/ˈa.ɡwɐ kõ ɡas i liˈmɐ̃w/", pt: "/ˈa.ɡwɐ kõ ɡaʃ i liˈmɐ̃w/", es: "/ˈaɣwa koŋ ɡas i liˈmon/", cl: "/ˈaɣwa koŋ ɡas i liˈmon/", ar: "/ˈsoda kon liˈmon/", fr: "/o ɡaˈzøz o si.tʁɔ̃/", it: "/ˈakkwa fridˈdzante al liˈmo.ne/" } 
    },
    { 
      source_term: "Cerveja Artesanal", image: "", gender_pt: "f", 
      translations: { cl: "Cerveza artesanal", ar: "Cerveza artesanal", gb: "Craft Beer", us: "Craft Beer", pt: "Cerveja artesanal", es: "Cerveza artesana", fr: "Bière artisanale", it: "Birra artigianale" }, 
      phonetics: { us: "/kræft bɪr/", gb: "/krɑːft bɪə/", br: "/seʁˈve.ʒɐ aʁ.te.zaˈnaw/", pt: "/sɨɾˈvɐj.ʒɐ ɐɾ.tɨ.zɐˈnaɫ/", es: "/θeɾˈβeθa aɾteˈsana/", cl: "/seɾˈβesa aɾtesaˈnal/", ar: "/seɾˈβesa aɾtesaˈnal/", fr: "/bjɛʁ aʁtizaˈnal/", it: "/ˈbirra artidʒaˈnale/" } 
    },
  ]
};
